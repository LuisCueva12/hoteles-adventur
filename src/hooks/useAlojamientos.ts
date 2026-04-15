'use client'

import { useState } from 'react'
import { dashboardService } from '@/services/dashboard.service'

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

export interface AlojamientoForm {
  nombre: string
  descripcion: string
  direccion: string
  departamento: string
  provincia: string
  distrito: string
  categoria: string
  tipo: string
  precio_base: number
  capacidad_maxima: number
  servicios_incluidos: string[]
  activo: boolean
}

export function useAlojamientos() {
  const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAlojamiento, setSelectedAlojamiento] = useState<Alojamiento | null>(null)
  const [saving, setSaving] = useState(false)

  const loadAlojamientos = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getAlojamientos()
      setAlojamientos(data || [])
    } catch (error) {
      console.error('Error loading alojamientos:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshAlojamientos = async () => {
    setIsRefreshing(true)
    await loadAlojamientos()
    setIsRefreshing(false)
  }

  const createAlojamiento = async (formData: AlojamientoForm) => {
    try {
      setSaving(true)
      await dashboardService.createAlojamiento(formData)
      await loadAlojamientos()
      setIsModalOpen(false)
      return { success: true }
    } catch (error) {
      console.error('Error creating alojamiento:', error)
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  const updateAlojamiento = async (id: string, formData: Partial<AlojamientoForm>) => {
    try {
      setSaving(true)
      await dashboardService.updateAlojamiento(id, formData)
      await loadAlojamientos()
      setIsEditModalOpen(false)
      setSelectedAlojamiento(null)
      return { success: true }
    } catch (error) {
      console.error('Error updating alojamiento:', error)
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  const deleteAlojamiento = async (id: string) => {
    try {
      setSaving(true)
      await dashboardService.deleteAlojamiento(id)
      await loadAlojamientos()
      return { success: true }
    } catch (error) {
      console.error('Error deleting alojamiento:', error)
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (alojamiento: Alojamiento) => {
    try {
      await dashboardService.updateAlojamiento(alojamiento.id, { activo: !alojamiento.activo })
      await loadAlojamientos()
      return { success: true }
    } catch (error) {
      console.error('Error toggling activo:', error)
      return { success: false, error }
    }
  }

  const openCreateModal = () => {
    setSelectedAlojamiento(null)
    setIsModalOpen(true)
  }

  const openEditModal = (alojamiento: Alojamiento) => {
    setSelectedAlojamiento(alojamiento)
    setIsEditModalOpen(true)
  }

  const closeModals = () => {
    setIsModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedAlojamiento(null)
  }

  return {
    alojamientos,
    loading,
    isRefreshing,
    isModalOpen,
    isEditModalOpen,
    selectedAlojamiento,
    saving,
    loadAlojamientos,
    refreshAlojamientos,
    createAlojamiento,
    updateAlojamiento,
    deleteAlojamiento,
    toggleActivo,
    openCreateModal,
    openEditModal,
    closeModals
  }
}
