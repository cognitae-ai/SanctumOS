'use client';

import { motion } from 'framer-motion';
import { ArtifactContent, SessionMode } from '@/lib/types';
import { MODES } from '@/lib/soul/modes';
import { cn } from '@/lib/utils/cn';

interface ArtCardProps {
    artifact: ArtifactContent;
    mode: SessionMode;
    dark?: boolean; // Default is light/paper mode unless specified
    animate?: boolean;
}

export function ArtCard({ artifact, mode, dark = false, animate = true }: ArtCardProps) {
    const modeName = MODES[mode]?.name || '';

    // Styles based on theme
    const styles = {
        bg: dark ? 'bg-surface' : 'bg-[#ede8df]', // C.paper
        text: dark ? 'text-text' : 'text-[#2b2520]', // C.paperText
        muted: dark ? 'text-muted' : 'text-[#736a5f]', // C.paperMuted
        highlight: dark ? 'text-guide' : 'text-[#1a1512]', // C.highlight
        border: dark ? 'border border-border' : 'shadow-2xl', // C.border or shadow
        deepBg: dark ? 'bg-accent/5' : 'bg-accent/10', // C.deepBg
    };

    type Section = {
        key: keyof ArtifactContent;
        label: string;
        highlight?: boolean;
        deep?: boolean;
        quote?: boolean;
        italic?: boolean;
    };

    const sections: Section[] = [
        { key: 'brought', label: 'What You Brought' },
        { key: 'explored', label: 'What We Explored' },
        { key: 'emerged', label: 'What Emerged', highlight: true },
        { key: 'underneath', label: 'What Was Underneath', deep: true },
        { key: 'words', label: 'Your Words Back to You', quote: true },
        { key: 'question', label: 'A Question to Carry', italic: true },
    ];

    return (
        <div
            className={cn(
                "w-full max-w-[500px] mx-auto rounded-sm p-8 md:p-12 transition-all duration-300",
                styles.bg,
                styles.border,
                animate && "opacity-0 animate-[sFadeIn_0.9s_ease_0.15s_both]"
            )}
        >
            {/* Header */}
            <div className="text-center mb-8">
                <p className={cn("font-sans text-[8px] tracking-[0.22em] uppercase mb-1", styles.muted)}>
                    Sanctum{modeName ? ` · ${modeName}` : ''}
                </p>
                <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-accent mb-2.5">
                    Clarity Artifact
                </p>
                <div className="w-7 h-px bg-accent mx-auto opacity-60" />
            </div>

            {/* Sections */}
            {sections.map((section, idx) => {
                const content = artifact[section.key as keyof ArtifactContent];
                if (!content) return null;

                return (
                    <motion.div
                        key={section.key}
                        initial={animate ? { opacity: 0, y: 10 } : undefined}
                        animate={animate ? { opacity: 1, y: 0 } : undefined}
                        transition={{ delay: 0.3 + (idx * 0.1), duration: 0.6 }}
                        className={cn(
                            "mb-6",
                            section.deep && cn("p-5 rounded-sm border-l-2 border-accent", styles.deepBg)
                        )}
                    >
                        <div className={cn(
                            "font-sans text-[8px] tracking-[0.14em] uppercase mb-2 font-medium",
                            (section.highlight || section.deep) ? "text-accent" : styles.muted
                        )}>
                            {section.label}
                        </div>

                        <p className={cn(
                            "font-serif text-[15px] md:text-[16px] leading-[1.85]",
                            (section.highlight || section.deep) ? styles.highlight : styles.text,
                            (section.italic || section.quote) && "italic",
                            section.quote && "border-l-2 border-accent pl-4 ml-0.5 opacity-90"
                        )}>
                            {content}
                        </p>
                    </motion.div>
                );
            })}

            {/* Footer */}
            <div className={cn("text-center mt-7 pt-5 border-t", dark ? "border-border" : "border-black/5")}>
                <div className="flex justify-center gap-1 mb-1.5 opacity-50">
                    <div className="w-0.5 h-0.5 rounded-full bg-episteme" />
                    <div className="w-0.5 h-0.5 rounded-full bg-accent" />
                    <div className="w-0.5 h-0.5 rounded-full bg-phronesis" />
                </div>
                <p className={cn("font-serif italic text-[10px]", styles.muted)}>
                    What is true · What is possible · What matters
                </p>
            </div>
        </div>
    );
}
