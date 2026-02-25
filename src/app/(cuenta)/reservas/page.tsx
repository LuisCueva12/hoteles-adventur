'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Reserva, Alojamiento } from '@/types/database'

interface ReservaConAlojamiento extends Reserva {
    alojamiento: Alojamiento | null
}

export default function ReservasPage() {
    const [reservas, setReservas] = useState<ReservaConAlojamiento[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'todas' | 'pendiente' | 'confirmada' | 'cancelada'>('todas')
    const supabase = createClient()

    useEffect(() => {
        loadReservas()
    }, [])

    async function loadReservas() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('reservas')
                .select(`
                    *,
                    alojamiento:alojamientos(*)
                `)
                .eq('usuario_id', user.id)
                .order('fecha_creacion', { ascending: false })

            if (error) throw error
            setReservas(data || [])
        } catch (error) {
            console.error('Error cargando reservas:', error)
        } finally {
            setLoading(false)
        }
    }

    async function cancelarReserva(id: string) {
        if (!confirm('¿Estás seguro de cancelar esta reserva?')) return

        try {
            const { error } = await supabase
                .from('reservas')
                .update({ estado: 'cancelada' })
                .eq('id', id)

            if (error) throw error
            loadReservas()
        } catch (error) {
            console.error('Error cancelando reserva:', error)
            alert('No se pudo cancelar la reserva')
        }
    }

    const reservasFiltradas = filter === 'todas' 
        ? reservas 
        : reservas.filter(r => r.estado === filter)

    const calcularNoches = (inicio: string, fin: string) => {
        const diff = new Date(fin).getTime() - new Date(inicio).getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mis Reservas</h1>
                <div className="flex gap-2">
                    {(['todas', 'pendiente', 'confirmada', 'cancelada'] as const).map((estado) => (
                        <button
                            key={estado}
                            onClick={() => setFilter(estado)}
                            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                                filter === estado
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {reservasFiltradas.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">No tienes reservas {filter !== 'todas' ? filter + 's' : ''}</p>
                    <a
                        href="/hoteles"
                        className="inline-block px-6 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                    >
                        Explorar Alojamientos
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {reservasFiltradas.map((reserva) => (
                        <div key={reserva.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {reserva.alojamiento?.nombre || 'Alojamiento'}
                                    </h3>
                                    <p className="text-sm text-gray-500">Código: {reserva.codigo_reserva}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                                    reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {reserva.estado.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Check-in</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(reserva.fecha_inicio).toLocaleDateString('es-PE')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Check-out</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(reserva.fecha_fin).toLocaleDateString('es-PE')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Noches</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {calcularNoches(reserva.fecha_inicio, reserva.fecha_fin)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Personas</p>
                                    <p className="text-sm font-medium text-gray-900">{reserva.personas}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="text-xl font-bold text-gray-900">S/. {reserva.total.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">Adelanto: S/. {reserva.adelanto.toFixed(2)}</p>
                                </div>
                                <div className="flex gap-2">
                                    {reserva.estado === 'pendiente' && (
                                        <>
                                            <a
                                                href="/pagos"
                                                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                                            >
                                                Pagar
                                            </a>
                                            <button
                                                onClick={() => cancelarReserva(reserva.id)}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                    {reserva.estado === 'confirmada' && (
                                        <span className="text-sm text-gray-500">Reserva confirmada</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
