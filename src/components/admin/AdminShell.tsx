'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { LoaderCircle, ShieldAlert } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminHeader } from './AdminHeader'
import { AdminPanel } from './AdminPanel'
import { AdminSidebar } from './AdminSidebar'

export function AdminShell({ children }: { children: ReactNode }) {
  const { profile, loading, accessDenied, signOut } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center p-6">
        <AdminPanel className="flex max-w-md flex-col items-center gap-4 px-8 py-10 text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-slate-500" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-slate-950">Cargando panel administrativo</h1>
            <p className="text-sm text-slate-500">Estamos validando tu sesión y preparando el entorno.</p>
          </div>
        </AdminPanel>
      </div>
    )
  }

  if (accessDenied || !profile) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center p-6">
        <AdminPanel className="flex max-w-lg flex-col items-center gap-5 px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-950">Acceso restringido</h1>
            <p className="text-sm text-slate-500">
              Tu cuenta no tiene permisos administrativos o la sesión ya no es válida.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="admin-button-secondary">
              Volver al sitio
            </Link>
            <button type="button" className="admin-button-primary" onClick={signOut}>
              Ir al inicio de sesión
            </button>
          </div>
        </AdminPanel>
      </div>
    )
  }

  const adminName = [profile.nombre, profile.apellido].filter(Boolean).join(' ')

  return (
    <div className="admin-shell">
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-4 p-4 lg:p-6">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onSignOut={signOut} />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <AdminHeader
            adminName={adminName}
            onMenuOpen={() => setSidebarOpen(true)}
            onSignOut={signOut}
          />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
