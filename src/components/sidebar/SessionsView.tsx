'use client';

import { motion } from 'framer-motion';
import { Session } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
// date-fns import removed as we use local timeAgo fallback

// Simple date formatter fallback if date-fns not installed
function timeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
}

interface SessionsViewProps {
    sessions: Session[];
}

export function SessionsView({ sessions }: SessionsViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex flex-col h-full overflow-y-auto px-4 py-2"
        >
            {sessions.length === 0 ? (
                <div className="text-center py-8 text-dim text-sm italic font-serif">
                    No sessions yet.
                </div>
            ) : (
                <div className="space-y-2">
                    {sessions.map(session => (
                        <Link
                            key={session.id}
                            href={`/session/${session.id}`}
                            className="block p-3 rounded hover:bg-surface-raised transition-colors group border border-transparent hover:border-border"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                    "text-[10px] tracking-wider uppercase font-medium px-1.5 py-0.5 rounded border",
                                    session.mode === 'quick' ? "text-episteme border-episteme/20 bg-episteme/10" :
                                        session.mode === 'standard' ? "text-accent border-accent/20 bg-accent/10" :
                                            "text-phronesis border-phronesis/20 bg-phronesis/10"
                                )}>
                                    {session.mode}
                                </span>
                                <span className="text-[10px] text-faint group-hover:text-dim transition-colors">
                                    {timeAgo(session.created_at)}
                                </span>
                            </div>
                            <p className="text-sm text-muted font-sans line-clamp-2">
                                {session.preview || "New Session"}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
