'use client'

import { useState } from 'react'
import { Modal } from '@/components/admin/Modal'
import { LogOut } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AlertService } from '@/lib/ui/alert.service'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { profile, updateProfile, signOut } = useAdminAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    nombre: profile?.nombre || '',
    apellido: profile?.apellido || '',
    email: profile?.email || '',
  })

  const getInitials = (): string => {
    if (!profile?.nombre) return '?'
    return profile.nombre.charAt(0).toUpperCase()
  }

  const startEditing = () => {
    setEditForm({
      nombre: profile?.nombre || '',
      apellido: profile?.apellido || '',
      email: profile?.email || '',
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({
      nombre: profile?.nombre || '',
      apellido: profile?.apellido || '',
      email: profile?.email || '',
    })
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      setSaving(true)
      const success = await updateProfile(editForm)

      if (success) {
        await AlertService.success('¡Actualizado!', 'Perfil actualizado correctamente')
        setIsEditing(false)
        onClose()
      } else {
        await AlertService.error('Error', 'Error al actualizar el perfil')
      }
    } catch (error) {
      console.error('Error:', error)
      await AlertService.error('Error', 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    const confirmed = await AlertService.confirmDanger({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar sesión?',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    })

    if (confirmed) {
      await signOut()
    }
  }

  if (!profile) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        cancelEditing()
      }}
      title="Mi Perfil"
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
          <div className="relative group">
            {profile.foto_perfil ? (
              <img 
                src={profile.foto_perfil} 
                alt="Profile" 
                width={120}
                height={120}
                className="w-30 h-30 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="w-30 h-30 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-100">
                {getInitials()}
              </div>
            )}
          </div>
          {!isEditing && (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">{profile.nombre} {profile.apellido}</h3>
              <p className="text-sm text-gray-500 capitalize">{profile.rol}</p>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                <input
                  type="text"
                  value={editForm.apellido}
                  onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium">Nombre Completo</p>
                <p className="text-sm font-semibold text-gray-900">{profile.nombre} {profile.apellido}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium">Email</p>
                <p className="text-sm font-semibold text-gray-900">{profile.email}</p>
              </div>
              <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium">Rol</p>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 capitalize">
                  {profile.rol}
                </span>
              </div>
            </div>
            <div className="flex justify-between pt-4 gap-3">
              <button
                onClick={handleSignOut}
                className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all font-semibold flex items-center gap-2"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </button>
              <button
                onClick={startEditing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
