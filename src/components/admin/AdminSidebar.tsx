'use client'

import Link from 'next/link'
import { Home, LogOut, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/web/Logo'
import { useOptionalSiteConfig } from '@/components/providers/ProveedorConfiguracionSitio'
import { adminNavigation } from './navigation'
import { cn } from './cn'

export function AdminSidebar({
  open,
  onClose,
  onSignOut,
}: {
  open: boolean
  onClose: () => void
  onSignOut: () => void
}) {
  const pathname = usePathname()
  const { config } = useOptionalSiteConfig()

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/55 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'admin-sidebar fixed inset-y-4 left-4 z-50 flex w-[296px] flex-col p-5 transition-transform duration-200 lg:static lg:inset-auto lg:z-auto lg:h-auto lg:min-h-[calc(100vh-2rem)] lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-4">
            <Logo className="h-12 justify-start" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-300">Menú principal</p>
              <p className="mt-2 text-sm text-slate-300">{config.identity.nombre}</p>
            </div>
          </div>
          <button type="button" className="admin-button-ghost text-white lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-2">
          {adminNavigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200',
                  active
                    ? 'bg-yellow-400 text-slate-950'
                    : 'text-slate-200 hover:bg-white/8 hover:text-white',
                )}
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 pt-5">
          <Link href="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8">
            <Home className="h-5 w-5" />
            <span>Volver al sitio</span>
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-white/8"
            onClick={onSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
