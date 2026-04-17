'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Hotel, 
    Calendar, 
    Users, 
    DollarSign, 
    TrendingUp, 
    Activity, 
    RefreshCw, 
    Search,
    Bell,
    ExternalLink,
    Zap,
    ArrowUpRight,
    Trophy,
    Target
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { ActivityStatusBadge } from '@/components/admin/ActivityStatusBadge'
import { QuickStats } from '@/components/admin/QuickStats'
import { QuickActions } from '@/components/admin/QuickActions'
import { formatCurrency } from '@/utils/formatters'
import { createClient } from '@/utils/supabase/client'

export default function AdminPage() {
    const { stats, recentActivity, loading, error, refreshData } = useDashboard()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [userName, setUserName] = useState<string>('Administrador')

    useEffect(() => {
        async function getUser() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.user_metadata?.nombre) {
                setUserName(user.user_metadata.nombre)
            }
        }
        getUser()
    }, [])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refreshData()
        setIsRefreshing(false)
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 border-4 border-blue-50 border-t-[#0d1b2a] rounded-full animate-spin"></div>
                <p className="text-[#0d1b2a] font-black uppercase tracking-[0.4em] animate-pulse">Inteligencia de Negocios...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-16">
            {/* Premium Header Card - Matching Modules */}
            <div className="bg-[#0d1b2a] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-500/20 transition-all duration-1000"></div>
                
                <div className="flex flex-col xl:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="text-center xl:text-left">
                        <div className="flex items-center justify-center xl:justify-start gap-2 text-blue-400 font-black text-[10px] tracking-[0.3em] uppercase mb-4">
                            <Activity size={14} />
                            Centro de Comando Global
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none uppercase">
                            ¡Bienvenido, <span className="text-blue-400">{userName}</span>! 👋
                        </h1>
                        <p className="text-gray-400 text-xl font-medium max-w-2xl leading-relaxed">
                            Hotel Adventur está operando con total normalidad. Aquí tienes el pulso estratégico de hoy.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-gray-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all backdrop-blur-md">
                            <Search size={18} className="mr-3 text-blue-400" />
                            <input type="text" placeholder="Consultar sistema..." className="bg-transparent border-none outline-none text-white w-48 font-bold" />
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-3 px-8 py-4 bg-[#fccd2a] hover:bg-[#ffdf4a] text-[#0d1b2a] rounded-2xl shadow-xl shadow-yellow-400/20 transition-all transform hover:scale-105 active:scale-95 font-black uppercase tracking-widest text-sm"
                        >
                            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={20} />
                            Sincronizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid - Premium Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Ocupación Actual', value: `${stats?.totalHabitaciones || 0}`, icon: Hotel, color: 'from-[#0d1b2a] to-[#1a3a5a]', sub: 'Unidades Habitacionales' },
                    { label: 'Reservas Activas', value: stats?.reservasActivas || 0, icon: Calendar, color: 'from-blue-600 to-blue-400', sub: 'Confirmadas/Pendientes' },
                    { label: 'Ecosistema Usuarios', value: stats?.usuariosRegistrados || 0, icon: Users, color: 'from-amber-400 to-orange-400', sub: 'Base de Datos Clientes' },
                    { label: 'Ingresos Mensuales', value: formatCurrency(stats?.ingresosMes || 0), icon: DollarSign, color: 'from-emerald-600 to-teal-400', sub: 'Facturación del Período', isCurrency: true }
                ].map((stat, i) => (
                    <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-[2rem] p-8 text-white shadow-2xl transition-all transform hover:scale-[1.03] cursor-default group relative overflow-hidden`}>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{stat.label}</span>
                                <div className="p-3.5 bg-white/20 rounded-[1.25rem] backdrop-blur-md">
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <h3 className={`font-black mb-1 italic tracking-tighter leading-none ${stat.isCurrency ? 'text-4xl' : 'text-5xl'}`}>{stat.value}</h3>
                            <p className="text-[10px] mt-4 font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                <Activity size={10} /> {stat.sub}
                            </p>
                        </div>
                        <stat.icon size={130} className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Activity Feed Container */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden h-full">
                        <div className="p-10 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                                    <Activity className="text-blue-500" /> Actividad Reciente
                                </h2>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Log de movimientos en tiempo real</p>
                            </div>
                            <Link href="/admin/reservas" className="bg-[#0d1b2a] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 group">
                                Ver todo <ArrowUpRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="p-10">
                            <div className="space-y-8">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity, i) => (
                                        <div key={i} className="flex items-center justify-between group cursor-default">
                                            <div className="flex items-center gap-6">
                                                <div className={`p-4 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                                                    activity.type === 'reserva' ? 'bg-blue-50 text-blue-600 shadow-blue-500/5' : 'bg-emerald-50 text-emerald-600 shadow-emerald-500/5'
                                                } group-hover:scale-110 duration-300`}>
                                                    {activity.type === 'reserva' ? <Calendar size={22} /> : <DollarSign size={22} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                        {activity.action}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0d1b2a] bg-gray-100 px-2 py-0.5 rounded-md">{activity.user}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest font-mono italic">
                                                            ● {activity.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ActivityStatusBadge status={activity.status} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                                        <Activity className="text-gray-300 w-20 h-20 mx-auto mb-6 opacity-20" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest">A la espera de nuevos eventos...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Metrics Widget */}
                <div className="space-y-10">
                    <div className="bg-[#0d1b2a] rounded-[2.5rem] p-10 shadow-3xl text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-xl font-black mb-10 border-l-4 border-blue-400 pl-4 uppercase tracking-[0.2em]">Estado Hoy</h2>
                            <QuickStats
                                checkinsHoy={stats?.checkinsHoy || 0}
                                checkoutsHoy={stats?.checkoutsHoy || 0}
                                pendientes={stats?.pendientes || 0}
                                ocupacionActual={stats?.ocupacionActual || 0}
                            />
                            
                            <div className="mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-md">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic">Meta del Mes</span>
                                    <Trophy size={16} className="text-yellow-400" />
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
                                    <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 italic">75% Completado (S/. 45,000 / S/. 60,000)</p>
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 p-10 opacity-5 group-hover:scale-110 transition-all duration-1000">
                            <Target size={200} className="text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 group">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Acceso Operativo</h2>
                            <div className="w-12 h-12 bg-amber-50 rounded-[1.25rem] flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10 group-hover:rotate-12 transition-transform">
                                <Zap size={20} className="fill-amber-500" />
                            </div>
                        </div>
                        <QuickActions />
                        
                        <div className="mt-10 pt-8 border-t border-gray-50">
                            <Link 
                                href="/" 
                                target="_blank"
                                className="w-full py-5 px-8 bg-gray-900 rounded-[2rem] flex items-center justify-between group/link hover:bg-black transition-all shadow-xl shadow-gray-900/10"
                            >
                                <span className="flex items-center gap-3 text-white text-sm font-black uppercase tracking-widest">
                                    <ExternalLink size={20} className="text-blue-400" />
                                    Portal Público
                                </span>
                                <ArrowUpRight size={20} className="text-white opacity-40 group-hover/link:opacity-100 transform translate-x-1 group-hover/link:translate-x-0 transition-all" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
