'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Pago, Reserva, Alojamiento } from '@/types/database'

interface PagoConReserva extends Pago {
    reserva: (Reserva & { alojamiento: Alojamiento | null }) | null
}

export default function PagosPage() {
    const [pagos, setPagos] = useState<PagoConReserva[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado'>('todos')
    const supabase = createClient()

    useEffect(() => {
        loadPagos()
    }, [])

    async function loadPagos() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('pagos')
                .select(`
                    *,
                    reserva:reservas(
                        *,
                        alojamiento:alojamientos(*)
                    )
                `)
                .order('fecha_pago', { ascending: false })

            if (error) throw error

            const pagosFiltrados = (data || []).filter(
                (pago: any) => pago.reserva?.usuario_id === user.id
            )
            setPagos(pagosFiltrados)
        } catch (error) {
            console.error('Error cargando pagos:', error)
        } finally {
            setLoading(false)
        }
    }

    const pagosFiltrados = filter === 'todos' 
        ? pagos 
        : pagos.filter(p => p.estado === filter)

    const totalPagado = pagos
        .filter(p => p.estado === 'aprobado')
        .reduce((sum, p) => sum + p.monto, 0)

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
                <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>
                <div className="flex gap-2">
                    {(['todos', 'pendiente', 'aprobado', 'rechazado'] as const).map((estado) => (
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
                    <p className="text-sm opacity-90 mb-1">Total Pagado</p>
                    <p className="text-3xl font-bold">S/. {totalPagado.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
                    <p className="text-sm opacity-90 mb-1">Pagos Pendientes</p>
                    <p className="text-3xl font-bold">{pagos.filter(p => p.estado === 'pendiente').length}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                    <p className="text-sm opacity-90 mb-1">Total Pagos</p>
                    <p className="text-3xl font-bold">{pagos.length}</p>
                </div>
            </div>

            {pagosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">No tienes pagos {filter !== 'todos' ? filter + 's' : ''}</p>
                    <a
                        href="/reservas"
                        className="inline-block px-6 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                    >
                        Ver Reservas
                    </a>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Alojamiento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Método
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Monto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Transacción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {pagosFiltrados.map((pago) => (
                                <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(pago.fecha_pago).toLocaleDateString('es-PE', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div>
                                            <p className="font-medium">{pago.reserva?.alojamiento?.nombre || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">
                                                Código: {pago.reserva?.codigo_reserva || 'N/A'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase">
                                            {pago.metodo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        S/. {pago.monto.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            pago.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                                            pago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {pago.estado.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {pago.transaccion_externa || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
