'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TabNav() {
  const pathname = usePathname()
  const isExternal = pathname.startsWith('/external')
  const isPlugins = pathname.startsWith('/plugins')
  const isHome = !isExternal && !isPlugins

  return (
    <div className="flex gap-0 border-b border-zinc-800 mb-8">
      <Link
        href="/"
        className={`text-xs font-mono px-4 py-2 border-b-2 transition-colors ${
          isHome
            ? 'border-orange-400 text-zinc-100'
            : 'border-transparent text-zinc-600 hover:text-zinc-400'
        }`}
      >
        My Skills
      </Link>
      <Link
        href="/external"
        className={`text-xs font-mono px-4 py-2 border-b-2 transition-colors ${
          isExternal
            ? 'border-orange-400 text-zinc-100'
            : 'border-transparent text-zinc-600 hover:text-zinc-400'
        }`}
      >
        External Skills
      </Link>
      <Link
        href="/plugins"
        className={`text-xs font-mono px-4 py-2 border-b-2 transition-colors ${
          isPlugins
            ? 'border-orange-400 text-zinc-100'
            : 'border-transparent text-zinc-600 hover:text-zinc-400'
        }`}
      >
        Plugins
      </Link>
    </div>
  )
}
