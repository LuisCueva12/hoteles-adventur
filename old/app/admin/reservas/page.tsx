'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, CalendarClock, CircleDollarSign, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/useNotificacion'
import { useReservas } from '@/hooks/useReservas'
import { dashboardService } from '@/services/dashboard.service'
import {
  AdminBadge,
  AdminDataTable,
  AdminDialog,
  AdminPageShell,
  AdminPanel,
  AdminReservaForm,
  AdminStatCard,
  type ReservaOption,
  type ReservaPayload,
} from '@/components/admin'
import { formatCurrency, formatDate } from '@/components/admin/formatters'

function getEstadoTone(estado: string) {
  const normalized = estado.toLowerCase()

  if (normalized.includes('confirm') || normalized.includes('check_in') || normalized.includes('complet')) {
    return 'success' as const
  }

  if (normalized.includes('pend')) {
    return 'warning' as const
  }

  if (normalized.includes('cancel')) {
    return 'danger' as const
  }

  return 'info' as const
}

export default function AdminReservasPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todas')
  const [usuarios, setUsuarios] = useState<ReservaOption[]>([])
  const [alojamientos, setAlojamientos] = useState<ReservaOption[]>([])
  const {
    reservas,
    loading,
    isRefreshing,
    isModalOpen,
    isEditModalOpen,
    selectedReserva,
    saving,
    loadReservas,
    refreshReservas,
    createReserva,
    updateReserva,
    deleteReserva,
    changeEstado,
    openCreateModal,
    openEditModal,
    closeModals,
  } = useReservas()
  const toast = useToast()

  useEffect(() => {
    loadReservas()

    const loadOptions = async () => {
      const [usuariosData, alojamientosData] = await Promise.all([
        dashboardService.getUsuarios(),
        dashboardService.getAlojamientos(),
      ])

      setUsuarios(
        (usuariosData || []).map((usuario: any) => ({
          id: usuario.id,
          label: `${usuario.nombre} ${usuario.apellido} · ${usuario.email}`,
        })),
      )
      setAlojamientos(
        (alojamientosData || []).map((alojamiento: any) => ({
          id: alojamiento.id,
          label: `${alojamiento.nombre} · ${alojamiento.tipo}`,
        })),
      )
    }

    loadOptions()
  }, [])

  const filteredReservas = useMemo(() => {
    const term = query.trim().toLowerCase()

    return reservas.filter((reserva) => {
      const matchesQuery =
        !term ||
        [
          reserva.codigo_reserva,
          reserva.usuarios?.nombre,
          reserva.usuarios?.apellido,
          reserva.usuarios?.email,
          reserva.alojamientos?.nombre,
          reserva.estado,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term)

      const matchesStatus = statusFilter === 'todas' || reserva.estado === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [query, reservas, statusFilter])

  const confirmadas = reservas.filter((reserva) =>
    ['confirmada', 'check_in', 'completada'].includes(reserva.estado),
  ).length
  const pendientes = reservas.filter((reserva) => reserva.estado === 'pendiente').length
  const ingresos = reservas.reduce((total, reserva) => total + Number(reserva.total || 0), 0)

  const handleCreate = async (payload: ReservaPayload) => {
    const result = await createReserva(payload)

    if (result.success) {
      toast.success('Reserva creada correctamente.')
      return
    }

    toast.error('No se pudo crear la reserva.')
  }

  const handleUpdate = async (payload: ReservaPayload) => {
    if (!selectedReserva) {
      return
    }

    const result = await updateReserva(selectedReserva.id, payload)

    if (result.success) {
      toast.success('Reserva actualizada correctamente.')
      return
    }

    toast.error('No se pudo actualizar la reserva.')
  }

  const handleDelete = async (id: string, codigo: string) => {
    const confirmed = window.confirm(`¿Deseas eliminar la reserva ${codigo}?`)

    if (!confirmed) {
      return
    }

    const result = await deleteReserva(id)

    if (result.success) {
      toast.success('Reserva eliminada correctamente.')
      return
    }

    toast.error('No se pudo eliminar la reserva.')
  }

  const handleStatusChange = async (reserva: (typeof reservas)[number], estado: string) => {
    const result = await changeEstado(reserva, estado)

    if (result.success) {
      toast.success(`Reserva actualizada a ${estado}.`)
      return
    }

    toast.error('No se pudo actualizar el estado de la reserva.')
  }

  const columns = [
    {
      key: 'codigo',
      header: 'Reserva',
      cell: (reserva: (typeof reservas)[number]) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{reserva.codigo_reserva}</p>
          <p className="text-sm text-slate-500">{formatDate(reserva.fecha_creacion)}</p>
        </div>
      ),
    },
    {
      key: 'huesped',
      header: 'Huésped',
      cell: (reserva: (typeof reservas)[number]) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-700">
            {[reserva.usuarios?.nombre, reserva.usuarios?.apellido].filter(Boolean).join(' ') || 'Sin usuario'}
          </p>
          <p className="text-sm text-slate-500">{reserva.usuarios?.email || 'Sin correo'}</p>
        </div>
      ),
    },
    {
      key: 'alojamiento',
      header: 'Alojamiento',
      cell: (reserva: (typeof reservas)[number]) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-700">{reserva.alojamientos?.nombre || 'Sin alojamiento'}</p>
          <p className="text-sm text-slate-500">{reserva.alojamientos?.tipo || 'Sin tipo'}</p>
        </div>
      ),
    },
    {
      key: 'fechas',
      header: 'Estadía',
      cell: (reserva: (typeof reservas)[number]) => (
        <div className="space-y-1 text-sm text-slate-600">
          <p>{formatDate(reserva.fecha_inicio)}</p>
          <p>{formatDate(reserva.fecha_fin)}</p>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (reserva: (typeof reservas)[number]) => (
        <div className="space-y-2">
          <AdminBadge tone={getEstadoTone(reserva.estado)}>{reserva.estado}</AdminBadge>
          <p className="text-xs text-slate-500">{formatCurrency(reserva.total)}</p>
        </div>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      cell: (reserva: (typeof reservas)[number]) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="admin-button-secondary px-3 py-2" onClick={() => openEditModal(reserva)}>
            Editar
          </button>
          {reserva.estado !== 'confirmada' ? (
            <button
              type="button"
              className="admin-button-secondary px-3 py-2"
              onClick={() => handleStatusChange(reserva, 'confirmada')}
            >
              Confirmar
            </button>
          ) : null}
          {reserva.estado !== 'cancelada' ? (
            <button
              type="button"
              className="admin-button-secondary px-3 py-2"
              onClick={() => handleStatusChange(reserva, 'cancelada')}
            >
              Cancelar
            </button>
          ) : null}
          <button
            type="button"
            className="admin-button-ghost px-3 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => handleDelete(reserva.id, reserva.codigo_reserva)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AdminPageShell
      title="Reservas"
      description="Control integral del flujo de reservas, estados y facturación asociada."
      actions={
        <>
          <button type="button" className="admin-button-secondary" onClick={refreshReservas}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button type="button" className="admin-button-primary" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Nueva reserva
          </button>
        </>
      }
    >
      <section className="admin-grid">
        <AdminStatCard title="Reservas totales" value={reservas.length} helper="Historial actual" icon={CalendarClock} tone="blue" />
        <AdminStatCard title="Confirmadas" value={confirmadas} helper="Activas o completadas" icon={CalendarCheck2} tone="green" />
        <AdminStatCard title="Pendientes" value={pendientes} helper="Por revisar" icon={CalendarClock} tone="purple" />
        <AdminStatCard title="Ingresos" value={formatCurrency(ingresos)} helper="Total acumulado" icon={CircleDollarSign} tone="amber" />
      </section>

      <AdminPanel className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Agenda de reservas</h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulta huéspedes, fechas, estado y facturación de cada reserva.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="admin-input w-full min-w-[240px]"
                placeholder="Buscar por código, huésped o alojamiento"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <select
                className="admin-input w-full sm:w-52"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="todas">Todas</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="check_in">Check-in</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          data={filteredReservas}
          getRowId={(reserva) => reserva.id}
          emptyTitle={loading ? 'Cargando reservas' : 'No hay reservas para mostrar'}
          emptyDescription={
            loading ? 'Estamos consultando el calendario de reservas.' : 'Prueba otro filtro o crea una nueva reserva.'
          }
        />
      </AdminPanel>

      <AdminDialog
        open={isModalOpen}
        title="Crear reserva"
        description="Registra una nueva reserva asociándola a un huésped y a una unidad."
        onClose={closeModals}
      >
        <AdminReservaForm
          mode="create"
          usuarios={usuarios}
          alojamientos={alojamientos}
          saving={saving}
          onCancel={closeModals}
          onSubmit={handleCreate}
        />
      </AdminDialog>

      <AdminDialog
        open={isEditModalOpen}
        title="Editar reserva"
        description="Actualiza fechas, estado o datos operativos de la reserva."
        onClose={closeModals}
      >
        <AdminReservaForm
          mode="edit"
          initialValue={
            selectedReserva
              ? {
                  codigo_reserva: selectedReserva.codigo_reserva,
                  fecha_inicio: selectedReserva.fecha_inicio?.slice(0, 10),
                  fecha_fin: selectedReserva.fecha_fin?.slice(0, 10),
                  personas: selectedReserva.personas,
                  total: Number(selectedReserva.total || 0),
                  estado: selectedReserva.estado,
                  usuario_id: selectedReserva.usuario_id,
                  alojamiento_id: selectedReserva.alojamiento_id,
                }
              : undefined
          }
          usuarios={usuarios}
          alojamientos={alojamientos}
          saving={saving}
          onCancel={closeModals}
          onSubmit={handleUpdate}
        />
      </AdminDialog>
    </AdminPageShell>
  )
}
