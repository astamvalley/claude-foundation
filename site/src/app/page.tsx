import Link from 'next/link'
import { skills, REPO } from '@/lib/skills'
import CopyButton from '@/components/CopyButton'
import TabNav from '@/components/TabNav'

export default function Home() {
  const installAll = `npx skills add ${REPO}`

  return (
    <main>
      <header className="mb-8">
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-xl font-mono font-semibold text-zinc-50 tracking-tight">
            claude-foundation
          </h1>
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
              href={`https://github.com/${REPO}`}
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

      <TabNav />

      <div className="mb-8">
        <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-2">전체 설치</p>
        <div className="flex items-center gap-3 border border-zinc-800 rounded px-4 py-3 bg-zinc-900/50">
          <code className="font-mono text-sm text-orange-300/90 flex-1">{installAll}</code>
          <CopyButton text={installAll} />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-zinc-600 uppercase tracking-widest">Skills</span>
          <span className="text-[11px] text-zinc-700 font-mono">{skills.length}</span>
        </div>
        <div className="border-t border-zinc-800 mt-3">
          {skills.map((skill, i) => (
            <Link key={skill.name} href={`/skills/${skill.name}`}>
              <div className="group flex items-start gap-5 py-5 border-b border-zinc-800/60 hover:border-zinc-700 transition-colors">
                <span className="font-mono text-xs text-zinc-700 pt-0.5 w-4 shrink-0 select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-mono text-sm font-medium text-zinc-100 group-hover:text-orange-300 transition-colors">
                      {skill.name}
                    </span>
                    <div className="flex gap-1.5">
                      {skill.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500 leading-snug">{skill.description}</p>
                </div>
                <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors text-sm pt-0.5 shrink-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-14 text-[11px] text-zinc-700">
        <div className="flex items-center justify-between mb-3">
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
    </main>
  )
}
