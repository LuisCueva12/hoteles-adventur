import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            gcTime: 1000 * 60 * 30, // 30 minutos (antes cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1
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
