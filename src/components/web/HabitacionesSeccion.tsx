'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'

// Datos de respaldo si no hay en BD
const ROOMS_FALLBACK = [
    {
        id: 'fallback-1',
        img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
        title: 'Suite Deluxe',
        price: 350,
    },
    {
        id: 'fallback-2',
        img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
        title: 'Habitacion Estandar',
        price: 180,
    },
    {
        id: 'fallback-3',
        img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80',
        title: 'Suite Premium',
        price: 520,
    },
]

export function HabitacionesSeccion() {
    const [rooms, setRooms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadRooms()
    }, [])

    const loadRooms = async () => {
        try {
            const { data, error } = await supabase
                .from('alojamientos')
                .select(`
                    id,
                    nombre,
                    precio_base,
                    capacidad_maxima,
                    activo,
                    fotos_alojamiento (
                        url,
                        es_principal
                    )
                `)
                .eq('activo', true)
                .order('precio_base', { ascending: true })
                .limit(3)

            if (error) throw error

            if (data && data.length > 0) {
                const mappedRooms = data.map(aloj => {
                    // Obtener foto principal o primera foto
                    const fotos = aloj.fotos_alojamiento || []
                    const fotoPrincipal = fotos.find((f: any) => f.es_principal)
                    const primeraFoto = fotos[0]
                    const imagen = fotoPrincipal?.url || primeraFoto?.url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80'

                    return {
                        id: aloj.id,
                        img: imagen,
                        title: aloj.nombre,
                        price: aloj.precio_base,
                        capacity: aloj.capacidad_maxima || 2,
                        slug: (aloj as any).slug || aloj.id,
                    }
                })
                setRooms(mappedRooms)
            } else {
                setRooms(ROOMS_FALLBACK)
            }
        } catch (error) {
            console.error('Error loading rooms:', error)
            setRooms(ROOMS_FALLBACK)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-50 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-30" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 animate-fadeInUp">
                    <div className="inline-block mb-4">
                        <span className="px-4 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-semibold tracking-[0.3em] uppercase rounded-full">
                            Nuestras Habitaciones
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
                        Bienvenido al <span className="text-yellow-600">Hotel</span>
                    </h2>
                    
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-400" />
                    </div>
                    
                    <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
                        Ofrecemos habitaciones de lujo con vistas espectaculares y servicios de primera clase para hacer de tu estadía una experiencia inolvidable.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {rooms.map((room, idx) => (
                        <div key={room.id} className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-white animate-fadeInUp">
                            <div className="relative h-64 overflow-hidden">
                                <Image src={room.img} alt={room.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                    quality={80}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all" />
                                
                                {/* Badge de precio flotante */}
                                <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full shadow-lg">
                                    <div className="text-xs font-semibold">desde</div>
                                    <div className="text-lg font-bold">S/. {room.price}</div>
                                    <div className="text-[10px]">/noche</div>
                                </div>
                                
                                {/* Botón de ver detalles */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <Link 
                                        href={`/hoteles/${room.slug || room.id}`}
                                        className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-full transform scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-yellow-400 hover:text-gray-900 shadow-2xl flex items-center gap-2"
                                    >
                                        Ver Detalles
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="p-6 bg-white">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">{room.title}</h3>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>{room.capacity || '2-4'} personas</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span>35m²</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="px-2 py-1 bg-gray-100 rounded">WiFi</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded">TV</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded">A/C</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/hoteles"
                        className="inline-flex items-center gap-3 px-12 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 rounded-full group">
                        Ver todas las habitaciones
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    )
}
