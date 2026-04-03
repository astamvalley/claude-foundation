import Link from 'next/link'
import { notFound } from 'next/navigation'
import { skills, REPO, GITHUB_BASE, RAW_BASE } from '@/lib/skills'
import CopyButton from '@/components/CopyButton'

export function generateStaticParams() {
  return skills.map((s) => ({ name: s.name }))
}

export function generateMetadata({ params }: { params: { name: string } }) {
  const skill = skills.find((s) => s.name === params.name)
  return { title: skill ? `${skill.name} — claude-foundation` : 'Not Found' }
}

export default function SkillPage({ params }: { params: { name: string } }) {
  const skill = skills.find((s) => s.name === params.name)
  if (!skill) notFound()

  const npxCmd = `npx skills add ${REPO} --skill ${skill.name} -a claude-code`
  const curlCmd = `curl -O ${RAW_BASE}/skills/${skill.name}/SKILL.md`
  const githubUrl = `${GITHUB_BASE}/tree/main/skills/${skill.name}`
  const rawSkillUrl = `${RAW_BASE}/skills/${skill.name}/SKILL.md`

  return (
    <main>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-10"
      >
        ← 돌아가기
      </Link>

      <header className="mb-10">
        <h1 className="font-mono text-2xl font-bold text-zinc-50 mb-3">{skill.name}</h1>
        <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{skill.longDescription}</p>
        {skill.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
            {skill.tags.map((tag) => (
              <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <section className="space-y-8">
        <div>
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">설치 / 다운로드</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500 mb-2">npx로 에이전트에 바로 설치</p>
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
                <code className="font-mono text-sm text-zinc-300 flex-1 overflow-x-auto whitespace-nowrap">
                  {npxCmd}
                </code>
                <CopyButton text={npxCmd} />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">curl로 파일만 다운로드</p>
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
                <code className="font-mono text-sm text-zinc-300 flex-1 overflow-x-auto whitespace-nowrap">
                  {curlCmd}
                </code>
                <CopyButton text={curlCmd} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={rawSkillUrl}
            download="SKILL.md"
            className="inline-flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg transition-colors"
          >
            ↓ SKILL.md 다운로드
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg transition-colors"
          >
            원본 레포 보기 ↗
          </a>
        </div>

        {skill.sources && skill.sources.length > 0 && (
          <div>
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">참고 출처</h2>
            <ul className="space-y-2">
              {skill.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
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
