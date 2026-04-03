import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'claude-foundation',
  description: 'Claude Code 및 호환 AI 에이전트를 위한 Agent Skills 모음',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-sans antialiased">
        <div className="max-w-3xl mx-auto px-5 py-14">{children}</div>
      </body>
    </html>
  )
}
