'use client'

import { useAlojamientos, type AlojamientoForm } from '@/hooks/useAlojamientos'
import { DataTableEnhanced } from '@/components/admin/DataTableEnhanced'
import { AlojamientoFormComponent } from '@/components/admin/AlojamientoForm'
import { Modal } from '@/components/admin/Modal'
import { StatCard } from '@/components/admin/TarjetaEstadistica'
import { AlertService } from '@/lib/ui/alert.service'
import { Plus, Edit, Trash2, RefreshCw, Hotel, ShieldCheck, ShieldAlert } from 'lucide-react'

export default function HotelesAdminPage() {
  const { alojamientos, loading, isRefreshing, isModalOpen, isEditModalOpen, selectedAlojamiento, saving, pagination, createAlojamiento, updateAlojamiento, deleteAlojamiento, toggleActivo, openCreateModal, openEditModal, closeModals, refreshAlojamientos, handlePageChange } = useAlojamientos()

  const handleCreate = async (data: AlojamientoForm) => {
    const r = await createAlojamiento(data)
    if (r.success) await AlertService.success('¡Creado!', 'Alojamiento registrado')
  }

  const handleUpdate = async (data: AlojamientoForm) => {
    if (!selectedAlojamiento) return
    const r = await updateAlojamiento(selectedAlojamiento.id, data)
    if (r.success) await AlertService.success('Despliegue Exitoso', 'Alojamiento actualizado')
  }

  const handleDelete = async (a: any) => {
    const c = await AlertService.confirmDanger({ title: '¿Destruir Registro?', text: `Eliminarás permanentemente "${a.nombre}"`, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' })
    if (c) await deleteAlojamiento(a.id)
  }

  const columns = [
    {
      key: 'nombre' as const,
      label: 'Identidad Propiedad',
      sortable: true,
      render: (v: string) => <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-admin-primary flex items-center justify-center text-admin-accent font-black shadow-lg"><Hotel size={20} /></div><span className="font-black text-admin-primary text-lg tracking-tight">{v}</span></div>
    },
    {
      key: 'categoria' as const,
      label: 'Categorización',
      sortable: true,
      render: (v: string) => <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{v}</span>
    },
    {
      key: 'precio_base' as const,
      label: 'Valoración Base',
      render: (v: number) => <div className="flex items-baseline gap-1.5"><span className="text-xs font-black text-slate-300">S/.</span><span className="text-2xl font-black text-admin-primary tracking-tighter">{(v || 0).toLocaleString()}</span></div>,
      sortable: true
    },
    {
      key: 'activo' as const,
      label: 'Estatus del Activo',
      render: (v: boolean, item: any) => (
        <button onClick={() => toggleActivo(item)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border shadow-lg ${item.activo ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50' : 'bg-red-50 text-red-600 border-red-100 shadow-red-50'}`}>
          {item.activo ? 'Operativo' : 'Inactivo'}
        </button>
      )
    },
    {
      key: 'actions' as const,
      label: 'Comandos',
      render: (_: any, item: any) => (
        <div className="flex items-center gap-3">
          <button onClick={() => openEditModal(item)} className="p-4 text-admin-info bg-blue-50/50 hover:bg-blue-100 rounded-[1.25rem] transition-all shadow-sm active:scale-90"><Edit size={20} /></button>
          <button onClick={() => handleDelete(item)} className="p-4 text-red-500 bg-red-50/50 hover:bg-red-100 rounded-[1.25rem] transition-all shadow-sm active:scale-90"><Trash2 size={20} /></button>
        </div>
      )
    }
  ]

  if (loading && !alojamientos.length) return <div className="flex flex-col items-center justify-center h-[600px] gap-6 animate-pulse"><Loader2 className="w-16 h-16 animate-spin text-admin-primary" /><p className="text-xs font-black uppercase tracking-[0.4em] text-slate-300">Cargando Inventario...</p></div>

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 p-8 xl:p-12 text-admin-primary">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 mb-16">
        <div>
          <h1 className="text-6xl font-black tracking-tighter mb-4 leading-none text-shadow-sm">Habitaciones & Activos</h1>
          <p className="text-slate-400 text-xl font-medium max-w-2xl">Gestión estratégica de unidades, disponibilidad y tarificación dinámica.</p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={refreshAlojamientos} disabled={isRefreshing} className="btn-admin-accent py-5 px-10 rounded-[2rem] shadow-2xl shadow-admin-accent/30 scale-110 active:scale-100 transition-all">
            <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-lg uppercase tracking-widest px-2 font-black text-admin-primary">Refrescar</span>
          </button>
          <button onClick={openCreateModal} className="btn-admin-primary py-5 px-10 rounded-[2rem] shadow-2xl shadow-admin-primary/30 scale-110 active:scale-100 transition-all border-4 border-white/10">
            <Plus size={24} />
            <span className="text-lg uppercase tracking-widest px-2 font-black text-white">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
        <StatCard title="Total Unidades" value={alojamientos.length} icon={Hotel} color="blue" />
        <StatCard title="Disponibles" value={alojamientos.filter(a => a.activo).length} icon={ShieldCheck} color="green" />
        <StatCard title="Promedio Tarifario" value={`S/. ${alojamientos.length > 0 ? Math.round(alojamientos.reduce((s, a) => s + (a.precio_base || 0), 0) / alojamientos.length).toLocaleString() : 0}`} icon={Hotel} color="yellow" />
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
        <div className="p-12 border-b border-slate-50 bg-slate-50/20"><h2 className="text-3xl font-black tracking-tighter">Inventario Estratégico</h2></div>
        <div className="p-4">
            <DataTableEnhanced data={alojamientos} columns={columns} loading={loading} searchable={true} onRefresh={refreshAlojamientos} serverSide={true} totalItems={pagination.total} currentPage={pagination.page} onPageChange={handlePageChange} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModals} title="Despliegue de Unidad"><AlojamientoFormComponent onSubmit={handleCreate} onCancel={closeModals} loading={saving} /></Modal>
      <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Optimización de Registro">{selectedAlojamiento && (<AlojamientoFormComponent initialValues={{ ...selectedAlojamiento, descripcion: selectedAlojamiento.descripcion || '', direccion: selectedAlojamiento.direccion || '', departamento: selectedAlojamiento.departamento || '', provincia: selectedAlojamiento.provincia || '', distrito: selectedAlojamiento.distrito || '', servicios_incluidos: selectedAlojamiento.servicios_incluidos || [] }} onSubmit={handleUpdate} onCancel={closeModals} loading={saving} />)}</Modal>
    </div>
  )
}
