'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import { AdminSidebar, AdminHeader } from '@/components/admin/AdminLayout'
import { ProfileModal } from '@/components/admin/ProfileModal'
import { useAuth } from '@/hooks/useAuth'
import Swal from 'sweetalert2'

export const dynamic = 'force-dynamic'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { user, profile, loading, accessDenied, signOut } = useAuth()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        const handlePopState = async (event: PopStateEvent) => {
            event.preventDefault()

            const result = await Swal.fire({
                title: '¿Seguridad de sesión',
                text: '¿Deseas cerrar sesión para proteger tu cuenta?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Permanecer conectado',
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#3b82f6',
                customClass: {
                    confirmButton: 'px-4 py-2 rounded-lg font-medium',
                    cancelButton: 'px-4 py-2 rounded-lg font-medium',
                }
            })

            if (result.isConfirmed) {
                await signOut()
            } else {
                window.history.pushState(null, '', window.location.href)
            }
        }

        window.history.pushState(null, '', window.location.href)
        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [signOut])

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
                            No tienes permisos para acceder al panel de administración. 
                            Necesitas una cuenta con rol de administrador para acceder a esta sección.
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
                                Cambiar de cuenta
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-6">
                            Si crees que deberías tener acceso, contacta al administrador del sistema.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Verificando acceso...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex bg-gray-50 overflow-hidden">
            <AdminSidebar 
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                pathname={pathname}
            />

            <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
                <AdminHeader 
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    isMobileMenuOpen={isMobileMenuOpen}
                    onProfileClick={() => setIsProfileModalOpen(true)}
                    profile={profile}
                    loading={loading}
                />

                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-b border-gray-200">
                        <nav className="p-4 space-y-1">
                            {/* Mobile navigation items */}
                        </nav>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto min-w-0 bg-gray-50">
                    <div className="p-4 lg:p-6 min-w-0">
                        {children}
                    </div>
                </main>
            </div>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    )
}
