'use client'

import { useEffect, useState } from 'react'

interface AnimatedDivProps {
    children: React.ReactNode
    className?: string
    delay?: number
    style?: React.CSSProperties
}

export function AnimatedDiv({ children, className = '', delay = 0, style = {} }: AnimatedDivProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className={className} style={style}>{children}</div>
    }

    return (
        <div 
            className={className} 
            style={{ 
                ...style,
                animationDelay: `${delay}ms`
            }}
        >
            {children}
        </div>
    )
}
