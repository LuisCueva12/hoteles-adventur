'use client'

import { useState } from 'react'
import { dashboardService } from '@/services/dashboard.service'

interface Reserva {
  id: string
  codigo_reserva: string
  fecha_inicio: string
  fecha_fin: string
  personas: number
  total: number | null
  estado: string
  fecha_creacion: string
  usuario_id: string
  alojamiento_id: string
  usuarios: {
    nombre: string
    apellido: string
    email: string | null
  } | null
  alojamientos: {
    nombre: string
    tipo: string
  } | null
}

interface ReservaForm {
  codigo_reserva: string
  fecha_inicio: string
  fecha_fin: string
  personas: number
  total: number
  estado: string
  usuario_id: string
  alojamiento_id: string
}

export function useReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
  const [saving, setSaving] = useState(false)

  const loadReservas = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getReservas()
      setReservas(data || [])
    } catch (error) {
      console.error('Error loading reservas:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshReservas = async () => {
    setIsRefreshing(true)
    await loadReservas()
    setIsRefreshing(false)
  }

  const createReserva = async (formData: ReservaForm) => {
    try {
      setSaving(true)
      await dashboardService.createReserva(formData)
      await loadReservas()
      setIsModalOpen(false)
      return { success: true }
    } catch (error) {
      console.error('Error creating reserva:', error)
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  const updateReserva = async (id: string, formData: Partial<ReservaForm>) => {
    try {
      setSaving(true)
      await dashboardService.updateReserva(id, formData)
      await loadReservas()
      setIsEditModalOpen(false)
      setSelectedReserva(null)
      return { success: true }
    } catch (error) {
      console.error('Error updating reserva:', error)
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  const deleteReserva = async (id: string) => {
    try {
      setSaving(true)
      await dashboardService.deleteReserva(id)
      await loadReservas()
      return { success: true }
    } catch (error) {
      console.error('Error deleting reserva:', error)
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  const changeEstado = async (reserva: Reserva, nuevoEstado: string) => {
    try {
      await dashboardService.updateReserva(reserva.id, { estado: nuevoEstado })
      await loadReservas()
      return { success: true }
    } catch (error) {
      console.error('Error changing estado:', error)
      return { success: false, error }
    }
  }

  const openCreateModal = () => {
    setSelectedReserva(null)
    setIsModalOpen(true)
  }

  const openEditModal = (reserva: Reserva) => {
    setSelectedReserva(reserva)
    setIsEditModalOpen(true)
  }

  const closeModals = () => {
    setIsModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedReserva(null)
  }

  return {
    reservas,
    loading,
    isRefreshing,
    isModalOpen,
    isEditModalOpen,
    selectedReserva,
    saving,
    loadReservas,
    refreshReservas,
    createReserva,
    updateReserva,
    deleteReserva,
    changeEstado,
    openCreateModal,
    openEditModal,
    closeModals
  }
}
