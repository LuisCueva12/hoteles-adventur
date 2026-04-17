'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UsuarioAdminService } from '@/lib/services/usuario.admin.service'
import type { Usuario } from '@/lib/repositories/usuario.repository'
import type { UsuarioCreateInput, UsuarioUpdateInput } from '@/lib/validations/usuario.schema'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const service = useMemo(() => new UsuarioAdminService(supabase), [supabase])

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('[useUsuarios] Auth check:', { userId: user?.id, authError: authError?.message })
      
      if (!user) {
        setErrorMessage('No hay usuario autenticado')
        setUsuarios([])
        return
      }
      
      console.log('[useUsuarios] Calling service.getAllUsuarios()...')
      const data = await service.getAllUsuarios()
      console.log('[useUsuarios] Data received:', data?.length || 0)
      setUsuarios(data)
    } catch (error: any) {
      console.error('[useUsuarios] Error:', error)
      setErrorMessage(error?.message || 'Error al cargar usuarios')
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const refreshUsuarios = async () => {
    try {
      setIsRefreshing(true)
      setErrorMessage(null)
      const data = await service.getAllUsuarios()
      setUsuarios(data)
    } catch (error: any) {
      console.error('Error refrescando usuarios:', error)
      setErrorMessage(error?.message || 'Error al refrescar usuarios')
    } finally {
      setIsRefreshing(false)
    }
  }

  const createUsuario = async (input: UsuarioCreateInput) => {
    try {
      setSaving(true)
      await service.createUsuario(input)
      await refreshUsuarios()
      closeModals()
      return { success: true }
    } catch (error: any) {
      console.error('Error creando usuario:', error.message || error)
      return { success: false, error: error.message || 'Error desconocido' }
    } finally {
      setSaving(false)
    }
  }

  const updateUsuario = async (id: string, input: UsuarioUpdateInput) => {
    try {
      setSaving(true)
      await service.updateUsuario(id, input)
      await refreshUsuarios()
      closeModals()
      return { success: true }
    } catch (error: any) {
      console.error('Error actualizando usuario:', error.message || error)
      return { success: false, error: error.message || 'Error desconocido' }
    } finally {
      setSaving(false)
    }
  }

  const deleteUsuario = async (id: string) => {
    try {
      await service.deleteUsuario(id)
      await refreshUsuarios()
      return { success: true }
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      return { success: false, error }
    }
  }

  const toggleVerificado = async (usuario: Usuario) => {
    try {
      await service.toggleVerificado(usuario.id, usuario.verificado)
      await refreshUsuarios()
      return { success: true }
    } catch (error) {
      console.error('Error cambiando verificación:', error)
      return { success: false, error }
    }
  }

  const openCreateModal = () => setIsModalOpen(true)
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
    errorMessage,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    toggleVerificado,
    openCreateModal,
    openEditModal,
    closeModals,
    refreshUsuarios,
  }
}
