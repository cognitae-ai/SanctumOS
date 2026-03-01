'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface SplitLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export function SplitLayout({ sidebar, children }: SplitLayoutProps) {
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Drag handlers
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const onMove = (e: MouseEvent | TouchEvent) => {
            const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
            if (x) {
                setSidebarWidth(Math.max(200, Math.min(480, x)));
            }
        };

        const onUp = () => setIsDragging(false);

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove);
        window.addEventListener('touchend', onUp);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [isDragging]);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-bg text-text font-sans">
            {/* Sidebar Area */}
            <motion.div
                className={cn(
                    "relative h-full shrink-0 overflow-hidden",
                    isMobile ? "hidden" : "block"
                )}
                style={{ width: sidebarWidth }}
                initial={false}
            >
                {sidebar}

                {/* Resize Handle */}
                <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent/50 active:bg-accent transition-colors z-50"
                    onMouseDown={onMouseDown}
                />
            </motion.div>

            {/* Main Content Area */}
            <main className="flex-1 h-full min-w-0 bg-bg relative">
                {children}
            </main>

            {/* Mobile Tab Bar (Placeholder) */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around px-4 z-50">
                    {/* TODO: Mobile Tabs */}
                    <span className="text-xs text-dim">Tabs</span>
                </div>
            )}
        </div>
    );
}
