'use client'

import { useState } from 'react'
import Link from 'next/link'

const ROOMS = [
    {
        id: 1,
        name: 'Habitación Estándar',
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
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
        price: 850,
        capacity: 6,
        size: 120,
        description: 'La suite más exclusiva del hotel con servicios personalizados y vistas de 360 grados.',
        amenities: ['WiFi premium', 'TV Smart', 'Aire acondicionado', 'Bar completo', 'Baño de mármol', 'Sala de estar', 'Comedor', 'Cocina', 'Terraza privada', 'Jacuzzi', 'Mayordomo'],
        available: true
    },
]

export default function HotelesPage() {
    const [filter, setFilter] = useState<'all' | 'available'>('all')
    const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'capacity'>('price-asc')

    let filteredRooms = filter === 'available' ? ROOMS.filter(r => r.available) : ROOMS

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
                    {filteredRooms.map((room) => (
                        <div key={room.id} className="group bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={room.image}
                                    alt={room.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {!room.available && (
                                    <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-1 text-xs font-semibold">
                                        NO DISPONIBLE
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2">
                                    <p className="text-xs">Desde</p>
                                    <p className="text-2xl font-bold">S/. {room.price}</p>
                                    <p className="text-xs">por noche</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{room.name}</h3>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <span>👥 {room.capacity} personas</span>
                                    <span>📐 {room.size}m²</span>
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
                                    disabled={!room.available}
                                    className={`w-full py-3 font-semibold text-sm uppercase tracking-wider transition-colors ${
                                        room.available
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
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
        </div>
    )
}
