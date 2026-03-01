-- ═══════════════════════════════════════════════════════════════
-- SanctumOS v1.0.0 — Genesis Migration
-- 001_genesis.sql
--
-- Tables: profiles, sessions, artifacts, notes, channels, carrying
-- All tables have RLS enabled from the start.
-- ═══════════════════════════════════════════════════════════════

-- ─── Custom Types ────────────────────────────────────────────

CREATE TYPE user_tier AS ENUM ('free', 'founder');
CREATE TYPE session_mode AS ENUM ('quick', 'standard', 'deep');
CREATE TYPE response_style AS ENUM ('mirror', 'lantern');
CREATE TYPE session_status AS ENUM ('active', 'complete');
CREATE TYPE carry_status AS ENUM ('carrying', 'settled');


-- ═════════════════════════════════════════════════════════════
-- TABLE: profiles
-- Extends auth.users. Created automatically via trigger on signup.
-- ═════════════════════════════════════════════════════════════

CREATE TABLE profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name       TEXT,
  tier               user_tier NOT NULL DEFAULT 'free',
  free_session_count INTEGER NOT NULL DEFAULT 3,
  is_premium         BOOLEAN NOT NULL DEFAULT FALSE,
  settings           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth. Tier controls access and model routing.';
COMMENT ON COLUMN profiles.free_session_count IS 'Decremented on session completion. Incremented by sharing artifacts. Ignored when is_premium = true.';
COMMENT ON COLUMN profiles.settings IS 'User preferences: { defaultMode, defaultStyle, animationSpeed }';

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ═════════════════════════════════════════════════════════════
-- TABLE: sessions
-- Each reflection session. Stores full message history as JSONB.
-- ═════════════════════════════════════════════════════════════

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode            session_mode NOT NULL DEFAULT 'standard',
  style           response_style NOT NULL DEFAULT 'mirror',
  status          session_status NOT NULL DEFAULT 'active',
  preview         TEXT,
  shift_in        TEXT,
  shift_out       TEXT,
  vow             TEXT,
  exchange_count  INTEGER NOT NULL DEFAULT 0,
  messages        JSONB NOT NULL DEFAULT '[]'::jsonb,
  display         JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sessions IS 'Reflection sessions. Messages stored as JSONB arrays. Display is the rendered message list.';
COMMENT ON COLUMN sessions.preview IS 'First ~80 chars of the users opening message. Used in sidebar history.';
COMMENT ON COLUMN sessions.shift_in IS 'What the user arrived with (shift-in prompt).';
COMMENT ON COLUMN sessions.shift_out IS 'What shifted during the session (set on completion).';
COMMENT ON COLUMN sessions.vow IS 'Users closing commitment (set on completion).';
COMMENT ON COLUMN sessions.messages IS 'Full conversation: [{ role, content }]. Sent to AI on each exchange.';
COMMENT ON COLUMN sessions.display IS 'Rendered messages: [{ role, text, phase, triadic }]. Displayed in UI.';

CREATE INDEX idx_sessions_user_created ON sessions(user_id, created_at DESC);

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ═════════════════════════════════════════════════════════════
-- TABLE: artifacts
-- Clarity cards generated at session completion.
-- ═════════════════════════════════════════════════════════════

CREATE TABLE artifacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content      JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public    BOOLEAN NOT NULL DEFAULT FALSE,
  share_slug   TEXT UNIQUE,
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
  theme        TEXT,
  rating       INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE artifacts IS 'Clarity artifacts. content = { brought, explored, emerged, underneath?, words, question }.';
COMMENT ON COLUMN artifacts.share_slug IS 'Unique public slug. Generated only when user shares. Enables /share/[slug] route.';
COMMENT ON COLUMN artifacts.is_pinned IS 'Pinned to welcome screen. Max 3 per user enforced in application logic.';
COMMENT ON COLUMN artifacts.theme IS 'Snapshot of visual theme at creation time.';

CREATE INDEX idx_artifacts_user ON artifacts(user_id, created_at DESC);
CREATE INDEX idx_artifacts_slug ON artifacts(share_slug) WHERE share_slug IS NOT NULL;

-- Enforce max 3 pinned artifacts per user
CREATE OR REPLACE FUNCTION enforce_max_pinned_artifacts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_pinned = TRUE THEN
    IF (SELECT COUNT(*) FROM artifacts WHERE user_id = NEW.user_id AND is_pinned = TRUE AND id != NEW.id) >= 3 THEN
      RAISE EXCEPTION 'Maximum of 3 pinned artifacts per user';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_pinned_artifacts
  BEFORE INSERT OR UPDATE ON artifacts
  FOR EACH ROW EXECUTE FUNCTION enforce_max_pinned_artifacts();


-- ═════════════════════════════════════════════════════════════
-- TABLE: notes
-- User notes organized by channel.
-- ═════════════════════════════════════════════════════════════

CREATE TABLE notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id   TEXT NOT NULL DEFAULT 'know',
  content      TEXT NOT NULL,
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
  session_ref  UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notes IS 'User notes. channel_id is know/do/matters (defaults) or a custom channel slug.';
COMMENT ON COLUMN notes.channel_id IS 'References default channels (know, do, matters) or channels.slug for custom.';
COMMENT ON COLUMN notes.session_ref IS 'Optional link to originating session (e.g. words saved from artifact).';

CREATE INDEX idx_notes_user_channel ON notes(user_id, channel_id, created_at DESC);

-- Enforce max 3 pinned notes per user per channel
CREATE OR REPLACE FUNCTION enforce_max_pinned_notes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_pinned = TRUE THEN
    IF (SELECT COUNT(*) FROM notes WHERE user_id = NEW.user_id AND channel_id = NEW.channel_id AND is_pinned = TRUE AND id != NEW.id) >= 3 THEN
      RAISE EXCEPTION 'Maximum of 3 pinned notes per channel';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_pinned_notes
  BEFORE INSERT OR UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION enforce_max_pinned_notes();

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ═════════════════════════════════════════════════════════════
-- TABLE: channels
-- Custom note channels (the 3 defaults are hardcoded in app).
-- ═════════════════════════════════════════════════════════════

CREATE TABLE channels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug         TEXT NOT NULL,
  name         TEXT NOT NULL,
  color        TEXT NOT NULL DEFAULT '#847b6f',
  icon         TEXT NOT NULL DEFAULT '+',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, slug)
);

COMMENT ON TABLE channels IS 'Custom note channels. Default channels (know, do, matters) are hardcoded in the app, not stored here.';

CREATE INDEX idx_channels_user ON channels(user_id, sort_order);


-- ═════════════════════════════════════════════════════════════
-- TABLE: carrying
-- Questions carried forward from sessions.
-- ═════════════════════════════════════════════════════════════

CREATE TABLE carrying (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id   UUID REFERENCES sessions(id) ON DELETE SET NULL,
  question     TEXT NOT NULL,
  status       carry_status NOT NULL DEFAULT 'carrying',
  resolution   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at   TIMESTAMPTZ
);

COMMENT ON TABLE carrying IS 'Questions to carry from sessions. Settled when the user resolves them on their own terms.';
COMMENT ON COLUMN carrying.resolution IS 'Users own answer/resolution. Set when status changes to settled.';

CREATE INDEX idx_carrying_user_status ON carrying(user_id, status, created_at DESC);


-- ═════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Standard: users access their own data.
-- Exception: public artifacts readable by anyone.
-- ═════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrying ENABLE ROW LEVEL SECURITY;

-- ─── Profiles ────────────────────────────────────────────────

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No INSERT policy needed — handled by trigger on auth.users
-- No DELETE policy — users don't delete their own profile

-- ─── Sessions ────────────────────────────────────────────────

CREATE POLICY "Users can read own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Artifacts ───────────────────────────────────────────────

CREATE POLICY "Users can read own artifacts"
  ON artifacts FOR SELECT
  USING (auth.uid() = user_id);

-- THE VIRAL EXCEPTION: public artifacts readable by anyone
CREATE POLICY "Public artifacts are world-readable"
  ON artifacts FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can create own artifacts"
  ON artifacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own artifacts"
  ON artifacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own artifacts"
  ON artifacts FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Notes ───────────────────────────────────────────────────

CREATE POLICY "Users can read own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Channels ────────────────────────────────────────────────

CREATE POLICY "Users can read own channels"
  ON channels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own channels"
  ON channels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels"
  ON channels FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels"
  ON channels FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Carrying ────────────────────────────────────────────────

CREATE POLICY "Users can read own carrying"
  ON carrying FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own carrying"
  ON carrying FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own carrying"
  ON carrying FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own carrying"
  ON carrying FOR DELETE
  USING (auth.uid() = user_id);


-- ═════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- Server-side functions for share-to-earn and session gating.
-- ═════════════════════════════════════════════════════════════

-- Share an artifact: set public, generate slug, reward user with +1 session
CREATE OR REPLACE FUNCTION share_artifact(artifact_id UUID, slug TEXT)
RETURNS VOID AS $$
BEGIN
  -- Set artifact as public with the slug
  UPDATE artifacts
  SET is_public = TRUE, share_slug = slug
  WHERE id = artifact_id AND user_id = auth.uid();

  -- Reward: +1 free session
  UPDATE profiles
  SET free_session_count = free_session_count + 1
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement session count (called after successful artifact generation)
CREATE OR REPLACE FUNCTION consume_session_credit()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET free_session_count = GREATEST(free_session_count - 1, 0)
  WHERE id = auth.uid() AND is_premium = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can start a session
CREATE OR REPLACE FUNCTION can_start_session()
RETURNS BOOLEAN AS $$
DECLARE
  profile_record profiles%ROWTYPE;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = auth.uid();
  IF profile_record.is_premium THEN RETURN TRUE; END IF;
  RETURN profile_record.free_session_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
