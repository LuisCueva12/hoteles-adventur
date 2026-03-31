'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()

    // Cargar usuario y favoritos al montar
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                // Cargar favoritos desde BD
                const { data } = await supabase
                    .from('favoritos')
                    .select('alojamiento_id')
                    .eq('usuario_id', user.id)
                if (data) {
                    setFavorites(data.map((f: any) => f.alojamiento_id))
                }
            } else {
                // Sin sesión: usar localStorage
                try {
                    const stored = localStorage.getItem('favorites')
                    if (stored) setFavorites(JSON.parse(stored))
                } catch { /* ignore */ }
            }
        }
        init()
    }, [])

    const toggleFavorite = async (id: string) => {
        const isCurrentlyFav = favorites.includes(id)
        const newFavorites = isCurrentlyFav
            ? favorites.filter(f => f !== id)
            : [...favorites, id]

        setFavorites(newFavorites)

        if (userId) {
            // Sincronizar con BD
            if (isCurrentlyFav) {
                await supabase
                    .from('favoritos')
                    .delete()
                    .eq('usuario_id', userId)
                    .eq('alojamiento_id', id)
            } else {
                await supabase
                    .from('favoritos')
                    .insert({ usuario_id: userId, alojamiento_id: id })
            }
        } else {
            // Sin sesión: persistir en localStorage
            localStorage.setItem('favorites', JSON.stringify(newFavorites))
        }
    }

    const isFavorite = (id: string) => favorites.includes(id)

    return { favorites, toggleFavorite, isFavorite }
}
