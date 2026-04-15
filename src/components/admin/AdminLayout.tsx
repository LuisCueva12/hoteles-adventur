'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Hotel, Calendar, Users, TrendingUp, 
  Settings, Home, LogOut, Menu, X, Images, Star
} from 'lucide-react'
import { Logo } from '@/components/web/Logo'

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  badge: string | null
}

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
  pathname: string
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { href: '/admin/hoteles', label: 'Habitaciones', icon: Hotel, badge: null },
  { href: '/admin/galeria', label: 'Galería', icon: Images, badge: null },
  { href: '/admin/reservas', label: 'Reservas', icon: Calendar, badge: null },
  { href: '/admin/resenas', label: 'Reseñas', icon: Star, badge: null },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, badge: null },
  { href: '/admin/reportes', label: 'Reportes', icon: TrendingUp, badge: null },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings, badge: null },
]

export function AdminSidebar({ isOpen, onToggle, pathname }: AdminSidebarProps) {
  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transition-all duration-300 hidden lg:flex flex-col shadow-xl h-full`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0 bg-white">
        {isOpen ? (
          <Link href="/" className="group transform hover:scale-105 transition-transform duration-200">
            <Logo className="h-10" variant="default" />
          </Link>
        ) : (
          <Link href="/" className="flex items-center justify-center group">
            <svg viewBox="0 0 200 200" className="w-10 h-10 transform group-hover:rotate-12 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg">
              <path d="M 60 150 L 100 50 L 140 150 L 120 150 L 100 100 L 80 150 Z" fill="#0A2540"/>
              <g transform="translate(120, 40)">
                <rect x="0" y="0" width="30" height="50" fill="#0A2540" rx="2"/>
                <rect x="3" y="3" width="4" height="4" fill="#FDB913"/>
                <rect x="10" y="3" width="4" height="4" fill="#FDB913"/>
                <rect x="17" y="3" width="4" height="4" fill="#FDB913"/>
                <rect x="24" y="3" width="4" height="4" fill="#FDB913"/>
                <text x="15" y="-2" fontSize="6" fill="#FDB913" textAnchor="middle" fontWeight="bold">HOTEL</text>
              </g>
            </svg>
          </Link>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className={`text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider ${!isOpen && 'text-center'}`}>
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
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${!isOpen && 'justify-center'}`}
              title={!isOpen ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}
              <div className={`${isActive ? '' : 'group-hover:scale-110'} transition-transform duration-200`}>
                <Icon size={20} />
              </div>
              {isOpen && <span className="flex-1">{item.label}</span>}
              {isOpen && item.badge && (
                <span className="px-2 py-0.5 bg-yellow-300 text-white text-xs font-bold rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0 bg-white">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-200 group ${!isOpen && 'justify-center'}`}
          title={!isOpen ? 'Volver al sitio' : undefined}
        >
          <Home size={20} className="group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
          {isOpen && <span className="font-medium">Volver al sitio</span>}
        </Link>
      </div>
    </aside>
  )
}

interface AdminHeaderProps {
  onSidebarToggle: () => void
  onMobileMenuToggle: () => void
  isMobileMenuOpen: boolean
  onProfileClick: () => void
  profile: any
  loading: boolean
}

export function AdminHeader({ 
  onSidebarToggle, 
  onMobileMenuToggle, 
  isMobileMenuOpen, 
  onProfileClick, 
  profile, 
  loading 
}: AdminHeaderProps) {
  const getInitials = (): string => {
    if (!profile?.nombre) return '?'
    return profile.nombre.charAt(0).toUpperCase()
  }

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <button
        onClick={onSidebarToggle}
        className="hidden lg:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
      >
        <Menu size={20} />
      </button>
      
      <button
        onClick={onMobileMenuToggle}
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
            K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onProfileClick}
          className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-all p-2"
          disabled={loading}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {loading ? 'Cargando...' : profile?.nombre || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">{profile?.rol}</p>
          </div>
          {profile?.foto ? (
            <img 
              src={profile.foto} 
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
  )
}
