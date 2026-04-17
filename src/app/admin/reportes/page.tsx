'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Building2, CircleDollarSign, Percent, RefreshCw, Users } from 'lucide-react'
import { dashboardService, type DashboardStats } from '@/services/dashboard.service'
import { AdminPageShell, AdminPanel, AdminStatCard } from '@/components/admin'
import { formatCurrency, formatPercent } from '@/components/admin/formatters'

type ReportState = {
  loading: boolean
  error: string | null
  stats: DashboardStats | null
  reservas: any[]
  usuarios: any[]
  alojamientos: any[]
}

function getPercentage(value: number, total: number) {
  if (!total) {
    return 0
  }

  return Math.round((value / total) * 100)
}

export default function AdminReportesPage() {
  const [state, setState] = useState<ReportState>({
    loading: true,
    error: null,
    stats: null,
    reservas: [],
    usuarios: [],
    alojamientos: [],
  })

  const loadReports = async () => {
    try {
      setState((current) => ({ ...current, loading: true, error: null }))

      const [stats, reservas, usuarios, alojamientos] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getReservas(),
        dashboardService.getUsuarios(),
        dashboardService.getAlojamientos(),
      ])

      setState({
        loading: false,
        error: null,
        stats,
        reservas: reservas || [],
        usuarios: usuarios || [],
        alojamientos: alojamientos || [],
      })
    } catch (error) {
      console.error(error)
      setState((current) => ({
        ...current,
        loading: false,
        error: 'No se pudo cargar la información para reportes.',
      }))
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const statusRows = useMemo(() => {
    const map = state.reservas.reduce<Record<string, number>>((accumulator, reserva) => {
      const key = reserva.estado || 'sin_estado'
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(map).sort((left, right) => right[1] - left[1])
  }, [state.reservas])

  const roleRows = useMemo(() => {
    const map = state.usuarios.reduce<Record<string, number>>((accumulator, usuario) => {
      const key = usuario.rol || 'sin_rol'
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(map).sort((left, right) => right[1] - left[1])
  }, [state.usuarios])

  const locationRows = useMemo(() => {
    const map = state.alojamientos.reduce<Record<string, number>>((accumulator, alojamiento) => {
      const key = alojamiento.distrito || alojamiento.provincia || 'Sin ubicación'
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(map).sort((left, right) => right[1] - left[1]).slice(0, 5)
  }, [state.alojamientos])

  const activeUnits = state.alojamientos.filter((alojamiento) => alojamiento.activo).length

  return (
    <AdminPageShell
      title="Reportes"
      description="Tablero ejecutivo con métricas agregadas de ocupación, ventas, usuarios y operación."
      actions={
        <button type="button" className="admin-button-secondary" onClick={loadReports}>
          <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
          {state.loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      }
    >
      {state.error ? (
        <AdminPanel className="border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-600">
          {state.error}
        </AdminPanel>
      ) : null}

      <section className="admin-grid">
        <AdminStatCard
          title="Ocupación"
          value={formatPercent(state.stats?.ocupacionActual)}
          helper="Promedio operativo"
          icon={Percent}
          tone="blue"
        />
        <AdminStatCard
          title="Ingresos del mes"
          value={formatCurrency(state.stats?.ingresosMes)}
          helper="Facturación mensual"
          icon={CircleDollarSign}
          tone="amber"
        />
        <AdminStatCard
          title="Usuarios"
          value={state.usuarios.length}
          helper="Base consolidada"
          icon={Users}
          tone="green"
        />
        <AdminStatCard
          title="Unidades activas"
          value={activeUnits}
          helper="Oferta disponible"
          icon={Building2}
          tone="purple"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <AdminPanel className="p-6 xl:col-span-1">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Reservas por estado</h2>
              <p className="mt-1 text-sm text-slate-500">Distribución del pipeline operativo.</p>
            </div>
            <div className="space-y-4">
              {statusRows.length === 0 ? (
                <p className="text-sm text-slate-500">No hay datos para construir este reporte.</p>
              ) : (
                statusRows.map(([label, value]) => (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize text-slate-700">{label}</span>
                      <span className="text-slate-500">{value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{ width: `${getPercentage(value, state.reservas.length)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </AdminPanel>

        <AdminPanel className="p-6 xl:col-span-1">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Usuarios por rol</h2>
              <p className="mt-1 text-sm text-slate-500">Composición de la base de usuarios.</p>
            </div>
            <div className="space-y-4">
              {roleRows.length === 0 ? (
                <p className="text-sm text-slate-500">No hay usuarios para reportar.</p>
              ) : (
                roleRows.map(([label, value]) => (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize text-slate-700">{label}</span>
                      <span className="text-slate-500">{value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${getPercentage(value, state.usuarios.length)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </AdminPanel>

        <AdminPanel className="p-6 xl:col-span-1">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Zonas más activas</h2>
              <p className="mt-1 text-sm text-slate-500">Concentración actual de inventario.</p>
            </div>
            <div className="space-y-4">
              {locationRows.length === 0 ? (
                <p className="text-sm text-slate-500">No hay ubicaciones para mostrar.</p>
              ) : (
                locationRows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-800">{label}</p>
                      <p className="text-sm text-slate-500">Unidades registradas</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                      {value}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </AdminPanel>
      </section>

      <AdminPanel className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Lectura ejecutiva</h2>
            <p className="mt-1 text-sm text-slate-500">
              Resumen rápido de disponibilidad, facturación y movimiento del sistema.
            </p>
          </div>
          <div className="admin-pill">
            <BarChart3 className="mr-2 h-4 w-4" />
            Vista consolidada
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 px-5 py-5">
            <p className="text-sm font-medium text-slate-500">Reservas activas</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{state.stats?.reservasActivas || 0}</p>
            <p className="mt-1 text-sm text-slate-500">Reservas actualmente en curso.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-5">
            <p className="text-sm font-medium text-slate-500">Check-ins del día</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{state.stats?.checkinsHoy || 0}</p>
            <p className="mt-1 text-sm text-slate-500">Llegadas previstas para hoy.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-5">
            <p className="text-sm font-medium text-slate-500">Pendientes</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{state.stats?.pendientes || 0}</p>
            <p className="mt-1 text-sm text-slate-500">Procesos aún por resolver.</p>
          </div>
        </div>
      </AdminPanel>
    </AdminPageShell>
  )
}
