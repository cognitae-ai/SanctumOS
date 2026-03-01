'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModeDefinition, SessionPhase } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { TRIADIC_COLORS } from '@/lib/soul/modes';

interface ModeCardProps {
    mode: ModeDefinition;
    selected: boolean;
    locked: boolean;
    onSelect: () => void;
}

export function ModeCard({ mode, selected, locked, onSelect }: ModeCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isComing = !!mode.coming;
    const isSelectable = !locked && !isComing;
    const isSelected = selected && isSelectable;

    return (
        <div
            className={cn(
                "relative border rounded overflow-hidden transition-all duration-200",
                isSelected ? "bg-accent/10 border-accent" : "bg-surface border-border",
                (locked || isComing) && "opacity-60"
            )}
        >
            {isComing && (
                <span className="absolute top-2 right-2.5 text-[10px] tracking-widest uppercase text-accent font-medium z-10">
                    Coming Soon
                </span>
            )}

            <button
                onClick={isSelectable ? onSelect : undefined}
                className={cn(
                    "w-full text-left p-4 flex justify-between items-start",
                    isSelectable ? "cursor-pointer" : "cursor-default"
                )}
            >
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                            "font-sans text-sm font-medium",
                            isSelected ? "text-accent" : "text-text"
                        )}>
                            {mode.name}
                        </span>
                        {locked && (
                            <span className="text-[10px] tracking-wide uppercase text-dim px-1.5 py-0.5 border border-border rounded">
                                {mode.tier === 'founder' ? 'Founder' : 'Clarity'}
                            </span>
                        )}
                    </div>
                    <p className="font-sans text-xs text-dim leading-relaxed">
                        {mode.desc}
                    </p>
                </div>

                <div className="shrink-0 text-right">
                    <div className="font-sans text-[10px] text-dim mb-1.5">{mode.time}</div>
                    <PhaseDots phases={mode.allPhases} />
                </div>
            </button>

            {/* Expandable Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-0 border-t border-border/50">
                            <p className="mt-3 font-sans text-xs text-muted leading-relaxed">
                                {mode.longDesc}
                            </p>
                            <p className="mt-2 font-serif italic text-sm text-accent">
                                {mode.example}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-3 items-center">
                                {mode.allPhases.map((p, i) => (
                                    <PhaseBadge key={i} phase={p} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="w-full py-2 text-center text-[10px] text-dim tracking-wider uppercase border-t border-border hover:bg-surface-raised transition-colors"
            >
                {expanded ? "Show Less" : "Learn More"}
            </button>
        </div>
    );
}

function PhaseDots({ phases }: { phases: SessionPhase[] }) {
    return (
        <div className="flex gap-0.5 justify-end">
            {phases.map((p, i) => {
                const color = p.triadic ? TRIADIC_COLORS[p.triadic]
                    : '#c49a6c'; // Accent
                return (
                    <div
                        key={i}
                        className="w-1 h-1 rounded-full opacity-60"
                        style={{ backgroundColor: color }}
                    />
                );
            })}
        </div>
    );
}

function PhaseBadge({ phase }: { phase: SessionPhase }) {
    const color = phase.triadic ? TRIADIC_COLORS[phase.triadic]
        : '#c49a6c'; // Accent

    return (
        <span
            className="text-[9px] px-1.5 py-0.5 border rounded"
            style={{
                color: color,
                borderColor: `${color}33`, // 20% opacity
                backgroundColor: `${color}11` // 6% opacity
            }}
        >
            {phase.name}
        </span>
    );
}
