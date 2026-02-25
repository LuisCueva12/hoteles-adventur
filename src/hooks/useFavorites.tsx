'use client'

import { useState, useEffect } from 'react'

export function useFavorites() {
    const [favorites, setFavorites] = useState<number[]>([])

    useEffect(() => {
        const stored = localStorage.getItem('favorites')
        if (stored) {
            setFavorites(JSON.parse(stored))
        }
    }, [])

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
