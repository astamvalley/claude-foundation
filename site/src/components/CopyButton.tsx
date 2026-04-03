'use client'

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-xs px-2 py-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
    >
      {copied ? '복사됨 ✓' : '복사'}
    </button>
  )
}
