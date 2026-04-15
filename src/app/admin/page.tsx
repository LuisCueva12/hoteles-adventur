'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Hotel, Calendar, Users, DollarSign, TrendingUp, Activity, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardCard } from '@/components/admin/DashboardCard'
import { DataTable } from '@/components/admin/DataTable'
import { ActivityStatusBadge } from '@/components/admin/ActivityStatusBadge'
import { QuickStats } from '@/components/admin/QuickStats'
import { QuickActions } from '@/components/admin/QuickActions'
import { formatActivityType, formatCurrency } from '@/utils/formatters'

export default function AdminPage() {
    const { stats, recentActivity, loading, error, refreshData } = useDashboard()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refreshData()
        setIsRefreshing(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">{error}</p>
                    <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    const activityColumns = [
        { key: 'type' as const, label: 'Tipo', render: formatActivityType },
        { key: 'user' as const, label: 'Usuario' },
        { key: 'action' as const, label: 'Acción' },
        { key: 'time' as const, label: 'Tiempo' },
        { key: 'status' as const, label: 'Estado', render: (value: string) => <ActivityStatusBadge status={value} /> }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Resumen general del sistema</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Total Habitaciones"
                    value={stats?.totalHabitaciones || 0}
                    icon={<Hotel size={24} />}
                    color="blue"
                />
                <DashboardCard
                    title="Reservas Activas"
                    value={stats?.reservasActivas || 0}
                    icon={<Calendar size={24} />}
                    color="green"
                />
                <DashboardCard
                    title="Usuarios Registrados"
                    value={stats?.usuariosRegistrados || 0}
                    icon={<Users size={24} />}
                    color="purple"
                />
                <DashboardCard
                    title="Ingresos del Mes"
                    value={formatCurrency(stats?.ingresosMes || 0)}
                    icon={<DollarSign size={24} />}
                    color="yellow"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
                        <DataTable
                            data={recentActivity}
                            columns={activityColumns}
                            loading={loading}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Rápidas</h2>
                        <QuickStats
                            checkinsHoy={stats?.checkinsHoy || 0}
                            checkoutsHoy={stats?.checkoutsHoy || 0}
                            pendientes={stats?.pendientes || 0}
                            ocupacionActual={stats?.ocupacionActual || 0}
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
                        <QuickActions />
                    </div>
                </div>
            </div>
        </div>
    )
}
