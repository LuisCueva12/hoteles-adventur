'use client'

import { useUsuarios } from '@/hooks/useUsuarios'
import type { UsuarioCreateInput, UsuarioUpdateInput } from '@/lib/validations/usuario.schema'
import { UsuarioRepository, type Usuario } from '@/lib/repositories/usuario.repository'
import { DataTableEnhanced } from '@/components/admin/DataTableEnhanced'
import { UsuarioFormComponent } from '@/components/admin/UsuarioForm'
import { Modal } from '@/components/admin/Modal'
import { AlertService } from '@/lib/ui/alert.service'
import { Edit, Trash2, Shield, ShieldCheck, RefreshCw, UserPlus, Mail } from 'lucide-react'

export default function UsuariosAdminPage() {
  const {
    usuarios,
    loading,
    isRefreshing,
    isModalOpen,
    isEditModalOpen,
    selectedUsuario,
    saving,
    errorMessage,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    toggleVerificado,
    openCreateModal,
    openEditModal,
    closeModals,
    refreshUsuarios
  } = useUsuarios()

  const handleCreate = async (data: UsuarioCreateInput) => {
    const result = await createUsuario(data)
    if (result.success) {
      await AlertService.success('¡Creado!', 'Usuario creado correctamente')
    } else {
      await AlertService.error('Error', 'No se pudo crear el usuario')
    }
  }

  const handleUpdate = async (data: UsuarioUpdateInput) => {
    if (!selectedUsuario) return
    
    const result = await updateUsuario(selectedUsuario.id, data)
    if (result.success) {
      await AlertService.success('¡Actualizado!', 'Usuario actualizado correctamente')
    } else {
      await AlertService.error('Error', 'No se pudo actualizar el usuario')
    }
  }

  const handleDelete = async (usuario: any) => {
    const confirmed = await AlertService.confirmDanger({
      title: '¿Estás seguro?',
      text: `Eliminarás el usuario "${usuario.nombre} ${usuario.apellido}"`,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (confirmed) {
      const result = await deleteUsuario(usuario.id)
      if (result.success) {
        await AlertService.success('¡Eliminado!', 'Usuario eliminado correctamente')
      }
    }
  }

  const handleToggleVerificado = async (usuario: any) => {
    const result = await toggleVerificado(usuario)
    if (result.success) {
      await AlertService.success(
        'Actualizado',
        `Usuario ${usuario.verificado ? 'desverificado' : 'verificado'} correctamente`,
        1500
      )
    }
  }

  const formatRol = (rol: string) => {
    switch (rol) {
      case 'admin': return 'Administrador'
      case 'propietario': return 'Propietario'
      case 'turista': return 'Turista'
      default: return rol
    }
  }

  const columns = [
    {
      key: 'nombre' as const,
      label: 'Nombre',
      render: (_value: string, item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-admin-primary to-admin-primary-dark flex items-center justify-center text-white font-bold text-sm shadow-md">
            {item.nombre.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{`${item.nombre} ${item.apellido}`}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'email' as const,
      label: 'Email',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-admin-primary/60" />
          <span className="text-gray-700">{value}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'telefono' as const,
      label: 'Teléfono',
      render: (value: string | undefined) => (
        <span className="text-gray-600">{value || '-'}</span>
      )
    },
    {
      key: 'rol' as const,
      label: 'Rol',
      render: (value: string) => {
        const colors = {
          admin: 'bg-admin-primary text-white',
          propietario: 'bg-admin-accent text-admin-primary-dark',
          turista: 'bg-gray-100 text-gray-700'
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-700'}`}>
            {formatRol(value)}
          </span>
        )
      },
      sortable: true
    },
    {
      key: 'verificado' as const,
      label: 'Verificado',
      render: (_value: boolean, item: any) => (
        <button
          onClick={() => handleToggleVerificado(item)}
          className={`p-2 rounded-lg transition-all ${
            item.verificado 
              ? 'text-admin-success bg-green-50 hover:bg-green-100' 
              : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
          }`}
          title={item.verificado ? 'Desverificar' : 'Verificar'}
        >
          {item.verificado ? <ShieldCheck size={20} /> : <Shield size={20} />}
        </button>
      ),
      sortable: true
    },
    {
      key: 'fecha_registro' as const,
      label: 'Fecha Registro',
      render: (value: string) => (
        <span className="text-gray-600 text-sm">
          {new Date(value).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      ),
      sortable: true
    },
    {
      key: 'actions' as const,
      label: 'Acciones',
      render: (_value: any, item: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-2 text-admin-primary hover:bg-admin-primary-light rounded-lg transition-all"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-2 text-admin-error hover:bg-red-50 rounded-lg transition-all"
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
      {/* Header */}
      <div className="bg-gradient-to-r from-admin-primary to-admin-primary-dark rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-white/80">
              Administra todos los usuarios del sistema
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshUsuarios}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg transition-all disabled:opacity-50 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent-hover text-admin-primary-dark rounded-lg shadow-lg transition-all font-semibold"
            >
              <UserPlus size={20} />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
            <div className="w-10 h-10 bg-admin-primary-light rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-admin-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-admin-primary">{usuarios.length}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Administradores</p>
            <div className="w-10 h-10 bg-admin-primary-light rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-admin-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-admin-primary">
            {usuarios.filter(u => u.rol === 'admin').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Verificados</p>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-admin-success" />
            </div>
          </div>
          <p className="text-3xl font-bold text-admin-success">
            {usuarios.filter(u => u.verificado).length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Turistas</p>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-700">
            {usuarios.filter(u => u.rol === 'turista').length}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-red-600">⚠</span>
          </div>
          <div>
            <p className="font-semibold text-red-800">Error al cargar usuarios</p>
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <DataTableEnhanced
          data={usuarios}
          columns={columns}
          loading={loading}
          searchable={true}
          onRefresh={refreshUsuarios}
        />
      </div>

      {/* Modals */}
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
            isEdit={true}
          />
        )}
      </Modal>
    </div>
  )
}
