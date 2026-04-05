import Link from 'next/link'
import { notFound } from 'next/navigation'
import { plugins } from '@/lib/plugins'
import CopyButton from '@/components/CopyButton'

export function generateStaticParams() {
  return plugins.map((p) => ({ name: p.name }))
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const plugin = plugins.find((p) => p.name === name)
  return { title: plugin ? `${plugin.name} — claude-foundation` : 'Not Found' }
}

export default async function PluginPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const plugin = plugins.find((p) => p.name === name)
  if (!plugin) notFound()

  return (
    <main>
      <Link
        href="/plugins"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors mb-12"
      >
        ← 돌아가기
      </Link>

      <header className="mb-12 pb-8 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-mono text-xl font-semibold text-zinc-50">{plugin.name}</h1>
          {plugin.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-[11px] font-mono text-zinc-600 mb-4">{plugin.author}</p>
        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{plugin.longDescription}</p>
      </header>

      <section className="space-y-12">
        {/* 요구사항 */}
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-4">요구사항</p>
          <ul className="space-y-1.5">
            {plugin.requirements.map((req) => (
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
            {plugin.installSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-700 w-4 shrink-0 select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-3 flex-1 border border-zinc-800 rounded px-4 py-2.5 bg-zinc-900/50">
                  <code className="font-mono text-sm text-orange-300/90 flex-1 overflow-x-auto whitespace-nowrap">
                    {step}
                  </code>
                  <CopyButton text={step} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 슬래시 커맨드 */}
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-4">슬래시 커맨드</p>
          <div className="space-y-8">
            {plugin.commands.map((cmd) => (
              <div key={cmd.name} className="border-l border-zinc-800 pl-5">
                <div className="flex items-center gap-3 mb-2">
                  <code className="font-mono text-sm font-semibold text-orange-300/90">{cmd.name}</code>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-3">{cmd.description}</p>
                {cmd.note && (
                  <p className="text-xs text-zinc-600 mb-3 italic">{cmd.note}</p>
                )}
                <div className="space-y-1.5">
                  {cmd.examples.map((ex) => (
                    <div key={ex} className="flex items-center gap-2 group/ex">
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

        {/* GitHub 링크 */}
        <div>
          <a
            href={plugin.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 px-3 py-2 rounded transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </section>
    </main>
  )
}
