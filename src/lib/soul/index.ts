// ═══════════════════════════════════════════════════════════════
// SanctumOS v1.0.0 — System Prompt Assembly (The Soul)
// src/lib/soul/index.ts
// ═══════════════════════════════════════════════════════════════

import {
  SKELETON,
  ORGANS,
  MUSCLES,
  SKIN_MIRROR,
  SKIN_LANTERN,
  SAFETY,
  PHASES,
  ARTIFACT_PROMPT_TEMPLATE,
} from './prompts';
import {
  buildSessionMap,
  buildPhasePrompt,
  MODES,
} from './modes';
import type { SessionMode, ResponseStyle } from '../types';

/**
 * Assembles the full System Prompt for the AI Guide.
 * 
 * Anatomy:
 * 1. SKELETON (Vows & Core Identity)
 * 2. ORGANS (Autonomous Systems)
 * 3. MUSCLES (Method Examples)
 * 4. SKIN (Voice & Tone)
 * 5. SAFETY (Boundaries)
 * 6. MAP (Session Arc)
 * 7. PHASE (Current Instruction)
 */
export function buildSystemPrompt(
  mode: SessionMode,
  exchange: number,
  style: ResponseStyle
): string {
  // Select Skin (Voice)
  const skin = style === 'lantern' ? SKIN_LANTERN : SKIN_MIRROR;

  // Build Session Map (Visualizes the arc for the AI)
  const map = buildSessionMap(mode, exchange);

  // Build Phase Instruction (Specific task for this turn)
  const modeDef = MODES[mode];
  const phaseName = modeDef.guidePhases[exchange - 1]?.name;

  // Handle Clarity special case for Quick Check
  let phasePrompt = '';
  if (phaseName === 'Clarity') {
    phasePrompt = mode === 'quick' ? PHASES.ClarityQuick : PHASES.Clarity;
  } else if (phaseName && phaseName in PHASES) {
    phasePrompt = PHASES[phaseName as keyof typeof PHASES];
  } else {
    // Default fallback (should rarely happen if aligned with modes.ts)
    phasePrompt = PHASES.Ground;
  }

  // Override: If we are past the defined phases, we are tracing the arc
  // buildPhasePrompt in modes.ts handles the specific text, but here we 
  // ensure we're pulling the right static text blocks if needed. 
  // Actually, the prototype logic combines specific phase prompt text 
  // with the map. 

  // Prototype logic: 
  // return [SKELETON, ORGANS, MUSCLES, skin, SAFETY, map, phase].join("\n\n");

  return [
    SKELETON,
    ORGANS,
    MUSCLES,
    skin,
    SAFETY,
    map,
    phasePrompt
  ].join('\n\n');
}

/**
 * Assembles the prompt for generating the final Clarity Artifact.
 */
export function buildArtifactPrompt(mode: SessionMode): string {
  const modeDef = MODES[mode];
  const name = modeDef?.name || 'Standard';

  const deepSection = mode === 'deep'
    ? `\n\nWHAT WAS UNDERNEATH\nOnly if the session revealed a recurring pattern, hidden assumption, or operating belief. 1-2 sentences using their words and examples. If nothing at this depth emerged, omit entirely.`
    : '';

  const wordCount = mode === 'deep' ? '250' : '200';

  return ARTIFACT_PROMPT_TEMPLATE
    .replace('{modeName}', name)
    .replace('{deepSection}', deepSection)
    .replace('{wordCount}', wordCount);
}
