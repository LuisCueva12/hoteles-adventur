'use client'

import { useState, useEffect } from 'react'
import { StatCard } from '@/components/admin/TarjetaEstadistica'
import { DollarSign, Calendar, Hotel, Users, FileText, Download, Loader2 } from 'lucide-react'
import { exportIngresosPDF, exportReservasExcel, exportUsuariosCSV, type ReservaConRelaciones, type DatosReporte } from '@/utils/exportarReportes'
import { adminService } from '@/services/admin.servicio'
import type { Usuario } from '@/types/basedatos'

export default function ReportesAdminPage() {
    const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes' | 'ano'>('mes')
    const [exporting, setExporting] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalIngresos: 0,
        totalReservas: 0,
        tasaOcupacion: 0,
        nuevosClientes: 0
    })
    const [ingresosMensuales, setIngresosMensuales] = useState<Array<{ mes: string; ingresos: number }>>([])
    const [reservasPorEstado, setReservasPorEstado] = useState<Array<{ estado: string; cantidad: number; porcentaje: number }>>([])
    const [topHabitaciones, setTopHabitaciones] = useState<Array<{ nombre: string; reservas: number; ingresos: number }>>([])
    // Datos crudos para exportaciones reales
    const [rawReservas, setRawReservas] = useState<ReservaConRelaciones[]>([])
    const [rawUsuarios, setRawUsuarios] = useState<Usuario[]>([])

    useEffect(() => {
        loadReportData()
    }, [])

    const loadReportData = async () => {
        try {
            setLoading(true)
            
            // Cargar estadísticas del dashboard
            const dashboardStats = await adminService.getDashboardStats()
            
            // Cargar reservas para calcular estadísticas
            const reservas = await adminService.getReservas()
            const alojamientos = await adminService.getAlojamientos()
            const usuarios = await adminService.getUsuarios()

            // Calcular ingresos totales
            const totalIngresos = reservas?.reduce((sum, r) => sum + (r.total || 0), 0) || 0
            
            // Calcular reservas por estado
            const reservasPorEstadoData = [
                { 
                    estado: 'Confirmadas', 
                    cantidad: reservas?.filter(r => r.estado === 'confirmada').length || 0,
                    porcentaje: 0
                },
                { 
                    estado: 'Pendientes', 
                    cantidad: reservas?.filter(r => r.estado === 'pendiente').length || 0,
                    porcentaje: 0
                },
                { 
                    estado: 'Completadas', 
                    cantidad: reservas?.filter(r => r.estado === 'confirmada' && new Date(r.fecha_fin) < new Date()).length || 0,
                    porcentaje: 0
                },
                { 
                    estado: 'Canceladas', 
                    cantidad: reservas?.filter(r => r.estado === 'cancelada').length || 0,
                    porcentaje: 0
                }
            ]

            // Calcular porcentajes
            const totalReservasEstado = reservasPorEstadoData.reduce((sum, r) => sum + r.cantidad, 0)
            reservasPorEstadoData.forEach(r => {
                r.porcentaje = totalReservasEstado > 0 ? Math.round((r.cantidad / totalReservasEstado) * 100) : 0
            })

            // Calcular ingresos mensuales (últimos 3 meses)
            const now = new Date()
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            const ingresosMensualesData = []
            
            for (let i = 2; i >= 0; i--) {
                const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const mesIndex = fecha.getMonth()
                const año = fecha.getFullYear()
                
                const ingresosMes = reservas?.filter(r => {
                    const fechaReserva = new Date(r.fecha_creacion)
                    return fechaReserva.getMonth() === mesIndex && fechaReserva.getFullYear() === año
                }).reduce((sum, r) => sum + (r.total || 0), 0) || 0
                
                ingresosMensualesData.push({
                    mes: meses[mesIndex],
                    ingresos: ingresosMes
                })
            }

            // Top 5 habitaciones más reservadas
            const habitacionesReservas = new Map<string, { nombre: string; reservas: number; ingresos: number }>()
            
            reservas?.forEach(reserva => {
                if (reserva.alojamientos) {
                    const nombre = reserva.alojamientos.nombre
                    const current = habitacionesReservas.get(nombre) || { nombre, reservas: 0, ingresos: 0 }
                    current.reservas++
                    current.ingresos += reserva.total || 0
                    habitacionesReservas.set(nombre, current)
                }
            })

            const topHabitacionesData = Array.from(habitacionesReservas.values())
                .sort((a, b) => b.reservas - a.reservas)
                .slice(0, 5)

            // Actualizar estados
            setStats({
                totalIngresos,
                totalReservas: reservas?.length || 0,
                tasaOcupacion: dashboardStats.ocupacionActual || 0,
                nuevosClientes: usuarios?.filter(u => {
                    const fechaRegistro = new Date(u.fecha_registro)
                    const hace30Dias = new Date()
                    hace30Dias.setDate(hace30Dias.getDate() - 30)
                    return fechaRegistro >= hace30Dias
                }).length || 0
            })

            setIngresosMensuales(ingresosMensualesData)
            setReservasPorEstado(reservasPorEstadoData)
            setTopHabitaciones(topHabitacionesData)
            // Guardar datos crudos para exportaciones
            setRawReservas((reservas || []) as ReservaConRelaciones[])
            setRawUsuarios((usuarios || []) as Usuario[])

        } catch (error) {
            console.error('Error loading report data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async (type: 'ingresos' | 'reservas' | 'usuarios') => {
        setExporting(type)
        try {
            switch (type) {
                case 'ingresos': {
                    const datosReporte: DatosReporte = {
                        reservas: rawReservas,
                        usuarios: rawUsuarios,
                        ingresosMensuales,
                        totalIngresos: stats.totalIngresos,
                        tasaOcupacion: stats.tasaOcupacion,
                    }
                    await exportIngresosPDF(datosReporte)
                    break
                }
                case 'reservas':
                    await exportReservasExcel(rawReservas)
                    break
                case 'usuarios':
                    await exportUsuariosCSV(rawUsuarios)
                    break
            }
        } catch (error) {
            console.error('Error al exportar:', error)
            alert('Error al exportar el reporte')
        } finally {
            setExporting(null)
        }
    }

    const statsCards = [
        { title: 'Ingresos Totales', value: `S/. ${stats.totalIngresos.toLocaleString()}`, icon: DollarSign, trend: { value: '15%', isPositive: true }, color: 'green' as const },
        { title: 'Reservas Realizadas', value: stats.totalReservas.toString(), icon: Calendar, trend: { value: '8%', isPositive: true }, color: 'blue' as const },
        { title: 'Tasa de Ocupación', value: `${stats.tasaOcupacion}%`, icon: Hotel, trend: { value: '5%', isPositive: true }, color: 'purple' as const },
        { title: 'Nuevos Clientes', value: stats.nuevosClientes.toString(), icon: Users, trend: { value: '23%', isPositive: true }, color: 'yellow' as const },
    ]

    const maxIngresos = Math.max(...ingresosMensuales.map(m => m.ingresos), 1)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Cargando reportes...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">Reportes y Estadísticas</h1>
                    <p className="text-gray-600">Análisis detallado del rendimiento del hotel</p>
                </div>
                <div className="flex gap-2">
                    {(['dia', 'semana', 'mes', 'ano'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriodo(p)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                periodo === p
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
                            }`}
                        >
                            {p === 'dia' ? 'Día' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900">Ingresos Mensuales</h2>
                    <div className="space-y-4">
                        {ingresosMensuales.map((item) => (
                            <div key={item.mes}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 font-medium">{item.mes}</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        S/. {item.ingresos.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(item.ingresos / maxIngresos) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900">Reservas por Estado</h2>
                    <div className="space-y-4">
                        {reservasPorEstado.map((item) => (
                            <div key={item.estado}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 font-medium">{item.estado}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900">{item.cantidad}</span>
                                        <span className="text-xs text-gray-500">({item.porcentaje}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            item.estado === 'Confirmadas' ? 'bg-yellow-400' :
                                            item.estado === 'Pendientes' ? 'bg-yellow-400' :
                                            item.estado === 'Completadas' ? 'bg-blue-500' :
                                            'bg-yellow-300'
                                        }`}
                                        style={{ width: `${item.porcentaje}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900">Habitaciones Más Reservadas</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Habitación</th>
                                    <th className="text-center py-3 text-sm font-semibold text-gray-700">Reservas</th>
                                    <th className="text-right py-3 text-sm font-semibold text-gray-700">Ingresos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {topHabitaciones.map((hab, idx) => (
                                    <tr key={hab.nombre} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-gray-900 font-medium">{hab.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                                                {hab.reservas}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right text-yellow-400 font-semibold">
                                            S/. {hab.ingresos.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900">Resumen Rápido</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <span className="text-sm text-gray-600 font-medium">Promedio por Reserva</span>
                                <span className="text-lg font-bold text-gray-900">
                                    S/. {stats.totalReservas > 0 ? Math.round(stats.totalIngresos / stats.totalReservas).toLocaleString() : '0'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <span className="text-sm text-gray-600 font-medium">Total Reservas</span>
                                <span className="text-lg font-bold text-gray-900">{stats.totalReservas}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                <span className="text-sm text-yellow-400 font-medium">Tasa de Cancelación</span>
                                <span className="text-lg font-bold text-yellow-400">
                                    {stats.totalReservas > 0 
                                        ? Math.round((reservasPorEstado.find(r => r.estado === 'Canceladas')?.cantidad || 0) / stats.totalReservas * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                <span className="text-sm text-yellow-400 font-medium">Tasa de Ocupación</span>
                                <span className="text-lg font-bold text-yellow-400">{stats.tasaOcupacion}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Exportar Reportes</h2>
                        <div className="space-y-2">
                            <button 
                                onClick={() => handleExport('ingresos')}
                                disabled={exporting === 'ingresos'}
                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-all text-left flex items-center justify-between group border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-sm font-medium">
                                        {exporting === 'ingresos' ? 'Exportando...' : 'Reporte de Ingresos'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 font-semibold">PDF</span>
                                    <Download size={16} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </button>
                            <button 
                                onClick={() => handleExport('reservas')}
                                disabled={exporting === 'reservas'}
                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-all text-left flex items-center justify-between group border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-sm font-medium">
                                        {exporting === 'reservas' ? 'Exportando...' : 'Reporte de Reservas'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 font-semibold">Excel</span>
                                    <Download size={16} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </button>
                            <button 
                                onClick={() => handleExport('usuarios')}
                                disabled={exporting === 'usuarios'}
                                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-all text-left flex items-center justify-between group border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-sm font-medium">
                                        {exporting === 'usuarios' ? 'Exportando...' : 'Reporte de Usuarios'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 font-semibold">CSV</span>
                                    <Download size={16} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
