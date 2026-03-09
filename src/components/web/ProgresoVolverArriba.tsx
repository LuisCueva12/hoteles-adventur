'use client'

import { useState, useEffect } from 'react'

export function BackToTopProgress() {
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const calculateScrollProgress = () => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const scrollTop = window.scrollY
            
            const totalScrollableHeight = documentHeight - windowHeight
            const progress = (scrollTop / totalScrollableHeight) * 100
            
            setScrollProgress(progress)
        }

        window.addEventListener('scroll', calculateScrollProgress)
        calculateScrollProgress()

        return () => window.removeEventListener('scroll', calculateScrollProgress)
    }, [])

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
            <div 
                className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-150"
                style={{ width: `${scrollProgress}%` }}
            />
        </div>
    )
}
