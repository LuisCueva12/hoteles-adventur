'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'

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
}

export default function PerfilPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [activeTab, setActiveTab] = useState<'personal' | 'seguridad'>('personal')
    
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
                .single()

            if (fetchError) throw fetchError

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
        } catch (err) {
            console.error('Error loading profile:', err)
            error('Error al cargar el perfil')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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
            loadProfile()
        } catch (err) {
            console.error('Error updating profile:', err)
            error('Error al actualizar el perfil')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            error('Las contraseñas no coinciden')
            return
        }

        if (passwordData.newPassword.length < 6) {
            error('La contraseña debe tener al menos 6 caracteres')
            return
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            })

            if (updateError) throw updateError

            success('Contraseña actualizada correctamente')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            console.error('Error updating password:', err)
            error('Error al actualizar la contraseña')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
                <p className="text-gray-600">Administra tu información personal y configuración de cuenta</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'personal'
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Información Personal
                    </button>
                    <button
                        onClick={() => setActiveTab('seguridad')}
                        className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'seguridad'
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Seguridad
                    </button>
                </div>
            </div>

            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {formData.nombre.charAt(0)}{formData.apellido.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {formData.nombre} {formData.apellido}
                            </h2>
                            <p className="text-gray-600">{profile?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Cuenta Activa
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Apellido *
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={profile?.email || ''}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="+51 999 999 999"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fecha de Nacimiento
                                </label>
                                <input
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ciudad
                                </label>
                                <input
                                    type="text"
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="Lima"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    País
                                </label>
                                <input
                                    type="text"
                                    name="pais"
                                    value={formData.pais}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="Perú"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="Av. Principal 123"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                                        Guardar cambios
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={loadProfile}
                                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'seguridad' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Cambiar Contraseña</h3>
                        
                        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirmar Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="Repite la contraseña"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Actualizar Contraseña
                            </button>
                        </form>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Zona de Peligro
                        </h3>
                        <p className="text-sm text-red-700 mb-4">
                            Las siguientes acciones son permanentes y no se pueden deshacer.
                        </p>
                        <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm">
                            Eliminar Cuenta
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
