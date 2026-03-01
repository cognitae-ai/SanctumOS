-- 001_genesis.sql
-- SanctumOS v1.0.0 Initial Migration
-- Roles: profiles, sessions, artifacts, notes, channels, carrying
-- Security: RLS enabled on all tables

-- 1. Profiles (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  display_name text,
  tier text default 'free' check (tier in ('free', 'pro', 'founder')),
  session_credits integer default 3,
  credits_reset_at timestamptz,
  is_premium boolean default false,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Handle new user creation automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, tier, session_credits)
  values (new.id, new.raw_user_meta_data->>'full_name', 'free', 3);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Sessions
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mode text not null, -- 'quick', 'standard', 'deep'
  style text not null, -- 'mirror', 'lantern'
  status text default 'active', -- 'active', 'complete'
  preview text,
  shift_in text,
  shift_out text,
  vow text,
  exchange_count integer default 0,
  messages jsonb default '[]'::jsonb,
  display jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.sessions enable row level security;

create policy "Users can CRUD own sessions"
  on public.sessions for all
  using ( auth.uid() = user_id );

-- 3. Artifacts (The Viral Exception)
create table public.artifacts (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content jsonb not null, -- { brought, explored, emerged, underneath, words, question }
  is_public boolean default false,
  share_slug text unique,
  is_pinned boolean default false,
  theme text,
  rating integer,
  created_at timestamptz default now()
);

alter table public.artifacts enable row level security;

create policy "Users can CRUD own artifacts"
  on public.artifacts for all
  using ( auth.uid() = user_id );

-- The Viral Exception: Public access strictly by slug
create policy "Public view shared artifacts"
  on public.artifacts for select
  to anon, authenticated
  using ( is_public = true );

create index idx_artifacts_share_slug on public.artifacts(share_slug);

-- 4. Channels
create table public.channels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  slug text not null,
  name text not null,
  color text,
  icon text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.channels enable row level security;

create policy "Users can CRUD own channels"
  on public.channels for all
  using ( auth.uid() = user_id );

-- 5. Notes
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  channel_id text not null, -- 'know', 'do', 'matters' or custom UUID
  content text,
  is_pinned boolean default false,
  session_ref uuid references public.sessions(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notes enable row level security;

create policy "Users can CRUD own notes"
  on public.notes for all
  using ( auth.uid() = user_id );

-- 6. Carrying
create table public.carrying (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete set null,
  question text not null,
  status text default 'carrying' check (status in ('carrying', 'settled')),
  resolution text,
  created_at timestamptz default now(),
  settled_at timestamptz
);

alter table public.carrying enable row level security;

create policy "Users can CRUD own carrying items"
  on public.carrying for all
  using ( auth.uid() = user_id );

-- Indexes for performance
create index idx_sessions_user_created on public.sessions(user_id, created_at desc);
create index idx_notes_user_channel on public.notes(user_id, channel_id);
create index idx_carrying_user_status on public.carrying(user_id, status);
