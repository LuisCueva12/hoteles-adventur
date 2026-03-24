'use client'

import { useSyncExternalStore } from 'react'

interface ClientOnlyProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const mounted = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false,
    )

    if (!mounted) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
