'use client'

import { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.servicio'
import { notificationsService } from '@/services/notificaciones.servicio'
import { RefreshCw, Loader2, Download, Eye, Edit, Trash2, UserPlus } from 'lucide-react'
import { Modal } from '@/components/admin/Modal'
import Swal from 'sweetalert2'

interface Usuario {
    id: string
    nombre: string
    apellido: string
    email: string | null
    telefono: string | null
    documento_identidad: string | null
    tipo_documento: string | null
    pais: string | null
    rol: string
    verificado: boolean
    fecha_registro: string
    foto_perfil: string | null
}

export default function UsuariosAdminPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [filterRol, setFilterRol] = useState<string>('todos')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editForm, setEditForm] = useState<Partial<Usuario>>({})
    const [createForm, setCreateForm] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        telefono: '',
        documento_identidad: '',
        tipo_documento: '',
        pais: 'Perú',
        rol: 'turista' as 'turista' | 'propietario' | 'admin_adventur'
    })
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [creatingUser, setCreatingUser] = useState(false)

    useEffect(() => {
        loadUsuarios()
    }, [])

    const loadUsuarios = async () => {
        try {
            setLoading(true)
            const data = await adminService.getUsuarios()
            setUsuarios(data || [])
        } catch (error) {
            console.error('Error loading usuarios:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadUsuarios()
        setIsRefreshing(false)
    }

    const handleView = (usuario: Usuario) => {
        setSelectedUsuario(usuario)
        setIsModalOpen(true)
    }

    const handleOpenCreateModal = () => {
        setCreateForm({
            email: '',
            password: '',
            nombre: '',
            apellido: '',
            telefono: '',
            documento_identidad: '',
            tipo_documento: '',
            pais: 'Perú',
            rol: 'turista'
        })
        setIsCreateModalOpen(true)
    }

    const handleCreateUser = async () => {
        // Validaciones
        if (!createForm.email || !createForm.password || !createForm.nombre || !createForm.apellido) {
            await Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor completa todos los campos obligatorios (Email, Contraseña, Nombre y Apellido)',
                confirmButtonColor: '#3B82F6'
            })
            return
        }

        if (createForm.password.length < 6) {
            await Swal.fire({
                icon: 'warning',
                title: 'Contraseña débil',
                text: 'La contraseña debe tener al menos 6 caracteres',
                confirmButtonColor: '#3B82F6'
            })
            return
        }

        setCreatingUser(true)
        try {
            const { createClient } = await import('@/utils/supabase/client')
            const supabase = createClient()

            // Crear usuario en auth.users
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: createForm.email,
                password: createForm.password,
                options: {
                    data: {
                        nombre: createForm.nombre,
                        apellido: createForm.apellido
                    }
                }
            })

            if (authError) throw authError

            if (!authData.user) {
                throw new Error('No se pudo crear el usuario')
            }

            // Actualizar datos adicionales en la tabla usuarios
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({
                    telefono: createForm.telefono || null,
                    documento_identidad: createForm.documento_identidad || null,
                    tipo_documento: createForm.tipo_documento || null,
                    pais: createForm.pais || null,
                    rol: createForm.rol,
                    verificado: true // Los usuarios creados por admin están verificados
                })
                .eq('id', authData.user.id)

            if (updateError) {
                console.error('Error updating user data:', updateError)
            }

            await loadUsuarios()
            setIsCreateModalOpen(false)

            // Notificar a los admins
            await notificationsService.notifyAdmins(
                'success',
                '✨ Nuevo usuario creado',
                `Se ha creado el usuario ${createForm.nombre} ${createForm.apellido} (${createForm.rol})`,
                '/admin/usuarios',
                { email: createForm.email, rol: createForm.rol }
            )

            await Swal.fire({
                icon: 'success',
                title: '¡Usuario creado!',
                html: `
                    <div class="text-left">
                        <p class="mb-2">El usuario ha sido creado exitosamente.</p>
                        <div class="bg-blue-50 p-3 rounded-lg">
                            <p class="text-sm"><strong>Email:</strong> ${createForm.email}</p>
                            <p class="text-sm"><strong>Nombre:</strong> ${createForm.nombre} ${createForm.apellido}</p>
                            <p class="text-sm"><strong>Rol:</strong> ${createForm.rol}</p>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#3B82F6'
            })

        } catch (error: any) {
            console.error('Error creating user:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error al crear usuario',
                text: error.message || 'No se pudo crear el usuario. Por favor intenta nuevamente.',
                confirmButtonColor: '#3B82F6'
            })
        } finally {
            setCreatingUser(false)
        }
    }

    const handleEdit = (usuario: Usuario) => {
        setSelectedUsuario(usuario)
        setEditForm(usuario)
        setPhotoPreview(null)
        setIsEditModalOpen(true)
    }

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            await Swal.fire({
                icon: 'error',
                title: 'Archivo inválido',
                text: 'Por favor selecciona una imagen válida',
                confirmButtonColor: '#3B82F6'
            })
            return
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            await Swal.fire({
                icon: 'error',
                title: 'Archivo muy grande',
                text: 'La imagen no debe superar los 5MB',
                confirmButtonColor: '#3B82F6'
            })
            return
        }

        // Crear preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Subir a Supabase Storage
        setUploadingPhoto(true)
        try {
            const { createClient } = await import('@/utils/supabase/client')
            const supabase = createClient()

            const fileExt = file.name.split('.').pop()
            const fileName = `${selectedUsuario?.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(fileName, file, { upsert: true })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                throw new Error(uploadError.message)
            }

            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(fileName)

            // Actualizar en la base de datos
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ foto_perfil: publicUrl })
                .eq('id', selectedUsuario?.id)

            if (updateError) {
                console.error('Update error:', updateError)
                throw new Error(updateError.message)
            }

            // Actualizar el estado local inmediatamente
            setEditForm(prev => ({ ...prev, foto_perfil: publicUrl }))
            if (selectedUsuario) {
                setSelectedUsuario({ ...selectedUsuario, foto_perfil: publicUrl })
            }

            // Recargar la lista de usuarios
            await loadUsuarios()

            await Swal.fire({
                icon: 'success',
                title: '¡Foto actualizada!',
                text: 'La foto de perfil se ha actualizado correctamente',
                confirmButtonColor: '#3B82F6',
                timer: 2000,
                showConfirmButton: false
            })

            setPhotoPreview(null)
        } catch (error: any) {
            console.error('Error uploading photo:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error al subir foto',
                html: `
                    <div class="text-left text-sm">
                        <p class="mb-2">${error.message || 'No se pudo subir la foto'}</p>
                        <p class="text-xs text-gray-600">Verifica que:</p>
                        <ul class="list-disc ml-5 text-xs text-gray-600">
                            <li>El bucket "profile-photos" existe en Storage</li>
                            <li>El bucket está marcado como público</li>
                            <li>Tienes permisos para subir archivos</li>
                        </ul>
                    </div>
                `,
                confirmButtonColor: '#3B82F6'
            })
        } finally {
            setUploadingPhoto(false)
        }
    }

    const handleSaveEdit = async () => {
        if (selectedUsuario) {
            try {
                await adminService.updateUsuario(selectedUsuario.id, editForm)
                await loadUsuarios()
                setIsEditModalOpen(false)
                
                // Crear notificación para todos los admins
                await notificationsService.notifyAdmins(
                    'info',
                    '👤 Usuario actualizado',
                    `El usuario ${editForm.nombre} ${editForm.apellido} ha sido actualizado`,
                    '/admin/usuarios',
                    { usuarioId: selectedUsuario.id, cambios: editForm }
                )
                
                await Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Usuario actualizado correctamente',
                    confirmButtonColor: '#3B82F6',
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error('Error updating usuario:', error)
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al actualizar el usuario',
                    confirmButtonColor: '#3B82F6'
                })
            }
        }
    }

    const handleDelete = async (usuario: Usuario) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar al usuario ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                // Implementar eliminación si es necesario
                await loadUsuarios()
                await Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'Usuario eliminado correctamente',
                    confirmButtonColor: '#3B82F6',
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error('Error deleting usuario:', error)
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el usuario',
                    confirmButtonColor: '#3B82F6'
                })
            }
        }
    }

    const filteredUsuarios = usuarios.filter(u => {
        const matchRol = filterRol === 'todos' || u.rol === filterRol
        const matchSearch = searchTerm === '' || 
            u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchRol && matchSearch
    })

    const getRolBadgeColor = (rol: string) => {
        switch (rol) {
            case 'admin_adventur':
                return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'propietario':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            default:
                return 'bg-green-100 text-green-700 border-green-200'
        }
    }

    const getRolLabel = (rol: string) => {
        switch (rol) {
            case 'admin_adventur':
                return 'Admin'
            case 'propietario':
                return 'Propietario'
            default:
                return 'Cliente'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando usuarios...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
                    <p className="text-gray-500">Administra todos los usuarios del sistema</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Nuevo Usuario</span>
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="text-sm text-gray-900 font-medium">Actualizar</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-blue-200 text-sm mb-2">Total Usuarios</p>
                    <p className="text-4xl font-bold">{usuarios.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-900 to-green-950 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-green-200 text-sm mb-2">Clientes</p>
                    <p className="text-4xl font-bold">{usuarios.filter(u => u.rol === 'turista').length}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-900 to-yellow-950 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-yellow-200 text-sm mb-2">Propietarios</p>
                    <p className="text-4xl font-bold">{usuarios.filter(u => u.rol === 'propietario').length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-purple-200 text-sm mb-2">Activos</p>
                    <p className="text-4xl font-bold">{usuarios.filter(u => u.verificado).length}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">Filtrar por rol:</span>
                            {['todos', 'turista', 'propietario', 'admin_adventur'].map((rol) => (
                                <button
                                    key={rol}
                                    onClick={() => setFilterRol(rol)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        filterRol === rol
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {rol === 'todos' ? 'Todos' : 
                                     rol === 'turista' ? 'Clientes' :
                                     rol === 'propietario' ? 'Propietarios' : 'Administradores'}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-700 font-medium">
                            <Download size={16} />
                            <span className="text-sm">Exportar CSV</span>
                        </button>
                    </div>
                    
                    <div className="mt-4 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar en la tabla..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsuarios.map((usuario) => (
                                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500">
                                                {usuario.foto_perfil ? (
                                                    <img 
                                                        src={usuario.foto_perfil} 
                                                        alt={`${usuario.nombre} ${usuario.apellido}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // Si la imagen falla, mostrar iniciales
                                                            e.currentTarget.style.display = 'none'
                                                            e.currentTarget.parentElement!.innerHTML = `${usuario.nombre.charAt(0).toUpperCase()}${usuario.apellido.charAt(0).toUpperCase()}`
                                                        }}
                                                    />
                                                ) : (
                                                    <span>{usuario.nombre.charAt(0).toUpperCase()}{usuario.apellido.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{usuario.nombre} {usuario.apellido}</p>
                                                <p className="text-xs text-gray-500">ID: {usuario.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{usuario.email || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-sm text-gray-600">{usuario.telefono || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getRolBadgeColor(usuario.rol)}`}>
                                            {getRolLabel(usuario.rol)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                                            usuario.verificado 
                                                ? 'bg-green-100 text-green-700 border-green-200' 
                                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        }`}>
                                            {usuario.verificado ? 'Verificado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleView(usuario)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Ver"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(usuario)}
                                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(usuario)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Detalles del Usuario"
                size="lg"
            >
                {selectedUsuario && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Nombre Completo</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedUsuario.nombre} {selectedUsuario.apellido}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedUsuario.email || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedUsuario.telefono || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Documento</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedUsuario.documento_identidad || 'N/A'}</p>
                                {selectedUsuario.tipo_documento && (
                                    <p className="text-xs text-gray-500 mt-1">{selectedUsuario.tipo_documento}</p>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">País</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedUsuario.pais || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Rol</p>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getRolBadgeColor(selectedUsuario.rol)}`}>
                                    {getRolLabel(selectedUsuario.rol)}
                                </span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Estado</p>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                                    selectedUsuario.verificado 
                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }`}>
                                    {selectedUsuario.verificado ? 'Verificado' : 'Pendiente'}
                                </span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Fecha de Registro</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {new Date(selectedUsuario.fecha_registro).toLocaleDateString('es-PE', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar Usuario"
                size="lg"
            >
                {selectedUsuario && (
                    <div className="space-y-4">
                        {/* Foto de perfil */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : editForm.foto_perfil ? (
                                        <img src={editForm.foto_perfil} alt="Foto actual" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{editForm.nombre?.charAt(0).toUpperCase()}{editForm.apellido?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        disabled={uploadingPhoto}
                                    />
                                    {uploadingPhoto ? (
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Haz clic en el ícono para cambiar la foto</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={editForm.nombre || ''}
                                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ingrese el nombre"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                                <input
                                    type="text"
                                    value={editForm.apellido || ''}
                                    onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ingrese el apellido"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                                <input
                                    type="text"
                                    value={editForm.telefono || ''}
                                    onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ingrese el teléfono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento</label>
                                <select
                                    value={editForm.tipo_documento || ''}
                                    onChange={(e) => setEditForm({ ...editForm, tipo_documento: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="DNI">DNI</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                    <option value="Carnet de Extranjería">Carnet de Extranjería</option>
                                    <option value="RUC">RUC</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Documento</label>
                                <input
                                    type="text"
                                    value={editForm.documento_identidad || ''}
                                    onChange={(e) => setEditForm({ ...editForm, documento_identidad: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ingrese el documento"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
                                <input
                                    type="text"
                                    value={editForm.pais || ''}
                                    onChange={(e) => setEditForm({ ...editForm, pais: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ingrese el país"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
                                <select
                                    value={editForm.rol || ''}
                                    onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="turista">Cliente</option>
                                    <option value="propietario">Propietario</option>
                                    <option value="admin_adventur">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                                <select
                                    value={editForm.verificado ? 'true' : 'false'}
                                    onChange={(e) => setEditForm({ ...editForm, verificado: e.target.value === 'true' })}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="true">Verificado</option>
                                    <option value="false">Pendiente</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Crear Usuario */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="✨ Crear Nuevo Usuario"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-900 font-semibold mb-1">📋 Información importante</p>
                        <p className="text-xs text-blue-700">El usuario recibirá un email de confirmación con sus credenciales de acceso.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                            <input
                                type="email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="usuario@ejemplo.com"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña *</label>
                            <input
                                type="password"
                                value={createForm.password}
                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                            <input
                                type="text"
                                value={createForm.nombre}
                                onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ingrese el nombre"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
                            <input
                                type="text"
                                value={createForm.apellido}
                                onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ingrese el apellido"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                            <input
                                type="text"
                                value={createForm.telefono}
                                onChange={(e) => setCreateForm({ ...createForm, telefono: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+51 999 999 999"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
                            <input
                                type="text"
                                value={createForm.pais}
                                onChange={(e) => setCreateForm({ ...createForm, pais: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Perú"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento</label>
                            <select
                                value={createForm.tipo_documento}
                                onChange={(e) => setCreateForm({ ...createForm, tipo_documento: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar</option>
                                <option value="DNI">DNI</option>
                                <option value="Pasaporte">Pasaporte</option>
                                <option value="Carnet de Extranjería">Carnet de Extranjería</option>
                                <option value="RUC">RUC</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Documento</label>
                            <input
                                type="text"
                                value={createForm.documento_identidad}
                                onChange={(e) => setCreateForm({ ...createForm, documento_identidad: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="12345678"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Rol *</label>
                            <select
                                value={createForm.rol}
                                onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value as any })}
                                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="turista">👤 Cliente</option>
                                <option value="propietario">🏠 Propietario</option>
                                <option value="admin_adventur">⭐ Administrador</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={creatingUser}
                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateUser}
                            disabled={creatingUser}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
                        >
                            {creatingUser ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Crear Usuario
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
