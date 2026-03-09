'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export function VolverArriba() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-28 right-6 z-40 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center animate-fadeIn hover:scale-110"
                    aria-label="Volver arriba"
                >
                    <ChevronUp className="w-6 h-6" />
                </button>
            )}
        </>
    )
}
