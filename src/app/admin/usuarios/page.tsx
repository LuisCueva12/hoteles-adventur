'use client'

import { useUsuarios, type UsuarioForm } from '@/hooks/useUsuarios'
import { DataTableEnhanced } from '@/components/admin/DataTableEnhanced'
import { UsuarioFormComponent } from '@/components/admin/UsuarioForm'
import { Modal } from '@/components/admin/Modal'
import { Plus, Edit, Trash2, Shield, ShieldCheck, RefreshCw, UserPlus, Mail, Phone } from 'lucide-react'
import Swal from 'sweetalert2'

export default function UsuariosAdminPage() {
  const {
    usuarios,
    loading,
    isRefreshing,
    isModalOpen,
    isEditModalOpen,
    selectedUsuario,
    saving,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    toggleVerificado,
    openCreateModal,
    openEditModal,
    closeModals,
    refreshUsuarios
  } = useUsuarios()

  const handleCreate = async (data: UsuarioForm) => {
    const result = await createUsuario(data)
    if (!result.success) {
      throw new Error('Error al crear usuario')
    }
  }

  const handleUpdate = async (data: UsuarioForm) => {
    if (!selectedUsuario) return
    
    const result = await updateUsuario(selectedUsuario.id, data)
    if (!result.success) {
      throw new Error('Error al actualizar usuario')
    }
  }

  const handleDelete = async (usuario: any) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás el usuario "${usuario.nombre} ${usuario.apellido}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      const deleteResult = await deleteUsuario(usuario.id)
      if (deleteResult.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'Usuario eliminado correctamente',
          timer: 2000,
          showConfirmButton: false
        })
      }
    }
  }

  const handleToggleVerificado = async (usuario: any) => {
    const result = await toggleVerificado(usuario)
    if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: `Usuario ${usuario.verificado ? 'desverificado' : 'verificado'} correctamente`,
        timer: 1500,
        showConfirmButton: false
      })
    }
  }

  const formatRol = (rol: string) => {
    switch (rol) {
      case 'Admin': return 'Administrador'
      case 'propietario': return 'Propietario'
      case 'turista': return 'Turista'
      default: return rol
    }
  }

  const columns = [
    {
      key: 'nombre' as const,
      label: 'Nombre',
      render: (value: string, item: any) => `${item.nombre} ${item.apellido}`,
      sortable: true
    },
    {
      key: 'email' as const,
      label: 'Email',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-gray-400" />
          <span>{value}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'telefono' as const,
      label: 'Teléfono',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'rol' as const,
      label: 'Rol',
      render: (value: string) => formatRol(value),
      sortable: true
    },
    {
      key: 'verificado' as const,
      label: 'Verificado',
      render: (value: boolean, item: any) => (
        <button
          onClick={() => handleToggleVerificado(item)}
          className={`p-1 rounded-lg transition-colors ${
            value ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
          }`}
          title={value ? 'Desverificar' : 'Verificar'}
        >
          {value ? <ShieldCheck size={20} /> : <Shield size={20} />}
        </button>
      ),
      sortable: true
    },
    {
      key: 'fecha_registro' as const,
      label: 'Fecha Registro',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true
    },
    {
      key: 'actions' as const,
      label: 'Acciones',
      render: (value: any, item: any) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gestiona todos los usuarios del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshUsuarios}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      <DataTableEnhanced
        data={usuarios}
        columns={columns}
        loading={loading}
        searchable={true}
        onRefresh={refreshUsuarios}
      />

      <Modal isOpen={isModalOpen} onClose={closeModals} title="Nuevo Usuario">
        <UsuarioFormComponent
          onSubmit={handleCreate}
          onCancel={closeModals}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Editar Usuario">
        {selectedUsuario && (
          <UsuarioFormComponent
            initialValues={{
              nombre: selectedUsuario.nombre,
              apellido: selectedUsuario.apellido,
              email: selectedUsuario.email || '',
              telefono: selectedUsuario.telefono || '',
              documento_identidad: selectedUsuario.documento_identidad || '',
              tipo_documento: selectedUsuario.tipo_documento || 'DNI',
              pais: selectedUsuario.pais || '',
              rol: selectedUsuario.rol,
              verificado: selectedUsuario.verificado
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
