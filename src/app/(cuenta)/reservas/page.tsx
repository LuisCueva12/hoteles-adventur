'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Reserva, Alojamiento } from '@/types/basedatos'
import { Calendar, MapPin, Users, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Hotel, ArrowRight, FileText } from 'lucide-react'
import ModalComprobante from '@/components/cuenta/ModalComprobante'

export const dynamic = 'force-dynamic'

interface ReservaConAlojamiento extends Reserva {
    alojamiento: Alojamiento | null
}

export default function ReservasPage() {
    const [reservas, setReservas] = useState<ReservaConAlojamiento[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'todas' | 'pendiente' | 'confirmada' | 'cancelada'>('todas')
    const [modalComprobanteOpen, setModalComprobanteOpen] = useState(false)
    const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaConAlojamiento | null>(null)
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
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-yellow-200 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Cargando reservas...</p>
                    <p className="text-sm text-gray-500">Por favor espera un momento</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-0">
            {/* Header mejorado y responsive */}
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-yellow-700/20 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 animate-fadeInUp text-gray-900">Mis Reservas</h1>
                            <p className="text-sm sm:text-base text-gray-700 animate-fadeInUp animation-delay-100">Gestiona y revisa todas tus reservas</p>
                        </div>
                        <div className="flex sm:hidden items-center gap-3 w-full">
                            <div className="flex-1 text-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <div className="text-xl font-bold">{reservas.length}</div>
                                <div className="text-xs text-gray-700">Total</div>
                            </div>
                            <div className="flex-1 text-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <div className="text-xl font-bold">{reservas.filter(r => r.estado === 'confirmada').length}</div>
                                <div className="text-xs text-gray-700">Confirmadas</div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <div className="text-2xl font-bold">{reservas.length}</div>
                                <div className="text-xs text-gray-700">Total</div>
                            </div>
                            <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <div className="text-2xl font-bold">{reservas.filter(r => r.estado === 'confirmada').length}</div>
                                <div className="text-xs text-gray-700">Confirmadas</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros mejorados y responsive */}
            <div className="mb-6 sm:mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 sm:p-2">
                    <div className="flex gap-1.5 sm:gap-2">
                        {(['todas', 'pendiente', 'confirmada', 'cancelada'] as const).map((estado) => (
                            <button
                                key={estado}
                                onClick={() => setFilter(estado)}
                                className={`flex-1 py-2 sm:py-3 lg:py-4 px-2 sm:px-4 lg:px-6 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                                    filter === estado
                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-400/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {estado === 'todas' && <Hotel className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {estado === 'pendiente' && <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {estado === 'confirmada' && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {estado === 'cancelada' && <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                                <span className="hidden sm:inline">{estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
                                <span className="sm:hidden">{estado.charAt(0).toUpperCase() + estado.slice(1, 4)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {reservasFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center animate-fadeInUp">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Hotel className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No tienes reservas {filter !== 'todas' ? filter + 's' : ''}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                        Explora nuestros alojamientos y encuentra el lugar perfecto para tu próxima aventura
                    </p>
                    <a
                        href="/hoteles"
                        className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm sm:text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-2xl hover:shadow-yellow-400/30 transform hover:-translate-y-0.5"
                    >
                        <Hotel className="w-4 h-4 sm:w-5 sm:h-5" />
                        Explorar Alojamientos
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {reservasFiltradas.map((reserva, index) => (
                        <div 
                            key={reserva.id} 
                            className="bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 hover:border-yellow-200 animate-fadeInUp group"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Header responsive */}
                            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 gap-3">
                                <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <Hotel className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 truncate">
                                            {reserva.alojamiento?.nombre || 'Alojamiento'}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            <span className="font-mono bg-gray-100 px-2 sm:px-3 py-1 rounded-lg text-xs">
                                                {reserva.codigo_reserva}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 self-start ${
                                    reserva.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                                    reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {reserva.estado === 'confirmada' && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                                    {reserva.estado === 'pendiente' && <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                                    {reserva.estado === 'cancelada' && <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                                    <span className="hidden sm:inline">{reserva.estado.toUpperCase()}</span>
                                    <span className="sm:hidden">{reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1, 4).toUpperCase()}</span>
                                </span>
                            </div>

                            {/* Grid de información responsive */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                        <p className="text-[10px] sm:text-xs font-bold text-blue-700">Check-in</p>
                                    </div>
                                    <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-900">
                                        {new Date(reserva.fecha_inicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                                        <p className="text-[10px] sm:text-xs font-bold text-purple-700">Check-out</p>
                                    </div>
                                    <p className="text-sm sm:text-base lg:text-lg font-bold text-purple-900">
                                        {new Date(reserva.fecha_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                                        <p className="text-[10px] sm:text-xs font-bold text-yellow-400">Noches</p>
                                    </div>
                                    <p className="text-sm sm:text-base lg:text-lg font-bold text-yellow-400">
                                        {calcularNoches(reserva.fecha_inicio, reserva.fecha_fin)}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                                        <p className="text-[10px] sm:text-xs font-bold text-orange-700">Personas</p>
                                    </div>
                                    <p className="text-sm sm:text-base lg:text-lg font-bold text-orange-900">{reserva.personas}</p>
                                </div>
                            </div>

                            {/* Footer responsive */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 sm:pt-6 border-t-2 border-gray-100 gap-4">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 w-full sm:w-auto">
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-600 mb-1">Total a Pagar</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">S/. {reserva.total.toFixed(2)}</p>
                                    <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                                        <CreditCard className="w-3 h-3" />
                                        Adelanto: S/. {reserva.adelanto.toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                    {reserva.estado === 'pendiente' && (
                                        <>
                                            <a
                                                href="/pagos"
                                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm sm:text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                            >
                                                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                                                Pagar Ahora
                                            </a>
                                            <button
                                                onClick={() => cancelarReserva(reserva.id)}
                                                className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 text-gray-700 text-sm sm:text-base font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                    {reserva.estado === 'confirmada' && (
                                        <>
                                            <div className="flex items-center justify-center gap-2 text-yellow-400 bg-yellow-50 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl">
                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                <span className="text-sm sm:text-base font-bold">Confirmada</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setReservaSeleccionada(reserva)
                                                    setModalComprobanteOpen(true)
                                                }}
                                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                            >
                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                                <span className="hidden sm:inline">Generar Comprobante</span>
                                                <span className="sm:hidden">Comprobante</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de comprobante */}
            {reservaSeleccionada && (
                <ModalComprobante
                    isOpen={modalComprobanteOpen}
                    onClose={() => {
                        setModalComprobanteOpen(false)
                        setReservaSeleccionada(null)
                    }}
                    reserva={reservaSeleccionada}
                    onSuccess={() => {
                        loadReservas()
                    }}
                />
            )}
        </div>
    )
}
