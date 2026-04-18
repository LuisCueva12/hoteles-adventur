'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Shield, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/web/Logo'
import { useToast } from '@/hooks/useNotificacion'
import { createClient } from '@/utils/supabase/client'
import { obtenerFortalezaContrasena } from '@/lib/seguridad'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Error al actualizar la contrasena.'
}

export default function ActualizarPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] })

  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const { success, error } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, feedback: [] })
      return
    }

    setPasswordStrength(obtenerFortalezaContrasena(password))
  }, [password])

  useEffect(() => {
    let active = true
    let unsubscribe: (() => void) | undefined
    let timeoutId: number | undefined

    async function prepareRecoverySession() {
      try {
        setSessionError(null)
        setSessionReady(false)

        const code = searchParams.get('code')
        const flow = searchParams.get('flow')
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const hasHashToken =
          typeof window !== 'undefined' && window.location.hash.includes('access_token')

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        }

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (sessionError) throw sessionError
        }

        const readSession = async () => {
          const { data, error: sessionLookupError } = await supabase.auth.getSession()
          if (sessionLookupError) throw sessionLookupError
          return data.session
        }

        const currentSession = await readSession()
        if (currentSession) {
          if (active) {
            setSessionReady(true)
          }
          return
        }

        const expectsRecoverySession = Boolean(code) || hasHashToken || flow === 'recovery' || (accessToken && refreshToken)
        if (!expectsRecoverySession) {
          throw new Error('El enlace de recuperacion no es valido o ya expiro.')
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
          if (active && session) {
            setSessionError(null)
            setSessionReady(true)
          }
        })
        unsubscribe = () => authListener.subscription.unsubscribe()

        timeoutId = window.setTimeout(async () => {
          try {
            const delayedSession = await readSession()

            if (!active) return

            if (delayedSession) {
              setSessionError(null)
              setSessionReady(true)
              return
            }

            setSessionError('El enlace de recuperacion no es valido o ya expiro.')
          } catch (err: unknown) {
            if (active) {
              setSessionError(getErrorMessage(err))
            }
          }
        }, 1500)
      } catch (err: unknown) {
        if (active) {
          setSessionError(getErrorMessage(err))
        }
      }
    }

    prepareRecoverySession()

    return () => {
      active = false
      if (timeoutId) window.clearTimeout(timeoutId)
      if (unsubscribe) unsubscribe()
    }
  }, [searchParams, supabase])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password || loading || !sessionReady) return

    if (password !== confirmPassword) {
      error('Las contrasenas no coinciden.')
      return
    }

    if (password.length < 8) {
      error('La contrasena debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      await supabase.auth.signOut()
      success('Contrasena actualizada exitosamente.')

      setTimeout(() => {
        router.replace('/login')
      }, 1500)
    } catch (err: unknown) {
      error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-400'
    if (score === 2) return 'bg-yellow-400'
    if (score === 3) return 'bg-blue-500'
    return 'bg-emerald-500'
  }

  const getStrengthText = (score: number) => {
    if (score <= 1) return 'Debil'
    if (score === 2) return 'Media'
    if (score === 3) return 'Buena'
    return 'Fuerte'
  }

  if (!sessionReady && !sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
          <div className="mb-5 flex justify-center">
            <Logo className="h-12" />
          </div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Validando enlace</h1>
          <p className="text-sm text-gray-600">Estamos preparando tu acceso seguro para cambiar la contrasena.</p>
        </div>
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <Logo className="mx-auto h-12" />
          </div>
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Enlace no valido</h1>
          <p className="text-center text-sm text-gray-600">{sessionError}</p>
          <div className="mt-6 space-y-3">
            <Link
              href="/recuperar-password"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-yellow-600"
            >
              Solicitar nuevo enlace
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto h-12" />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <Lock className="h-8 w-8 text-yellow-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Nueva contrasena</h1>
            <p className="text-sm text-gray-600">Ingresa una nueva contrasena segura para tu cuenta.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Lock className="h-3.5 w-3.5 text-yellow-500" />
                Nueva contrasena
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="........"
                  required
                  disabled={loading}
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className="min-w-[50px] text-xs font-semibold text-gray-600">
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {password.length >= 8 ? 'OK' : 'NO'} 8+ caracteres
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'OK' : 'NO'} Mayus y minus
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {/[0-9]/.test(password) ? 'OK' : 'NO'} Numeros
                    </div>
                    <div className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {/[^a-zA-Z0-9]/.test(password) ? 'OK' : 'NO'} Simbolos
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700">
                Confirmar contrasena
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={`w-full rounded-xl border-2 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
                      : 'border-gray-300 focus:border-yellow-400 focus:ring-yellow-400'
                  }`}
                  placeholder="........"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Las contrasenas no coinciden.</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Las contrasenas coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || password !== confirmPassword}
              className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-yellow-500 hover:to-orange-600 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Actualizando...</span>
                </span>
              ) : (
                'Actualizar contrasena'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
