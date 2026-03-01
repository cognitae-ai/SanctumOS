'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
}

export function ChatInput({ onSend, disabled, placeholder, autoFocus }: ChatInputProps) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto'; // Reset to recalculate
        const newHeight = Math.min(textarea.scrollHeight, 200); // Cap at 200px
        textarea.style.height = `${newHeight}px`;
    }, [value]);

    useEffect(() => {
        if (autoFocus && !disabled) {
            textareaRef.current?.focus();
        }
    }, [autoFocus, disabled]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !disabled) {
                onSend(value);
                setValue('');
            }
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative bg-bg border border-dim/20 rounded-lg shadow-sm focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-200">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholder || "Type your response..."}
                    rows={1}
                    className="w-full bg-transparent text-text font-sans text-sm resize-none py-3 px-4 focus:outline-none disabled:opacity-50 placeholder:text-dim"
                    style={{ minHeight: '46px' }}
                />

                {/* Send Button (Optional, maybe just rely on Enter?) 
            Prototype used Enter. We'll add a subtle visual indicator maybe.
        */}
                <div className="absolute right-2 bottom-2">
                    <button
                        onClick={() => {
                            if (value.trim() && !disabled) {
                                onSend(value);
                                setValue('');
                            }
                        }}
                        disabled={!value.trim() || disabled}
                        className="p-1.5 rounded-md text-dim hover:text-accent hover:bg-accent/10 disabled:opacity-0 transition-all duration-200"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Helper text */}
            <div className="absolute -bottom-6 right-0 text-[10px] text-faint uppercase tracking-wider">
                Return to send · Shift+Return for new line
            </div>
        </div>
    );
}
