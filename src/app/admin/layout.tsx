'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/hoteles', label: 'Habitaciones', icon: '🏨' },
    { href: '/admin/reservas', label: 'Reservas', icon: '📅' },
    { href: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
    { href: '/admin/reportes', label: 'Reportes', icon: '📈' },
]

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    return (
        <div className="min-h-screen flex bg-gray-950">
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
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
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <p className={`text-xs font-semibold text-gray-500 uppercase mb-3 ${!isSidebarOpen && 'text-center'}`}>
                        {isSidebarOpen ? 'Panel Admin' : '•••'}
                    </p>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href
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
                                <span className="text-lg">{item.icon}</span>
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
                        <span className="text-lg">🏠</span>
                        {isSidebarOpen && <span>Volver al sitio</span>}
                    </Link>
                    <Link
                        href="/login"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors mt-1 ${!isSidebarOpen && 'justify-center'}`}
                        title={!isSidebarOpen ? 'Cerrar sesión' : undefined}
                    >
                        <span className="text-lg">🚪</span>
                        {isSidebarOpen && <span>Cerrar sesión</span>}
                    </Link>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <div className="p-8 text-white">
                    {children}
                </div>
            </main>
        </div>
    )
}
