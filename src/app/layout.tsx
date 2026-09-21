import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Primer — Your context lives with you.',
  description: 'Install once. Every AI agent knows your project — Cursor, Claude Code, Windsurf, Aider, Goose. Zero config.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Primer — Your context lives with you.',
    description: 'Install once. Every AI agent knows your project.',
    url: 'https://www.getprimer.cloud',
    siteName: 'Primer',
    type: 'website',
    images: [{ url: '/logo.svg', width: 120, height: 32, alt: 'primer.' }],
  },
  twitter: {
    card: 'summary',
    title: 'Primer — Your context lives with you.',
    description: 'Install once. Every AI agent knows your project.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
