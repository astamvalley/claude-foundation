import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'claude-foundation',
  description: 'Claude Code 및 호환 AI 에이전트를 위한 Agent Skills 모음',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-[#0a0a0a] text-zinc-100 min-h-screen font-sans antialiased">
        <div className="border-t-2 border-orange-400/80" />
        <div className="max-w-2xl mx-auto px-6 py-16">{children}</div>
      </body>
    </html>
  )
}
