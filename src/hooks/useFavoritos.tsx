'use client'

import { useState } from 'react'

export function useFavorites() {
    const [favorites, setFavorites] = useState<number[]>(() => {
        if (typeof window === 'undefined') {
            return []
        }

        const stored = localStorage.getItem('favorites')
        if (!stored) {
            return []
        }

        try {
            const parsed = JSON.parse(stored)
            return Array.isArray(parsed) ? parsed.filter((value): value is number => typeof value === 'number') : []
        } catch {
            return []
        }
    })

    const toggleFavorite = (id: number) => {
        setFavorites(prev => {
            const newFavorites = prev.includes(id)
                ? prev.filter(fav => fav !== id)
                : [...prev, id]
            
            localStorage.setItem('favorites', JSON.stringify(newFavorites))
            return newFavorites
        })
    }

    const isFavorite = (id: number) => favorites.includes(id)

    return { favorites, toggleFavorite, isFavorite }
}
