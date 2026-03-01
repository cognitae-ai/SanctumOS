'use client';

import { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/lib/stores';
import { MODES } from '@/lib/soul/modes';
import { ModeCard } from './ModeCard';
import { PhaseBar } from './PhaseBar';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { ArtCard } from '@/components/artifacts/ArtCard';
import { SessionMode } from '@/lib/types';

export function ChatSession() {
    const {
        mode,
        phase,
        exchange,
        display,
        messages,
        artifact,
        resultView,
        startSession,
        addMessage,
        addDisplay,
        incrementExchange,
        setArtifact,
        setResultView,
    } = useSessionStore();

    const [isStreaming, setIsStreaming] = useState(false);
    const [streamedContent, setStreamedContent] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    // Check for session completion
    useEffect(() => {
        const totalExchanges = MODES[mode].exchanges;
        // If we have completed the final exchange (exchange > total) and no artifact yet
        // Note: exchange starts at 1? Store init is 0.
        // Exchange 1 = first turn. 
        // If exchange > total, it means we finished the last turn.
        // Wait, let's verfiy logic:
        // Start: exchange 0.
        // User sends -> exchange 1 (Guide replies).
        // ...
        // User sends -> exchange N (Guide replies with closing question).
        // User answers closing question -> exchange N+1? 
        // At this point, we generate artifact.

        // Actually, `incrementExchange` is called after Guide replies.
        // So if exchange === total, Guide just replied with closing Q.
        // User replies... we need to capture that reply, THEN generate artifact.

    }, [exchange, mode, artifact]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [display, phase, streamedContent]);

    const handleSend = async (text: string) => {
        if (isStreaming) return;

        const currentMode = MODES[mode];
        const isFinalTurn = exchange >= currentMode.exchanges;

        // 1. Add User Message
        const userMsg = { role: 'user' as const, content: text };
        addMessage(userMsg);
        addDisplay({ role: 'user', text });

        // If this was the answer to the closing question (Final Turn), DO NOT stream chat.
        // Instead, generate artifact.
        if (isFinalTurn) {
            setIsStreaming(true); // Reuse loading state
            try {
                // Generate Artifact
                const response = await fetch('/api/artifact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [...messages, userMsg],
                        mode
                    }),
                });

                if (!response.ok) throw new Error('Failed to generate artifact');

                const artifactData = await response.json();
                setArtifact(artifactData);
                setResultView('artifact');
                setIsStreaming(false);

            } catch (error) {
                console.error('Artifact error:', error);
                addDisplay({
                    role: 'assistant',
                    text: "I'm having trouble synthesizing your reflection. Please try again.",
                    phase: 'Error'
                });
                setIsStreaming(false);
            }
            return;
        }

        // Normal Chat Flow
        setIsStreaming(true);
        setStreamedContent('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    mode,
                    phase,
                    exchange: exchange + 1,
                }),
            });

            if (!response.ok) throw new Error(response.statusText);

            const data = response.body;
            if (!data) return;

            const reader = data.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulated = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                accumulated += chunkValue;
                setStreamedContent(accumulated);
            }

            const guideMsg = {
                role: 'assistant' as const,
                content: accumulated,
                phase: currentMode.guidePhases[exchange]?.name || 'Guide', // Approx phase name
                triadic: currentMode.guidePhases[exchange]?.triadic || null
            };

            addMessage(guideMsg);
            addDisplay({
                role: 'assistant',
                text: accumulated,
                phase: currentMode.guidePhases[exchange]?.name || 'Guide',
                triadic: currentMode.guidePhases[exchange]?.triadic || null
            });
            setIsStreaming(false);
            setStreamedContent('');
            incrementExchange();

        } catch (error) {
            console.error('Chat error:', error);
            setIsStreaming(false);
            addDisplay({
                role: 'assistant',
                text: "I'm having trouble connecting right now. Please try again.",
                phase: 'Error',
            });
        }
    };

    const handleModeSelect = (m: SessionMode) => {
        startSession(crypto.randomUUID(), m, 'mirror');
    };

    // ─── VIEW 1: MODE SELECTION ──────────────────────────────────
    if (phase === 'welcome') {
        return (
            <div className="h-full overflow-y-auto bg-bg p-4 md:p-8 flex flex-col items-center justify-center min-h-full">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="font-serif text-3xl md:text-4xl text-text">Begin a Session.</h1>
                        <p className="font-sans text-dim text-sm">Choose the depth of your reflection.</p>
                    </div>

                    <div className="grid gap-4">
                        {(Object.keys(MODES) as SessionMode[]).map((key) => (
                            <ModeCard
                                key={key}
                                mode={MODES[key]}
                                selected={false}
                                locked={false}
                                onSelect={() => handleModeSelect(key)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─── VIEW 2: ARTIFACT ────────────────────────────────────────
    if (artifact && resultView === 'artifact') {
        return (
            <div className="h-full overflow-y-auto bg-bg relative">
                <div className="p-4 md:p-8 flex justify-center min-h-full">
                    <ArtCard artifact={artifact} mode={mode} />
                </div>

                <button
                    onClick={() => setResultView('conversation')}
                    className="fixed bottom-6 right-6 px-4 py-2 bg-surface border border-border rounded-full text-xs uppercase tracking-widest hover:bg-surface-raised transition-colors shadow-sm"
                >
                    View Chat
                </button>
            </div>
        );
    }

    // ─── VIEW 3: ACTIVE SESSION ──────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-bg relative">
            <div className="shrink-0 z-10">
                <PhaseBar
                    mode={MODES[mode]}
                    exchange={exchange}
                    isReflection={artifact ? true : false}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                <div className="max-w-2xl mx-auto pb-24">
                    {display.map((msg, i) => (
                        <Message key={i} msg={msg} />
                    ))}

                    {/* Streaming Message (Chat) */}
                    {isStreaming && !artifact && (
                        <Message msg={{
                            role: 'assistant',
                            text: streamedContent || "...",
                            phase: 'Thinking...',
                        }} />
                    )}

                    {/* Loading Indicator (Artifact) */}
                    {isStreaming && (exchange >= MODES[mode].exchanges) && (
                        <div className="flex justify-center py-8">
                            <div className="animate-pulse flex flex-col items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-accent rounded-full mb-2" />
                                <span className="font-sans text-[10px] uppercase tracking-widest text-dim">Synthesizing Artifact...</span>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>
            </div>

            <div className="shrink-0 p-4 md:p-6 bg-gradient-to-t from-bg via-bg to-transparent">
                {/* Disable input if we are generating artifact */}
                <ChatInput
                    onSend={handleSend}
                    disabled={isStreaming || (!!artifact)}
                    placeholder={artifact ? "Session Complete" : "Type your response..."}
                />
            </div>

            {artifact && (
                <button
                    onClick={() => setResultView('artifact')}
                    className="fixed top-20 right-6 px-4 py-2 bg-surface border border-border rounded-full text-xs uppercase tracking-widest hover:bg-surface-raised transition-colors shadow-sm"
                >
                    View Artifact
                </button>
            )}
        </div>
    );
}
