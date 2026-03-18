'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Maximize, Heart, Star, Building2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

function HotelesContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()
    
    const [rooms, setRooms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadRooms()
    }, [])

    const loadRooms = async () => {
        try {
            const { data, error } = await supabase
                .from('alojamientos')
                .select('*')
                .eq('activo', true)

            if (data && data.length > 0) {
                setRooms(data)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando habitaciones...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white">
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
                    alt="Habitaciones"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-5xl font-bold mb-2 font-serif">Nuestras Habitaciones</h1>
                    <p className="text-gray-300">Encuentra tu espacio perfecto</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-12">
                {rooms.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay habitaciones disponibles</h2>
                        <p className="text-gray-600 mb-6">Por favor contacta con el administrador.</p>
                        <Link href="/" className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">
                            Volver al inicio
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative h-48">
                                    <img
                                        src={room.imagen_principal || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'}
                                        alt={room.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{room.nombre}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.descripcion}</p>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Users className="w-4 h-4" />
                                            <span>{room.capacidad_maxima || 2} personas</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-semibold">4.5</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-bold text-red-600">S/. {room.precio_base}</span>
                                            <span className="text-sm text-gray-500">/noche</span>
                                        </div>
                                        <Link
                                            href={`/hoteles/${room.id}`}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                                        >
                                            Ver detalles
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default function HotelesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        }>
            <HotelesContent />
        </Suspense>
    )
}
