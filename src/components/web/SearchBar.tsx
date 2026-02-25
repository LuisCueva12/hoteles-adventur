'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SearchBar() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        roomType: '',
        checkIn: '',
        checkOut: '',
        guests: 1
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Búsqueda:', formData)
        router.push('/hoteles')
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className="bg-white shadow-xl border-t-4 border-red-600 -mt-8 relative z-20 max-w-5xl mx-auto rounded-sm">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-0 divide-x divide-gray-200">
                <div className="px-4 py-3 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Tu email"
                        className="text-sm text-gray-700 outline-none w-full"
                        required
                    />
                </div>

                <div className="px-4 py-3 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Tipo de habitación
                    </label>
                    <select
                        name="roomType"
                        value={formData.roomType}
                        onChange={handleChange}
                        className="text-sm text-gray-700 outline-none w-full bg-transparent"
                    >
                        <option value="">Seleccionar</option>
                        <option value="estandar">Estándar</option>
                        <option value="superior">Superior</option>
                        <option value="deluxe">Suite Deluxe</option>
                        <option value="premium">Suite Premium</option>
                        <option value="ejecutiva">Suite Ejecutiva</option>
                    </select>
                </div>

                <div className="px-4 py-3 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Check-in
                    </label>
                    <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleChange}
                        className="text-sm text-gray-700 outline-none w-full"
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="px-4 py-3 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Check-out
                    </label>
                    <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleChange}
                        className="text-sm text-gray-700 outline-none w-full"
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="px-4 py-3 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Huéspedes
                    </label>
                    <input
                        type="number"
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        placeholder="1 huésped"
                        className="text-sm text-gray-700 outline-none w-full"
                        min={1}
                        max={10}
                        required
                    />
                </div>
            </form>
            <div className="px-4 pb-4 flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm uppercase tracking-wider transition-colors"
                >
                    Buscar disponibilidad
                </button>
            </div>
        </div>
    )
}
