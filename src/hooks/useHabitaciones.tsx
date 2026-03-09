'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { queryKeys } from '@/lib/cliente-consultas'

interface RoomFilters {
    tipo?: string
    capacidad?: number
    precioMin?: number
    precioMax?: number
    disponible?: boolean
}

export function useRooms(filters?: RoomFilters) {
    const supabase = createClient()

    return useQuery({
        queryKey: queryKeys.rooms.list(filters),
        queryFn: async () => {
            let query = supabase
                .from('alojamientos')
                .select(`
                    *,
                    fotos_alojamiento (
                        url,
                        es_principal
                    )
                `)
                .eq('activo', true)

            if (filters?.capacidad) {
                query = query.gte('capacidad_maxima', filters.capacidad)
            }

            if (filters?.precioMin) {
                query = query.gte('precio_base', filters.precioMin)
            }

            if (filters?.precioMax) {
                query = query.lte('precio_base', filters.precioMax)
            }

            query = query.order('precio_base', { ascending: true })

            const { data, error } = await query

            if (error) throw error

            return data?.map(aloj => {
                const fotos = aloj.fotos_alojamiento || []
                const fotosPrincipales = fotos.filter((f: any) => f.es_principal)
                const fotosSecundarias = fotos.filter((f: any) => !f.es_principal)
                const fotosOrdenadas = [...fotosPrincipales, ...fotosSecundarias]
                
                const images = fotosOrdenadas.length > 0 
                    ? fotosOrdenadas.map((f: any) => f.url)
                    : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80']

                return {
                    id: aloj.id,
                    name: aloj.nombre,
                    slug: aloj.id,
                    image: images[0],
                    images: images,
                    price: aloj.precio_base,
                    capacity: aloj.capacidad_maxima || 2,
                    description: aloj.descripcion || 'Habitación cómoda y acogedora',
                    amenities: aloj.servicios_incluidos || [],
                    available: aloj.activo,
                    distrito: aloj.distrito,
                    direccion: aloj.direccion
                }
            }) || []
        },
        staleTime: 1000 * 60 * 5 // 5 minutos
    })
}

export function useRoom(id: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: queryKeys.rooms.detail(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('alojamientos')
                .select(`
                    *,
                    fotos_alojamiento (
                        url,
                        es_principal
                    )
                `)
                .eq('id', id)
                .eq('activo', true)
                .single()

            if (error) throw error

            const fotos = data.fotos_alojamiento || []
            const fotosPrincipales = fotos.filter((f: any) => f.es_principal)
            const fotosSecundarias = fotos.filter((f: any) => !f.es_principal)
            const fotosOrdenadas = [...fotosPrincipales, ...fotosSecundarias]
            
            const images = fotosOrdenadas.length > 0 
                ? fotosOrdenadas.map((f: any) => f.url)
                : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80']

            return {
                id: data.id,
                name: data.nombre,
                slug: data.id,
                image: images[0],
                images: images,
                price: data.precio_base,
                capacity: data.capacidad_maxima || 2,
                description: data.descripcion || 'Habitación cómoda y acogedora',
                amenities: data.servicios_incluidos || [],
                available: data.activo,
                distrito: data.distrito,
                direccion: data.direccion
            }
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 10 // 10 minutos
    })
}

export function useCreateBooking() {
    const supabase = createClient()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (booking: {
            alojamiento_id: string
            fecha_inicio: string
            fecha_fin: string
            personas: number
            total: number
            adelanto: number
        }) => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            const codigoReserva = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

            const { data, error } = await supabase
                .from('reservas')
                .insert([{
                    usuario_id: user.id,
                    ...booking,
                    codigo_reserva: codigoReserva,
                    estado: 'pendiente'
                }])
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
        }
    })
}
