'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import Link from 'next/link'

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent')
        if (!consent) {
            setIsVisible(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted')
        setIsVisible(false)
    }

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'rejected')
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl animate-slideInUp">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <Cookie className="w-8 h-8 text-red-600" />
                    </div>
                    
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                            Usamos cookies
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Utilizamos cookies para mejorar tu experiencia de navegación, personalizar contenido y analizar nuestro tráfico. 
                            Al hacer clic en "Aceptar", aceptas nuestro uso de cookies.{' '}
                            <Link href="/privacidad" className="text-red-600 hover:underline">
                                Más información
                            </Link>
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleAccept}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 text-sm"
                            >
                                Aceptar
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-6 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-300 text-sm"
                            >
                                Rechazar
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleReject}
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
