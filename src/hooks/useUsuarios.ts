'use client'

import { useState } from 'react'
import { dashboardService } from '@/services/dashboard.service'

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
}

export interface UsuarioForm {
  nombre: string
  apellido: string
  email: string
  telefono: string
  documento_identidad: string
  tipo_documento: string
  pais: string
  rol: string
  verificado: boolean
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getUsuarios()
      setUsuarios(data || [])
    } catch (error) {
      console.error('Error loading usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUsuarios = async () => {
    setIsRefreshing(true)
    await loadUsuarios()
    setIsRefreshing(false)
  }

  const createUsuario = async (formData: UsuarioForm) => {
    try {
      setSaving(true)
      await dashboardService.createUsuario(formData)
      await loadUsuarios()
      setIsModalOpen(false)
      return { success: true }
    } catch (error) {
      console.error('Error creating usuario:', error)
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  const updateUsuario = async (id: string, formData: Partial<UsuarioForm>) => {
    try {
      setSaving(true)
      await dashboardService.updateUsuario(id, formData)
      await loadUsuarios()
      setIsEditModalOpen(false)
      setSelectedUsuario(null)
      return { success: true }
    } catch (error) {
      console.error('Error updating usuario:', error)
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  const deleteUsuario = async (id: string) => {
    try {
      setSaving(true)
      await dashboardService.deleteUsuario(id)
      await loadUsuarios()
      return { success: true }
    } catch (error) {
      console.error('Error deleting usuario:', error)
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  const toggleVerificado = async (usuario: Usuario) => {
    try {
      await dashboardService.updateUsuario(usuario.id, { verificado: !usuario.verificado })
      await loadUsuarios()
      return { success: true }
    } catch (error) {
      console.error('Error toggling verificado:', error)
      return { success: false, error }
    }
  }

  const openCreateModal = () => {
    setSelectedUsuario(null)
    setIsModalOpen(true)
  }

  const openEditModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setIsEditModalOpen(true)
  }

  const closeModals = () => {
    setIsModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedUsuario(null)
  }

  return {
    usuarios,
    loading,
    isRefreshing,
    isModalOpen,
    isEditModalOpen,
    selectedUsuario,
    saving,
    loadUsuarios,
    refreshUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    toggleVerificado,
    openCreateModal,
    openEditModal,
    closeModals
  }
}
