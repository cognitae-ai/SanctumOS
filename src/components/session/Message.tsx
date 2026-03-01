'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { TRIADIC_COLORS } from '@/lib/soul/modes';
import type { DisplayMessage } from '@/lib/types';

interface MessageProps {
    msg: DisplayMessage;
}

export function Message({ msg }: MessageProps) {
    const isGuide = msg.role === 'assistant';

    // Resolve triadic color if present
    const triadicColor = msg.triadic && msg.triadic in TRIADIC_COLORS
        ? TRIADIC_COLORS[msg.triadic as keyof typeof TRIADIC_COLORS]
        : '#c49a6c'; // Default accent

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6"
        >
            {isGuide ? (
                <div className="pr-4 md:pr-12">
                    {/* Guide Header */}
                    <div className="flex items-center gap-2 mb-2.5">
                        <div
                            className="w-1.5 h-1.5 rounded-full opacity-70"
                            style={{ backgroundColor: triadicColor }}
                        />
                        <span
                            className="font-sans text-[9px] tracking-widest uppercase font-medium"
                            style={{ color: triadicColor || '#847b6f' }} // Use dim by default if no triadic
                        >
                            Guide {msg.phase ? `· ${msg.phase}` : ''}
                        </span>
                    </div>

                    {/* Guide Content */}
                    <p className="font-serif text-[17px] md:text-[19px] leading-[1.8] text-guide pl-3.5">
                        {msg.text}
                    </p>
                </div>
            ) : (
                <div className="pl-3.5 border-l-2 border-faint ml-1 md:ml-4">
                    {/* User Content */}
                    <p className="font-sans text-[13px] md:text-[13.5px] leading-[1.85] text-text/80 whitespace-pre-wrap">
                        {msg.text}
                    </p>
                </div>
            )}
        </motion.div>
    );
}
