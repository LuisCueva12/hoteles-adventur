'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Users, Maximize, Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { ShareButtons } from '@/components/web/ShareButtons'

const ROOMS = [
    {
        id: 1,
        name: 'Habitación Estándar',
        slug: 'estandar',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        price: 180,
        capacity: 2,
        size: 25,
        description: 'Habitación cómoda y acogedora con todas las comodidades básicas para una estadía placentera.',
        amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Minibar', 'Baño privado'],
        available: true
    },
    {
        id: 2,
        name: 'Habitación Superior',
        slug: 'superior',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
        price: 250,
        capacity: 2,
        size: 30,
        description: 'Habitación espaciosa con vistas a la ciudad y amenidades premium.',
        amenities: ['WiFi', 'TV Smart', 'Aire acondicionado', 'Minibar', 'Baño con bañera', 'Escritorio'],
        available: true
    },
    {
        id: 3,
        name: 'Suite Deluxe',
        slug: 'deluxe',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        price: 350,
        capacity: 3,
        size: 45,
        description: 'Suite elegante con sala de estar separada y vistas panorámicas.',
        amenities: ['WiFi', 'TV Smart', 'Aire acondicionado', 'Minibar premium', 'Baño de lujo', 'Sala de estar', 'Balcón'],
        available: true
    },
    {
        id: 4,
        name: 'Suite Premium',
        slug: 'premium',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
        price: 520,
        capacity: 4,
        size: 60,
        description: 'Suite de lujo con dos habitaciones, sala de estar y comedor privado.',
        amenities: ['WiFi', 'TV Smart', 'Aire acondicionado', 'Minibar premium', 'Baño de lujo', 'Sala de estar', 'Comedor', 'Balcón privado', 'Jacuzzi'],
        available: true
    },
    {
        id: 5,
        name: 'Suite Ejecutiva',
        slug: 'ejecutiva',
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
        price: 420,
        capacity: 2,
        size: 50,
        description: 'Suite diseñada para viajeros de negocios con área de trabajo y sala de reuniones.',
        amenities: ['WiFi premium', 'TV Smart', 'Aire acondicionado', 'Minibar', 'Baño de lujo', 'Escritorio ejecutivo', 'Sala de reuniones'],
        available: false
    },
    {
        id: 6,
        name: 'Suite Presidencial',
        slug: 'presidencial',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
        price: 850,
        capacity: 6,
        size: 120,
        description: 'La suite más exclusiva del hotel con servicios personalizados y vistas de 360 grados.',
        amenities: ['WiFi premium', 'TV Smart', 'Aire acondicionado', 'Bar completo', 'Baño de mármol', 'Sala de estar', 'Comedor', 'Cocina', 'Terraza privada', 'Jacuzzi', 'Mayordomo'],
        available: true
    },
]

interface ReservaModal {
    room: typeof ROOMS[0] | null
    checkIn: string
    checkOut: string
    guests: number
}

export default function HotelesPage() {
    const searchParams = useSearchParams()
    const [filter, setFilter] = useState<'all' | 'available'>('all')
    const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'capacity'>('price-asc')
    const [reservaModal, setReservaModal] = useState<ReservaModal>({
        room: null,
        checkIn: '',
        checkOut: '',
        guests: 1
    })
    const [showModal, setShowModal] = useState(false)
    const { toggleFavorite, isFavorite } = useFavorites()

    // Aplicar filtros de búsqueda
    useEffect(() => {
        const tipo = searchParams.get('tipo')
        const huespedes = searchParams.get('huespedes')
        
        if (tipo || huespedes) {
            // Aquí podrías filtrar automáticamente
            console.log('Filtros aplicados:', { tipo, huespedes })
        }
    }, [searchParams])

    const handleReservar = (room: typeof ROOMS[0]) => {
        const checkIn = searchParams.get('checkIn') || ''
        const checkOut = searchParams.get('checkOut') || ''
        const guests = parseInt(searchParams.get('huespedes') || '1')
        
        setReservaModal({
            room,
            checkIn,
            checkOut,
            guests
        })
        setShowModal(true)
    }

    const calcularTotal = () => {
        if (!reservaModal.room || !reservaModal.checkIn || !reservaModal.checkOut) return 0
        
        const inicio = new Date(reservaModal.checkIn)
        const fin = new Date(reservaModal.checkOut)
        const noches = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
        
        return noches * reservaModal.room.price
    }

    const handleConfirmarReserva = () => {
        // Aquí se conectaría con Supabase para crear la reserva
        alert('Reserva confirmada! (Conectar con Supabase)')
        setShowModal(false)
    }

    let filteredRooms = filter === 'available' ? ROOMS.filter(r => r.available) : ROOMS

    // Filtrar por tipo de búsqueda
    const tipoParam = searchParams.get('tipo')
    if (tipoParam) {
        filteredRooms = filteredRooms.filter(r => r.slug === tipoParam)
    }

    // Filtrar por capacidad
    const huespedesParam = searchParams.get('huespedes')
    if (huespedesParam) {
        filteredRooms = filteredRooms.filter(r => r.capacity >= parseInt(huespedesParam))
    }

    filteredRooms = [...filteredRooms].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        return b.capacity - a.capacity
    })

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
                    <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        Nuestras Habitaciones
                    </h1>
                    <p className="text-gray-300 tracking-widest uppercase text-sm">Encuentra tu espacio perfecto</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${
                                filter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Todas ({ROOMS.length})
                        </button>
                        <button
                            onClick={() => setFilter('available')}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${
                                filter === 'available' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Disponibles ({ROOMS.filter(r => r.available).length})
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Ordenar por:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-600"
                        >
                            <option value="price-asc">Precio: Menor a Mayor</option>
                            <option value="price-desc">Precio: Mayor a Menor</option>
                            <option value="capacity">Capacidad</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredRooms.map((room, index) => (
                        <div key={room.id} className="group bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col animate-fadeInUp hover:-translate-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={room.image}
                                    alt={room.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                {!room.available && (
                                    <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-1 text-xs font-semibold animate-fadeInDown">
                                        NO DISPONIBLE
                                    </div>
                                )}
                                
                                {/* Botones de acción */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <button
                                        onClick={() => toggleFavorite(room.id)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            isFavorite(room.id)
                                                ? 'bg-red-600 text-white scale-110'
                                                : 'bg-white/90 text-gray-700 hover:bg-red-600 hover:text-white'
                                        }`}
                                        aria-label="Agregar a favoritos"
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite(room.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                                
                                <div className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 transform transition-transform duration-300 group-hover:scale-105">
                                    <p className="text-xs">Desde</p>
                                    <p className="text-2xl font-bold">S/. {room.price}</p>
                                    <p className="text-xs">por noche</p>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-2xl font-semibold text-gray-900">{room.name}</h3>
                                    <ShareButtons 
                                        title={room.name}
                                        description={room.description}
                                    />
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {room.capacity} personas
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Maximize className="w-4 h-4" />
                                        {room.size}m²
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    {room.description}
                                </p>

                                <div className="mb-6">
                                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                        Amenidades
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {room.amenities.map((amenity) => (
                                            <span
                                                key={amenity}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                            >
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleReservar(room)}
                                    disabled={!room.available}
                                    className={`w-full py-3 font-semibold text-sm uppercase tracking-wider transition-all duration-300 mt-auto ${
                                        room.available
                                            ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg transform hover:-translate-y-1'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {room.available ? 'Reservar ahora' : 'No disponible'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Modal de Reserva */}
            {showModal && reservaModal.room && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Confirmar Reserva</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl transition-all duration-300 hover:rotate-90"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex gap-4 mb-6">
                                <img
                                    src={reservaModal.room.image}
                                    alt={reservaModal.room.name}
                                    className="w-32 h-32 object-cover rounded"
                                />
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {reservaModal.room.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {reservaModal.room.description}
                                    </p>
                                    <p className="text-lg font-bold text-red-600">
                                        S/. {reservaModal.room.price} / noche
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fecha de entrada
                                    </label>
                                    <input
                                        type="date"
                                        value={reservaModal.checkIn}
                                        onChange={(e) => setReservaModal({ ...reservaModal, checkIn: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 bg-white text-gray-900 font-medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fecha de salida
                                    </label>
                                    <input
                                        type="date"
                                        value={reservaModal.checkOut}
                                        onChange={(e) => setReservaModal({ ...reservaModal, checkOut: e.target.value })}
                                        min={reservaModal.checkIn || new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 bg-white text-gray-900 font-medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Número de huéspedes
                                    </label>
                                    <input
                                        type="number"
                                        value={reservaModal.guests}
                                        onChange={(e) => setReservaModal({ ...reservaModal, guests: parseInt(e.target.value) })}
                                        min={1}
                                        max={reservaModal.room.capacity}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 bg-white text-gray-900 font-medium"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Capacidad máxima: {reservaModal.room.capacity} personas
                                    </p>
                                </div>
                            </div>

                            {reservaModal.checkIn && reservaModal.checkOut && (
                                <div className="bg-gray-50 p-4 rounded mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">
                                            {Math.ceil((new Date(reservaModal.checkOut).getTime() - new Date(reservaModal.checkIn).getTime()) / (1000 * 60 * 60 * 24))} noches × S/. {reservaModal.room.price}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            S/. {calcularTotal()}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-red-600">
                                                S/. {calcularTotal()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmarReserva}
                                    disabled={!reservaModal.checkIn || !reservaModal.checkOut}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-1 disabled:transform-none"
                                >
                                    Confirmar Reserva
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
