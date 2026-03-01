import { AnthropicAdapter } from '@/lib/brain/anthropic';
import { buildSystemPrompt } from '@/lib/soul';
import { NextRequest, NextResponse } from 'next/server';
import { SessionMode, ResponseStyle } from '@/lib/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { messages, mode, exchange, style } = await req.json();

        // 1. Validate (Stub)
        const sessionMode: SessionMode = mode || 'standard';
        const sessionStyle: ResponseStyle = style || 'mirror';
        // Ensure exchange is a number
        const currentExchange = Number(exchange) || 1;

        // 2. Build System Prompt (The Soul)
        const systemPrompt = buildSystemPrompt(sessionMode, currentExchange, sessionStyle);

        // 3. Create Adapter (The Ghost)
        const adapter = new AnthropicAdapter();

        // 4. Stream Response
        const stream = await adapter.stream(
            messages,
            systemPrompt,
            {
                mode: sessionMode,
                exchange: currentExchange,
                style: sessionStyle,
                totalExchanges: 0, // Not strictly needed for stream
                userTier: 'free'
            }
        );

        // 5. Return Stream (AI SDK 3.1+ style)
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Content-Type-Options': 'nosniff',
            },
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
