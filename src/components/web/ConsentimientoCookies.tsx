'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

function safeGetConsent(): boolean {
    if (typeof window === 'undefined') return false
    try {
        return localStorage.getItem('cookie-consent') !== null
    } catch {
        return false
    }
}

function safeSetConsent(value: string): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem('cookie-consent', value)
    } catch {
        // Silently fail
    }
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const hasConsent = safeGetConsent()
    if (!hasConsent) {
        setIsVisible(true)
    }
  }, [mounted])

  const updateConsent = (value: 'accepted' | 'rejected') => {
    safeSetConsent(value)
    setIsVisible(false)
  }

  if (!mounted || !isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl animate-slideInUp">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Cookie className="w-8 h-8 text-yellow-400" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Usamos cookies</h3>
            <p className="text-sm text-gray-600 mb-3">
              Utilizamos cookies para mejorar tu experiencia de navegacion, personalizar contenido y analizar
              nuestro trafico. Al hacer clic en &quot;Aceptar&quot;, aceptas nuestro uso de cookies.{` `}
              <Link href="/privacidad" className="text-yellow-400 hover:underline">
                Mas informacion
              </Link>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => updateConsent('accepted')}
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all duration-300 text-sm"
              >
                Aceptar
              </button>
              <button
                onClick={() => updateConsent('rejected')}
                className="px-6 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-300 text-sm"
              >
                Rechazar
              </button>
            </div>
          </div>

          <button
            onClick={() => updateConsent('rejected')}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
