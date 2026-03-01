import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    variable: '--font-cormorant',
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
    display: 'swap',
})

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    weight: ['400', '500', '700'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'SanctumOS',
    description: 'Structured reflection for moments that matter.',
    manifest: '/manifest.json',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
            <body className="font-sans antialiased overflow-hidden h-screen bg-bg text-text selection:bg-accent selection:text-bg">
                {children}
            </body>
        </html>
    )
}
