// ═══════════════════════════════════════════════════════════════
// SanctumOS v1.0.0 — Client State (Zustand)
// src/lib/stores.ts
//
// Two stores:
//   useSessionStore — active session state (mode, exchange, messages)
//   useShellStore   — UI layout state (sidebar, mobile tab, panel width)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Mode,
  ChannelId,
  ChatMessage,
  DisplayMessage,
  ArtifactContent,
  MobileTab,
  SessionMode,
  ResponseStyle,
  SessionStatus,
  SessionPhaseId,
  SidebarMode,
} from './types';
import { DEFAULT_CHANNELS as CHANNELS, MODES } from './soul/modes';

// ─── Session Store ───────────────────────────────────────────
// Manages the active reflection session.

interface SessionState {
  // Identity
  sessionId: string | null;
  createdAt: string | null;

  // Configuration
  mode: SessionMode;
  style: ResponseStyle;
  status: SessionStatus;

  // Flow
  phase: SessionPhaseId;
  exchange: number;
  input: string;

  // Content
  shiftIn: string;
  shiftOut: string;
  vow: string;
  messages: ChatMessage[];
  display: DisplayMessage[];
  artifact: ArtifactContent | null;
  rating: number | null;

  // Result view
  resultView: 'artifact' | 'conversation';

  // Actions
  setMode: (mode: SessionMode) => void;
  setStyle: (style: ResponseStyle) => void;
  setPhase: (phase: SessionPhaseId) => void;
  setInput: (input: string) => void;
  setShiftIn: (text: string) => void;
  setShiftOut: (text: string) => void;
  setVow: (text: string) => void;
  setArtifact: (artifact: ArtifactContent | null) => void;
  setRating: (rating: number | null) => void;
  setResultView: (view: 'artifact' | 'conversation') => void;
  addMessage: (msg: ChatMessage) => void;
  addDisplay: (msg: DisplayMessage) => void;
  incrementExchange: () => void;

  // Session lifecycle
  startSession: (id: string, mode: SessionMode, style: ResponseStyle) => void;
  loadSession: (data: {
    id: string;
    created_at: string;
    mode: SessionMode;
    style: ResponseStyle;
    status: SessionStatus;
    exchange_count: number;
    messages: ChatMessage[];
    display: DisplayMessage[];
    artifact: ArtifactContent | null;
    shift_in: string;
    shift_out: string;
    vow: string;
    rating: number | null;
  }) => void;
  resetSession: () => void;
}

const initialSessionState = {
  sessionId: null,
  createdAt: null,
  mode: 'standard' as SessionMode,
  style: 'mirror' as ResponseStyle,
  status: 'active' as SessionStatus,
  phase: 'welcome' as SessionPhaseId,
  exchange: 0,
  input: '',
  shiftIn: '',
  shiftOut: '',
  vow: '',
  messages: [] as ChatMessage[],
  display: [] as DisplayMessage[],
  artifact: null,
  rating: null,
  resultView: 'artifact' as const,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialSessionState,

  // Setters
  setMode: (mode) => set({ mode }),
  setStyle: (style) => set({ style }),
  setPhase: (phase) => set({ phase }),
  setInput: (input) => set({ input }),
  setShiftIn: (text) => set({ shiftIn: text }),
  setShiftOut: (text) => set({ shiftOut: text }),
  setVow: (text) => set({ vow: text }),
  setArtifact: (artifact) => set({ artifact }),
  setRating: (rating) => set({ rating }),
  setResultView: (view) => set({ resultView: view }),

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  addDisplay: (msg) =>
    set((state) => ({ display: [...state.display, msg] })),

  incrementExchange: () =>
    set((state) => ({ exchange: state.exchange + 1 })),

  // Lifecycle
  startSession: (id, mode, style) =>
    set({
      ...initialSessionState,
      sessionId: id,
      createdAt: new Date().toISOString(),
      mode,
      style,
      phase: 'shiftIn',
    }),

  loadSession: (data) =>
    set({
      sessionId: data.id,
      createdAt: data.created_at,
      mode: data.mode,
      style: data.style,
      status: data.status,
      exchange: data.exchange_count,
      messages: data.messages,
      display: data.display,
      artifact: data.artifact,
      shiftIn: data.shift_in || '',
      shiftOut: data.shift_out || '',
      vow: data.vow || '',
      rating: data.rating,
      phase: data.artifact ? 'result' : data.exchange_count > 0 ? 'dialogue' : 'welcome',
      resultView: 'artifact',
      input: '',
    }),

  resetSession: () => set(initialSessionState),
}));


// ─── Shell Store ─────────────────────────────────────────────
// Manages UI layout and sidebar state.

interface ShellState {
  // Sidebar
  sidebarWidth: number;
  sidebarMode: SidebarMode;
  isDragging: boolean;

  // Mobile
  mobileTab: MobileTab;

  // Notes sidebar
  noteChannel: string;

  // General UI
  fade: number;
  expandedMode: string | null;
  copied: boolean;

  // Actions
  setSidebarWidth: (width: number) => void;
  setSidebarMode: (mode: SidebarMode) => void;
  setIsDragging: (dragging: boolean) => void;
  setMobileTab: (tab: MobileTab) => void;
  setNoteChannel: (channel: string) => void;
  setFade: (fade: number) => void;
  setExpandedMode: (mode: string | null) => void;
  setCopied: (copied: boolean) => void;
  flashCopied: () => void;
}

export const useShellStore = create<ShellState>((set) => ({
  // Defaults
  sidebarWidth: 280,
  sidebarMode: 'notes',
  isDragging: false,
  mobileTab: 'session',
  noteChannel: 'know',
  fade: 0,
  expandedMode: null,
  copied: false,

  // Setters
  setSidebarWidth: (width) =>
    set({ sidebarWidth: Math.min(480, Math.max(200, width)) }),
  setSidebarMode: (mode) => set({ sidebarMode: mode }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setMobileTab: (tab) => set({ mobileTab: tab }),
  setNoteChannel: (channel) => set({ noteChannel: channel }),
  setFade: (fade) => set({ fade }),
  setExpandedMode: (mode) => set({ expandedMode: mode }),
  setCopied: (copied) => set({ copied }),
  flashCopied: () => {
    set({ copied: true });
    setTimeout(() => set({ copied: false }), 2200);
  },
}));
