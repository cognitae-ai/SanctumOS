// ═══════════════════════════════════════════════════════════════
// SanctumOS v1.0.0 — Session Modes & Phase Definitions
// src/lib/soul/modes.ts
//
// The Triadic Method expressed as session structures.
// Three dimensions: Episteme (what is true), Techne (what is possible),
// Phronesis (what matters).
// ═══════════════════════════════════════════════════════════════

import type {
  Mode,
  SessionMode,
  ModeDefinition,
  SessionPhase,
  DefaultChannel,
  UserTier,
} from '../types';

// ─── Triadic Colors ──────────────────────────────────────────

export const TRIADIC_COLORS = {
  episteme: '#7a9eb5',
  epistemeSoft: 'rgba(122,158,181,0.10)',
  techne: '#8aab7a',
  techneSoft: 'rgba(138,171,122,0.10)',
  phronesis: '#b59a7a',
  phronesisSoft: 'rgba(181,154,122,0.10)',
} as const;

// ─── Default Note Channels ──────────────────────────────────

export const DEFAULT_CHANNELS: DefaultChannel[] = [
  {
    id: 'know',
    name: 'What I Know',
    desc: 'Facts, evidence, things I\'ve verified',
    color: TRIADIC_COLORS.episteme,
    icon: '◆',
  },
  {
    id: 'do',
    name: 'What I Could Do',
    desc: 'Actions, options, next steps',
    color: TRIADIC_COLORS.techne,
    icon: '▸',
  },
  {
    id: 'matters',
    name: 'What Matters',
    desc: 'Meaning, values, what\'s important',
    color: TRIADIC_COLORS.phronesis,
    icon: '○',
  },
];

// ─── Closing Reflection Phase ────────────────────────────────
// Appended to every mode's phase list. The person reflects.

export const REFLECT_PHASE: SessionPhase = {
  name: 'Reflect',
  desc: 'Your closing reflection',
  triadic: null,
};

// ─── Session Modes ───────────────────────────────────────────

const MODES_RAW: Record<SessionMode, Omit<ModeDefinition, 'allPhases'>> = {
  quick: {
    id: 'quick',
    name: 'Quick Check',
    exchanges: 3,
    tier: 'free',
    time: '~5 min',
    desc: 'One exchange per dimension — a sharp nudge when you\'re mostly clear.',
    longDesc:
      'Quick Check moves fast. Three exchanges, each targeting a different dimension of your thinking. The Guide finds the gap, bridges to what you\'re neglecting, and reflects what\'s become clear. Best for decisions where you\'re 80% there and need someone to illuminate the last 20%.',
    example: 'Quick Check reveals the blind spot.',
    synthMsg: 'Distilling three sharp exchanges…',
    guidePhases: [
      { name: 'Ground', desc: 'Finding the gap', triadic: 'episteme' },
      { name: 'Bridge', desc: 'The neglected dimension', triadic: 'techne' },
      { name: 'Clarity', desc: 'What\'s becoming clear', triadic: 'phronesis' },
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    exchanges: 5,
    tier: 'free',
    time: '~15 min',
    desc: 'The full Triadic arc — a dedicated exchange for knowing, doing, and meaning.',
    longDesc:
      'Standard is the core Sanctum experience. Five exchanges that systematically move through each dimension: establishing ground truth, examining what\'s possible, exploring what matters, then drawing it together. Most situations find their clarity here.',
    example: 'Standard builds the strategy.',
    synthMsg: 'Weaving five exchanges into your clarity artifact…',
    guidePhases: [
      { name: 'Ground', desc: 'Establishing what\'s real', triadic: null },
      { name: 'Episteme', desc: 'What is actually true', triadic: 'episteme' },
      { name: 'Techne', desc: 'What is actually possible', triadic: 'techne' },
      { name: 'Phronesis', desc: 'What actually matters', triadic: 'phronesis' },
      { name: 'Clarity', desc: 'The shape of your thinking', triadic: null },
    ],
  },
  deep: {
    id: 'deep',
    name: 'Deep Dive',
    exchanges: 8,
    tier: 'founder',
    time: '~25 min',
    desc: 'Extended reflection — tests assumptions, weaves threads, reveals life patterns.',
    longDesc:
      'Deep Dive keeps going after Standard would stop. After covering the three dimensions, it tests your assumptions against your own evidence, weaves threads from across the conversation, and names the recurring patterns in how you think and decide — patterns you carry from situation to situation without seeing them.',
    example: 'Deep Dive finds the life pattern.',
    synthMsg: 'Drawing together eight exchanges into something you can carry…',
    coming: true,
    guidePhases: [
      { name: 'Ground', desc: 'Establishing what\'s real', triadic: null },
      { name: 'Episteme', desc: 'What is actually true', triadic: 'episteme' },
      { name: 'Techne', desc: 'What is actually possible', triadic: 'techne' },
      { name: 'Phronesis', desc: 'What actually matters', triadic: 'phronesis' },
      { name: 'Deepen', desc: 'Testing the assumptions', triadic: 'episteme' },
      { name: 'Integrate', desc: 'Weaving threads together', triadic: 'techne' },
      { name: 'Pattern', desc: 'What keeps recurring', triadic: 'phronesis' },
      { name: 'Clarity', desc: 'What\'s become clear', triadic: null },
    ],
  },
};

// Build final modes with allPhases appended
export const MODES: Record<SessionMode, ModeDefinition> = Object.fromEntries(
  Object.entries(MODES_RAW).map(([key, mode]) => [
    key,
    {
      ...mode,
      allPhases: [...mode.guidePhases, REFLECT_PHASE],
    },
  ])
) as Record<SessionMode, ModeDefinition>;

// ─── Session Map Labels ──────────────────────────────────────
// Used in system prompt to show the AI where it is in the arc.

export const MAP_LABELS: Record<SessionMode, string[]> = {
  quick: ['Ground', 'Bridge', 'Clarity → handoff'],
  standard: ['Ground', 'What is true', 'What is possible', 'What matters', 'Clarity → handoff'],
  deep: ['Ground', 'True', 'Possible', 'Matters', 'Deepen', 'Integrate', 'Pattern', 'Clarity → handoff'],
};

/**
 * Generates the session map string injected into the system prompt.
 * Shows the AI which exchange it's on and what comes next.
 */
export function buildSessionMap(mode: SessionMode, exchange: number): string {
  const labels = MAP_LABELS[mode];
  const total = MODES[mode].exchanges;
  const modeName = MODES[mode].name;

  const parts = labels.map((label, i) => {
    const num = i + 1;
    if (num < exchange) return `${num}: ${label} ✓`;
    if (num === exchange) return `${num}: ${label} ← YOU ARE HERE`;
    return `${num}: ${label}`;
  });

  let map = `SESSION: ${modeName} (${total} exchanges → closing reflection → artifact)\n[${parts.join('] [')}] [Reflection: theirs]`;

  if (exchange >= total) {
    map += '\nYour job now: trace the arc, then deliver the closing question. Their answer is the culmination.';
  } else {
    map += '\nEverything builds toward their closing reflection. That is the destination.';
  }

  return map;
}

/**
 * Generates the phase-specific instruction appended to the system prompt.
 */
export function buildPhasePrompt(mode: SessionMode, exchange: number): string {
  const m = MODES[mode];
  const total = m.exchanges;
  const modeName = m.name;

  if (exchange === 1) {
    return `This is Exchange 1 of ${total} in a ${modeName} session. Ground. Listen. Find the entry point. One question.`;
  }

  const phase = m.guidePhases[exchange - 1];
  if (!phase) {
    return `Exchange ${exchange} of ${total}. Continue the reflection. One question.`;
  }

  if (exchange >= total) {
    return `This is Exchange ${exchange} of ${total} — ${phase.name}: ${phase.desc}. This is the final guided exchange. Trace the full arc from Exchange 1 to now. Surface the strongest evidence. Deliver the closing question — the one they will answer in their own reflection. Make it count.`;
  }

  return `Exchange ${exchange} of ${total} — ${phase.name}: ${phase.desc}. Build on what came before. One question.`;
}
