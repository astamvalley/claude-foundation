'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TabNav() {
  const pathname = usePathname()
  const isPlugins = pathname.startsWith('/plugins')
  const isMcp = pathname.startsWith('/mcp')
  const isTools = pathname.startsWith('/tools')
  const isFinds = pathname.startsWith('/finds')
  const isSkills = !isPlugins && !isMcp && !isTools && !isFinds

  const tab = (label: string, href: string, active: boolean) => (
    <Link
      href={href}
      className={`whitespace-nowrap text-xs font-mono px-4 py-2 border-b-2 transition-colors ${
        active
          ? 'border-orange-400 text-zinc-100'
          : 'border-transparent text-zinc-600 hover:text-zinc-400'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <div className="flex gap-0 overflow-x-auto border-b border-zinc-800 mb-8 scrollbar-none">
      {tab('Skills', '/', isSkills)}
      {tab('Plugins', '/plugins', isPlugins)}
      {tab('MCP', '/mcp', isMcp)}
      {tab('Tools', '/tools', isTools)}
      {tab('Finds', '/finds', isFinds)}
    </div>
  )
}
