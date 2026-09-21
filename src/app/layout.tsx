import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Primer — Your context lives with you.',
  description: 'Install once. Every AI agent knows your project — Cursor, Claude Code, Windsurf, Aider, Goose. Zero config.',
  openGraph: {
    title: 'Primer — Your context lives with you.',
    description: 'Install once. Every AI agent knows your project.',
    url: 'https://getprimer.cloud',
    siteName: 'Primer',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
