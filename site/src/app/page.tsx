import Link from 'next/link'
import { skills, REPO } from '@/lib/skills'
import CopyButton from '@/components/CopyButton'

export default function Home() {
  const installAll = `npx skills add ${REPO}`

  return (
    <main>
      <header className="mb-14">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-mono font-bold text-zinc-50">claude-foundation</h1>
          <a
            href={`https://github.com/${REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors border border-zinc-800 hover:border-zinc-600 px-2 py-0.5 rounded"
          >
            GitHub ↗
          </a>
        </div>
        <p className="text-zinc-400 mb-6">
          Claude Code 및 호환 AI 에이전트를 위한 Agent Skills 모음
        </p>
        <div>
          <p className="text-xs text-zinc-500 mb-1.5">전체 설치</p>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 max-w-lg">
            <code className="font-mono text-sm text-zinc-300 flex-1">{installAll}</code>
            <CopyButton text={installAll} />
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
          스킬 — {skills.length}개
        </h2>
        <div className="flex flex-col gap-3">
          {skills.map((skill) => (
            <Link key={skill.name} href={`/skills/${skill.name}`} className="block">
              <div className="group flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-4 hover:border-zinc-600 transition-all hover:bg-zinc-900/80">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-sm font-medium text-zinc-100 shrink-0">
                    {skill.name}
                  </span>
                  <span className="text-zinc-500 text-sm truncate hidden sm:block">
                    {skill.description}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded hidden sm:block">
                      {tag}
                    </span>
                  ))}
                  <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-16 text-xs text-zinc-600 flex items-center gap-2">
        <span>agentskills.io 호환</span>
        <span>·</span>
        <a href="https://skills.sh" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">
          skills.sh ↗
        </a>
      </footer>
    </main>
  )
}
