'use client'

import { useState } from 'react'
import { useAlojamientos, type AlojamientoForm } from '@/hooks/useAlojamientos'
import { DataTableEnhanced } from '@/components/admin/DataTableEnhanced'
import { AlojamientoFormComponent } from '@/components/admin/AlojamientoForm'
import { Modal } from '@/components/admin/Modal'
import { AlertService } from '@/lib/ui/alert.service'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react'

export default function HotelesAdminPage() {
  const {
    alojamientos,
    loading,
    isRefreshing,
    isModalOpen,
    isEditModalOpen,
    selectedAlojamiento,
    saving,
    createAlojamiento,
    updateAlojamiento,
    deleteAlojamiento,
    toggleActivo,
    openCreateModal,
    openEditModal,
    closeModals,
    refreshAlojamientos
  } = useAlojamientos()

  const handleCreate = async (data: AlojamientoForm) => {
    const result = await createAlojamiento(data)
    if (result.success) {
      await AlertService.success('¡Creado!', 'Alojamiento creado correctamente')
    } else {
      await AlertService.error('Error', 'No se pudo crear el alojamiento')
    }
  }

  const handleUpdate = async (data: AlojamientoForm) => {
    if (!selectedAlojamiento) return
    
    const result = await updateAlojamiento(selectedAlojamiento.id, data)
    if (result.success) {
      await AlertService.success('¡Actualizado!', 'Alojamiento actualizado correctamente')
    } else {
      await AlertService.error('Error', 'No se pudo actualizar el alojamiento')
    }
  }

  const handleDelete = async (alojamiento: any) => {
    const confirmed = await AlertService.confirmDanger({
      title: '¿Estás seguro?',
      text: `Eliminarás el alojamiento "${alojamiento.nombre}"`,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (confirmed) {
      const result = await deleteAlojamiento(alojamiento.id)
      if (result.success) {
        await AlertService.success('¡Eliminado!', 'Alojamiento eliminado correctamente')
      }
    }
  }

  const handleToggleActivo = async (alojamiento: any) => {
    const result = await toggleActivo(alojamiento)
    if (result.success) {
      await AlertService.success(
        'Actualizado',
        `Alojamiento ${alojamiento.activo ? 'desactivado' : 'activado'} correctamente`,
        1500
      )
    }
  }

  const columns = [
    {
      key: 'nombre' as const,
      label: 'Nombre',
      sortable: true
    },
    {
      key: 'categoria' as const,
      label: 'Categoría',
      sortable: true
    },
    {
      key: 'tipo' as const,
      label: 'Tipo',
      sortable: true
    },
    {
      key: 'precio_base' as const,
      label: 'Precio',
      render: (value: number) => `S/. ${value.toLocaleString()}`,
      sortable: true
    },
    {
      key: 'capacidad_maxima' as const,
      label: 'Capacidad',
      sortable: true
    },
    {
      key: 'activo' as const,
      label: 'Estado',
      render: (_value: boolean, item: any) => (
        <button
          onClick={() => handleToggleActivo(item)}
          className={`p-1 rounded-lg transition-colors ${
            item.activo ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
          }`}
          title={item.activo ? 'Desactivar' : 'Activar'}
        >
          {item.activo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
        </button>
      )
    },
    {
      key: 'actions' as const,
      label: 'Acciones',
      render: (_value: any, item: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alojamientos</h1>
          <p className="text-gray-600">Gestiona todos los alojamientos del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshAlojamientos}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover shadow-lg transition-all"
          >
            <Plus size={20} />
            Nuevo Alojamiento
          </button>
        </div>
      </div>

      <DataTableEnhanced
        data={alojamientos}
        columns={columns}
        loading={loading}
        searchable={true}
        onRefresh={refreshAlojamientos}
      />

      <Modal isOpen={isModalOpen} onClose={closeModals} title="Nuevo Alojamiento">
        <AlojamientoFormComponent
          onSubmit={handleCreate}
          onCancel={closeModals}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Editar Alojamiento">
        {selectedAlojamiento && (
          <AlojamientoFormComponent
            initialValues={{
              nombre: selectedAlojamiento.nombre,
              descripcion: selectedAlojamiento.descripcion || '',
              direccion: selectedAlojamiento.direccion || '',
              departamento: selectedAlojamiento.departamento || '',
              provincia: selectedAlojamiento.provincia || '',
              distrito: selectedAlojamiento.distrito || '',
              categoria: selectedAlojamiento.categoria,
              tipo: selectedAlojamiento.tipo,
              precio_base: selectedAlojamiento.precio_base,
              capacidad_maxima: selectedAlojamiento.capacidad_maxima,
              servicios_incluidos: selectedAlojamiento.servicios_incluidos || [],
              activo: selectedAlojamiento.activo
            }}
            onSubmit={handleUpdate}
            onCancel={closeModals}
            loading={saving}
          />
        )}
      </Modal>
    </div>
  )
}
