'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Pago, Reserva, Alojamiento } from '@/types/basedatos'
import { CreditCard, CheckCircle, Clock, XCircle, DollarSign, Calendar, Receipt, TrendingUp, Wallet } from 'lucide-react'
import Swal from 'sweetalert2'

export const dynamic = 'force-dynamic'

interface PagoConReserva extends Pago {
    reserva: (Reserva & { alojamiento: Alojamiento | null }) | null
}

interface ReservaPendiente extends Reserva {
    alojamiento: Alojamiento | null
}

export default function PagosPage() {
    const [pagos, setPagos] = useState<PagoConReserva[]>([])
    const [reservasPendientes, setReservasPendientes] = useState<ReservaPendiente[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado'>('todos')
    const supabase = createClient()

    useEffect(() => {
        loadPagos()
        loadReservasPendientes()
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

    async function loadReservasPendientes() {
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
                .eq('estado', 'pendiente')
                .order('fecha_creacion', { ascending: false })

            if (error) throw error
            setReservasPendientes(data || [])
        } catch (error) {
            console.error('Error cargando reservas pendientes:', error)
        }
    }

    async function crearPago(reserva: ReservaPendiente) {
        const { value: metodo } = await Swal.fire({
            title: 'Selecciona el método de pago',
            input: 'select',
            inputOptions: {
                yape: 'Yape',
                plin: 'Plin',
                transferencia: 'Transferencia Bancaria',
                tarjeta: 'Tarjeta de Crédito/Débito',
                efectivo: 'Efectivo',
            },
            inputPlaceholder: 'Selecciona un método',
            showCancelButton: true,
            confirmButtonText: 'Confirmar Pago',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#16a34a',
            inputValidator: (value) => {
                if (!value) return 'Debes seleccionar un método de pago'
            }
        })

        if (!metodo) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error: pagoError } = await supabase
                .from('pagos')
                .insert({
                    reserva_id: reserva.id,
                    monto: reserva.adelanto,
                    metodo,
                    estado: 'pendiente',
                    fecha_pago: new Date().toISOString()
                })
                .select()
                .single()

            if (pagoError) throw pagoError

            await Swal.fire({
                icon: 'success',
                title: '¡Pago registrado!',
                text: `Pago por ${metodo} registrado. Por favor realiza la transferencia y espera la confirmación.`,
                confirmButtonColor: '#3B82F6',
                timer: 3000,
                showConfirmButton: false
            })
            loadPagos()
            loadReservasPendientes()
        } catch (error) {
            console.error('Error creando pago:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo registrar el pago',
                confirmButtonColor: '#3B82F6'
            })
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
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-yellow-200 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Cargando pagos...</p>
                    <p className="text-sm text-gray-500">Por favor espera un momento</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-0">
            {/* Header mejorado y responsive */}
            <div className="bg-gradient-to-r from-yellow-400 via-red-700 to-red-800 text-white rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-red-900/30 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 animate-fadeInUp">Mis Pagos</h1>
                            <p className="text-sm sm:text-base text-yellow-100 animate-fadeInUp animation-delay-100">Historial de transacciones</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                                <Wallet className="w-8 h-8 sm:w-10 sm:h-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas mejoradas y responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 relative overflow-hidden group hover:shadow-2xl transition-all animate-fadeInUp">
                    <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1">Total Pagado</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">S/. {totalPagado.toFixed(2)}</p>
                        <p className="text-[10px] sm:text-xs text-yellow-400 mt-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Pagos aprobados
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 relative overflow-hidden group hover:shadow-2xl transition-all animate-fadeInUp animation-delay-100">
                    <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-yellow-400/10 to-yellow-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1">Pagos Pendientes</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{pagos.filter(p => p.estado === 'pendiente').length}</p>
                        <p className="text-[10px] sm:text-xs text-yellow-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            En proceso
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 relative overflow-hidden group hover:shadow-2xl transition-all animate-fadeInUp animation-delay-200">
                    <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                                <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1">Total Pagos</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{pagos.length}</p>
                        <p className="text-[10px] sm:text-xs text-blue-600 mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Todas las transacciones
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtros mejorados y responsive */}
            <div className="mb-6 sm:mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 sm:p-2">
                    <div className="flex gap-1.5 sm:gap-2">
                        {(['todos', 'pendiente', 'aprobado', 'rechazado'] as const).map((estado) => (
                            <button
                                key={estado}
                                onClick={() => setFilter(estado)}
                                className={`flex-1 py-2 sm:py-3 lg:py-4 px-2 sm:px-4 lg:px-6 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                                    filter === estado
                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg shadow-red-600/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {estado === 'todos' && <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {estado === 'pendiente' && <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {estado === 'aprobado' && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {estado === 'rechazado' && <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                                <span className="hidden sm:inline">{estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
                                <span className="sm:hidden">{estado.charAt(0).toUpperCase() + estado.slice(1, 4)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reservas pendientes de pago */}
            {reservasPendientes.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-yellow-400" />
                        Reservas Pendientes de Pago
                    </h2>
                    <div className="space-y-4">
                        {reservasPendientes.map((reserva, index) => (
                            <div 
                                key={reserva.id}
                                className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <CreditCard className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{reserva.alojamiento?.nombre || 'Alojamiento'}</h3>
                                                <p className="text-sm text-gray-600 font-mono bg-white px-2 py-1 rounded inline-block">
                                                    {reserva.codigo_reserva}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Check-in</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {new Date(reserva.fecha_inicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Check-out</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {new Date(reserva.fecha_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Adelanto</p>
                                                <p className="text-lg font-bold text-orange-700">S/. {reserva.adelanto.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Total</p>
                                                <p className="text-lg font-bold text-gray-900">S/. {reserva.total.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => crearPago(reserva)}
                                        className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        Pagar Adelanto
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pagosFiltrados.length === 0 && reservasPendientes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center animate-fadeInUp">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Receipt className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No tienes pagos {filter !== 'todos' ? filter + 's' : ''}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                        Revisa tus reservas pendientes para realizar pagos
                    </p>
                    <a
                        href="/reservas"
                        className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-400 hover:to-red-800 text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-2xl hover:shadow-red-600/30 transform hover:-translate-y-0.5"
                    >
                        <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                        Ver Reservas
                    </a>
                </div>
            ) : pagosFiltrados.length > 0 && (
                <div className="space-y-4 sm:space-y-0">
                    {/* Vista de tarjetas para móvil */}
                    <div className="block lg:hidden space-y-4">
                        {pagosFiltrados.map((pago, index) => (
                            <div 
                                key={pago.id}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Header de la tarjeta */}
                                <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm truncate">{pago.reserva?.alojamiento?.nombre || 'N/A'}</p>
                                        <p className="text-[10px] text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
                                            {pago.reserva?.codigo_reserva || 'N/A'}
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ml-2 flex-shrink-0 ${
                                        pago.estado === 'aprobado' ? 'bg-yellow-100 text-yellow-400' :
                                        pago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-400' :
                                        'bg-yellow-100 text-yellow-400'
                                    }`}>
                                        {pago.estado === 'aprobado' && <CheckCircle className="w-2.5 h-2.5" />}
                                        {pago.estado === 'pendiente' && <Clock className="w-2.5 h-2.5" />}
                                        {pago.estado === 'rechazado' && <XCircle className="w-2.5 h-2.5" />}
                                        {pago.estado.toUpperCase()}
                                    </span>
                                </div>

                                {/* Información del pago */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2.5">
                                        <p className="text-[10px] font-bold text-yellow-400 mb-0.5 flex items-center gap-1">
                                            <DollarSign className="w-2.5 h-2.5" />
                                            Monto
                                        </p>
                                        <p className="text-base font-bold text-yellow-400">S/. {pago.monto.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2.5">
                                        <p className="text-[10px] font-bold text-blue-700 mb-0.5 flex items-center gap-1">
                                            <CreditCard className="w-2.5 h-2.5" />
                                            Método
                                        </p>
                                        <p className="text-xs font-bold text-blue-900 uppercase">{pago.metodo}</p>
                                    </div>
                                </div>

                                {/* Fecha y transacción */}
                                <div className="flex items-center justify-between text-[10px] text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {new Date(pago.fecha_pago).toLocaleDateString('es-PE', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    {pago.transaccion_externa && (
                                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 truncate max-w-[120px]">
                                            {pago.transaccion_externa}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Vista de tabla para desktop */}
                    <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeInUp">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Alojamiento
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Método
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Monto
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Transacción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pagosFiltrados.map((pago, index) => (
                                        <tr 
                                            key={pago.id} 
                                            className="hover:bg-gray-50 transition-all group"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">
                                                        {new Date(pago.fecha_pago).toLocaleDateString('es-PE', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(pago.fecha_pago).toLocaleTimeString('es-PE', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div>
                                                    <p className="font-bold text-gray-900">{pago.reserva?.alojamiento?.nombre || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                                                        {pago.reserva?.codigo_reserva || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg text-xs font-bold uppercase flex items-center gap-2 w-fit">
                                                    <CreditCard className="w-3 h-3" />
                                                    {pago.metodo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-yellow-400" />
                                                    <span className="font-bold text-gray-900 text-lg">S/. {pago.monto.toFixed(2)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 w-fit ${
                                                    pago.estado === 'aprobado' ? 'bg-yellow-100 text-yellow-400' :
                                                    pago.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-400' :
                                                    'bg-yellow-100 text-yellow-400'
                                                }`}>
                                                    {pago.estado === 'aprobado' && <CheckCircle className="w-3 h-3" />}
                                                    {pago.estado === 'pendiente' && <Clock className="w-3 h-3" />}
                                                    {pago.estado === 'rechazado' && <XCircle className="w-3 h-3" />}
                                                    {pago.estado.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {pago.transaccion_externa ? (
                                                    <span className="font-mono text-xs bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
                                                        {pago.transaccion_externa}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
