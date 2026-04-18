'use client'

import { LogOut, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { getAdminSection } from './navigation'

export function AdminHeader({
  adminName,
  onMenuOpen,
  onSignOut,
}: {
  adminName: string
  onMenuOpen: () => void
  onSignOut: () => void
}) {
  const pathname = usePathname()
  const section = getAdminSection(pathname)
  const currentDate = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="admin-header flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button type="button" className="admin-button-ghost text-white lg:hidden" onClick={onMenuOpen}>
          <Menu className="h-5 w-5" />
        </button>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">{currentDate}</p>
          <h2 className="text-xl font-semibold text-white">{section.label}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-2 text-right">
          <p className="text-sm font-semibold text-white">{adminName}</p>
          <p className="text-xs text-yellow-300">Administrador</p>
        </div>
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          onClick={onSignOut}
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
