'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Hotel, Calendar, Users, TrendingUp, Settings, Home, LogOut, Menu, X, Bell } from 'lucide-react'

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/hoteles', label: 'Habitaciones', icon: Hotel },
    { href: '/admin/reservas', label: 'Reservas', icon: Calendar },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/admin/reportes', label: 'Reportes', icon: TrendingUp },
    { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen flex bg-gray-950">
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex-col hidden lg:flex`}>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    {isSidebarOpen && (
                        <Link href="/" className="flex items-center gap-2">
                            <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">H</span>
                            <span className="text-white font-bold">Adventur</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <p className={`text-xs font-semibold text-gray-500 uppercase mb-3 ${!isSidebarOpen && 'text-center'}`}>
                        {isSidebarOpen ? 'Panel Admin' : '•••'}
                    </p>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                    isActive
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                } ${!isSidebarOpen && 'justify-center'}`}
                                title={!isSidebarOpen ? item.label : undefined}
                            >
                                <Icon size={20} />
                                {isSidebarOpen && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link
                        href="/"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors ${!isSidebarOpen && 'justify-center'}`}
                        title={!isSidebarOpen ? 'Volver al sitio' : undefined}
                    >
                        <Home size={20} />
                        {isSidebarOpen && <span>Volver al sitio</span>}
                    </Link>
                    <Link
                        href="/login"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors mt-1 ${!isSidebarOpen && 'justify-center'}`}
                        title={!isSidebarOpen ? 'Cerrar sesión' : undefined}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Cerrar sesión</span>}
                    </Link>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="lg:hidden bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">H</span>
                        <span className="text-white font-bold">Adventur Admin</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell size={20} />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </header>

                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-gray-900 border-b border-gray-800">
                        <nav className="p-4 space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                            isActive
                                                ? 'bg-red-600 text-white'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                            <div className="border-t border-gray-800 pt-2 mt-2">
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                                >
                                    <Home size={20} />
                                    <span>Volver al sitio</span>
                                </Link>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
                                >
                                    <LogOut size={20} />
                                    <span>Cerrar sesión</span>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}

                <main className="flex-1 overflow-auto">
                    <div className="p-4 lg:p-8 text-white">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
