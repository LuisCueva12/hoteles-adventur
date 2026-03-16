'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function SearchBar() {
    const router = useRouter()
    const [minDate, setMinDate] = useState('')

    useEffect(() => {
        setMinDate(new Date().toISOString().split('T')[0])
    }, [])

    const [formData, setFormData] = useState({
        email: '',
        roomType: '',
        checkIn: '',
        checkOut: '',
        guests: 1
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validaciones
        const newErrors: Record<string, string> = {}
        
        if (formData.checkIn && formData.checkOut) {
            const checkInDate = new Date(formData.checkIn)
            const checkOutDate = new Date(formData.checkOut)
            
            if (checkOutDate <= checkInDate) {
                newErrors.checkOut = 'La fecha de salida debe ser posterior a la entrada'
            }
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        
        setErrors({})
        
        // Construir query params para filtrar
        const params = new URLSearchParams()
        if (formData.roomType) params.set('tipo', formData.roomType)
        if (formData.checkIn) params.set('checkIn', formData.checkIn)
        if (formData.checkOut) params.set('checkOut', formData.checkOut)
        if (formData.guests) params.set('huespedes', formData.guests.toString())
        if (formData.email) params.set('email', formData.email)
        
        router.push(`/hoteles?${params.toString()}`)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' })
        }
    }

    return (
        <div className="bg-white shadow-xl border-t-4 border-red-600 -mt-8 relative z-20 max-w-5xl mx-auto rounded-sm animate-fadeInUp">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                <div className="px-4 py-3 flex flex-col hover:bg-gray-50 transition-colors duration-300">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Tu email"
                        className="text-sm text-gray-700 outline-none w-full bg-transparent"
                        required
                    />
                </div>

                <div className="px-4 py-3 flex flex-col hover:bg-gray-50 transition-colors duration-300">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Tipo de habitación
                    </label>
                    <select
                        name="roomType"
                        value={formData.roomType}
                        onChange={handleChange}
                        className="text-sm text-gray-700 outline-none w-full bg-transparent"
                    >
                        <option value="">Todas</option>
                        <option value="estandar">Estándar</option>
                        <option value="superior">Superior</option>
                        <option value="deluxe">Suite Deluxe</option>
                        <option value="premium">Suite Premium</option>
                        <option value="ejecutiva">Suite Ejecutiva</option>
                        <option value="presidencial">Suite Presidencial</option>
                    </select>
                </div>

                <div className="px-4 py-3 flex flex-col hover:bg-gray-50 transition-colors duration-300">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Check-in
                    </label>
                    <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleChange}
                        className="text-sm text-gray-700 outline-none w-full bg-transparent"
                        min={minDate}
                        required
                    />
                </div>

                <div className="px-4 py-3 flex flex-col hover:bg-gray-50 transition-colors duration-300">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Check-out
                    </label>
                    <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleChange}
                        className={`text-sm text-gray-700 outline-none w-full bg-transparent ${errors.checkOut ? 'border-red-500' : ''}`}
                        min={formData.checkIn || minDate}
                        required
                    />
                    {errors.checkOut && (
                        <span className="text-xs text-red-500 mt-1 animate-fadeIn">{errors.checkOut}</span>
                    )}
                </div>

                <div className="px-4 py-3 flex flex-col hover:bg-gray-50 transition-colors duration-300">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Huéspedes
                    </label>
                    <input
                        type="number"
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        placeholder="1 huésped"
                        className="text-sm text-gray-700 outline-none w-full bg-transparent"
                        min={1}
                        max={10}
                        required
                    />
                </div>
            </form>
            <div className="px-4 pb-4 flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                    Buscar disponibilidad
                </button>
            </div>
        </div>
    )
}
