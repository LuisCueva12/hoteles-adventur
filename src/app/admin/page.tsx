'use client'

import Link from 'next/link'
import { StatCard } from '@/components/admin/StatCard'
import { Hotel, Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminPage() {
    const stats = [
        { title: 'Total Habitaciones', value: '150', icon: Hotel, trend: { value: '12%', isPositive: true }, color: 'blue' as const },
        { title: 'Reservas Activas', value: '89', icon: Calendar, trend: { value: '8%', isPositive: true }, color: 'green' as const },
        { title: 'Usuarios Registrados', value: '2,547', icon: Users, trend: { value: '23%', isPositive: true }, color: 'purple' as const },
        { title: 'Ingresos del Mes', value: 'S/. 125K', icon: DollarSign, trend: { value: '15%', isPositive: true }, color: 'yellow' as const },
    ]

    const recentActivity = [
        { type: 'reserva', user: 'María González', action: 'Nueva reserva - Suite Deluxe', time: 'Hace 5 min', status: 'success', icon: Calendar },
        { type: 'pago', user: 'Carlos Rodríguez', action: 'Pago confirmado - S/. 520', time: 'Hace 12 min', status: 'success', icon: DollarSign },
        { type: 'usuario', user: 'Ana Martínez', action: 'Nuevo usuario registrado', time: 'Hace 25 min', status: 'info', icon: Users },
        { type: 'cancelacion', user: 'Jorge Silva', action: 'Reserva cancelada', time: 'Hace 1 hora', status: 'warning', icon: AlertCircle },
        { type: 'reserva', user: 'Laura Pérez', action: 'Nueva reserva - Habitación Estándar', time: 'Hace 2 horas', status: 'success', icon: Calendar },
    ]

    const quickStats = [
        { label: 'Ocupación Actual', value: '78%', color: 'text-green-400', icon: TrendingUp },
        { label: 'Check-ins Hoy', value: '12', color: 'text-blue-400', icon: CheckCircle },
        { label: 'Check-outs Hoy', value: '8', color: 'text-yellow-400', icon: Clock },
        { label: 'Pendientes', value: '5', color: 'text-red-400', icon: AlertCircle },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
                <p className="text-gray-400">Gestión del sistema Adventur Hotels</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Actividad Reciente</h2>
                        <Link href="/admin/reportes" className="text-sm text-blue-400 hover:text-blue-300">
                            Ver todo →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity, idx) => {
                            const ActivityIcon = activity.icon
                            return (
                                <div key={idx} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        activity.status === 'success' ? 'bg-green-500/10 text-green-400' :
                                        activity.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-blue-500/10 text-blue-400'
                                    }`}>
                                        <ActivityIcon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white">{activity.user}</p>
                                        <p className="text-sm text-gray-400">{activity.action}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">Estadísticas Rápidas</h2>
                        <div className="space-y-4">
                            {quickStats.map((stat) => {
                                const StatIcon = stat.icon
                                return (
                                    <div key={stat.label} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <StatIcon size={16} className={stat.color} />
                                            <span className="text-sm text-gray-400">{stat.label}</span>
                                        </div>
                                        <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
                        <div className="space-y-2">
                            {[
                                { label: 'Gestionar Habitaciones', href: '/admin/hoteles', icon: Hotel },
                                { label: 'Ver Reservas', href: '/admin/reservas', icon: Calendar },
                                { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
                                { label: 'Reportes', href: '/admin/reportes', icon: TrendingUp },
                            ].map((item) => {
                                const ItemIcon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
                                    >
                                        <ItemIcon size={20} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
