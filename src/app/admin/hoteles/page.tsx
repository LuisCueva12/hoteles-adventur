'use client'

import { useAlojamientos, type AlojamientoForm } from '@/hooks/useAlojamientos'
import { DataTableEnhanced } from '@/components/admin/DataTableEnhanced'
import { AlojamientoFormComponent } from '@/components/admin/AlojamientoForm'
import { Modal } from '@/components/admin/Modal'
import { AlertService } from '@/lib/ui/alert.service'
import { 
    Plus, 
    Edit, 
    Trash2, 
    RefreshCw, 
    Hotel, 
    ShieldCheck, 
    Loader2,
    Bed,
    Zap,
    Tag,
    Eye
} from 'lucide-react'

export default function HotelesAdminPage() {
  const { 
    alojamientos, 
    loading, 
    isRefreshing, 
    isModalOpen, 
    isEditModalOpen, 
    selectedAlojamiento, 
    saving, 
    pagination, 
    createAlojamiento, 
    updateAlojamiento, 
    deleteAlojamiento, 
    toggleActivo, 
    openCreateModal, 
    openEditModal, 
    closeModals, 
    refreshAlojamientos, 
    handlePageChange 
  } = useAlojamientos()

  const handleCreate = async (data: AlojamientoForm) => {
    const r = await createAlojamiento(data)
    if (r.success) await AlertService.success('¡Creado!', 'Alojamiento registrado correctamente')
  }

  const handleUpdate = async (data: AlojamientoForm) => {
    if (!selectedAlojamiento) return
    const r = await updateAlojamiento(selectedAlojamiento.id, data)
    if (r.success) await AlertService.success('Optimizado', 'Registro actualizado correctamente')
  }

  const handleDelete = async (a: any) => {
    const c = await AlertService.confirmDanger({ 
        title: '¿Destruir Registro?', 
        text: `Eliminarás permanentemente "${a.nombre}"`, 
        confirmButtonText: 'Sí, eliminar', 
        cancelButtonText: 'Cancelar' 
    })
    if (c) await deleteAlojamiento(a.id)
  }

  const columns = [
    {
      key: 'nombre' as const,
      label: 'PROPIEDAD',
      sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-4 py-1">
            <div className="w-12 h-12 rounded-2xl bg-[#0d1b2a] flex items-center justify-center text-white shadow-xl">
                <Hotel size={22} />
            </div>
            <div className="flex flex-col">
                <span className="font-black text-gray-800 text-sm uppercase tracking-tight leading-none mb-1">
                    {v}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ACTIVO INMOBILIARIO</span>
            </div>
        </div>
      )
    },
    {
      key: 'categoria' as const,
      label: 'CATEGORIZACIÓN',
      sortable: true,
      render: (v: string) => (
        <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100 italic">
          #{v}
        </span>
      )
    },
    {
      key: 'precio_base' as const,
      label: 'TARIFA BASE',
      sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-blue-500">S/.</span>
            <span className="text-xl font-black text-[#0d1b2a] tabular-nums tracking-tighter">
                {(v || 0).toLocaleString()}
            </span>
        </div>
      )
    },
    {
      key: 'activo' as const,
      label: 'ESTATUS',
      render: (v: boolean, item: any) => (
        <button 
            onClick={() => toggleActivo(item)} 
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                item.activo 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}
        >
          {item.activo ? '● Operativo' : '○ Inactivo'}
        </button>
      )
    },
    {
      key: 'actions' as const,
      label: 'ACCIONES',
      render: (_: any, item: any) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openEditModal(item)} 
            className="p-3 text-gray-600 hover:bg-gray-100 rounded-2xl transition-all border border-transparent hover:border-gray-200"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(item)} 
            className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  if (loading && !alojamientos.length) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 border-4 border-blue-50 border-t-[#0d1b2a] rounded-full animate-spin"></div>
            <p className="text-[#0d1b2a] font-black uppercase tracking-[0.4em] animate-pulse">Consultando Inventario...</p>
        </div>
    )
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Premium Header Container */}
      <div className="bg-[#0d1b2a] rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-500/20 transition-all duration-1000"></div>
        
        <div className="flex flex-col xl:flex-row items-center justify-between gap-10 relative z-10">
          <div className="text-center xl:text-left">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">
              Inventario de <span className="text-blue-400 font-black italic">Unidades</span>
            </h1>
            <p className="text-gray-400 text-xl font-medium max-w-2xl leading-relaxed">
                Gestión estratégica de habitaciones, disponibilidad y tarificación dinámica para una operación optimizada.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
                onClick={refreshAlojamientos} 
                disabled={isRefreshing} 
                className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-2xl transition-all backdrop-blur-md font-black uppercase tracking-widest text-sm"
            >
              <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={20} />
              Refrescar
            </button>
            <button 
                onClick={openCreateModal} 
                className="flex items-center gap-3 px-10 py-5 bg-[#fccd2a] hover:bg-[#ffdf4a] text-[#0d1b2a] rounded-2xl shadow-xl shadow-yellow-400/20 transition-all transform hover:scale-105 active:scale-95 font-black uppercase tracking-widest text-sm"
            >
              <Plus size={24} className="stroke-[3]" />
              Nueva Unidad
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
            { label: 'Total Activos', value: pagination.total || alojamientos.length, icon: Hotel, color: 'from-[#0d1b2a] to-[#1a3a5a]', iconBg: 'bg-white/10' },
            { label: 'Unidades Operativas', value: alojamientos.filter(a => a.activo).length, icon: ShieldCheck, color: 'from-emerald-600 to-teal-400', iconBg: 'bg-white/20' },
            { label: 'Tarifa Media', value: `S/. ${alojamientos.length > 0 ? Math.round(alojamientos.reduce((s, a) => s + (a.precio_base || 0), 0) / alojamientos.length).toLocaleString() : 0}`, icon: Tag, color: 'from-blue-600 to-indigo-500', iconBg: 'bg-white/20' }
        ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-[2rem] p-8 text-white shadow-2xl transition-all transform hover:scale-[1.02] cursor-default group relative overflow-hidden`}>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{stat.label}</span>
                        <div className={`p-4 ${stat.iconBg} rounded-2xl backdrop-blur-sm`}>
                            <stat.icon size={26} />
                        </div>
                    </div>
                    <h3 className="text-5xl font-black mb-1 italic tracking-tighter">{stat.value}</h3>
                    <p className="text-[10px] mt-4 font-black uppercase tracking-widest opacity-60">Snapshot en tiempo real</p>
                </div>
                <stat.icon size={140} className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700" />
            </div>
        ))}
      </div>

      {/* Main Table Wrapper */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Explorador de Inventario</h2>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Sincronizado con base de datos central</p>
            </div>
            <div className="bg-[#0d1b2a] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                Total Unidades: {pagination.total || alojamientos.length}
            </div>
        </div>
        <div className="p-4">
            <DataTableEnhanced 
                data={alojamientos} 
                columns={columns} 
                loading={loading} 
                searchable={true} 
                onRefresh={refreshAlojamientos} 
                serverSide={true} 
                totalItems={pagination.total} 
                currentPage={pagination.page} 
                onPageChange={handlePageChange} 
            />
        </div>
      </div>

      {/* Modals with Premium Framing */}
      <Modal isOpen={isModalOpen} onClose={closeModals} title="Desplegar Nueva Unidad">
        <div className="p-2">
            <AlojamientoFormComponent onSubmit={handleCreate} onCancel={closeModals} loading={saving} />
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Optimización de Registro">
        {selectedAlojamiento && (
          <div className="p-2">
            <AlojamientoFormComponent 
                initialValues={{ 
                    ...selectedAlojamiento, 
                    descripcion: selectedAlojamiento.descripcion || '', 
                    direccion: selectedAlojamiento.direccion || '', 
                    departamento: selectedAlojamiento.departamento || '', 
                    provincia: selectedAlojamiento.provincia || '', 
                    distrito: selectedAlojamiento.distrito || '', 
                    servicios_incluidos: selectedAlojamiento.servicios_incluidos || [] 
                }} 
                onSubmit={handleUpdate} 
                onCancel={closeModals} 
                loading={saving} 
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
