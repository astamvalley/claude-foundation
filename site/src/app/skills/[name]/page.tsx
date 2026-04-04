import Link from 'next/link'
import { notFound } from 'next/navigation'
import { skills, REPO, GITHUB_BASE, RAW_BASE } from '@/lib/skills'
import CopyButton from '@/components/CopyButton'

export function generateStaticParams() {
  return skills.map((s) => ({ name: s.name }))
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const skill = skills.find((s) => s.name === name)
  return { title: skill ? `${skill.name} — claude-foundation` : 'Not Found' }
}

export default async function SkillPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const skill = skills.find((s) => s.name === name)
  if (!skill) notFound()

  const npxCmd = `npx skills add ${REPO} --skill ${skill.name} -a claude-code`
  const curlCmd = `curl -O ${RAW_BASE}/skills/${skill.name}/SKILL.md`
  const githubUrl = `${GITHUB_BASE}/tree/main/skills/${skill.name}`
  const rawSkillUrl = `${RAW_BASE}/skills/${skill.name}/SKILL.md`

  return (
    <main>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors mb-12"
      >
        ← 돌아가기
      </Link>

      <header className="mb-12 pb-8 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="font-mono text-xl font-semibold text-zinc-50">{skill.name}</h1>
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{skill.longDescription}</p>
      </header>

      <section className="space-y-10">
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-4">설치</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-600 mb-2 font-mono">npx — 에이전트에 바로 설치</p>
              <div className="flex items-center gap-3 border border-zinc-800 rounded px-4 py-3 bg-zinc-900/50">
                <code className="font-mono text-sm text-orange-300/90 flex-1 overflow-x-auto whitespace-nowrap">
                  {npxCmd}
                </code>
                <CopyButton text={npxCmd} />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-600 mb-2 font-mono">curl — 파일만 다운로드</p>
              <div className="flex items-center gap-3 border border-zinc-800 rounded px-4 py-3 bg-zinc-900/50">
                <code className="font-mono text-sm text-zinc-400 flex-1 overflow-x-auto whitespace-nowrap">
                  {curlCmd}
                </code>
                <CopyButton text={curlCmd} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={rawSkillUrl}
            download="SKILL.md"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 px-3 py-2 rounded transition-colors"
          >
            ↓ SKILL.md
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 px-3 py-2 rounded transition-colors"
          >
            GitHub ↗
          </a>
        </div>

        {skill.sources && skill.sources.length > 0 && (
          <div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-4">참고 출처</p>
            <ul className="space-y-2.5">
              {skill.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-zinc-500 hover:text-orange-300 transition-colors"
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
}
