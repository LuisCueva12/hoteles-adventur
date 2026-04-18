'use client'

import { useEffect, useMemo, useState } from 'react'
import { BedDouble, CheckCircle2, Plus, RefreshCw, Trash2, Wallet } from 'lucide-react'
import { useToast } from '@/hooks/useNotificacion'
import { useAlojamientos } from '@/hooks/useAlojamientos'
import {
  AdminAlojamientoForm,
  AdminBadge,
  AdminDataTable,
  AdminDialog,
  AdminPageShell,
  AdminPanel,
  AdminStatCard,
} from '@/components/admin'
import { formatCurrency } from '@/components/admin/formatters'

export default function AdminHotelesPage() {
  const [query, setQuery] = useState('')
  const {
    alojamientos,
    loading,
    isRefreshing,
    isModalOpen,
    isEditModalOpen,
    selectedAlojamiento,
    saving,
    loadAlojamientos,
    refreshAlojamientos,
    createAlojamiento,
    updateAlojamiento,
    deleteAlojamiento,
    toggleActivo,
    openCreateModal,
    openEditModal,
    closeModals,
  } = useAlojamientos()
  const toast = useToast()

  useEffect(() => {
    loadAlojamientos()
  }, [])

  const filteredAlojamientos = useMemo(() => {
    const term = query.trim().toLowerCase()

    if (!term) {
      return alojamientos
    }

    return alojamientos.filter((alojamiento) =>
      [
        alojamiento.nombre,
        alojamiento.categoria,
        alojamiento.tipo,
        alojamiento.departamento,
        alojamiento.provincia,
        alojamiento.distrito,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [alojamientos, query])

  const activos = alojamientos.filter((alojamiento) => alojamiento.activo).length
  const capacidadTotal = alojamientos.reduce(
    (total, alojamiento) => total + Number(alojamiento.capacidad_maxima || 0),
    0,
  )
  const promedio = alojamientos.length
    ? alojamientos.reduce((total, alojamiento) => total + Number(alojamiento.precio_base || 0), 0) /
      alojamientos.length
    : 0

  const handleCreate = async (payload: Parameters<typeof createAlojamiento>[0]) => {
    const result = await createAlojamiento(payload)

    if (result.success) {
      toast.success('Alojamiento creado correctamente.')
      return
    }

    toast.error('No se pudo crear el alojamiento.')
  }

  const handleUpdate = async (payload: Parameters<typeof updateAlojamiento>[1]) => {
    if (!selectedAlojamiento) {
      return
    }

    const result = await updateAlojamiento(selectedAlojamiento.id, payload)

    if (result.success) {
      toast.success('Alojamiento actualizado correctamente.')
      return
    }

    toast.error('No se pudo actualizar el alojamiento.')
  }

  const handleDelete = async (id: string, nombre: string) => {
    const confirmed = window.confirm(`¿Deseas eliminar ${nombre}?`)

    if (!confirmed) {
      return
    }

    const result = await deleteAlojamiento(id)

    if (result.success) {
      toast.success('Alojamiento eliminado correctamente.')
      return
    }

    toast.error('No se pudo eliminar el alojamiento.')
  }

  const handleToggle = async (alojamiento: (typeof alojamientos)[number]) => {
    const result = await toggleActivo(alojamiento)

    if (result.success) {
      toast.success(
        alojamiento.activo ? 'Alojamiento marcado como inactivo.' : 'Alojamiento activado correctamente.',
      )
      return
    }

    toast.error('No se pudo actualizar el estado del alojamiento.')
  }

  const columns = [
    {
      key: 'alojamiento',
      header: 'Alojamiento',
      cell: (alojamiento: (typeof alojamientos)[number]) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{alojamiento.nombre}</p>
          <p className="text-sm text-slate-500">{alojamiento.descripcion || 'Sin descripción'}</p>
        </div>
      ),
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
      cell: (alojamiento: (typeof alojamientos)[number]) => (
        <div className="space-y-1 text-sm text-slate-600">
          <p>{alojamiento.direccion || 'Sin dirección'}</p>
          <p>
            {[alojamiento.distrito, alojamiento.provincia, alojamiento.departamento]
              .filter(Boolean)
              .join(', ') || 'Sin ubicación'}
          </p>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      cell: (alojamiento: (typeof alojamientos)[number]) => (
        <div className="space-y-2">
          <AdminBadge tone="info">{alojamiento.categoria}</AdminBadge>
          <p className="text-sm text-slate-500">{alojamiento.tipo}</p>
        </div>
      ),
    },
    {
      key: 'capacidad',
      header: 'Capacidad',
      cell: (alojamiento: (typeof alojamientos)[number]) => (
        <div className="space-y-1 text-sm text-slate-600">
          <p>{alojamiento.capacidad_maxima} personas</p>
          <p>{formatCurrency(alojamiento.precio_base)}</p>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (alojamiento: (typeof alojamientos)[number]) => (
        <AdminBadge tone={alojamiento.activo ? 'success' : 'warning'}>
          {alojamiento.activo ? 'Activo' : 'Inactivo'}
        </AdminBadge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      cell: (alojamiento: (typeof alojamientos)[number]) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="admin-button-secondary px-3 py-2" onClick={() => openEditModal(alojamiento)}>
            Editar
          </button>
          <button
            type="button"
            className="admin-button-secondary px-3 py-2"
            onClick={() => handleToggle(alojamiento)}
          >
            {alojamiento.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button
            type="button"
            className="admin-button-ghost px-3 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => handleDelete(alojamiento.id, alojamiento.nombre)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AdminPageShell
      title="Habitaciones y alojamientos"
      description="Inventario unificado de habitaciones, suites y unidades de hospedaje."
      actions={
        <>
          <button type="button" className="admin-button-secondary" onClick={refreshAlojamientos}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button type="button" className="admin-button-primary" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Nuevo alojamiento
          </button>
        </>
      }
    >
      <section className="admin-grid">
        <AdminStatCard title="Unidades" value={alojamientos.length} helper="Inventario total" icon={BedDouble} tone="blue" />
        <AdminStatCard title="Activos" value={activos} helper="Disponibles para venta" icon={CheckCircle2} tone="green" />
        <AdminStatCard title="Capacidad" value={capacidadTotal} helper="Huéspedes máximos" icon={BedDouble} tone="purple" />
        <AdminStatCard title="Tarifa promedio" value={formatCurrency(promedio)} helper="Precio base" icon={Wallet} tone="amber" />
      </section>

      <AdminPanel className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Inventario</h2>
            <p className="mt-1 text-sm text-slate-500">
              Revisa ubicación, capacidad, tarifa y estado de cada unidad.
            </p>
          </div>
          <input
            className="admin-input w-full max-w-sm"
            placeholder="Buscar por nombre, categoría o ubicación"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <AdminDataTable
          columns={columns}
          data={filteredAlojamientos}
          getRowId={(alojamiento) => alojamiento.id}
          emptyTitle={loading ? 'Cargando alojamientos' : 'No hay alojamientos registrados'}
          emptyDescription={
            loading ? 'Estamos recuperando el inventario.' : 'Crea la primera unidad para comenzar a gestionarla.'
          }
        />
      </AdminPanel>

      <AdminDialog
        open={isModalOpen}
        title="Crear alojamiento"
        description="Define la información principal del nuevo alojamiento."
        onClose={closeModals}
      >
        <AdminAlojamientoForm mode="create" saving={saving} onCancel={closeModals} onSubmit={handleCreate} />
      </AdminDialog>

      <AdminDialog
        open={isEditModalOpen}
        title="Editar alojamiento"
        description="Actualiza la ficha comercial del alojamiento."
        onClose={closeModals}
      >
        <AdminAlojamientoForm
          mode="edit"
          initialValue={selectedAlojamiento}
          saving={saving}
          onCancel={closeModals}
          onSubmit={handleUpdate}
        />
      </AdminDialog>
    </AdminPageShell>
  )
}
