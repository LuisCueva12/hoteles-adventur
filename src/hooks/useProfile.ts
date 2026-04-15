'use client'

import { useState } from 'react'
import { uploadProfilePhoto, validateProfilePhotoFile } from '@/utils/supabase/profilePhotos'
import Swal from 'sweetalert2'
import type { UserProfile } from '@/services/auth.service'

export function useProfile(initialProfile: UserProfile) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(initialProfile)
  const [saving, setSaving] = useState(false)

  const startEditing = (): void => {
    setEditForm(initialProfile)
    setIsEditing(true)
  }

  const cancelEditing = (): void => {
    setEditForm(initialProfile)
    setIsEditing(false)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileError = validateProfilePhotoFile(file)
    if (fileError) {
      await Swal.fire({
        icon: 'error',
        title: 'Archivo inválido',
        text: fileError,
        confirmButtonColor: '#3B82F6'
      })
      e.target.value = ''
      return
    }

    // Esta función será manejada por el componente que tiene acceso a Supabase
    // Por ahora solo validamos el archivo
    e.target.value = ''
  }

  const getInitials = (): string => {
    if (!initialProfile.nombre) return '?'
    return initialProfile.nombre.charAt(0).toUpperCase()
  }

  return {
    isEditing,
    editForm,
    saving,
    setSaving,
    startEditing,
    cancelEditing,
    handlePhotoUpload,
    getInitials,
    setEditForm
  }
}
