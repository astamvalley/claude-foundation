'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface ListItem {
  name: string
  displayName?: string
  description: string
  tags: string[]
  source: string
  author?: string
  href: string
}

export default function FilteredList({ items }: { items: ListItem[] }) {
  const sources = [...new Set(items.map((i) => i.source))]
  const showFilter = sources.length >= 2
  const [activeSource, setActiveSource] = useState('all')

  const filtered =
    activeSource === 'all' ? items : items.filter((i) => i.source === activeSource)

  const chipClass = (active: boolean) =>
    `text-[10px] font-mono border px-2 py-0.5 rounded-sm uppercase tracking-wide cursor-pointer transition-colors select-none ${
      active
        ? 'text-orange-400 border-orange-400'
        : 'text-zinc-600 border-zinc-800 hover:text-zinc-400 hover:border-zinc-700'
    }`

  return (
    <>
      {showFilter && (
        <div className="flex items-center gap-2 mb-6">
          <button className={chipClass(activeSource === 'all')} onClick={() => setActiveSource('all')}>
            all
          </button>
          {sources.map((source) => (
            <button
              key={source}
              className={chipClass(activeSource === source)}
              onClick={() => setActiveSource(source)}
            >
              {source}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-zinc-600 uppercase tracking-widest">
          {filtered.length === items.length ? `${items.length}` : `${filtered.length} / ${items.length}`}
        </span>
      </div>

      <div className="border-t border-zinc-800 mt-3">
        {filtered.map((item, i) => (
          <Link key={item.name} href={item.href}>
            <div className="group flex items-start gap-3 sm:gap-5 py-5 border-b border-zinc-800/60 hover:border-zinc-700 transition-colors">
              <span className="font-mono text-xs text-zinc-700 pt-0.5 w-4 shrink-0 select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-sm font-medium text-zinc-100 group-hover:text-orange-300 transition-colors">
                    {item.displayName ?? item.name}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {showFilter && (
                      <span className="text-[10px] font-mono text-orange-900 border border-orange-900/50 bg-orange-900/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                        {item.source}
                      </span>
                    )}
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-zinc-500 leading-snug">{item.description}</p>
                {item.author && (
                  <p className="text-[11px] font-mono text-zinc-700 mt-1.5">{item.author}</p>
                )}
              </div>
              <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors text-sm pt-0.5 shrink-0">
                →
              </span>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="py-10 text-center text-xs font-mono text-zinc-700">no items</p>
        )}
      </div>
    </>
  )
}
