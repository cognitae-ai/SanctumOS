import { AnthropicAdapter } from '@/lib/brain/anthropic';
import { buildArtifactPrompt } from '@/lib/soul';
import { NextResponse } from 'next/server';
import { SessionMode, ArtifactContent } from '@/lib/types';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { messages, mode } = await req.json();
        const sessionMode: SessionMode = mode || 'standard';

        // 1. Build Prompt
        const systemPrompt = buildArtifactPrompt(sessionMode);

        // 2. Generate
        const adapter = new AnthropicAdapter();
        const text = await adapter.generate(messages, systemPrompt);

        if (!text) {
            throw new Error('Failed to generate artifact text');
        }

        // 3. Parse Sections
        // The prompt enforces headers:
        // WHAT YOU BROUGHT, WHAT WE EXPLORED, WHAT EMERGED, 
        // WHAT WAS UNDERNEATH (Deep only), YOUR WORDS BACK TO YOU, A QUESTION TO CARRY

        const content: ArtifactContent = {
            brought: extractSection(text, 'WHAT YOU BROUGHT'),
            explored: extractSection(text, 'WHAT WE EXPLORED'),
            emerged: extractSection(text, 'WHAT EMERGED'),
            words: extractSection(text, 'YOUR WORDS BACK TO YOU'),
            question: extractSection(text, 'A QUESTION TO CARRY'),
            // Optional 'underneath' gets added if present
        };

        const underneath = extractSection(text, 'WHAT WAS UNDERNEATH');
        if (underneath) {
            content.underneath = underneath;
        }

        return NextResponse.json(content);

    } catch (error) {
        console.error('Artifact API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate artifact' },
            { status: 500 }
        );
    }
}

function extractSection(fullText: string, header: string): string {
    const pattern = new RegExp(`${header}\\s*\\n+([\\s\\S]*?)(?=\\n+[A-Z ]+\\n|$)`, 'i');
    const match = fullText.match(pattern);
    return match ? match[1].trim() : '';
}
