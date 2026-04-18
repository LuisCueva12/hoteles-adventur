'use client'

import { useMemo, useState } from 'react'
import { RefreshCw, ShieldCheck, ShieldUser, Trash2, UserPlus, Users } from 'lucide-react'
import { useToast } from '@/hooks/useNotificacion'
import { useUsuarios } from '@/hooks/useUsuarios'
import type { Usuario } from '@/lib/repositories/usuario.repository'
import type { UsuarioCreateInput, UsuarioUpdateInput } from '@/lib/validations/usuario.schema'
import {
  AdminBadge,
  AdminDataTable,
  AdminDialog,
  AdminPageShell,
  AdminPanel,
  AdminStatCard,
  AdminUserForm,
} from '@/components/admin'
import { formatDate } from '@/components/admin/formatters'

function getRoleTone(role: Usuario['rol']) {
  if (role === 'admin') {
    return 'danger' as const
  }

  if (role === 'propietario') {
    return 'info' as const
  }

  return 'neutral' as const
}

export default function AdminUsuariosPage() {
  const [query, setQuery] = useState('')
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
    refreshUsuarios,
  } = useUsuarios()
  const toast = useToast()

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase()

    if (!term) {
      return usuarios
    }

    return usuarios.filter((usuario) =>
      [usuario.nombre, usuario.apellido, usuario.email, usuario.pais]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [query, usuarios])

  const totalAdmins = usuarios.filter((usuario) => usuario.rol === 'admin').length
  const totalPropietarios = usuarios.filter((usuario) => usuario.rol === 'propietario').length
  const totalVerificados = usuarios.filter((usuario) => usuario.verificado).length

  const handleCreate = async (payload: UsuarioCreateInput | UsuarioUpdateInput) => {
    const result = await createUsuario(payload as UsuarioCreateInput)

    if (result.success) {
      toast.success('Usuario creado correctamente.')
      return
    }

    toast.error(result.error || 'No se pudo crear el usuario.')
  }

  const handleUpdate = async (payload: UsuarioCreateInput | UsuarioUpdateInput) => {
    if (!selectedUsuario) {
      return
    }

    const result = await updateUsuario(selectedUsuario.id, payload as UsuarioUpdateInput)

    if (result.success) {
      toast.success('Usuario actualizado correctamente.')
      return
    }

    toast.error(result.error || 'No se pudo actualizar el usuario.')
  }

  const handleDelete = async (usuario: Usuario) => {
    const confirmed = window.confirm(`¿Deseas eliminar a ${usuario.nombre} ${usuario.apellido}?`)

    if (!confirmed) {
      return
    }

    const result = await deleteUsuario(usuario.id)

    if (result.success) {
      toast.success('Usuario eliminado correctamente.')
      return
    }

    toast.error('No se pudo eliminar el usuario.')
  }

  const handleToggleVerification = async (usuario: Usuario) => {
    const result = await toggleVerificado(usuario)

    if (result.success) {
      toast.success(
        usuario.verificado ? 'Usuario marcado como no verificado.' : 'Usuario verificado correctamente.',
      )
      return
    }

    toast.error('No se pudo actualizar la verificación del usuario.')
  }

  const columns = [
    {
      key: 'usuario',
      header: 'Usuario',
      cell: (usuario: Usuario) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            {usuario.nombre} {usuario.apellido}
          </p>
          <p className="text-sm text-slate-500">{usuario.email}</p>
        </div>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      cell: (usuario: Usuario) => <AdminBadge tone={getRoleTone(usuario.rol)}>{usuario.rol}</AdminBadge>,
    },
    {
      key: 'contacto',
      header: 'Contacto',
      cell: (usuario: Usuario) => (
        <div className="space-y-1 text-sm text-slate-600">
          <p>{usuario.telefono || 'Sin teléfono'}</p>
          <p>{usuario.pais || 'Sin país'}</p>
        </div>
      ),
    },
    {
      key: 'documento',
      header: 'Documento',
      cell: (usuario: Usuario) => (
        <div className="space-y-1 text-sm text-slate-600">
          <p>{usuario.tipo_documento || 'Sin tipo'}</p>
          <p>{usuario.documento_identidad || 'Sin documento'}</p>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (usuario: Usuario) => (
        <div className="space-y-2">
          <AdminBadge tone={usuario.verificado ? 'success' : 'warning'}>
            {usuario.verificado ? 'Verificado' : 'Pendiente'}
          </AdminBadge>
          <p className="text-xs text-slate-500">Registro: {formatDate(usuario.fecha_registro)}</p>
        </div>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      cell: (usuario: Usuario) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="admin-button-secondary px-3 py-2" onClick={() => openEditModal(usuario)}>
            Editar
          </button>
          <button
            type="button"
            className="admin-button-secondary px-3 py-2"
            onClick={() => handleToggleVerification(usuario)}
          >
            {usuario.verificado ? 'Quitar verificación' : 'Verificar'}
          </button>
          <button
            type="button"
            className="admin-button-ghost px-3 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => handleDelete(usuario)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AdminPageShell
      title="Usuarios"
      description="Gestión centralizada de usuarios, perfiles y verificación del sistema."
      actions={
        <>
          <button type="button" className="admin-button-secondary" onClick={refreshUsuarios}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button type="button" className="admin-button-primary" onClick={openCreateModal}>
            <UserPlus className="h-4 w-4" />
            Nuevo usuario
          </button>
        </>
      }
    >
      {errorMessage ? (
        <AdminPanel className="border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-600">
          {errorMessage}
        </AdminPanel>
      ) : null}

      <section className="admin-grid">
        <AdminStatCard title="Usuarios totales" value={usuarios.length} helper="Base actual" icon={Users} tone="blue" />
        <AdminStatCard title="Administradores" value={totalAdmins} helper="Acceso total" icon={ShieldUser} tone="rose" />
        <AdminStatCard
          title="Propietarios"
          value={totalPropietarios}
          helper="Cuentas de negocio"
          icon={Users}
          tone="green"
        />
        <AdminStatCard
          title="Verificados"
          value={totalVerificados}
          helper="Usuarios activos"
          icon={ShieldCheck}
          tone="amber"
        />
      </section>

      <AdminPanel className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Directorio de usuarios</h2>
            <p className="mt-1 text-sm text-slate-500">
              Todos los perfiles administrativos, propietarios y turistas registrados.
            </p>
          </div>
          <input
            className="admin-input w-full max-w-sm"
            placeholder="Buscar por nombre, correo o país"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <AdminDataTable
          columns={columns}
          data={filteredUsers}
          getRowId={(usuario) => usuario.id}
          emptyTitle={loading ? 'Cargando usuarios' : 'No hay usuarios para mostrar'}
          emptyDescription={
            loading ? 'Estamos recuperando la información del directorio.' : 'Prueba con otro filtro o crea un nuevo usuario.'
          }
        />
      </AdminPanel>

      <AdminDialog
        open={isModalOpen}
        title="Crear usuario"
        description="Completa la información básica para registrar un nuevo perfil."
        onClose={closeModals}
      >
        <AdminUserForm mode="create" saving={saving} onCancel={closeModals} onSubmit={handleCreate} />
      </AdminDialog>

      <AdminDialog
        open={isEditModalOpen}
        title="Editar usuario"
        description="Actualiza la información del usuario seleccionado."
        onClose={closeModals}
      >
        <AdminUserForm
          mode="edit"
          initialValue={selectedUsuario}
          saving={saving}
          onCancel={closeModals}
          onSubmit={handleUpdate}
        />
      </AdminDialog>
    </AdminPageShell>
  )
}
