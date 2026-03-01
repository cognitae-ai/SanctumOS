'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DefaultChannel } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface NotesViewProps {
    channels: DefaultChannel[];
}

export function NotesView({ channels }: NotesViewProps) {
    const [activeChannelId, setActiveChannelId] = useState<string>(channels[0]?.id || 'know');

    const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col h-full"
        >
            {/* Channel Filters */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                {channels.map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => setActiveChannelId(channel.id)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap",
                            activeChannelId === channel.id
                                ? "bg-surface-raised text-text border border-border"
                                : "text-dim hover:text-muted hover:bg-surface-raised/50"
                        )}
                        style={{
                            borderColor: activeChannelId === channel.id ? channel.color : 'transparent'
                        }}
                    >
                        <span style={{ color: channel.color }}>{channel.icon}</span>
                        <span>{channel.id}</span>
                    </button>
                ))}
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
                {/* Placeholder for Notes List */}
                <div className="text-center py-8 text-dim text-sm italic font-serif">
                    No notes in {activeChannel?.name || 'this channel'} yet.
                </div>

                {/* Quick Input would go here */}
            </div>
        </motion.div>
    );
}
