'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TabNav() {
  const pathname = usePathname()
  const isExternal = pathname.startsWith('/external')
  const isPlugins = pathname.startsWith('/plugins')
  const isMcp = pathname.startsWith('/mcp')
  const isTools = pathname.startsWith('/tools')
  const isHome = !isExternal && !isPlugins && !isMcp && !isTools

  return (
    <div className="flex gap-0 overflow-x-auto border-b border-zinc-800 mb-8 scrollbar-none">
      <Link
        href="/"
        className={`whitespace-nowrap text-xs font-mono px-4 py-2 border-b-2 transition-colors ${
          isHome
            ? 'border-orange-400 text-zinc-100'
            : 'border-transparent text-zinc-600 hover:text-zinc-400'
        }`}
      >
        My Skills
      </Link>
      <Link
        href="/external"
        className={`whitespace-nowrap text-xs font-mono px-4 py-2 border-b-2 transition-colors ${
          isExternal
            ? 'border-orange-400 text-zinc-100'
            : 'border-transparent text-zinc-600 hover:text-zinc-400'
        }`}
      >
        External Skills
      </Link>
      <Link
        href="/plugins"
        className={`whitespace-nowrap text-xs font-mono px-4 py-2 border-b-2 transition-colors ${
          isPlugins
            ? 'border-orange-400 text-zinc-100'
            : 'border-transparent text-zinc-600 hover:text-zinc-400'
        }`}
      >
        Plugins
      </Link>
      <Link
        href="/mcp"
        className={`whitespace-nowrap text-xs font-mono px-4 py-2 border-b-2 transition-colors ${
          isMcp
            ? 'border-orange-400 text-zinc-100'
            : 'border-transparent text-zinc-600 hover:text-zinc-400'
        }`}
      >
        MCP
      </Link>
      <Link
        href="/tools"
        className={`whitespace-nowrap text-xs font-mono px-4 py-2 border-b-2 transition-colors ${
          isTools
            ? 'border-orange-400 text-zinc-100'
            : 'border-transparent text-zinc-600 hover:text-zinc-400'
        }`}
      >
        Tools
      </Link>
    </div>
  )
}
