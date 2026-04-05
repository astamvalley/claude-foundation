import Link from 'next/link'
import { notFound } from 'next/navigation'
import { mcps } from '@/lib/mcps'
import CopyButton from '@/components/CopyButton'

export function generateStaticParams() {
  return mcps.map((m) => ({ name: m.name }))
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const mcp = mcps.find((m) => m.name === name)
  return { title: mcp ? `${mcp.displayName} MCP — claude-foundation` : 'Not Found' }
}

export default async function McpPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const mcp = mcps.find((m) => m.name === name)
  if (!mcp) notFound()

  return (
    <main>
      <Link
        href="/mcp"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors mb-12"
      >
        ← 돌아가기
      </Link>

      <header className="mb-12 pb-8 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-mono text-xl font-semibold text-zinc-50">{mcp.displayName}</h1>
          {mcp.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-[11px] font-mono text-zinc-600 mb-4">
          maintained by{' '}
          <a
            href={mcp.maintainerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors"
          >
            {mcp.maintainer} ↗
          </a>
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{mcp.longDescription}</p>
      </header>

      <section className="space-y-10">
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-4">무엇을 할 수 있나</p>
          <div className="space-y-4">
            {mcp.capabilities.map((cap) => (
              <div key={cap.title} className="border border-zinc-800 rounded px-4 py-4 bg-zinc-900/30">
                <p className="font-mono text-sm text-zinc-200 mb-1.5">{cap.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {mcp.setup.map((s) => (
            <div key={s.target}>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-[11px] text-zinc-600 uppercase tracking-widest">{s.target}</p>
              </div>
              <p className="text-xs text-zinc-600 mb-3 font-mono leading-relaxed">{s.description}</p>
              <div className="relative border border-zinc-800 rounded bg-zinc-900/50">
                <pre className={`font-mono text-sm px-4 py-3 overflow-x-auto leading-relaxed ${s.type === 'cmd' ? 'text-orange-300/90' : 'text-zinc-300'}`}>
                  {s.code}
                </pre>
                <div className="absolute top-2.5 right-3">
                  <CopyButton text={s.code} />
                </div>
              </div>
              {s.note && (
                <p className="text-xs text-zinc-700 mt-2 font-mono">{s.note}</p>
              )}
            </div>
          ))}
        </div>

        {mcp.alternative && (
          <div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-3">대안 — {mcp.alternative.name}</p>
            <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-line mb-6">{mcp.alternative.description}</p>
            <div className="space-y-5">
              {mcp.alternative.setup.map((s) => (
                <div key={s.target}>
                  <p className="text-xs text-zinc-600 mb-2 font-mono">{s.target} — {s.description}</p>
                  <div className="relative border border-zinc-800 rounded bg-zinc-900/50">
                    <pre className="font-mono text-sm text-orange-300/90 px-4 py-3 overflow-x-auto leading-relaxed">
                      {s.code}
                    </pre>
                    <div className="absolute top-2.5 right-3">
                      <CopyButton text={s.code} />
                    </div>
                  </div>
                  {s.note && <p className="text-xs text-zinc-700 mt-2 font-mono">{s.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <a
            href={mcp.repoUrl}
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
