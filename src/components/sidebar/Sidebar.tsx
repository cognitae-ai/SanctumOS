// src/components/sidebar/Sidebar.tsx
import { createClient } from '@/lib/data/server/client';
import { SidebarClient } from './SidebarClient';
import { DEFAULT_CHANNELS } from '@/lib/soul/modes';
import { Session } from '@/lib/types';

export async function Sidebar() {
    const supabase = createClient();

    // TODO: Fetch real sessions from Supabase
    // const { data: sessions } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
    const sessions: Session[] = []; // Mock for now

    return (
        <aside className="h-full flex flex-col bg-surface border-r border-border w-full">
            <div className="p-4 border-b border-border shrink-0">
                <h1 className="font-serif text-xl tracking-wide text-text">SANCTUM</h1>
            </div>
            <div className="flex-1 min-h-0">
                {/* Pass default channels and fetched sessions to client */}
                <SidebarClient
                    channels={DEFAULT_CHANNELS}
                    sessions={sessions}
                />
            </div>
        </aside>
    );
}
