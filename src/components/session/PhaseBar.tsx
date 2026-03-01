'use client';

import { ModeDefinition } from '@/lib/types';
import { TRIADIC_COLORS } from '@/lib/soul/modes';
import { cn } from '@/lib/utils/cn';

interface PhaseBarProps {
    mode: ModeDefinition;
    exchange: number;
    isReflection: boolean;
}

export function PhaseBar({ mode, exchange, isReflection }: PhaseBarProps) {
    if (exchange < 1) return null;

    const allPhases = mode.allPhases;
    // Calculate active index (0-based)
    // If reflecting, we are at the last phase (Reflect)
    // Otherwise, we are at exchange - 1 (min capped at total exchanges)
    const activeIdx = isReflection
        ? allPhases.length - 1
        : Math.min(exchange, mode.exchanges) - 1;

    // How many bars are "filled"/colored
    const filledCount = isReflection
        ? allPhases.length
        : Math.min(exchange, mode.exchanges);

    const currentPhase = allPhases[activeIdx];

    // Helper to get color for a phase
    const getPhaseColor = (triadic: string | null) => {
        if (triadic === 'reflect') return '#d4aa78'; // Reflect color
        if (triadic && triadic in TRIADIC_COLORS) return TRIADIC_COLORS[triadic as keyof typeof TRIADIC_COLORS];
        return '#c49a6c'; // Accent
    };

    const activeColor = getPhaseColor(currentPhase?.triadic || null);

    return (
        <div className="px-5 py-3 bg-surface border-b border-border transition-colors duration-500">
            {/* Progress Bars */}
            <div className="flex gap-1 mb-2.5 h-1">
                {allPhases.map((p, i) => {
                    const color = getPhaseColor(p.triadic);
                    const isFilled = i < filledCount;
                    const isActive = i === activeIdx;

                    return (
                        <div
                            key={i}
                            className="flex-1 h-full rounded-full transition-all duration-500"
                            style={{
                                backgroundColor: isFilled ? color : '#2a2622', // C.faint
                                opacity: isFilled ? (isActive ? 1 : 0.4) : 1
                            }}
                        />
                    );
                })}
            </div>

            {/* Info Row */}
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: activeColor }}
                    />
                    <div className="flex flex-col">
                        <span
                            className="font-sans text-[10px] font-medium tracking-widest uppercase"
                            style={{ color: activeColor }}
                        >
                            {currentPhase?.name}
                        </span>
                        <span className="font-sans text-[10px] text-dim">
                            {currentPhase?.desc}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <span className="font-sans text-[10px] text-dim">
                        <span className="text-muted text-[9px] tracking-wider uppercase mr-1.5">
                            {mode.name}
                        </span>
                        {isReflection ? 'Yours' : `${exchange}/${mode.exchanges}`}
                    </span>
                </div>
            </div>
        </div>
    );
}
