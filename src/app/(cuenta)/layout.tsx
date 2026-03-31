'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

import { Calendar, CreditCard } from 'lucide-react'

export const dynamic = 'force-dynamic'

const MENU_ITEMS = [
    { href: '/reservas', label: 'Mis Reservas', Icon: Calendar },
    { href: '/pagos', label: 'Mis Pagos', Icon: CreditCard },
]

function CuentaLayoutContent({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [accessDenied, setAccessDenied] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        setMounted(true)
        checkUserAccess()
    }, [])

    const checkUserAccess = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            
            if (authError || !user) {
                console.error('Error de autenticación:', authError)
                router.push('/login?redirect=' + pathname)
                return
            }

            // Verificar que el usuario existe
            const { data: userData, error: dbError } = await supabase
                .from('usuarios')
                .select('id, rol')
                .eq('id', user.id)
                .maybeSingle()

            // Si hay error de base de datos (tabla no existe), permitir acceso temporal
            if (dbError) {
                console.error('Error de base de datos:', dbError)
                console.warn('Permitiendo acceso temporal - la tabla usuarios no existe o hay un error de conexión')
                setUser(user)
                setLoading(false)
                return
            }

            if (!userData) {
                console.warn('Usuario no encontrado en la base de datos:', user.id)
                await supabase.auth.signOut()
                setAccessDenied(true)
                setLoading(false)
                return
            }

            setUser(user)
            setLoading(false)
        } catch (error) {
            console.error('Error en checkUserAccess:', error)
            setAccessDenied(true)
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    // Evitar errores de hidratación
    if (!mounted) {
        return null
    }

    if (accessDenied) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
                <div className="text-center max-w-md">
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Acceso Denegado
                        </h1>
                        <p className="text-gray-600 mb-6">
                            No tienes permisos para acceder a esta sección. 
                            Por favor, inicia sesión o contacta al administrador.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/"
                                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors inline-block"
                            >
                                Ir al inicio
                            </Link>
                            <Link
                                href="/login"
                                className="px-6 py-3 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 font-semibold rounded-lg transition-colors inline-block"
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header responsive */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-base sm:text-lg">H</span>
                        <span className="text-gray-900 font-bold text-base sm:text-lg tracking-wide hidden sm:inline">otel Adventur</span>
                        <span className="text-gray-900 font-bold text-base tracking-wide sm:hidden">Adventur</span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href="/" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:inline">
                            Volver al sitio
                        </Link>
                        <Link href="/" className="text-xs text-gray-600 hover:text-gray-900 transition-colors sm:hidden">
                            Inicio
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                    {/* Sidebar - Horizontal en móvil, vertical en desktop */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:sticky lg:top-24">
                            {/* Perfil - Oculto en móvil, visible en desktop */}
                            <div className="hidden lg:block mb-6 pb-6 border-b border-gray-200">
                                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 text-2xl font-bold mx-auto mb-3">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-center text-sm font-semibold text-gray-900 truncate px-2">
                                    {user?.email}
                                </p>
                            </div>

                            {/* Navegación - Horizontal en móvil, vertical en desktop */}
                            <nav className="flex lg:flex-col gap-1 sm:gap-2 lg:space-y-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                                {MENU_ITEMS.map((item) => {
                                    const isActive = pathname?.includes(item.href)
                                    const Icon = item.Icon
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 lg:flex-shrink ${
                                                isActive
                                                    ? 'bg-yellow-50 text-yellow-400'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="hidden sm:inline">{item.label}</span>
                                            <span className="sm:hidden">{item.label.replace('Mis ', '').replace('Mi ', '')}</span>
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

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        }>
            <CuentaLayoutContent>{children}</CuentaLayoutContent>
        </Suspense>
    )
}
