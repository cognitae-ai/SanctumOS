'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotesView } from './NotesView';
import { SessionsView } from './SessionsView';
import type { Channel, Note, Session } from '@/lib/types';
import { DefaultChannel } from '@/lib/types'; // Import specific type

interface SidebarClientProps {
    channels: DefaultChannel[];
    sessions: Session[];
}

type ViewMode = 'notes' | 'sessions';

export function SidebarClient({ channels, sessions }: SidebarClientProps) {
    const [mode, setMode] = useState<ViewMode>('notes');

    return (
        <div className="flex flex-col h-full bg-surface">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex gap-4">
                    <button
                        onClick={() => setMode('notes')}
                        className={`text-xs font-medium uppercase tracking-wider transition-colors ${mode === 'notes' ? 'text-text' : 'text-dim hover:text-muted'
                            }`}
                    >
                        Notes
                    </button>
                    <button
                        onClick={() => setMode('sessions')}
                        className={`text-xs font-medium uppercase tracking-wider transition-colors ${mode === 'sessions' ? 'text-text' : 'text-dim hover:text-muted'
                            }`}
                    >
                        Sessions
                    </button>
                </div>
                {/* User Badge / Profile Link could go here */}
                <div className="w-2 h-2 rounded-full bg-accent/50" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {mode === 'notes' ? (
                        <NotesView key="notes" channels={channels} />
                    ) : (
                        <SessionsView key="sessions" sessions={sessions} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
