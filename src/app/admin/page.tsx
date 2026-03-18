'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminService } from '@/services/admin.servicio'
import { Hotel, Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowRight, Activity, BarChart3, RefreshCw, Loader2 } from 'lucide-react'

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalHabitaciones: 0,
        reservasActivas: 0,
        usuariosRegistrados: 0,
        ingresosMes: 0,
        ocupacionActual: 0,
        checkinsHoy: 0,
        checkoutsHoy: 0,
        pendientes: 0,
    })

    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [monthlyData, setMonthlyData] = useState<{ month: string; value: number; raw: number }[]>([])

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            const [dashboardStats, activities, monthly] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getRecentActivity(8),
                adminService.getMonthlyRevenue()
            ])
            setStats(dashboardStats)
            setRecentActivity(activities)
            setMonthlyData(monthly)
        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadDashboardData()
        setIsRefreshing(false)
    }

    const maxValue = Math.max(...monthlyData.map(d => d.value), 1)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Cargando dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Bienvenido al panel de administración
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="bg-white border-2 border-gray-300 rounded-xl px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
                    >
                        <RefreshCw className={`text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} size={16} />
                        <span className="text-sm text-gray-900 font-medium">Actualizar</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Users className="text-white" size={24} />
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            +11.01%
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1 font-medium">Usuarios</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.usuariosRegistrados.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Calendar className="text-white" size={24} />
                        </div>
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            -9.05%
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1 font-medium">Reservas</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.reservasActivas}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <DollarSign className="text-white" size={24} />
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            +15.3%
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1 font-medium">Ingresos del Mes</p>
                    <p className="text-3xl font-bold text-gray-900">S/. {(stats.ingresosMes / 1000).toFixed(1)}K</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                            <Hotel className="text-white" size={24} />
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            +8.2%
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1 font-medium">Alojamientos</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalHabitaciones}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Ventas Mensuales</h2>
                            <p className="text-sm text-gray-600 mt-1">Estadísticas de reservas por mes</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-64 gap-3">
                        {monthlyData.map((data) => (
                            <div key={data.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    S/. {data.raw.toLocaleString()}
                                </div>
                                <div className="w-full bg-gray-100 rounded-t-xl relative overflow-hidden cursor-pointer hover:bg-gray-200 transition-all"
                                     style={{ height: `${Math.max(data.value, 4)}%` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-700 group-hover:to-blue-500 transition-all"
                                         style={{ height: '100%' }}></div>
                                </div>
                                <span className="text-xs font-bold text-gray-900">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Meta Mensual</h2>
                        <p className="text-sm text-gray-600 mt-1">Objetivo establecido para cada mes</p>
                    </div>
                    
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke="#f3f4f6"
                                    strokeWidth="16"
                                    fill="none"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke="url(#gradient)"
                                    strokeWidth="16"
                                    fill="none"
                                    strokeDasharray={`${(stats.ocupacionActual / 100) * 502.4} 502.4`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-gray-900">{stats.ocupacionActual}%</span>
                                <span className="text-sm text-green-600 font-semibold">+10%</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-700 mb-6 font-medium">
                        Ganaste S/. {stats.ingresosMes.toLocaleString()} hoy, es mayor que el mes pasado. ¡Sigue con tu buen trabajo!
                    </p>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1 font-medium">Meta</p>
                            <p className="text-lg font-bold text-gray-900">S/. 20K</p>
                            <p className="text-xs text-red-600">↓</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1 font-medium">Ingresos</p>
                            <p className="text-lg font-bold text-gray-900">S/. {(stats.ingresosMes / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-green-600">↑</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1 font-medium">Hoy</p>
                            <p className="text-lg font-bold text-gray-900">S/. 20K</p>
                            <p className="text-xs text-green-600">↑</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="text-blue-600" size={20} />
                                Actividad Reciente
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Últimas acciones del sistema</p>
                        </div>
                        <Link href="/admin/reportes" className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group">
                            Ver todo 
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group border border-gray-100">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    activity.status === 'success' ? 'bg-green-100 text-green-600' :
                                    activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    {activity.type === 'reserva' ? <Calendar size={18} /> :
                                     activity.type === 'pago' ? <DollarSign size={18} /> :
                                     <Users size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">{activity.user}</p>
                                    <p className="text-sm text-gray-700">{activity.action}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Estadísticas Rápidas</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                        <TrendingUp size={18} className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">Ocupación</span>
                                </div>
                                <span className="text-xl font-bold text-green-600">{stats.ocupacionActual}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                        <CheckCircle size={18} className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">Check-ins Hoy</span>
                                </div>
                                <span className="text-xl font-bold text-blue-600">{stats.checkinsHoy}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                                        <Clock size={18} className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">Check-outs Hoy</span>
                                </div>
                                <span className="text-xl font-bold text-yellow-600">{stats.checkoutsHoy}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                                        <AlertCircle size={18} className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">Pendientes</span>
                                </div>
                                <span className="text-xl font-bold text-red-600">{stats.pendientes}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
                        <div className="space-y-2">
                            {[
                                { label: 'Alojamientos', href: '/admin/hoteles', icon: Hotel, color: 'blue' },
                                { label: 'Reservas', href: '/admin/reservas', icon: Calendar, color: 'green' },
                                { label: 'Usuarios', href: '/admin/usuarios', icon: Users, color: 'purple' },
                                { label: 'Reportes', href: '/admin/reportes', icon: BarChart3, color: 'orange' },
                            ].map((item) => {
                                const ItemIcon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group border border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                item.color === 'blue' ? 'bg-blue-500' :
                                                item.color === 'green' ? 'bg-green-500' :
                                                item.color === 'purple' ? 'bg-purple-500' :
                                                'bg-orange-500'
                                            }`}>
                                                <ItemIcon size={18} className="text-white" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-900">{item.label}</span>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
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
