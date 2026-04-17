'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/admin/Modal'
import { dashboardService } from '@/services/dashboard.service'
import { notificationsService } from '@/services/notificaciones.servicio'
import { AlertService } from '@/lib/ui/alert.service'
import { 
    RefreshCw, 
    Loader2, 
    Calendar, 
    User, 
    Home, 
    CreditCard, 
    Eye, 
    Trash2,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp
} from 'lucide-react'
import { DataTableEnhanced } from '@/components/admin/DataTableEnhanced'

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

const COLUMNS = [
    {
        key: 'codigo_reserva' as const,
        label: 'CÓDIGO',
        sortable: true,
        render: (value: string) => (
            <span className="text-[10px] font-black tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl text-blue-700 border border-blue-100 uppercase">
                {value}
            </span>
        )
    },
    {
        key: 'usuarios' as const,
        label: 'HUÉSPED',
        sortable: true,
        render: (_value: any, row: Reserva) => (
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                    {row.usuarios ? `${row.usuarios.nombre} ${row.usuarios.apellido}` : 'Huésped General'}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">{row.usuarios?.email || 'Sin contacto'}</span>
            </div>
        )
    },
    {
        key: 'alojamientos' as const,
        label: 'ALOJAMIENTO',
        sortable: true,
        render: (_value: any, row: Reserva) => (
            <div className="flex flex-col">
                <span className="text-sm text-gray-800 font-bold uppercase tracking-tight">{row.alojamientos?.nombre || 'General'}</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-[0.15em] font-medium">{row.alojamientos?.tipo || 'Unidad'}</span>
            </div>
        )
    },
    {
        key: 'fecha_inicio' as const,
        label: 'ESTADÍA',
        sortable: true,
        render: (_value: any, row: Reserva) => (
            <div className="flex items-center gap-2">
                <div className="flex flex-col bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 min-w-17.5 items-center">
                    <span className="text-[9px] font-black text-blue-600 uppercase">In</span>
                    <span className="text-xs font-bold text-gray-900">{new Date(row.fecha_inicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                </div>
                <div className="w-2 h-0.5 bg-gray-200"></div>
                <div className="flex flex-col bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 min-w-17.5 items-center">
                    <span className="text-[9px] font-black text-purple-600 uppercase">Out</span>
                    <span className="text-xs font-bold text-gray-900">{new Date(row.fecha_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                </div>
            </div>
        )
    },
    {
        key: 'total' as const,
        label: 'TOTAL',
        sortable: true,
        render: (value: number, row: Reserva) => (
            <div className="flex flex-col text-right">
                <span className="text-base font-black text-gray-900 leading-none mb-1">S/. {value.toLocaleString()}</span>
                {row.adelanto > 0 && (
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Adelanto: S/. {row.adelanto.toLocaleString()}</span>
                )}
            </div>
        )
    },
    {
        key: 'estado' as const,
        label: 'ESTADO',
        sortable: true,
        render: (value: string, row: Reserva) => {
            const colors = {
                confirmada: 'bg-green-50 text-green-600 border-green-200',
                pendiente: 'bg-amber-50 text-amber-600 border-amber-200',
                cancelada: 'bg-red-50 text-red-600 border-red-200'
            }
            return (
                <div className="flex justify-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${colors[value as keyof typeof colors] || 'bg-gray-50 text-gray-600'}`}>
                        {value === 'confirmada' ? '✓ ' : value === 'pendiente' ? '⏱ ' : '✕ '}
                        {value}
                    </span>
                </div>
            )
        }
    },
    {
        key: 'actions' as const,
        label: 'ACCIONES',
        render: (_value: any, row: Reserva) => (
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); (window as any).onViewReserva(row) }}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                    title="Ver detalles"
                >
                    <Eye size={18} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); (window as any).onDeleteReserva(row) }}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="Eliminar"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        )
    }
]

export default function ReservasAdminPage() {
    const [reservas, setReservas] = useState<Reserva[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filterEstado, setFilterEstado] = useState<string>('todas')
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        loadReservas()
        
        // Global focus for action buttons
        (window as any).onViewReserva = handleView;
        (window as any).onDeleteReserva = handleDelete;
        
        return () => {
            delete (window as any).onViewReserva;
            delete (window as any).onDeleteReserva;
        }
    }, [])

    const loadReservas = async () => {
        try {
            setLoading(true)
            const data = await dashboardService.getReservas()
            const cleanData = (data || []).map((reserva: Reserva) => ({
                ...reserva,
                usuarios: reserva.usuarios || null,
                alojamientos: reserva.alojamientos || null,
                pagos: reserva.pagos || []
            }))
            setReservas(cleanData)
        } catch (error) {
            console.error('Error loading reservas:', error)
            await AlertService.error('Error', 'No se pudieron cargar las reservas.')
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

    const handleDelete = async (reserva: Reserva) => {
        const confirmed = await AlertService.confirmDanger({
            title: '¿Eliminar reserva?',
            text: `Esta acción borrará el código ${reserva.codigo_reserva} permanentemente.`,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (confirmed) {
            try {
                await dashboardService.deleteReserva(reserva.id)
                await loadReservas()
                await AlertService.success('¡Eliminado!', 'Reserva eliminada con éxito')
            } catch (error) {
                await AlertService.error('Error', 'No se pudo eliminar')
            }
        }
    }

    const handleChangeStatus = async (newStatus: string) => {
        if (!selectedReserva) return
        try {
            await dashboardService.updateReserva(selectedReserva.id, { estado: newStatus })
            await loadReservas()
            
            // Notify if needed
            await notificationsService.notifyAdmins(
                'info',
                'Status Actualizado',
                `Reserva ${selectedReserva.codigo_reserva} pasó a ${newStatus}`,
                '/admin/reservas'
            )
            
            await AlertService.success('¡Hecho!', `Estado cambiado a ${newStatus}`)
            setIsModalOpen(false)
        } catch (error) {
            await AlertService.error('Error', 'No se pudo cambiar el estado')
        }
    }

    const filteredReservas = filterEstado === 'todas' 
        ? reservas 
        : reservas.filter(r => r.estado === filterEstado)

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-black uppercase tracking-[0.4em] animate-pulse">Sincronizando Reservas...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-16">
            {/* Premium Header - Matching Users Design */}
            <div className="bg-[#0d1b2a] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl transition-all duration-1000 group-hover:bg-blue-500/20"></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">
                            Gestión de <span className="text-blue-400">Reservas</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium">
                            Administra ingresos, estadías y estados en tiempo real.
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-2xl transition-all backdrop-blur-md disabled:opacity-50 font-black uppercase tracking-widest text-sm"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </button>
                </div>
            </div>

            {/* Colorful Stats Cards - Matching Shared Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Reservas', value: reservas.length, icon: Calendar, color: 'from-blue-600 to-indigo-600', sub: 'Todas las estadías' },
                    { label: 'Confirmadas', value: reservas.filter(r => r.estado === 'confirmada').length, icon: CheckCircle, color: 'from-emerald-500 to-teal-400', sub: 'Listas para ingreso' },
                    { label: 'Pendientes', value: reservas.filter(r => r.estado === 'pendiente').length, icon: Clock, color: 'from-amber-400 to-orange-400', sub: 'Esperando validación' },
                    { label: 'Canceladas', value: reservas.filter(r => r.estado === 'cancelada').length, icon: XCircle, color: 'from-rose-500 to-pink-500', sub: 'Fuera de sistema' }
                ].map((stat, i) => (
                    <div key={i} className={`bg-linear-to-br ${stat.color} rounded-4xl p-8 text-white shadow-xl shadow-blue-900/10 transition-all transform hover:scale-[1.03] cursor-default group relative overflow-hidden`}>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">{stat.label}</span>
                                <div className="p-3 bg-white/20 rounded-[1.25rem]">
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <h3 className="text-5xl font-black mb-1">{stat.value}</h3>
                            <p className="text-xs mt-3 font-medium opacity-80 uppercase tracking-widest">{stat.sub}</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <stat.icon size={120} />
                        </div>
                    </div>
                ))}
            </div>

            {/* New Table Container with Filter Tabs */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,123,255,0.05)] border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">Filtro Estado:</span>
                        <div className="flex bg-white/50 p-1.5 rounded-2xl border border-gray-100">
                            {['todas', 'pendiente', 'confirmada', 'cancelada'].map((est) => (
                                <button
                                    key={est}
                                    onClick={() => setFilterEstado(est)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        filterEstado === est 
                                        ? 'bg-[#0d1b2a] text-white shadow-lg' 
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {est}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={14} />
                        Total: {filteredReservas.length} registros
                    </div>
                </div>
                
                <div className="p-4">
                    <DataTableEnhanced
                        data={filteredReservas}
                        columns={COLUMNS}
                        searchable={true}
                        onRefresh={handleRefresh}
                    />
                </div>
            </div>

            {/* Premium Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Detalles Reserva ${selectedReserva?.codigo_reserva}`}
                size="lg"
            >
                {selectedReserva && (
                    <div className="space-y-8 py-2">
                        {/* Guest Hero Section */}
                        <div className="flex items-start justify-between bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-[#0d1b2a] rounded-4xl flex items-center justify-center text-white text-3xl font-black">
                                    {selectedReserva.usuarios?.nombre?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-gray-900 uppercase">
                                        {selectedReserva.usuarios ? `${selectedReserva.usuarios.nombre} ${selectedReserva.usuarios.apellido}` : 'Invitado'}
                                    </h4>
                                    <p className="text-blue-600 font-bold">{selectedReserva.usuarios?.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white border ${
                                            selectedReserva.estado === 'confirmada' ? 'text-green-600 border-green-200' : 
                                            selectedReserva.estado === 'pendiente' ? 'text-amber-600 border-amber-200' : 'text-red-600 border-red-200'
                                        }`}>
                                            Estado Actual: {selectedReserva.estado}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Reserva</p>
                                <p className="text-4xl font-black text-[#0d1b2a]">S/. {selectedReserva.total.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Information Grid */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                    <Home size={14} className="text-blue-500" /> Detalle Alojamiento
                                </h5>
                                <div className="bg-white border border-gray-100 p-6 rounded-4xl shadow-sm">
                                    <p className="text-lg font-black text-gray-800 uppercase leading-none">{selectedReserva.alojamientos?.nombre}</p>
                                    <p className="text-sm text-gray-400 mt-2 font-medium uppercase tracking-widest">{selectedReserva.alojamientos?.tipo}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                    <Calendar size={14} className="text-purple-500" /> Período Estadía
                                </h5>
                                <div className="bg-white border border-gray-100 p-6 rounded-4xl shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Check-In</p>
                                        <p className="text-xl font-black text-gray-800">{new Date(selectedReserva.fecha_inicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="w-10 h-0.5 bg-gray-100"></div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-purple-600 uppercase mb-1">Check-Out</p>
                                        <p className="text-xl font-black text-gray-800">{new Date(selectedReserva.fecha_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500"><CreditCard size={20} /></div>
                                <h5 className="text-lg font-black text-gray-800 uppercase tracking-tight">Registro de Pagos</h5>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                    <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">Adelanto abonado:</span>
                                    <span className="text-xl font-black text-emerald-600 italic">S/. {selectedReserva.adelanto.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-[#0d1b2a] text-white rounded-2xl shadow-xl">
                                    <span className="text-sm font-bold opacity-70 uppercase tracking-widest">Saldo Pendiente:</span>
                                    <span className="text-2xl font-black text-amber-400 italic">S/. {(selectedReserva.total - selectedReserva.adelanto).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Command Section */}
                        <div className="pt-4 border-t border-gray-50">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Cambiar Estado Operativo</p>
                            <div className="grid grid-cols-3 gap-4">
                                <button onClick={() => handleChangeStatus('confirmada')} className="group p-5 bg-emerald-50 hover:bg-emerald-600 border border-emerald-100 rounded-4xl transition-all flex flex-col items-center gap-2">
                                    <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm group-hover:bg-[#0d1b2a] group-hover:text-white transition-all"><CheckCircle size={24} /></div>
                                    <span className="text-xs font-black text-emerald-700 uppercase tracking-widest group-hover:text-white">Confirmar</span>
                                </button>
                                <button onClick={() => handleChangeStatus('pendiente')} className="group p-5 bg-amber-50 hover:bg-amber-500 border border-amber-100 rounded-4xl transition-all flex flex-col items-center gap-2">
                                    <div className="p-3 bg-white text-amber-500 rounded-2xl shadow-sm group-hover:bg-[#0d1b2a] group-hover:text-white transition-all"><Clock size={24} /></div>
                                    <span className="text-xs font-black text-amber-700 uppercase tracking-widest group-hover:text-white">Pendiente</span>
                                </button>
                                <button onClick={() => handleChangeStatus('cancelada')} className="group p-5 bg-rose-50 hover:bg-rose-500 border border-rose-100 rounded-4xl transition-all flex flex-col items-center gap-2">
                                    <div className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm group-hover:bg-[#0d1b2a] group-hover:text-white transition-all"><XCircle size={24} /></div>
                                    <span className="text-xs font-black text-rose-700 uppercase tracking-widest group-hover:text-white">Cancelar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
