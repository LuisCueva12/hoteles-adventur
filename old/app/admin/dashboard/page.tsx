'use client'

import {
  Activity,
  BedDouble,
  CalendarDays,
  CircleDollarSign,
  RefreshCw,
  UserRound,
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import type { ActivityLog } from '@/services/dashboard.service'
import {
  AdminBadge,
  AdminDataTable,
  AdminPageShell,
  AdminPanel,
  AdminStatCard,
} from '@/components/admin'
import { formatCurrency, formatPercent } from '@/components/admin/formatters'

function getActivityTone(status: string) {
  const normalized = status.toLowerCase()

  if (normalized.includes('confirm')) {
    return 'success' as const
  }

  if (normalized.includes('pend')) {
    return 'warning' as const
  }

  if (normalized.includes('cancel') || normalized.includes('error')) {
    return 'danger' as const
  }

  return 'info' as const
}

export default function AdminDashboardPage() {
  const { stats, recentActivity, loading, error, refreshData } = useDashboard()

  const dashboardStats = stats ?? {
    totalHabitaciones: 0,
    reservasActivas: 0,
    usuariosRegistrados: 0,
    ingresosMes: 0,
    ocupacionActual: 0,
    checkinsHoy: 0,
    checkoutsHoy: 0,
    pendientes: 0,
  }

  const columns = [
    {
      key: 'type',
      header: 'Tipo',
      cell: (item: ActivityLog) => (
        <span className="text-sm font-semibold capitalize text-slate-700">{item.type}</span>
      ),
    },
    {
      key: 'user',
      header: 'Usuario',
      cell: (item: ActivityLog) => <span className="text-sm text-slate-600">{item.user}</span>,
    },
    {
      key: 'action',
      header: 'Acción',
      cell: (item: ActivityLog) => <span className="text-sm text-slate-600">{item.action}</span>,
    },
    {
      key: 'time',
      header: 'Tiempo',
      cell: (item: ActivityLog) => <span className="text-sm text-slate-500">{item.time}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (item: ActivityLog) => (
        <AdminBadge tone={getActivityTone(item.status)}>{item.status}</AdminBadge>
      ),
    },
  ]

  return (
    <AdminPageShell
      title="Dashboard"
      description="Resumen general del sistema y actividad reciente del panel administrativo."
      actions={
        <button type="button" className="admin-button-secondary" onClick={refreshData}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      }
    >
      {error ? (
        <AdminPanel className="border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-600">
          {error}
        </AdminPanel>
      ) : null}

      <section className="admin-grid">
        <AdminStatCard
          title="Total habitaciones"
          value={dashboardStats.totalHabitaciones}
          helper="Inventario operativo"
          icon={BedDouble}
          tone="blue"
        />
        <AdminStatCard
          title="Reservas activas"
          value={dashboardStats.reservasActivas}
          helper="Reservas en curso"
          icon={CalendarDays}
          tone="green"
        />
        <AdminStatCard
          title="Usuarios registrados"
          value={dashboardStats.usuariosRegistrados}
          helper="Cuentas creadas"
          icon={UserRound}
          tone="purple"
        />
        <AdminStatCard
          title="Ingresos del mes"
          value={formatCurrency(dashboardStats.ingresosMes)}
          helper="Facturación mensual"
          icon={CircleDollarSign}
          tone="amber"
        />
      </section>

      <section className="admin-section-grid">
        <AdminPanel className="overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-2xl font-semibold text-slate-950">Actividad reciente</h2>
            <p className="mt-1 text-sm text-slate-500">
              Últimos movimientos registrados desde reservas, usuarios y operaciones del panel.
            </p>
          </div>
          <AdminDataTable
            columns={columns}
            data={recentActivity}
            emptyTitle="Sin actividad reciente"
            emptyDescription="Cuando existan acciones recientes del sistema aparecerán aquí."
          />
        </AdminPanel>

        <AdminPanel className="p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Estadísticas rápidas</h2>
              <p className="mt-1 text-sm text-slate-500">
                Indicadores operativos para el seguimiento diario del hotel.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-3xl bg-blue-50 px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Check-ins hoy</p>
                  <p className="text-2xl font-semibold text-slate-950">{dashboardStats.checkinsHoy}</p>
                </div>
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-emerald-50 px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Check-outs hoy</p>
                  <p className="text-2xl font-semibold text-slate-950">{dashboardStats.checkoutsHoy}</p>
                </div>
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-amber-50 px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Pendientes</p>
                  <p className="text-2xl font-semibold text-slate-950">{dashboardStats.pendientes}</p>
                </div>
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Ocupación actual</span>
                <span>{formatPercent(dashboardStats.ocupacionActual)}</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: `${Math.min(Math.max(dashboardStats.ocupacionActual, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </AdminPanel>
      </section>
    </AdminPageShell>
  )
}
