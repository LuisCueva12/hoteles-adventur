'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Hotel, Calendar, Users, TrendingUp, Settings, Home, LogOut, Menu, X, Camera, Images, Star } from 'lucide-react'
import { Modal } from '@/components/admin/Modal'
import { Logo } from '@/components/web/Logo'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { uploadProfilePhoto, validateProfilePhotoFile } from '@/utils/supabase/profilePhotos'
import Swal from 'sweetalert2'

export const dynamic = 'force-dynamic'

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { href: '/admin/hoteles', label: 'Habitaciones', icon: Hotel, badge: null },
    { href: '/admin/galeria', label: 'Galería', icon: Images, badge: null },
    { href: '/admin/reservas', label: 'Reservas', icon: Calendar, badge: null },
    { href: '/admin/resenas', label: 'Reseñas', icon: Star, badge: null },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users, badge: null },
    { href: '/admin/reportes', label: 'Reportes', icon: TrendingUp, badge: null },
    { href: '/admin/configuracion', label: 'Configuración', icon: Settings, badge: null },
]

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const [accessDenied, setAccessDenied] = useState(false)
    const [profileData, setProfileData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rol: 'Admin',
        foto: null as string | null
    })
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState(profileData)

    useEffect(() => {
        setMounted(true)
        checkAdminAccess()

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Solo mostrar confirmación, NO cerrar sesión automáticamente
            e.preventDefault()
        }

        const handlePopState = async (event: PopStateEvent) => {
            event.preventDefault()

            const result = await Swal.fire({
                title: '¿Quieres cerrar sesión?',
                text: 'Si vuelves atrás se cerrará tu sesión y tendrás que iniciar sesión de nuevo.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'No, quedarme aquí',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
            })

            if (result.isConfirmed) {
                await supabase.auth.signOut().catch(() => {})
                router.push('/login')
            } else {
                window.history.pushState(null, '', window.location.href)
            }
        }

        window.history.pushState(null, '', window.location.href)
        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('popstate', handlePopState)
            // NO cerrar sesión al desmontar — el usuario puede estar navegando entre páginas del admin
        }
    }, [])

    const checkAdminAccess = async () => {
        try {
            setLoading(true)

            // Intentar obtener sesión primero, luego el usuario
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                // No hay sesión — redirigir al login, no mostrar acceso denegado
                router.replace('/login?redirect=/admin')
                return
            }

            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                router.replace('/login?redirect=/admin')
                return
            }

            // Verificar rol en la tabla usuarios
            const { data: userData, error: dbError } = await supabase
                .from('usuarios')
                .select('rol, nombre, apellido, email, telefono, foto_perfil')
                .eq('id', user.id)
                .maybeSingle()

            if (dbError) {
                // Error de BD — permitir acceso si hay sesión válida
                console.warn('DB error, allowing access with session:', dbError.message)
                setUserId(user.id)
                const nombre = user.email?.split('@')[0] || 'Admin'
                setProfileData({ nombre, apellido: '', email: user.email || '', telefono: '', rol: 'Admin', foto: null })
                setEditForm({ nombre, apellido: '', email: user.email || '', telefono: '', rol: 'Admin', foto: null })
                setLoading(false)
                return
            }

            if (!userData) {
                // Usuario en auth pero no en tabla — insertarlo y dar acceso
                await supabase.from('usuarios').upsert({
                    id: user.id,
                    email: user.email,
                    nombre: user.email?.split('@')[0] || 'Admin',
                    apellido: '',
                    rol: 'turista'
                })
                setAccessDenied(true)
                setLoading(false)
                return
            }

            if (userData.rol !== 'admin_adventur') {
                setAccessDenied(true)
                setLoading(false)
                return
            }

            // Acceso concedido — cargar perfil
            setUserId(user.id)
            const profile = {
                nombre: userData.nombre || user.email?.split('@')[0] || '',
                apellido: userData.apellido || '',
                email: userData.email || user.email || '',
                telefono: userData.telefono || '',
                rol: 'Admin',
                foto: userData.foto_perfil || null
            }
            setProfileData(profile)
            setEditForm(profile)
            setLoading(false)
        } catch (error) {
            console.error('Error en checkAdminAccess:', error)
            router.replace('/login?redirect=/admin')
        }
    }


    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !userId) return

        const fileError = validateProfilePhotoFile(file)
        if (fileError) {
            await Swal.fire({
                icon: 'error',
                title: 'Archivo invalido',
                text: fileError,
                confirmButtonColor: '#3B82F6'
            })
            e.target.value = ''
            return
        }

        try {
            const { publicUrl } = await uploadProfilePhoto({
                supabase,
                file,
                ownerUserId: userId,
            })


            // Obtener URL pública
            setEditForm(prev => ({ ...prev, foto: publicUrl }))
        } catch (error) {
            console.error('Error:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? `No se pudo subir la imagen. ${error.message}` : 'Error al procesar la imagen',
                confirmButtonColor: '#3B82F6'
            })
        } finally {
            e.target.value = ''
        }
    }

    const handleSaveProfile = async () => {
        if (!userId) return

        try {
            setSaving(true)

            // Actualizar datos en Supabase
            const { error } = await supabase
                .from('usuarios')
                .update({
                    nombre: editForm.nombre,
                    apellido: editForm.apellido,
                    telefono: editForm.telefono,
                    foto_perfil: editForm.foto,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (error) {
                console.error('Error updating profile:', error)
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al actualizar el perfil',
                    confirmButtonColor: '#3B82F6'
                })
                return
            }

            setProfileData(editForm)
            setIsEditing(false)
            await Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Perfil actualizado correctamente',
                confirmButtonColor: '#3B82F6',
                timer: 2000,
                showConfirmButton: false
            })
        } catch (error) {
            console.error('Error:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar los cambios',
                confirmButtonColor: '#3B82F6'
            })
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleCancelEdit = () => {
        setEditForm(profileData)
        setIsEditing(false)
    }

    const getInitials = () => {
        if (!profileData.nombre) return '?'
        return profileData.nombre.charAt(0).toUpperCase()
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
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transition-all duration-300 hidden lg:flex flex-col shadow-xl h-full`}>
                {/* Header con Logo */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0 bg-white">
                    {isSidebarOpen ? (
                        <Link href="/" className="group transform hover:scale-105 transition-transform duration-200">
                            <Logo className="h-10" variant="default" />
                        </Link>
                    ) : (
                        <Link href="/" className="flex items-center justify-center group">
                            <svg viewBox="0 0 200 200" className="w-10 h-10 transform group-hover:rotate-12 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg">
                                <path 
                                    d="M 60 150 L 100 50 L 140 150 L 120 150 L 100 100 L 80 150 Z" 
                                    fill="#0A2540"
                                />
                                <g transform="translate(120, 40)">
                                    <rect x="0" y="0" width="30" height="50" fill="#0A2540" rx="2"/>
                                    <rect x="3" y="3" width="4" height="4" fill="#FDB913"/>
                                    <rect x="10" y="3" width="4" height="4" fill="#FDB913"/>
                                    <rect x="17" y="3" width="4" height="4" fill="#FDB913"/>
                                    <rect x="24" y="3" width="4" height="4" fill="#FDB913"/>
                                    <rect x="3" y="10" width="4" height="4" fill="#FDB913"/>
                                    <rect x="10" y="10" width="4" height="4" fill="#FDB913"/>
                                    <rect x="17" y="10" width="4" height="4" fill="#FDB913"/>
                                    <rect x="24" y="10" width="4" height="4" fill="#FDB913"/>
                                    <rect x="3" y="17" width="4" height="4" fill="#FDB913"/>
                                    <rect x="10" y="17" width="4" height="4" fill="#FDB913"/>
                                    <rect x="17" y="17" width="4" height="4" fill="#FDB913"/>
                                    <rect x="24" y="17" width="4" height="4" fill="#FDB913"/>
                                    <text x="15" y="-2" fontSize="6" fill="#FDB913" textAnchor="middle" fontWeight="bold">HOTEL</text>
                                </g>
                            </svg>
                        </Link>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className={`text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider ${!isSidebarOpen && 'text-center'}`}>
                        {isSidebarOpen ? 'MENÚ PRINCIPAL' : '•••'}
                    </p>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group relative ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                } ${!isSidebarOpen && 'justify-center'}`}
                                title={!isSidebarOpen ? item.label : undefined}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                )}
                                <div className={`${isActive ? '' : 'group-hover:scale-110'} transition-transform duration-200`}>
                                    <Icon size={20} />
                                </div>
                                {isSidebarOpen && (
                                    <span className="flex-1">{item.label}</span>
                                )}
                                {isSidebarOpen && item.badge && (
                                    <span className="px-2 py-0.5 bg-yellow-300 text-white text-xs font-bold rounded-full animate-pulse">
                                        {item.badge}
                                    </span>
                                )}
                                {!isSidebarOpen && item.badge && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0 bg-white">
                    <Link
                        href="/"
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-200 group ${!isSidebarOpen && 'justify-center'}`}
                        title={!isSidebarOpen ? 'Volver al sitio' : undefined}
                    >
                        <Home size={20} className="group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                        {isSidebarOpen && <span className="font-medium">Volver al sitio</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-yellow-400 transition-all duration-200 group w-full ${!isSidebarOpen && 'justify-center'}`}
                        title={!isSidebarOpen ? 'Cerrar sesión' : undefined}
                    >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                        {isSidebarOpen && <span className="font-medium">Cerrar sesión</span>}
                    </button>
                </div>
            </aside>

            <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
                <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                    >
                        <Menu size={20} />
                    </button>
                    
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-all"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="hidden md:block flex-1 max-w-xl mx-4">
                        <div className="relative">
                              <input
                                type="text"
                                placeholder="Buscar o escribir comando..."
                                className="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-all p-2"
                            disabled={loading}
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">
                                    {loading ? 'Cargando...' : profileData.nombre || 'Usuario'}
                                </p>
                                <p className="text-xs text-gray-500">{profileData.rol}</p>
                            </div>
                            {profileData.foto ? (
                                <Image 
                                    src={profileData.foto} 
                                    alt="Profile" 
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform">
                                    {loading ? '...' : getInitials()}
                                </div>
                            )}
                        </button>
                    </div>
                </header>

                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-b border-gray-200">
                        <nav className="p-4 space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto min-w-0 bg-gray-50">
                    <div className="p-4 lg:p-6 min-w-0">
                        {children}
                    </div>
                </main>
            </div>

            <Modal
                isOpen={isProfileModalOpen}
                onClose={() => {
                    setIsProfileModalOpen(false)
                    setIsEditing(false)
                    setEditForm(profileData)
                }}
                title="Mi Perfil"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
                        <div className="relative group">
                            {editForm.foto ? (
                                <Image 
                                    src={editForm.foto} 
                                    alt="Profile" 
                                    width={120}
                                    height={120}
                                    className="w-30 h-30 rounded-full object-cover border-4 border-blue-100"
                                />
                            ) : (
                                <div className="w-30 h-30 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-100">
                                    {getInitials()}
                                </div>
                            )}
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-all shadow-lg">
                                    <Camera size={20} className="text-white" />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        {!isEditing && (
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900">{profileData.nombre} {profileData.apellido}</h3>
                                <p className="text-sm text-gray-500">{profileData.rol}</p>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        value={editForm.nombre}
                                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                                    <input
                                        type="text"
                                        value={editForm.apellido}
                                        onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={editForm.telefono}
                                        onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar Cambios'
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Nombre Completo</p>
                                    <p className="text-sm font-semibold text-gray-900">{profileData.nombre} {profileData.apellido}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Email</p>
                                    <p className="text-sm font-semibold text-gray-900">{profileData.email}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Teléfono</p>
                                    <p className="text-sm font-semibold text-gray-900">{profileData.telefono}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Rol</p>
                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                        {profileData.rol}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold flex items-center gap-2"
                                >
                                    <Users size={18} />
                                    Editar Perfil
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}
