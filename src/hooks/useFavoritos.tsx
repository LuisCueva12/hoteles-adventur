'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

function safeGetItem(key: string): string | null {
    if (typeof window === 'undefined') return null
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

function safeSetItem(key: string, value: string): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(key, value)
    } catch {
        // Silently fail
    }
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
    
    if (!supabaseRef.current) {
        supabaseRef.current = createClient()
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        
        const init = async () => {
            const { data: { user } } = await supabaseRef.current!.auth.getUser()
            if (user) {
                setUserId(user.id)
                const { data } = await supabaseRef.current!
                    .from('favoritos')
                    .select('alojamiento_id')
                    .eq('usuario_id', user.id)
                if (data) {
                    setFavorites(data.map((f: any) => f.alojamiento_id))
                }
            } else {
                const stored = safeGetItem('favorites')
                if (stored) {
                    try {
                        setFavorites(JSON.parse(stored))
                    } catch {
                        // Ignore
                    }
                }
            }
        }
        
        init()
    }, [mounted])

    const toggleFavorite = async (id: string) => {
        const isCurrentlyFav = favorites.includes(id)
        const newFavorites = isCurrentlyFav
            ? favorites.filter(f => f !== id)
            : [...favorites, id]

        setFavorites(newFavorites)

        if (userId) {
            if (isCurrentlyFav) {
                await supabaseRef.current!
                    .from('favoritos')
                    .delete()
                    .eq('usuario_id', userId)
                    .eq('alojamiento_id', id)
            } else {
                await supabaseRef.current!
                    .from('favoritos')
                    .insert({ usuario_id: userId, alojamiento_id: id })
            }
        } else {
            safeSetItem('favorites', JSON.stringify(newFavorites))
        }
    }

    const isFavorite = (id: string) => favorites.includes(id)

    return { favorites, toggleFavorite, isFavorite }
}
