'use client'

import dynamic from 'next/dynamic'
import { Bot } from 'lucide-react'
import { useState } from 'react'

const AIChatbot = dynamic(() => import('@/components/web/ChatbotIA'), {
  ssr: false,
  loading: () => null,
})

export function HomeChatLauncher() {
  const [enabled, setEnabled] = useState(false)

  if (enabled) {
    return <AIChatbot defaultOpen />
  }

  return (
    <button
      type="button"
      onClick={() => setEnabled(true)}
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Abrir chat de Adventur"
    >
      <span className="absolute inset-0 rounded-full bg-amber-400/35 blur-2xl transition-opacity group-hover:opacity-90" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-3xl border border-amber-200/70 bg-white text-amber-500 shadow-[0_20px_60px_rgba(251,191,36,0.28)] transition-transform group-hover:-translate-y-1">
        <Bot className="h-6 w-6" />
      </span>
    </button>
  )
}
