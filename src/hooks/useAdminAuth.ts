'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { AuthService } from '@/lib/services/auth.service'
import { AUTH_ROUTES } from '@/lib/auth/constants'
import type { AuthState, AdminProfile } from '@/lib/auth/types'

export function useAdminAuth() {
  const router = useRouter()
  const supabase = createClient()
  const authService = new AuthService(supabase)

  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    accessDenied: false,
  })

  useEffect(() => {
    checkAccess()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push(AUTH_ROUTES.LOGIN)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAccess = async () => {
    try {
      const session = await authService.getSession()

      if (!session?.user) {
        router.replace(`${AUTH_ROUTES.LOGIN}?redirect=${AUTH_ROUTES.ADMIN}`)
        return
      }

      const profile = await authService.validateAdminSession()

      console.log('Admin profile loaded:', profile)

      if (!profile) {
        setState(prev => ({ ...prev, accessDenied: true, loading: false }))
        return
      }

      setState({
        user: session.user,
        profile,
        loading: false,
        accessDenied: false,
      })
    } catch (error) {
      console.error('Error verificando acceso:', error)
      router.replace(`${AUTH_ROUTES.LOGIN}?redirect=${AUTH_ROUTES.ADMIN}`)
    }
  }

  const signOut = async () => {
    await authService.logout()
    router.push(AUTH_ROUTES.LOGIN)
  }

  const updateProfile = async (data: Partial<AdminProfile>) => {
    if (!state.user || !state.profile) return false

    try {
      const success = await authService.updateProfile(state.user.id, data)
      if (success) {
        setState(prev => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, ...data } : null
        }))
      }
      return success
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      return false
    }
  }

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    accessDenied: state.accessDenied,
    signOut,
    updateProfile,
    checkAccess
  }
}
