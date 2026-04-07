import Link from 'next/link'
import { tools } from '@/lib/tools'
import TabNav from '@/components/TabNav'

export default function ToolsPage() {
  return (
    <>
      <TabNav />

      <section>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-zinc-600 uppercase tracking-widest">Tools</span>
          <span className="text-[11px] text-zinc-700 font-mono">{tools.length}</span>
        </div>
        <div className="border-t border-zinc-800 mt-3">
          {tools.map((tool, i) => (
            <Link key={tool.name} href={`/tools/${tool.name}`}>
              <div className="group flex items-start gap-3 sm:gap-5 py-5 border-b border-zinc-800/60 hover:border-zinc-700 transition-colors">
                <span className="font-mono text-xs text-zinc-700 pt-0.5 w-4 shrink-0 select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-sm font-medium text-zinc-100 group-hover:text-orange-300 transition-colors">
                      {tool.name}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500 leading-snug">{tool.description}</p>
                  <p className="text-[11px] font-mono text-zinc-700 mt-1.5">{tool.author}</p>
                </div>
                <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors text-sm pt-0.5 shrink-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
