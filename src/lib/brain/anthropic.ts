// ═══════════════════════════════════════════════════════════════
// SanctumOS v1.0.0 — Anthropic Adapter (The Ghost's Voice)
// src/lib/brain/anthropic.ts
// ═══════════════════════════════════════════════════════════════

import { anthropic } from '@ai-sdk/anthropic';
import { streamText, generateText } from 'ai';
import type { ModelAdapter, ChatMessage, SessionContext } from '@/lib/types';

/**
 * Implementation of the ModelAdapter using Vercel AI SDK + Anthropic.
 * This is the implementation detail of "The Ghost".
 */
export class AnthropicAdapter implements ModelAdapter {
    private model = anthropic('claude-3-5-sonnet-latest');

    async ping(): Promise<boolean> {
        try {
            // Light check to verify API key is valid
            await generateText({
                model: this.model,
                messages: [{ role: 'user', content: 'ping' }],
            });
            return true;
        } catch (error) {
            console.error('Anthropic ping failed:', error);
            return false;
        }
    }

    async stream(
        messages: ChatMessage[],
        systemPrompt: string,
        context: SessionContext
    ): Promise<ReadableStream<Uint8Array>> {
        // 1. Convert Sanctum messages to AI SDK CoreMessages if needed
        // (Our types are compatible: role 'user'|'assistant', content string)

        // 2. Stream
        const result = await streamText({
            model: this.model, // Defaults to claude-3-5-sonnet
            system: systemPrompt,
            messages: messages as any, // Cast to avoid minor type mismatches
            temperature: 0.7, // "Warm" for reflection
        });

        // 3. Return the generic stream for the client (server action compatible)
        return result.toTextStreamResponse().body as ReadableStream<Uint8Array>;
    }

    async generate(
        messages: ChatMessage[],
        systemPrompt: string
    ): Promise<string | null> {
        try {
            const { text } = await generateText({
                model: this.model,
                system: systemPrompt,
                messages: messages as any,
                temperature: 0.5, // Slightly more deterministic for artifacts
            });
            return text;
        } catch (error) {
            console.error('Anthropic generation failed:', error);
            return null;
        }
    }
}

// Singleton instance
export const ghost = new AnthropicAdapter();
