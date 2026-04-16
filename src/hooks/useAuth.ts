'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { AuthService } from '@/lib/services/auth.service'
import { AUTH_ROUTES, ADMIN_ROLE } from '@/lib/auth/constants'
import { Registrador } from '@/lib/errores'
import type { LoginInput } from '@/lib/validations'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const clearError = useCallback(() => setError(null), [])

  const login = useCallback(async (data: LoginInput, redirectTo: string | null) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const authService = new AuthService(supabase)
      
      const authData = await authService.login(data.email, data.password)
      const userId = authData.user.id
      const rol = await authService.getUserRole(userId)
      
      if (rol === ADMIN_ROLE) {
        const adminProfile = await authService.validateAdminSession()
        if (!adminProfile) {
          throw new Error('Sesión de administrador no válida o acceso denegado')
        }
      }

      const destination = redirectTo || (rol === ADMIN_ROLE ? AUTH_ROUTES.ADMIN : AUTH_ROUTES.HOME)

      Registrador.info('Login exitoso y validado', { userId, rol, destination })

      router.refresh()
      await router.replace(destination)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      Registrador.error(err as Error, { action: 'login' })
      setError(message)
      setLoading(false)
    }
  }, [router])

  return { loading, error, login, clearError }
}
