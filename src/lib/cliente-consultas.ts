import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 10, // 10 minutos - datos siguen válidos por más tiempo
            gcTime: 1000 * 60 * 60, // 1 hora (antes cacheTime) - mantener datos en cache más tiempo
            refetchOnWindowFocus: false,
            refetchOnReconnect: false, // No re-fetch automaticamente al reconectar
            refetchInterval: false, // No re-fetch periodico
            retry: 1,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: 1
        }
    }
})

// Query keys para consistencia
export const queryKeys = {
    rooms: {
        all: ['rooms'] as const,
        list: (filters?: any) => ['rooms', 'list', filters] as const,
        detail: (id: string) => ['rooms', 'detail', id] as const
    },
    bookings: {
        all: ['bookings'] as const,
        list: (userId?: string) => ['bookings', 'list', userId] as const,
        detail: (id: string) => ['bookings', 'detail', id] as const
    },
    user: {
        profile: (id: string) => ['user', 'profile', id] as const,
        favorites: (id: string) => ['user', 'favorites', id] as const
    },
    reviews: {
        list: (roomId: string) => ['reviews', 'list', roomId] as const
    }
}
