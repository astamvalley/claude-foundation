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
    <html lang="ko" className={`${inter.variable} ${mono.variable}`} data-scroll-behavior="smooth">
      <body className="bg-[#0a0a0a] text-zinc-100 min-h-screen font-sans antialiased overflow-x-hidden">
        <div className="border-t-2 border-orange-400/80" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col min-h-[calc(100vh-2px)]">
          <header className="mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
              <span className="text-xl font-mono font-semibold text-zinc-50 tracking-tight">
                claude-foundation
              </span>
              <div className="flex items-center gap-4">
                <a
                  href="https://astamvalley.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono"
                >
                  astamvalley ↗
                </a>
                <a
                  href="https://github.com/astamvalley/claude-foundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              Claude Code를 위한 Skills · Plugins 모음
            </p>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="mt-14 text-[11px] text-zinc-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>agentskills.io 호환</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/anthropics/skills"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-500 transition-colors"
                >
                  Anthropic 공식 스킬 ↗
                </a>
                <a
                  href="https://skills.sh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-500 transition-colors"
                >
                  skills.sh ↗
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
