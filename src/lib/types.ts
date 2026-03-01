// ═══════════════════════════════════════════════════════════════
// SanctumOS v1.0.0 — Core Type Definitions
// src/lib/types.ts
// ═══════════════════════════════════════════════════════════════

// ─── User & Auth ─────────────────────────────────────────────

export type UserTier = 'free' | 'founder';

// Alias for convenience (used in modes.ts)
export type Mode = SessionMode;

export interface Profile {
  id: string;
  display_name: string | null;
  tier: UserTier;
  free_session_count: number;
  is_premium: boolean;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  defaultMode?: SessionMode;
  defaultStyle?: ResponseStyle;
  animationSpeed?: number;
}

// ─── Sessions ────────────────────────────────────────────────

export type SessionMode = 'quick' | 'standard' | 'deep';
export type ResponseStyle = 'mirror' | 'lantern';
export type SessionStatus = 'active' | 'complete';

export interface Session {
  id: string;
  user_id: string;
  mode: SessionMode;
  style: ResponseStyle;
  status: SessionStatus;
  preview: string | null;
  shift_in: string | null;
  shift_out: string | null;
  vow: string | null;
  exchange_count: number;
  messages: ChatMessage[];
  display: DisplayMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DisplayMessage {
  role: 'user' | 'assistant';
  text: string;
  phase?: string;
  triadic?: TriadicDimension | null;
}

// ─── Artifacts ───────────────────────────────────────────────

export interface Artifact {
  id: string;
  session_id: string;
  user_id: string;
  content: ArtifactContent;
  is_public: boolean;
  share_slug: string | null;
  is_pinned: boolean;
  theme: string | null;
  rating: number | null;
  created_at: string;
}

export interface ArtifactContent {
  brought: string;
  explored: string;
  emerged: string;
  underneath?: string; // Only present in Deep Dive mode
  words: string;
  question: string;
}

// ─── Notes ───────────────────────────────────────────────────

export interface Note {
  id: string;
  user_id: string;
  channel_id: string;
  content: string;
  is_pinned: boolean;
  session_ref: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Channels ────────────────────────────────────────────────

export type ChannelId = string;

export interface Channel {
  id: ChannelId;
  user_id: string;
  slug: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

/** Default channels — hardcoded, not stored in DB */
export interface DefaultChannel {
  id: ChannelId;
  name: string;
  desc: string;
  color: string;
  icon: string;
}

// ─── Carrying ────────────────────────────────────────────────

export type CarryStatus = 'carrying' | 'settled';

export interface CarryingItem {
  id: string;
  user_id: string;
  session_id: string | null;
  question: string;
  status: CarryStatus;
  resolution: string | null;
  created_at: string;
  settled_at: string | null;
}

// ─── The Triadic Method ──────────────────────────────────────

export type TriadicDimension = 'episteme' | 'techne' | 'phronesis';

export interface SessionPhase {
  name: string;
  desc: string;
  triadic: TriadicDimension | null;
}

export interface ModeDefinition {
  id: SessionMode;
  name: string;
  exchanges: number;
  tier: UserTier;
  time: string;
  desc: string;
  longDesc: string;
  example: string;
  synthMsg: string;
  guidePhases: SessionPhase[];
  allPhases: SessionPhase[];
  coming?: boolean;
}

// ─── AI Adapter ──────────────────────────────────────────────

export interface SessionContext {
  mode: SessionMode;
  style: ResponseStyle;
  exchange: number;
  totalExchanges: number;
  userTier: UserTier;
}

export interface ModelAdapter {
  stream(
    messages: ChatMessage[],
    systemPrompt: string,
    context: SessionContext
  ): Promise<ReadableStream>;

  generate(
    messages: ChatMessage[],
    systemPrompt: string
  ): Promise<string | null>;
}

// ─── UI State ────────────────────────────────────────────────

export type SidebarMode = 'notes' | 'sessions';
export type MobileTab = 'menu' | 'session';

export type SessionPhaseId =
  | 'welcome'
  | 'shiftIn'
  | 'opening'
  | 'dialogue'
  | 'synthesizing'
  | 'result';
