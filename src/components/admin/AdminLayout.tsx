'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, Hotel, Calendar, Users, TrendingUp, 
  Settings, Home, LogOut, Menu, X, Images, Star
} from 'lucide-react'
import { Logo } from '@/components/web/Logo'
import type { AdminProfile } from '@/lib/auth/types'

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
}

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
  pathname: string
  onSignOut: () => Promise<void>
}

interface AdminHeaderProps {
  onSidebarToggle: () => void
  onMobileMenuToggle: () => void
  isMobileMenuOpen: boolean
  onProfileClick: () => void
  onSignOut: () => Promise<void>
  profile: AdminProfile | null
  loading: boolean
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/hoteles', label: 'Habitaciones', icon: Hotel },
  { href: '/admin/galeria', label: 'Galería', icon: Images },
  { href: '/admin/reservas', label: 'Reservas', icon: Calendar },
  { href: '/admin/resenas', label: 'Reseñas', icon: Star },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/reportes', label: 'Reportes', icon: TrendingUp },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export function AdminSidebar({ isOpen, onToggle, pathname, onSignOut }: AdminSidebarProps) {
  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-gradient-to-b from-admin-primary to-admin-primary-dark border-r border-admin-primary-dark transition-all duration-300 hidden lg:flex flex-col shadow-xl h-full`}>
      <div className="p-4 border-b border-admin-primary-dark/30 flex items-center justify-center flex-shrink-0 bg-admin-primary">
        <Link href="/" className="group transform hover:scale-105 transition-transform duration-200">
          {/* 💡 Limpieza: Usamos el componente Logo centralizado. 
            Si necesitas una versión mini, podrías pasarle una prop al componente Logo luego.
          */}
          <Logo className={isOpen ? "h-10" : "h-8 w-8"} variant="default" />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className={`text-xs font-bold text-admin-accent uppercase mb-4 tracking-wider ${!isOpen && 'text-center'}`}>
          {isOpen ? 'MENÚ PRINCIPAL' : '...'}
        </p>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-admin-accent text-admin-primary-dark font-semibold shadow-lg'
                  : 'text-white/80 hover:bg-admin-primary-hover hover:text-white'
              } ${!isOpen && 'justify-center'}`}
              title={!isOpen ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-admin-accent rounded-r-full shadow-lg" />
              )}
              <div className={`${isActive ? '' : 'group-hover:scale-110'} transition-transform duration-200`}>
                <Icon size={20} />
              </div>
              {isOpen && <span className="flex-1">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-admin-primary-dark/30 space-y-2 flex-shrink-0 bg-admin-primary">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/80 hover:bg-admin-primary-hover hover:text-white transition-all duration-200 group ${!isOpen && 'justify-center'}`}
          title={!isOpen ? 'Volver al sitio' : undefined}
        >
          <Home size={20} className="group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
          {isOpen && <span className="font-medium">Volver al sitio</span>}
        </Link>
        
        <button
          onClick={onSignOut}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group ${!isOpen && 'justify-center'}`}
          title={!isOpen ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
          {isOpen && <span className="font-medium">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}

export function AdminHeader({ 
  onSidebarToggle, 
  onMobileMenuToggle, 
  isMobileMenuOpen, 
  onProfileClick, 
  onSignOut,
  profile, 
  loading 
}: AdminHeaderProps) {
  const getInitials = (): string => {
    if (!profile?.nombre) return 'A'
    return profile.nombre.charAt(0).toUpperCase()
  }

  return (
    <header className="bg-admin-primary border-b border-admin-primary-dark p-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
      <button
        onClick={onSidebarToggle}
        className="hidden lg:block p-2 text-white/80 hover:text-white hover:bg-admin-primary-hover rounded-lg transition-all"
      >
        <Menu size={20} />
      </button>
      
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 text-white/80 hover:text-white transition-all"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="flex items-center gap-3 ml-auto">
        <button 
          onClick={onProfileClick}
          className="flex items-center gap-3 pl-3 border-l border-white/20 hover:bg-admin-primary-hover rounded-lg transition-all p-2"
          disabled={loading}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {loading ? 'Cargando...' : profile?.nombre || 'Admin'}
            </p>
            <p className="text-xs text-admin-accent capitalize">{profile?.rol || 'admin'}</p>
          </div>
          {profile?.foto_perfil ? (
            <img 
              src={profile.foto_perfil} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform ring-2 ring-admin-accent"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-admin-accent to-admin-accent-hover rounded-full flex items-center justify-center text-admin-primary-dark font-bold cursor-pointer hover:scale-110 transition-transform shadow-lg">
              {getInitials()}
            </div>
          )}
        </button>

        <button
          onClick={onSignOut}
          className="p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}