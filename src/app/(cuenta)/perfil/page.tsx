'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useNotificacion'
import { User, Mail, Phone, MapPin, Calendar, Globe, Lock, Shield, Camera, Award, Star, TrendingUp } from 'lucide-react'
import Swal from 'sweetalert2'

export const dynamic = 'force-dynamic'

interface UserProfile {
    id: string
    email: string
    nombre: string
    apellido: string
    telefono?: string
    direccion?: string
    ciudad?: string
    pais?: string
    fecha_nacimiento?: string
    foto_perfil?: string
}

interface UserStats {
    reservas: number
    puntos: number
    nivel: number
}

export default function PerfilPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [activeTab, setActiveTab] = useState<'personal' | 'seguridad'>('personal')
    const [stats, setStats] = useState<UserStats>({ reservas: 0, puntos: 0, nivel: 0 })
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        pais: '',
        fecha_nacimiento: ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const supabase = createClient()
    const router = useRouter()
    const { success, error } = useToast()

    useEffect(() => {
        loadProfile()
    }, [])

    // Detectar cambios no guardados
    useEffect(() => {
        if (!profile) return
        
        const hasChanges = 
            formData.nombre !== (profile.nombre || '') ||
            formData.apellido !== (profile.apellido || '') ||
            formData.telefono !== (profile.telefono || '') ||
            formData.direccion !== (profile.direccion || '') ||
            formData.ciudad !== (profile.ciudad || '') ||
            formData.pais !== (profile.pais || '') ||
            formData.fecha_nacimiento !== (profile.fecha_nacimiento || '')
        
        setHasUnsavedChanges(hasChanges)
    }, [formData, profile])

    // Advertir antes de salir con cambios no guardados
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    const loadStats = async (userId: string) => {
        try {
            const { data: reservas } = await supabase
                .from('reservas')
                .select('id, total')
                .eq('usuario_id', userId)
                .eq('estado', 'completada')

            const totalReservas = reservas?.length || 0
            const puntos = Math.floor(reservas?.reduce((sum, r) => sum + (r.total * 0.1), 0) || 0)
            const nivel = Math.floor(puntos / 100)

            setStats({ reservas: totalReservas, puntos, nivel })
        } catch (err) {
            console.error('Error loading stats:', err)
        }
    }

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                router.push('/login')
                return
            }

            const { data, error: fetchError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', user.id)
                .maybeSingle()

            if (fetchError) {
                console.error('Error fetching profile:', fetchError)
                throw fetchError
            }

            // Si no existe el usuario en la tabla, crear uno básico
            if (!data) {
                console.log('Usuario no encontrado en tabla, creando registro...')
                const { data: newUser, error: insertError } = await supabase
                    .from('usuarios')
                    .insert({
                        id: user.id,
                        email: user.email || '',
                        nombre: user.user_metadata?.nombre || 'Usuario',
                        apellido: user.user_metadata?.apellido || 'Nuevo'
                    })
                    .select()
                    .single()

                if (insertError) {
                    console.error('Error creating user:', insertError)
                    error('Error al crear el perfil. Por favor, contacta al administrador.')
                    return
                }

                setProfile(newUser)
                setFormData({
                    nombre: newUser.nombre || '',
                    apellido: newUser.apellido || '',
                    telefono: newUser.telefono || '',
                    direccion: newUser.direccion || '',
                    ciudad: newUser.ciudad || '',
                    pais: newUser.pais || '',
                    fecha_nacimiento: newUser.fecha_nacimiento || ''
                })
            } else {
                setProfile(data)
                setFormData({
                    nombre: data.nombre || '',
                    apellido: data.apellido || '',
                    telefono: data.telefono || '',
                    direccion: data.direccion || '',
                    ciudad: data.ciudad || '',
                    pais: data.pais || '',
                    fecha_nacimiento: data.fecha_nacimiento || ''
                })
            }

            // Cargar estadísticas
            await loadStats(user.id)
        } catch (err: any) {
            console.error('Error loading profile:', err)
            if (err.code === 'PGRST116') {
                error('Usuario no encontrado en la base de datos')
            } else {
                error(`Error al cargar el perfil: ${err.message || 'Error desconocido'}`)
            }
        } finally {
            setLoading(false)
        }
    }

    // Validaciones
    const validatePhone = (phone: string): boolean => {
        if (!phone) return true // Opcional
        const phoneRegex = /^\+?[\d\s-()]+$/
        const digitsOnly = phone.replace(/\D/g, '')
        return phoneRegex.test(phone) && digitsOnly.length >= 9
    }

    const validateBirthdate = (date: string): boolean => {
        if (!date) return true // Opcional
        const birthDate = new Date(date)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        
        if (age < 18) {
            error('Debes ser mayor de 18 años')
            return false
        }
        if (birthDate > today) {
            error('La fecha de nacimiento no puede ser futura')
            return false
        }
        return true
    }

    const calculateProfileCompletion = (): number => {
        const fields = [
            formData.nombre,
            formData.apellido,
            formData.telefono,
            formData.direccion,
            formData.ciudad,
            formData.pais,
            formData.fecha_nacimiento,
            profile?.foto_perfil
        ]
        const completed = fields.filter(f => f && f.length > 0).length
        return Math.round((completed / fields.length) * 100)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
    }

    const handlePhotoClick = () => {
        fileInputRef.current?.click()
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            error('Por favor selecciona una imagen válida')
            return
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            error('La imagen no debe superar los 5MB')
            return
        }

        setUploadingPhoto(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Subir archivo
            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(filePath)

            // Actualizar perfil
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ foto_perfil: publicUrl })
                .eq('id', user.id)

            if (updateError) throw updateError

            success('Foto de perfil actualizada correctamente')
            await loadProfile()
        } catch (err: any) {
            console.error('Error uploading photo:', err)
            error(`Error al subir la foto: ${err.message}`)
        } finally {
            setUploadingPhoto(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Validaciones
        if (!validatePhone(formData.telefono)) {
            error('Formato de teléfono inválido. Debe tener al menos 9 dígitos')
            return
        }

        if (!validateBirthdate(formData.fecha_nacimiento)) {
            return
        }

        // Confirmación
        const result = await Swal.fire({
            title: '¿Guardar cambios?',
            text: 'Se actualizará tu información personal',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) return

        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            const { error: updateError } = await supabase
                .from('usuarios')
                .update(formData)
                .eq('id', user.id)

            if (updateError) throw updateError

            success('Perfil actualizado correctamente')
            setHasUnsavedChanges(false)
            await loadProfile()
        } catch (err: any) {
            console.error('Error updating profile:', err)
            if (err.code === '23505') {
                error('Ya existe un usuario con estos datos')
            } else {
                error(`Error al actualizar el perfil: ${err.message}`)
            }
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            error('Las contraseñas no coinciden')
            return
        }

        if (passwordData.newPassword.length < 6) {
            error('La contraseña debe tener al menos 6 caracteres')
            return
        }

        // Confirmación
        const result = await Swal.fire({
            title: '¿Cambiar contraseña?',
            text: 'Tu contraseña será actualizada',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) return

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            })

            if (updateError) throw updateError

            await Swal.fire({
                icon: 'success',
                title: '¡Contraseña actualizada!',
                text: 'Tu contraseña ha sido cambiada correctamente',
                confirmButtonColor: '#DC2626'
            })

            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err: any) {
            console.error('Error updating password:', err)
            error(`Error al actualizar la contraseña: ${err.message}`)
        }
    }

    // Calcular fortaleza de contraseña
    const getPasswordStrength = (password: string) => {
        let strength = 0
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        }
        
        if (checks.length) strength += 20
        if (checks.uppercase) strength += 20
        if (checks.lowercase) strength += 20
        if (checks.number) strength += 20
        if (checks.special) strength += 20
        
        return { strength, checks }
    }

    const passwordStrength = getPasswordStrength(passwordData.newPassword)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-red-200 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Cargando perfil...</p>
                    <p className="text-sm text-gray-500">Por favor espera un momento</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-6 lg:px-8 py-6">
            {/* Header mejorado y responsive */}
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden shadow-2xl">
                {/* Elementos decorativos */}
                <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-red-900/30 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 animate-fadeInUp">Mi Perfil</h1>
                            <p className="text-sm sm:text-base text-red-100 animate-fadeInUp animation-delay-100">Administra tu información personal</p>
                        </div>
                        <div className="flex sm:hidden items-center gap-3 w-full">
                            <div className="flex-1 text-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <div className="text-xl font-bold">0</div>
                                <div className="text-xs text-red-100">Reservas</div>
                            </div>
                            <div className="flex-1 text-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <div className="text-xl font-bold">0</div>
                                <div className="text-xs text-red-100">Puntos</div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <div className="text-2xl font-bold">{stats.reservas}</div>
                                <div className="text-xs text-red-100">Reservas</div>
                            </div>
                            <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <div className="text-2xl font-bold">{stats.puntos}</div>
                                <div className="text-xs text-red-100">Puntos</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Barra de progreso del perfil */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-semibold">Completitud del perfil</span>
                            <span className="text-xs sm:text-sm font-bold">{calculateProfileCompletion()}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white rounded-full transition-all duration-500" 
                                style={{ width: `${calculateProfileCompletion()}%` }} 
                            />
                        </div>
                        <p className="text-xs text-red-100 mt-2">
                            {calculateProfileCompletion() === 100 
                                ? '¡Perfil completo! 🎉' 
                                : 'Completa tu perfil para obtener mejores recomendaciones'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs mejorados y responsive */}
            <div className="mb-6 sm:mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 sm:p-2">
                    <div className="flex gap-1.5 sm:gap-2">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                                activeTab === 'personal'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Información Personal</span>
                            <span className="sm:hidden">Personal</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('seguridad')}
                            className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                                activeTab === 'seguridad'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Seguridad</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 animate-fadeInUp">
                    {/* Avatar y header mejorado y responsive */}
                    <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10 pb-6 sm:pb-8 lg:pb-10 border-b border-gray-100">
                        <div className="relative group">
                            {profile?.foto_perfil ? (
                                <img
                                    src={profile.foto_perfil}
                                    alt="Foto de perfil"
                                    className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-3xl object-cover shadow-2xl transform group-hover:scale-105 transition-all duration-300"
                                />
                            ) : (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                                    {formData.nombre.charAt(0)}{formData.apellido.charAt(0)}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                            <button
                                onClick={handlePhotoClick}
                                disabled={uploadingPhoto}
                                className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100 hover:bg-red-600 hover:text-white transition-all duration-300 group-hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Cambiar foto de perfil"
                            >
                                {uploadingPhoto ? (
                                    <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </button>
                        </div>
                        
                        <div className="flex-1 text-center w-full">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                {formData.nombre} {formData.apellido}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 mb-3 flex items-center gap-2 justify-center flex-wrap">
                                <Mail className="w-4 h-4" />
                                <span className="break-all">{profile?.email}</span>
                            </p>
                            <div className="flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
                                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-700 text-xs sm:text-sm font-bold rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Cuenta Activa
                                </span>
                                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold rounded-full">
                                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Miembro
                                </span>
                            </div>
                        </div>
                        
                        {/* Estadísticas responsive */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
                            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">{stats.reservas}</div>
                                <div className="text-[10px] sm:text-xs text-blue-700">Reservas</div>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">{stats.puntos}</div>
                                <div className="text-[10px] sm:text-xs text-purple-700">Puntos</div>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">{stats.nivel}</div>
                                <div className="text-[10px] sm:text-xs text-green-700">Nivel</div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                                Información Básica
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-red-600" />
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400 bg-white text-gray-900 text-base placeholder:text-gray-400"
                                        placeholder="Ingresa tu nombre"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-red-600" />
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400 bg-white text-gray-900 text-base placeholder:text-gray-400"
                                        placeholder="Ingresa tu apellido"
                                    />
                                </div>

                                <div className="group sm:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-red-600" />
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={profile?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed text-base"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        El email no se puede cambiar
                                    </p>
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-red-600" />
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400 bg-white text-gray-900 text-base placeholder:text-gray-400"
                                        placeholder="+51 999 999 999"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-red-600" />
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        name="fecha_nacimiento"
                                        value={formData.fecha_nacimiento}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400 bg-white text-gray-900 text-base"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                                Ubicación
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-600" />
                                        Ciudad
                                    </label>
                                    <input
                                        type="text"
                                        name="ciudad"
                                        value={formData.ciudad}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400 bg-white text-gray-900 text-base placeholder:text-gray-400"
                                        placeholder="Lima"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-red-600" />
                                        País
                                    </label>
                                    <input
                                        type="text"
                                        name="pais"
                                        value={formData.pais}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400 bg-white text-gray-900 text-base placeholder:text-gray-400"
                                        placeholder="Perú"
                                    />
                                </div>

                                <div className="sm:col-span-2 group">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-600" />
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400 bg-white text-gray-900 text-base placeholder:text-gray-400"
                                        placeholder="Av. Principal 123"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={saving || !hasUnsavedChanges}
                                className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-2xl hover:shadow-red-600/30 transform hover:-translate-y-0.5 text-sm sm:text-base relative"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {hasUnsavedChanges ? 'Guardar cambios' : 'Sin cambios'}
                                    </>
                                )}
                                {hasUnsavedChanges && !saving && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (hasUnsavedChanges) {
                                        Swal.fire({
                                            title: '¿Descartar cambios?',
                                            text: 'Los cambios no guardados se perderán',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#DC2626',
                                            cancelButtonColor: '#6B7280',
                                            confirmButtonText: 'Sí, descartar',
                                            cancelButtonText: 'Cancelar'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                loadProfile()
                                            }
                                        })
                                    } else {
                                        loadProfile()
                                    }
                                }}
                                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm sm:text-base"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'seguridad' && (
                <div className="space-y-4 sm:space-y-6 animate-fadeInUp">
                    {/* Cambiar Contraseña */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
                        <div className="flex items-start gap-3 mb-6 sm:mb-8">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Cambiar Contraseña</h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">Actualiza tu contraseña para mantener tu cuenta segura</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 sm:space-y-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-red-600" />
                                    Nueva Contraseña *
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400 bg-white text-gray-900 text-base placeholder:text-gray-400"
                                    placeholder="Ingresa tu nueva contraseña"
                                />
                                
                                {/* Indicador de fortaleza */}
                                {passwordData.newPassword && (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-700">Fortaleza de la contraseña</span>
                                            <span className={`text-sm font-bold ${
                                                passwordStrength.strength >= 80 ? 'text-green-600' :
                                                passwordStrength.strength >= 60 ? 'text-blue-600' :
                                                passwordStrength.strength >= 40 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                                {passwordStrength.strength >= 80 ? 'Muy Fuerte' :
                                                 passwordStrength.strength >= 60 ? 'Fuerte' :
                                                 passwordStrength.strength >= 40 ? 'Media' :
                                                 'Débil'}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 rounded-full ${
                                                    passwordStrength.strength >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                                    passwordStrength.strength >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                                    passwordStrength.strength >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                                    'bg-gradient-to-r from-red-500 to-red-600'
                                                }`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            />
                                        </div>
                                        
                                        {/* Checklist de requisitos */}
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            <div className={`flex items-center gap-2 text-sm ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${passwordStrength.checks.length ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    {passwordStrength.checks.length ? '✓' : '○'}
                                                </div>
                                                <span>8+ caracteres</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${passwordStrength.checks.uppercase ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    {passwordStrength.checks.uppercase ? '✓' : '○'}
                                                </div>
                                                <span>Mayúsculas</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${passwordStrength.checks.lowercase ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    {passwordStrength.checks.lowercase ? '✓' : '○'}
                                                </div>
                                                <span>Minúsculas</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${passwordStrength.checks.number ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    {passwordStrength.checks.number ? '✓' : '○'}
                                                </div>
                                                <span>Números</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${passwordStrength.checks.special ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    {passwordStrength.checks.special ? '✓' : '○'}
                                                </div>
                                                <span>Caracteres especiales</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-red-600" />
                                    Confirmar Nueva Contraseña *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400 bg-white text-gray-900 text-base placeholder:text-gray-400"
                                    placeholder="Repite tu nueva contraseña"
                                />
                                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Las contraseñas no coinciden
                                    </p>
                                )}
                                {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Las contraseñas coinciden
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-2xl hover:shadow-blue-600/30 transform hover:-translate-y-0.5 text-sm sm:text-base"
                            >
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                                Actualizar Contraseña
                            </button>
                        </form>
                    </div>

                    {/* Información de Seguridad */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-4 sm:p-6 lg:p-8">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-green-900 mb-2">Consejos de Seguridad</h3>
                                <ul className="space-y-2 text-xs sm:text-sm text-green-800">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>Usa una contraseña única que no uses en otros sitios</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>Combina letras mayúsculas, minúsculas, números y símbolos</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>Evita información personal como nombres o fechas</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>Cambia tu contraseña regularmente</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Zona de Peligro */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg border-2 border-red-200 p-4 sm:p-6 lg:p-8">
                        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-2">Zona de Peligro</h3>
                                <p className="text-xs sm:text-sm text-red-700 mb-4 sm:mb-6">
                                    Las siguientes acciones son permanentes y no se pueden deshacer. Por favor, procede con precaución.
                                </p>
                                
                                <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-red-200">
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Eliminar Cuenta</h4>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                Una vez que elimines tu cuenta, no hay vuelta atrás. Todos tus datos, reservas e información personal serán eliminados permanentemente.
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                                                    error('Funcionalidad de eliminación de cuenta no implementada')
                                                }
                                            }}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all text-xs sm:text-sm whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            Eliminar Cuenta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
