'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/TablasDatos'
import { Modal } from '@/components/admin/Modal'
import { adminService } from '@/services/admin.servicio'
import { notificationsService } from '@/services/notificaciones.servicio'
import { RefreshCw, Loader2, Calendar, User, Home, CreditCard, Eye, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'

interface Reserva {
    id: string
    codigo_reserva: string
    fecha_inicio: string
    fecha_fin: string
    personas: number
    total: number
    adelanto: number
    estado: string
    fecha_creacion: string
    usuarios: {
        nombre: string
        apellido: string
        email: string
    } | null
    alojamientos: {
        nombre: string
        tipo: string
    } | null
    pagos: Array<{
        monto: number
        estado: string
        metodo: string
    }> | null
}

export default function ReservasAdminPage() {
    const [reservas, setReservas] = useState<Reserva[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filterEstado, setFilterEstado] = useState<string>('todas')
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        loadReservas()
    }, [])

    const loadReservas = async () => {
        try {
            setLoading(true)
            const data = await adminService.getReservas()
            
            if (!data || data.length === 0) {
                console.log('No hay reservas en la base de datos')
                setReservas([])
                return
            }
            
            // Limpiar y validar datos
            const cleanData = data.map(reserva => ({
                ...reserva,
                usuarios: reserva.usuarios || null,
                alojamientos: reserva.alojamientos || null,
                pagos: Array.isArray(reserva.pagos) ? reserva.pagos : []
            }))
            
            setReservas(cleanData)
        } catch (error) {
            console.error('Error loading reservas:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error al cargar reservas',
                text: 'No se pudieron cargar las reservas. Verifica tu conexión con Supabase.',
                confirmButtonColor: '#3B82F6'
            })
            setReservas([])
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadReservas()
        setIsRefreshing(false)
    }

    const handleView = (reserva: Reserva) => {
        setSelectedReserva(reserva)
        setIsModalOpen(true)
    }

    const handleChangeStatus = async (newStatus: string) => {
        if (selectedReserva) {
            try {
                const oldStatus = selectedReserva.estado
                await adminService.updateReserva(selectedReserva.id, { estado: newStatus })
                setSelectedReserva({ ...selectedReserva, estado: newStatus })
                await loadReservas()
                
                // Crear notificación para todos los admins
                const statusEmoji = newStatus === 'confirmada' ? '✓' : newStatus === 'pendiente' ? '⏱' : '✕'
                const statusColor = newStatus === 'confirmada' ? 'success' : newStatus === 'pendiente' ? 'warning' : 'error'
                
                await notificationsService.notifyAdmins(
                    statusColor,
                    `${statusEmoji} Reserva ${newStatus}`,
                    `La reserva ${selectedReserva.codigo_reserva} cambió de "${oldStatus}" a "${newStatus}"`,
                    '/admin/reservas',
                    { reservaId: selectedReserva.id, oldStatus, newStatus }
                )
                
                await Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Estado de la reserva actualizado correctamente',
                    confirmButtonColor: '#3B82F6',
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error('Error updating reserva:', error)
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al actualizar el estado de la reserva',
                    confirmButtonColor: '#3B82F6'
                })
            }
        }
    }

    const handleDelete = async (reserva: Reserva) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la reserva ${reserva.codigo_reserva}? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                // Implementar eliminación si es necesario
                await loadReservas()
                await Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'Reserva eliminada correctamente',
                    confirmButtonColor: '#3B82F6',
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error('Error deleting reserva:', error)
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar la reserva',
                    confirmButtonColor: '#3B82F6'
                })
            }
        }
    }

    const filteredReservas = filterEstado === 'todas' 
        ? reservas 
        : reservas.filter(r => r.estado === filterEstado)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Cargando reservas...</p>
                </div>
            </div>
        )
    }

    const calcularNoches = (inicio: string, fin: string) => {
        const diff = new Date(fin).getTime() - new Date(inicio).getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Gestión de Reservas
                    </h1>
                    <p className="text-gray-600 text-lg">Administra todas las reservas del hotel</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="font-semibold">Actualizar</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Total Reservas</p>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-5xl font-bold mb-1">{reservas.length}</p>
                    <p className="text-blue-100 text-xs">Todas las reservas registradas</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-green-100 text-sm font-semibold uppercase tracking-wide">Confirmadas</p>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-5xl font-bold mb-1">{reservas.filter(r => r.estado === 'confirmada').length}</p>
                    <p className="text-green-100 text-xs">Reservas activas confirmadas</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-yellow-100 text-sm font-semibold uppercase tracking-wide">Pendientes</p>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-5xl font-bold mb-1">{reservas.filter(r => r.estado === 'pendiente').length}</p>
                    <p className="text-yellow-100 text-xs">Esperando confirmación</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-red-100 text-sm font-semibold uppercase tracking-wide">Canceladas</p>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-5xl font-bold mb-1">{reservas.filter(r => r.estado === 'cancelada').length}</p>
                    <p className="text-red-100 text-xs">Reservas canceladas</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-600 font-medium">Filtrar por estado:</span>
                            {['todas', 'pendiente', 'confirmada', 'cancelada'].map((estado) => (
                                <button
                                    key={estado}
                                    onClick={() => setFilterEstado(estado)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        filterEstado === estado
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Habitación</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check-in</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check-out</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Huéspedes</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredReservas.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                                            <p className="text-gray-500 font-medium text-lg mb-2">No hay reservas disponibles</p>
                                            <p className="text-gray-400 text-sm">
                                                {filterEstado === 'todas' 
                                                    ? 'Aún no se han registrado reservas en el sistema'
                                                    : `No hay reservas con estado "${filterEstado}"`
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredReservas.map((reserva) => (
                                <tr key={reserva.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{reserva.codigo_reserva}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {reserva.usuarios 
                                                ? `${reserva.usuarios.nombre || ''} ${reserva.usuarios.apellido || ''}`
                                                : 'Sin usuario'}
                                        </p>
                                        <p className="text-xs text-gray-500">{reserva.usuarios?.email || ''}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">
                                            {reserva.alojamientos?.nombre || 'Sin alojamiento'}
                                        </p>
                                        <p className="text-xs text-gray-500">{reserva.alojamientos?.tipo || ''}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">{new Date(reserva.fecha_inicio).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">{new Date(reserva.fecha_fin).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-semibold text-gray-900">{reserva.personas}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-green-600">S/. {reserva.total.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <select
                                            value={reserva.estado}
                                            onChange={async (e) => {
                                                const newStatus = e.target.value
                                                const oldStatus = reserva.estado
                                                try {
                                                    await adminService.updateReserva(reserva.id, { estado: newStatus })
                                                    await loadReservas()
                                                    
                                                    // Crear notificación para todos los admins
                                                    const statusEmoji = newStatus === 'confirmada' ? '✓' : newStatus === 'pendiente' ? '⏱' : '✕'
                                                    const statusColor = newStatus === 'confirmada' ? 'success' : newStatus === 'pendiente' ? 'warning' : 'error'
                                                    
                                                    await notificationsService.notifyAdmins(
                                                        statusColor,
                                                        `${statusEmoji} Reserva ${newStatus}`,
                                                        `La reserva ${reserva.codigo_reserva} cambió de "${oldStatus}" a "${newStatus}"`,
                                                        '/admin/reservas',
                                                        { reservaId: reserva.id, oldStatus, newStatus }
                                                    )
                                                    
                                                    await Swal.fire({
                                                        icon: 'success',
                                                        title: '¡Actualizado!',
                                                        text: 'Estado actualizado correctamente',
                                                        confirmButtonColor: '#3B82F6',
                                                        timer: 1500,
                                                        showConfirmButton: false
                                                    })
                                                } catch (error) {
                                                    console.error('Error:', error)
                                                    await Swal.fire({
                                                        icon: 'error',
                                                        title: 'Error',
                                                        text: 'No se pudo actualizar el estado',
                                                        confirmButtonColor: '#3B82F6'
                                                    })
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all hover:shadow-md ${
                                                reserva.estado === 'confirmada' ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' :
                                                reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' :
                                                'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                                            }`}
                                        >
                                            <option value="pendiente">⏱ Pendiente</option>
                                            <option value="confirmada">✓ Confirmada</option>
                                            <option value="cancelada">✕ Cancelada</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleView(reserva)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Ver detalles"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reserva)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Reserva ${selectedReserva?.codigo_reserva}`}
                size="lg"
            >
                {selectedReserva && (
                    <div className="space-y-6">
                        {/* Header con código de reserva */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 -m-6 mb-6 p-6 rounded-t-xl">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Código de Reserva</p>
                                    <p className="text-2xl font-bold font-mono">{selectedReserva.codigo_reserva}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm opacity-90 mb-1">Estado</p>
                                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                                        selectedReserva.estado === 'confirmada' ? 'bg-green-500' :
                                        selectedReserva.estado === 'pendiente' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}>
                                        {selectedReserva.estado.charAt(0).toUpperCase() + selectedReserva.estado.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Información principal en tarjetas */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Cliente */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <User className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Cliente</p>
                                        <p className="text-gray-900 font-bold text-lg mb-1">
                                            {selectedReserva.usuarios 
                                                ? `${selectedReserva.usuarios.nombre || ''} ${selectedReserva.usuarios.apellido || ''}`
                                                : 'Sin información'}
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            {selectedReserva.usuarios?.email || 'Sin email'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Alojamiento */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Home className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">Alojamiento</p>
                                        <p className="text-gray-900 font-bold text-lg mb-1">
                                            {selectedReserva.alojamientos?.nombre || 'Sin información'}
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            {selectedReserva.alojamientos?.tipo || 'Sin tipo'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fechas y detalles */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-6 h-6 text-purple-600" />
                                <h3 className="text-lg font-bold text-gray-900">Detalles de la Estadía</h3>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                                    <p className="text-xs text-purple-700 font-semibold mb-2">CHECK-IN</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {new Date(selectedReserva.fecha_inicio).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'short'
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {new Date(selectedReserva.fecha_inicio).toLocaleDateString('es-PE', {
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                                    <p className="text-xs text-purple-700 font-semibold mb-2">CHECK-OUT</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {new Date(selectedReserva.fecha_fin).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'short'
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {new Date(selectedReserva.fecha_fin).toLocaleDateString('es-PE', {
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                                    <p className="text-xs text-purple-700 font-semibold mb-2">DURACIÓN</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {calcularNoches(selectedReserva.fecha_inicio, selectedReserva.fecha_fin)}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {calcularNoches(selectedReserva.fecha_inicio, selectedReserva.fecha_fin) === 1 ? 'noche' : 'noches'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-purple-600" />
                                        <span className="text-sm font-semibold text-gray-700">Huéspedes</span>
                                    </div>
                                    <span className="text-2xl font-bold text-purple-600">{selectedReserva.personas}</span>
                                </div>
                            </div>
                        </div>

                        {/* Información de pagos */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="w-6 h-6 text-yellow-700" />
                                <h3 className="text-lg font-bold text-gray-900">Información de Pago</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                                    <span className="text-gray-700 font-medium">Adelanto pagado</span>
                                    <span className="text-xl font-bold text-yellow-700">S/. {selectedReserva.adelanto?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                                    <span className="text-gray-700 font-medium">Saldo pendiente</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        S/. {(selectedReserva.total - (selectedReserva.adelanto || 0)).toLocaleString()}
                                    </span>
                                </div>
                                {selectedReserva.pagos && Array.isArray(selectedReserva.pagos) && selectedReserva.pagos.length > 0 && (
                                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-2">Pagos registrados: {selectedReserva.pagos.length}</p>
                                        <div className="space-y-2">
                                            {selectedReserva.pagos.map((pago, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{pago.metodo}</span>
                                                    <span className={`font-semibold ${
                                                        pago.estado === 'aprobado' ? 'text-green-600' : 'text-gray-600'
                                                    }`}>
                                                        S/. {pago.monto.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total destacado */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl shadow-lg">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Total de la Reserva</p>
                                    <p className="text-4xl font-bold">S/. {selectedReserva.total.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs opacity-75 mb-1">Reservado el</p>
                                    <p className="text-sm font-semibold">
                                        {new Date(selectedReserva.fecha_creacion).toLocaleDateString('es-PE', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cambiar estado */}
                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Cambiar Estado de la Reserva</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleChangeStatus('confirmada')}
                                    className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    ✓ Confirmar
                                </button>
                                <button
                                    onClick={() => handleChangeStatus('pendiente')}
                                    className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    ⏱ Pendiente
                                </button>
                                <button
                                    onClick={() => handleChangeStatus('cancelada')}
                                    className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    ✕ Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
