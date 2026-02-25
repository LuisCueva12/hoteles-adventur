'use client'

import { useState } from 'react'
import { StatCard } from '@/components/admin/StatCard'
import { DollarSign, Calendar, Hotel, Users, FileText, Download } from 'lucide-react'

export default function ReportesAdminPage() {
    const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes' | 'ano'>('mes')

    const stats = [
        { title: 'Ingresos Totales', value: 'S/. 125,450', icon: DollarSign, trend: { value: '15%', isPositive: true }, color: 'green' as const },
        { title: 'Reservas Realizadas', value: '89', icon: Calendar, trend: { value: '8%', isPositive: true }, color: 'blue' as const },
        { title: 'Tasa de Ocupación', value: '78%', icon: Hotel, trend: { value: '5%', isPositive: true }, color: 'purple' as const },
        { title: 'Nuevos Clientes', value: '45', icon: Users, trend: { value: '23%', isPositive: true }, color: 'yellow' as const },
    ]

    const topHabitaciones = [
        { nombre: 'Suite Premium 301', reservas: 28, ingresos: 14560 },
        { nombre: 'Suite Deluxe 101', reservas: 25, ingresos: 8750 },
        { nombre: 'Suite Ejecutiva 401', reservas: 18, ingresos: 7560 },
        { nombre: 'Habitación Superior 202', reservas: 15, ingresos: 3750 },
        { nombre: 'Habitación Estándar 201', reservas: 12, ingresos: 2160 },
    ]

    const ingresosMensuales = [
        { mes: 'Ene', ingresos: 95000 },
        { mes: 'Feb', ingresos: 125450 },
        { mes: 'Mar', ingresos: 0 },
    ]

    const reservasPorEstado = [
        { estado: 'Confirmadas', cantidad: 45, porcentaje: 51 },
        { estado: 'Pendientes', cantidad: 20, porcentaje: 22 },
        { estado: 'Completadas', cantidad: 18, porcentaje: 20 },
        { estado: 'Canceladas', cantidad: 6, porcentaje: 7 },
    ]

    const maxIngresos = Math.max(...ingresosMensuales.map(m => m.ingresos))

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Reportes y Estadísticas</h1>
                    <p className="text-gray-400">Análisis detallado del rendimiento del hotel</p>
                </div>
                <div className="flex gap-2">
                    {(['dia', 'semana', 'mes', 'ano'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriodo(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                periodo === p
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {p === 'dia' ? 'Día' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6">Ingresos Mensuales</h2>
                    <div className="space-y-4">
                        {ingresosMensuales.map((item) => (
                            <div key={item.mes}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-400">{item.mes}</span>
                                    <span className="text-sm font-semibold text-white">
                                        S/. {item.ingresos.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(item.ingresos / maxIngresos) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6">Reservas por Estado</h2>
                    <div className="space-y-4">
                        {reservasPorEstado.map((item) => (
                            <div key={item.estado}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-400">{item.estado}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-white">{item.cantidad}</span>
                                        <span className="text-xs text-gray-500">({item.porcentaje}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            item.estado === 'Confirmadas' ? 'bg-green-500' :
                                            item.estado === 'Pendientes' ? 'bg-yellow-500' :
                                            item.estado === 'Completadas' ? 'bg-blue-500' :
                                            'bg-red-500'
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
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6">Habitaciones Más Reservadas</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-800">
                                <tr>
                                    <th className="text-left py-3 text-sm font-semibold text-gray-400">Habitación</th>
                                    <th className="text-center py-3 text-sm font-semibold text-gray-400">Reservas</th>
                                    <th className="text-right py-3 text-sm font-semibold text-gray-400">Ingresos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {topHabitaciones.map((hab, idx) => (
                                    <tr key={hab.nombre} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-white">{hab.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-semibold">
                                                {hab.reservas}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right text-green-400 font-semibold">
                                            S/. {hab.ingresos.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">Resumen Rápido</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <span className="text-sm text-gray-400">Promedio por Reserva</span>
                                <span className="text-lg font-bold text-white">S/. 1,410</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <span className="text-sm text-gray-400">Duración Promedio</span>
                                <span className="text-lg font-bold text-white">3.2 días</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <span className="text-sm text-gray-400">Tasa de Cancelación</span>
                                <span className="text-lg font-bold text-red-400">7%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <span className="text-sm text-gray-400">Satisfacción</span>
                                <span className="text-lg font-bold text-green-400">4.8/5</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Exportar Reportes</h2>
                        <div className="space-y-2">
                            <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-left flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                    <span className="text-sm">Reporte de Ingresos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">PDF</span>
                                    <Download size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                </div>
                            </button>
                            <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-left flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                    <span className="text-sm">Reporte de Reservas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">Excel</span>
                                    <Download size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                </div>
                            </button>
                            <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-left flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                    <span className="text-sm">Reporte de Usuarios</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">CSV</span>
                                    <Download size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
