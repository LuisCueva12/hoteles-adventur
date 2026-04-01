'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/TablasDatos'
import { Modal } from '@/components/admin/Modal'
import { adminService } from '@/services/admin.servicio'
import { notificationsService } from '@/services/notificaciones.servicio'
import { RefreshCw, Loader2, Home, MapPin, DollarSign, Users, Plus, Edit, X } from 'lucide-react'
import Swal from 'sweetalert2'

interface Alojamiento {
    id: string
    nombre: string
    descripcion: string | null
    direccion: string | null
    departamento: string | null
    provincia: string | null
    distrito: string | null
    categoria: string
    tipo: string
    precio_base: number
    capacidad_maxima: number
    servicios_incluidos: string[] | null
    activo: boolean
    fecha_creacion: string
    usuarios: {
        nombre: string
        apellido: string
    } | null
    fotos_alojamiento: Array<{
        url: string
        es_principal: boolean
    }> | null
}

export default function HotelesAdminPage() {
    const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([])
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedAlojamiento, setSelectedAlojamiento] = useState<Alojamiento | null>(null)
    const [filterCategoria, setFilterCategoria] = useState<string>('todas')
    const [filterTipo, setFilterTipo] = useState<string>('todos')
    const [saving, setSaving] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [principalImageIndex, setPrincipalImageIndex] = useState(0)
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        direccion: '',
        departamento: '',
        provincia: '',
        distrito: '',
        categoria: 'Económico' as 'Económico' | 'Familiar' | 'Parejas' | 'Premium' | 'Naturaleza',
        tipo: 'Hotel' as 'Cabaña' | 'EcoLodge' | 'Hotel' | 'Hostal' | 'Casa',
        precio_base: 0,
        capacidad_maxima: 2,
        servicios_incluidos: [] as string[],
        activo: true,
        latitud: -7.1637,
        longitud: -78.5001
    })

    const serviciosDisponibles = [
        'Energía solar', 'Agua caliente solar', 'Baño ecológico', 'Cocina con productos orgánicos locales',
        'Huerto orgánico', 'Tours guiados incluidos', 'Observación de aves', 'Senderos naturales',
        'Talleres de agricultura', 'Biblioteca ecológica', 'WiFi', 'Estacionamiento',
        'Desayuno incluido', 'Piscina', 'Gimnasio', 'Spa', 'Restaurant', 'Bar',
        'Servicio de habitación', 'Lavandería', 'Aire acondicionado', 'TV por cable'
    ]

    useEffect(() => {
        loadAlojamientos()
    }, [])

    const loadAlojamientos = async () => {
        try {
            setLoading(true)
            const data = await adminService.getAlojamientos()
            setAlojamientos(data || [])
        } catch (error) {
            console.error('Error loading alojamientos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadAlojamientos()
        setIsRefreshing(false)
    }

    const handleOpenCreateModal = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            direccion: '',
            departamento: '',
            provincia: '',
            distrito: '',
            categoria: 'Económico',
            tipo: 'Hotel',
            precio_base: 0,
            capacidad_maxima: 2,
            servicios_incluidos: [],
            activo: true,
            latitud: -7.1637,
            longitud: -78.5001
        })
        setSelectedAlojamiento(null)
        setImagePreviews([])
        setImageFiles([])
        setPrincipalImageIndex(0)
        setIsEditModalOpen(true)
    }

    const handleOpenEditModal = (alojamiento: Alojamiento) => {
        setFormData({
            nombre: alojamiento.nombre,
            descripcion: alojamiento.descripcion || '',
            direccion: alojamiento.direccion || '',
            departamento: alojamiento.departamento || '',
            provincia: alojamiento.provincia || '',
            distrito: alojamiento.distrito || '',
            categoria: alojamiento.categoria as any,
            tipo: alojamiento.tipo as any,
            precio_base: alojamiento.precio_base,
            capacidad_maxima: alojamiento.capacidad_maxima,
            servicios_incluidos: alojamiento.servicios_incluidos || [],
            activo: alojamiento.activo,
            latitud: -7.1637,
            longitud: -78.5001
        })
        setSelectedAlojamiento(alojamiento)
        
        // Cargar imágenes existentes
        if (alojamiento.fotos_alojamiento && alojamiento.fotos_alojamiento.length > 0) {
            setImagePreviews(alojamiento.fotos_alojamiento.map(f => f.url))
            const principalIndex = alojamiento.fotos_alojamiento.findIndex(f => f.es_principal)
            setPrincipalImageIndex(principalIndex >= 0 ? principalIndex : 0)
        } else {
            setImagePreviews([])
            setPrincipalImageIndex(0)
        }
        setImageFiles([])
        
        setIsEditModalOpen(true)
    }

    const handleSaveAlojamiento = async () => {
        try {
            setSaving(true)
            
            if (selectedAlojamiento) {
                // Editar
                await adminService.updateAlojamiento(selectedAlojamiento.id, formData)
                
                // Subir nuevas imágenes si hay
                if (imageFiles.length > 0) {
                    await uploadImages(selectedAlojamiento.id)
                }
                
                // Notificar a los administradores
                await notificationsService.notifyAdmins(
                    'info',
                    '🏨 Habitación actualizada',
                    `La habitación "${formData.nombre}" ha sido actualizada`,
                    '/admin/hoteles',
                    { alojamientoId: selectedAlojamiento.id, nombre: formData.nombre }
                )
            } else {
                // Crear - obtener usuario actual
                const { data: { user } } = await adminService.supabase.auth.getUser()
                if (!user) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Debes iniciar sesión para crear alojamientos',
                        confirmButtonColor: '#3B82F6'
                    })
                    return
                }
                
                const newAlojamiento = {
                    ...formData,
                    propietario_id: user.id
                }
                const { data: created, error: createError } = await adminService.supabase
                    .from('alojamientos')
                    .insert([newAlojamiento])
                    .select()
                    .single()

                if (createError) throw createError
                
                // Subir imágenes si hay
                if (imageFiles.length > 0 && created) {
                    await uploadImages(created.id)
                }
                
                // Notificar a los administradores
                await notificationsService.notifyAdmins(
                    'success',
                    '✨ Nueva habitación creada',
                    `Se ha creado la habitación "${formData.nombre}" (${formData.tipo})`,
                    '/admin/hoteles',
                    { nombre: formData.nombre, tipo: formData.tipo }
                )
            }
            
            await loadAlojamientos()
            setIsEditModalOpen(false)
            
            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: selectedAlojamiento ? 'Alojamiento actualizado correctamente' : 'Alojamiento creado correctamente',
                confirmButtonColor: '#3B82F6',
                timer: 2000,
                showConfirmButton: false
            })
        } catch (error) {
            console.error('Error saving alojamiento:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el alojamiento: ' + (error as any).message,
                confirmButtonColor: '#3B82F6'
            })
        } finally {
            setSaving(false)
        }
    }

    const handleToggleServicio = (servicio: string) => {
        setFormData(prev => ({
            ...prev,
            servicios_incluidos: prev.servicios_incluidos.includes(servicio)
                ? prev.servicios_incluidos.filter(s => s !== servicio)
                : [...prev.servicios_incluidos, servicio]
        }))
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        // Validar tamaño y tipo
        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Archivo muy grande',
                    text: `${file.name} excede el tamaño máximo de 5MB`,
                    confirmButtonColor: '#3B82F6'
                })
                return false
            }
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Tipo de archivo inválido',
                    text: `${file.name} no es una imagen válida`,
                    confirmButtonColor: '#3B82F6'
                })
                return false
            }
            return true
        })

        if (validFiles.length === 0) return

        // Crear previews
        const newPreviews: string[] = []
        validFiles.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                newPreviews.push(reader.result as string)
                if (newPreviews.length === validFiles.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews])
                    setImageFiles(prev => [...prev, ...validFiles])
                }
            }
            reader.readAsDataURL(file)
        })
    }

    const handleRemoveImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
        setImageFiles(prev => prev.filter((_, i) => i !== index))
        if (principalImageIndex === index) {
            setPrincipalImageIndex(0)
        } else if (principalImageIndex > index) {
            setPrincipalImageIndex(prev => prev - 1)
        }
    }

    const uploadImages = async (alojamientoId: string) => {
        if (imageFiles.length === 0) return

        setUploadingImages(true)
        try {
            const supabase = adminService.supabase

            // Subir cada imagen directamente sin verificar el bucket
            const uploadedUrls: { url: string; es_principal: boolean }[] = []

            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `${alojamientoId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('accommodation-photos')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) {
                    console.error('Error uploading file:', uploadError)
                    throw new Error(`Error al subir ${file.name}: ${uploadError.message}`)
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('accommodation-photos')
                    .getPublicUrl(fileName)

                uploadedUrls.push({
                    url: publicUrl,
                    es_principal: i === principalImageIndex
                })
            }

            // Guardar URLs en la tabla fotos_alojamiento
            const { error: insertError } = await supabase
                .from('fotos_alojamiento')
                .insert(uploadedUrls.map(u => ({
                    alojamiento_id: alojamientoId,
                    url: u.url,
                    es_principal: u.es_principal
                })))

            if (insertError) {
                console.error('Error saving image URLs:', insertError)
                throw new Error(`Error al guardar URLs: ${insertError.message}`)
            }

        } catch (error) {
            console.error('Error uploading images:', error)
            throw error
        } finally {
            setUploadingImages(false)
        }
    }

    const columns = [
        { 
            key: 'nombre', 
            label: 'Nombre',
            render: (value: string, row: Alojamiento) => (
                <div className="flex items-center gap-3">
                    {row.fotos_alojamiento && row.fotos_alojamiento.length > 0 ? (
                        <img 
                            src={row.fotos_alojamiento.find(f => f.es_principal)?.url || row.fotos_alojamiento[0].url} 
                            alt={value}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                            <Home className="w-6 h-6 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-600">{row.tipo}</p>
                    </div>
                </div>
            )
        },
        { 
            key: 'categoria', 
            label: 'Categoría',
            render: (value: string) => (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                    {value}
                </span>
            )
        },
        { 
            key: 'direccion', 
            label: 'Ubicación',
            render: (_: any, row: Alojamiento) => (
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                        {row.distrito || 'N/A'}, {row.provincia || 'N/A'}
                    </span>
                </div>
            )
        },
        { 
            key: 'precio_base', 
            label: 'Precio Base',
            render: (value: number) => (
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold text-yellow-400">S/. {value.toLocaleString()}</span>
                </div>
            )
        },
        { 
            key: 'capacidad_maxima', 
            label: 'Capacidad',
            render: (value: number) => (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">{value} personas</span>
                </div>
            )
        },
        { 
            key: 'activo', 
            label: 'Estado',
            render: (value: boolean) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    value 
                        ? 'bg-yellow-100 text-yellow-400 border-yellow-200' 
                        : 'bg-yellow-100 text-yellow-400 border-yellow-200'
                }`}>
                    {value ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
    ]

    const handleView = (alojamiento: Alojamiento) => {
        setSelectedAlojamiento(alojamiento)
        setIsModalOpen(true)
    }

    const handleEdit = (alojamiento: Alojamiento) => {
        handleOpenEditModal(alojamiento)
    }

    const handleToggleActivo = async (alojamiento: Alojamiento) => {
        try {
            await adminService.updateAlojamiento(alojamiento.id, { activo: !alojamiento.activo })
            await loadAlojamientos()
            await Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: `Alojamiento ${!alojamiento.activo ? 'activado' : 'desactivado'} correctamente`,
                confirmButtonColor: '#3B82F6',
                timer: 1500,
                showConfirmButton: false
            })
        } catch (error) {
            console.error('Error updating alojamiento:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar el estado del alojamiento',
                confirmButtonColor: '#3B82F6'
            })
        }
    }

    const handleDelete = async (alojamiento: Alojamiento) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar ${alojamiento.nombre}? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await adminService.deleteAlojamiento(alojamiento.id)
                await loadAlojamientos()
                await Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El alojamiento ha sido eliminado correctamente',
                    confirmButtonColor: '#3B82F6',
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error('Error deleting alojamiento:', error)
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el alojamiento',
                    confirmButtonColor: '#3B82F6'
                })
            }
        }
    }

    const filteredAlojamientos = alojamientos.filter(a => {
        const matchCategoria = filterCategoria === 'todas' || a.categoria === filterCategoria
        const matchTipo = filterTipo === 'todos' || a.tipo === filterTipo
        return matchCategoria && matchTipo
    })

    const stats = [
        { 
            label: 'Total Alojamientos', 
            value: alojamientos.length, 
            color: 'text-blue-600',
            icon: Home,
            bgColor: 'bg-blue-100'
        },
        { 
            label: 'Activos', 
            value: alojamientos.filter(a => a.activo).length, 
            color: 'text-yellow-400',
            icon: Home,
            bgColor: 'bg-yellow-100'
        },
        { 
            label: 'Ingresos Promedio', 
            value: `S/. ${Math.round(alojamientos.reduce((sum, a) => sum + a.precio_base, 0) / (alojamientos.length || 1)).toLocaleString()}`, 
            color: 'text-yellow-400',
            icon: DollarSign,
            bgColor: 'bg-yellow-100'
        },
        { 
            label: 'Capacidad Total', 
            value: alojamientos.reduce((sum, a) => sum + a.capacidad_maxima, 0), 
            color: 'text-purple-600',
            icon: Users,
            bgColor: 'bg-purple-100'
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Cargando alojamientos...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Alojamientos</h1>
                    <p className="text-gray-500 text-sm mt-1">Administra todos los alojamientos del sistema</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold text-sm shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nuevo Alojamiento</span>
                        <span className="sm:hidden">Nuevo</span>
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline text-gray-700 font-medium">Actualizar</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-gray-500 font-medium leading-tight">{stat.label}</p>
                                <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                            </div>
                            <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    )
                })}
            </div>

            {/* Filtros */}
            <div className="mb-5 bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide w-full sm:w-auto">Categoría:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {['todas', 'Económico', 'Familiar', 'Parejas', 'Premium', 'Naturaleza'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategoria(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    filterCategoria === cat
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat === 'todas' ? 'Todas' : cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide w-full sm:w-auto">Tipo:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {['todos', 'Cabaña', 'EcoLodge', 'Hotel', 'Hostal', 'Casa'].map((tipo) => (
                            <button
                                key={tipo}
                                onClick={() => setFilterTipo(tipo)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    filterTipo === tipo
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tipo === 'todos' ? 'Todos' : tipo}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredAlojamientos}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Modal Crear/Editar */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={selectedAlojamiento ? '✏️ Editar Alojamiento' : '✨ Nuevo Alojamiento'}
                size="lg"
            >
                <div className="space-y-6">
                    {/* Información Básica */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Información Básica
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Nombre del Alojamiento *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: EcoLodge Aventura Verde"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Categoría *</label>
                                    <select
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Económico">💰 Económico</option>
                                        <option value="Familiar">👨‍👩‍👧‍👦 Familiar</option>
                                        <option value="Parejas">💑 Parejas</option>
                                        <option value="Premium">⭐ Premium</option>
                                        <option value="Naturaleza">🌿 Naturaleza</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Tipo *</label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Cabaña">🏡 Cabaña</option>
                                        <option value="EcoLodge">🌲 EcoLodge</option>
                                        <option value="Hotel">🏨 Hotel</option>
                                        <option value="Hostal">🏠 Hostal</option>
                                        <option value="Casa">🏘️ Casa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Precio Base (S/.) *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.precio_base}
                                            onChange={(e) => setFormData({ ...formData, precio_base: Number(e.target.value) })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="320"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Capacidad Máxima *</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.capacidad_maxima}
                                            onChange={(e) => setFormData({ ...formData, capacidad_maxima: Number(e.target.value) })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="4"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Ubicación
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Distrito</label>
                                <input
                                    type="text"
                                    value={formData.distrito}
                                    onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Llacanora"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Provincia</label>
                                <input
                                    type="text"
                                    value={formData.provincia}
                                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Cajamarca"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Departamento</label>
                                <input
                                    type="text"
                                    value={formData.departamento}
                                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Cajamarca"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Dirección Completa</label>
                            <input
                                type="text"
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Calle Principal 123, Referencia: Cerca al parque"
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Descripción
                        </h3>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            placeholder="Describe el alojamiento, sus características principales y lo que lo hace especial..."
                        />
                    </div>

                    {/* Imágenes */}
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                        <h3 className="text-sm font-bold text-orange-900 mb-1 flex items-center gap-2">
                            📸 Imágenes del Alojamiento
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">Máx. 10 imágenes (5MB c/u). La marcada con ⭐ será la principal.</p>
                        
                        <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            imagePreviews.length >= 10 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                        }`}>
                            <Plus className="w-4 h-4" />
                            Seleccionar Imágenes
                            {imagePreviews.length > 0 && <span className="ml-1 opacity-75">({imagePreviews.length}/10)</span>}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={imagePreviews.length >= 10}
                            />
                        </label>

                        {imagePreviews.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <div className="relative overflow-hidden rounded-lg border-2 border-white shadow">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 sm:h-28 object-cover"
                                            />
                                            {index === principalImageIndex && (
                                                <div className="absolute top-1 left-1 bg-yellow-400 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                    ⭐ Principal
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                                                {index !== principalImageIndex && (
                                                    <button
                                                        onClick={() => setPrincipalImageIndex(index)}
                                                        className="w-full px-2 py-1 bg-yellow-400 text-white rounded text-[10px] font-bold"
                                                    >
                                                        ⭐ Principal
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="w-full px-2 py-1 bg-red-500 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1"
                                                >
                                                    <X className="w-3 h-3" /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-3 border-2 border-dashed border-orange-300 rounded-lg bg-white/50 text-center py-8">
                                <Home className="w-8 h-8 text-orange-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Sin imágenes seleccionadas</p>
                            </div>
                        )}
                    </div>

                    {/* Servicios */}
                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                        <h3 className="text-sm font-bold text-cyan-900 mb-1 flex items-center gap-2">
                            ✨ Servicios Incluidos
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                            {formData.servicios_incluidos.length} seleccionado{formData.servicios_incluidos.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                            {serviciosDisponibles.map((servicio) => (
                                <label key={servicio} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg transition-all border border-transparent hover:border-cyan-200 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.servicios_incluidos.includes(servicio)}
                                        onChange={() => handleToggleServicio(servicio)}
                                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                                    />
                                    <span className="text-xs text-gray-700 font-medium">{servicio}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900">
                                    {formData.activo ? '✅' : '❌'} Estado del Alojamiento
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {formData.activo ? 'Visible y disponible para reservas' : 'Oculto, no acepta reservas'}
                                </p>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    formData.activo
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-gray-400 hover:bg-gray-500 text-white'
                                }`}
                            >
                                {formData.activo ? '✓ Activo' : '✕ Inactivo'}
                            </button>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={saving || uploadingImages}
                            className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold border border-gray-300 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveAlojamiento}
                            disabled={saving || uploadingImages || !formData.nombre}
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving || uploadingImages ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {uploadingImages ? 'Subiendo...' : 'Guardando...'}
                                </>
                            ) : (
                                <>
                                    {selectedAlojamiento ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    {selectedAlojamiento ? 'Actualizar' : 'Crear Alojamiento'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal Ver Detalles */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedAlojamiento?.nombre || 'Detalles del Alojamiento'}
                size="lg"
            >
                {selectedAlojamiento && (
                    <div className="space-y-6">
                        {/* Galería de Fotos */}
                        {selectedAlojamiento.fotos_alojamiento && selectedAlojamiento.fotos_alojamiento.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {selectedAlojamiento.fotos_alojamiento.slice(0, 3).map((foto, idx) => (
                                    <div key={idx} className="relative overflow-hidden rounded-xl">
                                        <img 
                                            src={foto.url} 
                                            alt={`Foto ${idx + 1}`}
                                            className="w-full h-28 sm:h-36 object-cover"
                                        />
                                        {foto.es_principal && (
                                            <div className="absolute top-1.5 right-1.5 bg-yellow-400 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                Principal
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Información Principal con Iconos */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Home className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wide">Categoría</p>
                                </div>
                                <p className="text-base font-bold text-purple-900">{selectedAlojamiento.categoria}</p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Home className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wide">Tipo</p>
                                </div>
                                <p className="text-base font-bold text-blue-900">{selectedAlojamiento.tipo}</p>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-wide">Precio Base</p>
                                </div>
                                <p className="text-lg font-bold text-yellow-500">S/. {selectedAlojamiento.precio_base.toLocaleString()}</p>
                                <p className="text-[10px] text-yellow-500 mt-0.5">por noche</p>
                            </div>

                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <Users className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p className="text-[10px] text-orange-700 font-bold uppercase tracking-wide">Capacidad</p>
                                </div>
                                <p className="text-lg font-bold text-orange-900">{selectedAlojamiento.capacidad_maxima}</p>
                                <p className="text-[10px] text-orange-600 mt-0.5">personas máximo</p>
                            </div>
                        </div>

                        {/* Ubicación Destacada */}
                        <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border-2 border-indigo-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-xs text-indigo-700 font-bold uppercase tracking-wide">Ubicación</p>
                            </div>
                            <p className="text-lg font-bold text-indigo-900">{selectedAlojamiento.distrito || 'N/A'}</p>
                            <p className="text-sm text-indigo-700 font-medium mt-1">
                                {selectedAlojamiento.provincia || 'N/A'}, {selectedAlojamiento.departamento || 'N/A'}
                            </p>
                            {selectedAlojamiento.direccion && (
                                <p className="text-xs text-indigo-600 mt-2">{selectedAlojamiento.direccion}</p>
                            )}
                        </div>

                        {/* Propietario */}
                        <div className="p-5 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {selectedAlojamiento.usuarios 
                                        ? selectedAlojamiento.usuarios.nombre.charAt(0).toUpperCase()
                                        : '?'}
                                </div>
                                <div>
                                    <p className="text-xs text-pink-700 font-bold uppercase tracking-wide">Propietario</p>
                                    <p className="text-lg font-bold text-pink-900">
                                        {selectedAlojamiento.usuarios 
                                            ? `${selectedAlojamiento.usuarios.nombre} ${selectedAlojamiento.usuarios.apellido}`
                                            : 'Sin propietario asignado'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        {selectedAlojamiento.descripcion && (
                            <div className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-200">
                                <p className="text-xs text-gray-600 mb-3 font-bold uppercase tracking-wide">Descripción</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{selectedAlojamiento.descripcion}</p>
                            </div>
                        )}

                        {/* Servicios Incluidos */}
                        {selectedAlojamiento.servicios_incluidos && selectedAlojamiento.servicios_incluidos.length > 0 && (
                            <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                                <p className="text-xs text-cyan-700 mb-3 font-bold uppercase tracking-wide">Servicios Incluidos</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                    {selectedAlojamiento.servicios_incluidos.map((servicio, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 px-2 py-1.5 bg-white rounded-lg border border-cyan-200">
                                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                                            <span className="text-xs text-cyan-900 font-medium truncate">{servicio}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Estado del Alojamiento */}
                        <div className="border-t-2 border-gray-200 pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">Estado del Alojamiento</p>
                                    <p className="text-xs text-gray-600">Cambia el estado de disponibilidad</p>
                                </div>
                                <button
                                    onClick={() => handleToggleActivo(selectedAlojamiento)}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                        selectedAlojamiento.activo
                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                            : 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-white'
                                    }`}
                                >
                                    {selectedAlojamiento.activo ? '✓ Activo' : '✕ Inactivo'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
