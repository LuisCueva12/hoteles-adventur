'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function VolverArriba() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setVisible(scrollY > 300)
      setProgress(docH > 0 ? Math.min((scrollY / docH) * 100, 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // SVG circle progress
  const size = 48
  const stroke = 3
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ

  return (
    <button
      onClick={scrollToTop}
      aria-label="Volver arriba"
      className={`fixed bottom-8 right-6 z-40 group transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      {/* Tooltip */}
      <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
        Volver arriba
      </span>

      {/* SVG ring + button */}
      <div className="relative w-12 h-12">
        {/* Progress ring */}
        <svg
          width={size} height={size}
          className="absolute inset-0 -rotate-90"
        >
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="#FACC15"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-150"
          />
        </svg>

        {/* Inner button */}
        <div className="absolute inset-1 bg-yellow-400 group-hover:bg-yellow-300 rounded-full flex items-center justify-center shadow-md group-hover:shadow-yellow-400/40 group-hover:shadow-lg transition-all duration-200">
          <ArrowUp
            size={18}
            className="text-gray-900 transition-transform duration-200 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </button>
  )
}
