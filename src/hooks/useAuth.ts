'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService, type AuthState, type UserProfile } from '@/services/auth.service'

export function useAuth() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    accessDenied: false
  })

  const checkAdminAccess = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))

      const user = await authService.getCurrentUser()
      if (!user) {
        router.replace('/login?redirect=/admin')
        return
      }

      const profile = await authService.getUserProfile(user.id)
      
      if (!profile) {
        await authService.createUserProfile(user.id, user.email || '')
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          accessDenied: true 
        }))
        return
      }

      if (!authService.isAdmin(profile)) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          accessDenied: true 
        }))
        return
      }

      setAuthState({
        user,
        profile,
        loading: false,
        accessDenied: false
      })
    } catch (error) {
      console.error('Error en checkAdminAccess:', error)
      router.replace('/login?redirect=/admin')
    }
  }

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!authState.user) return false

    const success = await authService.updateUserProfile(
      authState.user.id, 
      profileData
    )

    if (success && authState.profile) {
      setAuthState(prev => ({
        ...prev,
        profile: { ...prev.profile!, ...profileData }
      }))
    }

    return success
  }

  const signOut = async (): Promise<void> => {
    await authService.signOut()
    router.push('/login')
  }

  useEffect(() => {
    checkAdminAccess()
  }, [])

  return {
    ...authState,
    checkAdminAccess,
    updateProfile,
    signOut
  }
}
