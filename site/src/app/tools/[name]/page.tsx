import Link from 'next/link'
import { notFound } from 'next/navigation'
import { tools } from '@/lib/tools'
import CopyButton from '@/components/CopyButton'

export function generateStaticParams() {
  return tools.map((t) => ({ name: t.name }))
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const tool = tools.find((t) => t.name === name)
  return { title: tool ? `${tool.name} — claude-foundation` : 'Not Found' }
}

export default async function ToolPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const tool = tools.find((t) => t.name === name)
  if (!tool) notFound()

  return (
    <>
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors mb-12"
      >
        ← 돌아가기
      </Link>

      <header className="mb-12 pb-8 border-b border-zinc-800">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="font-mono text-xl font-semibold text-zinc-50">{tool.name}</h1>
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-[11px] font-mono text-zinc-600 mb-4">{tool.author}</p>
        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{tool.longDescription}</p>
      </header>

      <section className="space-y-12">
        {/* 토큰 절약 테이블 */}
        {tool.savingsTable && (
          <div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-4">토큰 절약 (30분 세션 기준)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-zinc-600 py-2 pr-4 font-normal">명령어</th>
                    <th className="text-right text-zinc-600 py-2 pr-4 font-normal">빈도</th>
                    <th className="text-right text-zinc-600 py-2 pr-4 font-normal">기본</th>
                    <th className="text-right text-zinc-600 py-2 pr-4 font-normal">rtk</th>
                    <th className="text-right text-zinc-600 py-2 font-normal">절약</th>
                  </tr>
                </thead>
                <tbody>
                  {tool.savingsTable.map((row) => (
                    <tr key={row.operation} className="border-b border-zinc-800/40">
                      <td className="text-zinc-300 py-2 pr-4">{row.operation}</td>
                      <td className="text-zinc-600 text-right py-2 pr-4">{row.frequency}</td>
                      <td className="text-zinc-600 text-right py-2 pr-4">{row.standard}</td>
                      <td className="text-zinc-500 text-right py-2 pr-4">{row.rtk}</td>
                      <td className="text-orange-400/80 text-right py-2">{row.savings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-zinc-700 mt-2">중간 규모 TypeScript/Rust 프로젝트 기준 추정치. 실제 절약량은 프로젝트 크기에 따라 다를 수 있다.</p>
          </div>
        )}

        {/* 요구사항 */}
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-4">요구사항</p>
          <ul className="space-y-1.5">
            {tool.requirements.map((req) => (
              <li key={req} className="flex items-start gap-2 text-sm text-zinc-500">
                <span className="text-zinc-700 mt-0.5 shrink-0">—</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* 설치 */}
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-4">설치</p>
          <div className="space-y-2">
            {tool.installSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-700 w-4 shrink-0 select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-3 flex-1 border border-zinc-800 rounded px-4 py-2.5 bg-zinc-900/50">
                  <code className="font-mono text-sm text-orange-300/90 flex-1 overflow-x-auto whitespace-nowrap">
                    {step}
                  </code>
                  {!step.startsWith('#') && <CopyButton text={step} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 자동 리라이트 훅 */}
        {tool.hookSection && (
          <div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-4">자동 리라이트 훅</p>
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line mb-6">{tool.hookSection.description}</p>

            {/* 플로우 */}
            <div className="mb-6">
              <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-3">동작 흐름</p>
              <ol className="space-y-2">
                {tool.hookSection.flow.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-zinc-500">
                    <span className="font-mono text-xs text-zinc-700 shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* 리라이트 테이블 */}
            <div className="mb-4">
              <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-3">자동 변환 목록</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-zinc-600 py-2 pr-6 font-normal">원본 명령어</th>
                      <th className="text-left text-zinc-600 py-2 font-normal">변환 후</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tool.hookSection.rewriteTable.map((row) => (
                      <tr key={row.raw} className="border-b border-zinc-800/40">
                        <td className="text-zinc-500 py-2 pr-6">{row.raw}</td>
                        <td className="text-orange-300/80 py-2">{row.rewritten}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {tool.hookSection.note && (
              <p className="text-xs text-zinc-600 italic">{tool.hookSection.note}</p>
            )}
          </div>
        )}

        {/* 명령어 */}
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-6">명령어</p>
          <div className="space-y-10">
            {tool.commandGroups.map((group) => (
              <div key={group.category}>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-4 pl-5 border-l border-zinc-800">
                  {group.category}
                </p>
                <div className="space-y-8">
                  {group.commands.map((cmd) => (
                    <div key={cmd.name} className="border-l border-zinc-800 pl-5">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <code className="font-mono text-sm font-semibold text-orange-300/90">{cmd.name}</code>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-3">{cmd.description}</p>
                      {cmd.note && (
                        <p className="text-xs text-zinc-600 mb-3 italic">{cmd.note}</p>
                      )}
                      <div className="space-y-1.5">
                        {cmd.examples.map((ex) => (
                          <div key={ex} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-1 bg-zinc-900/40 border border-zinc-800/60 rounded px-3 py-2">
                              <code className="font-mono text-xs text-zinc-400 flex-1">{ex}</code>
                              <CopyButton text={ex} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub 링크 */}
        <div>
          <a
            href={tool.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 px-3 py-2 rounded transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </section>
    </>
  )
}
