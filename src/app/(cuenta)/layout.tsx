'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const MENU_ITEMS = [
    { href: '/perfil', label: 'Mi Perfil', icon: '👤' },
    { href: '/reservas', label: 'Mis Reservas', icon: '📅' },
    { href: '/pagos', label: 'Mis Pagos', icon: '💳' },
]

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
        } else {
            setUser(user)
        }
        setLoading(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">H</span>
                        <span className="text-gray-900 font-bold text-lg tracking-wide">otel Adventur</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            Volver al sitio
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-center text-sm font-semibold text-gray-900 truncate">
                                    {user?.email}
                                </p>
                            </div>

                            <nav className="space-y-1">
                                {MENU_ITEMS.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-xl">{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
