'use client'

import { useUsuarios } from '@/hooks/useUsuarios'
import type { UsuarioCreateInput, UsuarioUpdateInput } from '@/lib/validations/usuario.schema'
import { DataTableEnhanced } from '@/components/admin/DataTableEnhanced'
import { UsuarioFormComponent } from '@/components/admin/UsuarioForm'
import { Modal } from '@/components/admin/Modal'
import { AlertService } from '@/lib/ui/alert.service'
import { 
    Edit, 
    Trash2, 
    Shield, 
    ShieldCheck, 
    RefreshCw, 
    UserPlus, 
    Mail, 
    AlertCircle
} from 'lucide-react'

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
      await AlertService.error('Error', (result as any).error || 'No se pudo crear el usuario')
    }
  }

  const handleUpdate = async (data: UsuarioUpdateInput) => {
    if (!selectedUsuario) return
    
    const result = await updateUsuario(selectedUsuario.id, data)
    if (result.success) {
      await AlertService.success('¡Actualizado!', 'Usuario actualizado correctamente')
    } else {
      await AlertService.error('Error', (result as any).error || 'No se pudo actualizar el usuario')
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
      label: 'NOMBRE',
      render: (_value: string, item: any) => (
        <div className="flex items-center gap-4 py-1">
          <div className="w-10 h-10 rounded-full bg-[#0d1b2a] flex items-center justify-center text-white font-bold text-sm">
            {(item.nombre?.charAt(0) || 'U').toUpperCase()}
          </div>
          <span className="font-bold text-gray-800 text-sm">
            {`${item.nombre} ${item.apellido}`.toLowerCase()}
          </span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'email' as const,
      label: 'EMAIL',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-gray-400" />
          <span className="text-gray-500 text-sm font-medium">{value}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'telefono' as const,
      label: 'TELÉFONO',
      render: (value: string | undefined) => (
        <span className="text-gray-400 text-sm font-medium">{value || '-'}</span>
      )
    },
    {
      key: 'rol' as const,
      label: 'ROL',
      render: (value: string) => (
        <span className="px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#0d1b2a] text-white">
          {formatRol(value)}
        </span>
      ),
      sortable: true
    },
    {
      key: 'verificado' as const,
      label: 'VERIFICADO',
      render: (_value: boolean, item: any) => (
        <div className="flex justify-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    item.verificado 
                    ? 'bg-green-50 text-green-500 border-green-200' 
                    : 'bg-gray-50 text-gray-300 border-gray-200'
                }`}>
                <ShieldCheck size={20} className={item.verificado ? 'fill-green-500/10' : ''} />
            </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'fecha_registro' as const,
      label: 'FECHA REGISTRO',
      render: (value: string) => (
        <span className="text-gray-400 text-sm font-medium">
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
      label: 'ACCIONES',
      render: (_value: any, item: any) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => openEditModal(item)}
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
            title="Editar"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Dark Header Card */}
      <div className="bg-[#0d1b2a] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-500/20 transition-all duration-1000"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              Administra todos los usuarios del sistema de forma segura.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={refreshUsuarios}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-2xl transition-all backdrop-blur-md disabled:opacity-50 font-bold"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-8 py-4 bg-[#fccd2a] hover:bg-[#ffdf4a] text-[#0d1b2a] rounded-2xl shadow-xl shadow-yellow-400/10 transition-all transform hover:scale-105 active:scale-95 font-black uppercase tracking-tight"
            >
              <UserPlus size={22} className="stroke-[3]" />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Total Usuarios', value: usuarios.length, icon: UserPlus, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
            { label: 'Administradores', value: usuarios.filter(u => u.rol === 'admin').length, icon: Shield, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-900' },
            { label: 'Verificados', value: usuarios.filter(u => u.verificado).length, icon: ShieldCheck, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
            { label: 'Turistas', value: usuarios.filter(u => u.rol === 'turista').length, icon: UserPlus, iconBg: 'bg-slate-50', iconColor: 'text-slate-400' }
        ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-gray-50 flex items-center justify-between hover:shadow-blue-900/10 transition-all group">
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
                    <p className="text-5xl font-black text-gray-900 tabular-nums">{stat.value}</p>
                </div>
                <div className={`w-16 h-16 ${stat.iconBg} rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                    <stat.icon className={`w-8 h-8 ${stat.iconColor} stroke-[2.5]`} />
                </div>
            </div>
        ))}
      </div>

      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
            <AlertCircle className="text-white w-6 h-6" />
          </div>
          <div>
            <p className="font-black text-red-900 uppercase text-sm tracking-tighter">Error crítico de sistema</p>
            <p className="text-red-600 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,123,255,0.05)] border border-gray-100 overflow-hidden">
        <DataTableEnhanced
          data={usuarios}
          columns={columns}
          loading={loading}
          searchable={true}
          onRefresh={refreshUsuarios}
        />
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModals} title="Desplegar Nuevo Usuario">
        <UsuarioFormComponent
          onSubmit={handleCreate}
          onCancel={closeModals}
          loading={saving}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Optimizar Registro de Usuario">
        {selectedUsuario && (
          <div className="p-2">
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
          </div>
        )}
      </Modal>
    </div>
  )
}
