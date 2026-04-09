'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/hooks/useNotificacion'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Shield, AlertCircle } from 'lucide-react'
import { obtenerFortalezaContrasena } from '@/lib/seguridad'

export default function AgregarPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasPassword, setHasPassword] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] })
  const supabase = createClient()
  const { success, error } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (password) {
      const strength = obtenerFortalezaContrasena(password)
      setPasswordStrength(strength)
    }
  }, [password])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')

      const isGoogleUser = user.app_metadata.provider === 'google' || 
                          user.app_metadata.providers?.includes('google')

      if (!isGoogleUser) {
        setHasPassword(true)
      }

      setChecking(false)
    } catch (err) {
      console.error('Error checking user:', err)
      error('Error al verificar usuario')
      setChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || loading) return

    if (password !== confirmPassword) {
      error('Las contraseñas no coinciden')
      return
    }

    if (password.length < 8) {
      error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (passwordStrength.score < 2) {
      error('La contraseña es demasiado débil. Usa mayúsculas, números y símbolos.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      success('¡Contraseña agregada exitosamente! Ahora puedes iniciar sesión con email y contraseña.')
      
      setTimeout(() => {
        router.push('/reservas')
      }, 2000)
    } catch (err: any) {
      console.error('Error adding password:', err)
      error(err.message || 'Error al agregar la contraseña')
      setLoading(false)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-yellow-300'
    if (score === 2) return 'bg-yellow-400'
    if (score === 3) return 'bg-blue-500'
    return 'bg-yellow-400'
  }

  const getStrengthText = (score: number) => {
    if (score <= 1) return 'Débil'
    if (score === 2) return 'Media'
    if (score === 3) return 'Buena'
    return 'Fuerte'
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-600">Verificando usuario...</p>
        </div>
      </div>
    )
  }

  if (hasPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ya tienes una contraseña
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Tu cuenta ya tiene una contraseña configurada. Si deseas cambiarla, ve a tu perfil.
            </p>
            <button
              onClick={() => router.push('/reservas')}
              className="w-full py-2.5 px-5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-400 hover:to-red-800 text-white font-semibold rounded-lg transition-all text-sm"
            >
              Ver mis reservas
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Agregar contraseña
            </h1>
            <p className="text-sm text-gray-600">
              Crea una contraseña para poder iniciar sesión con email además de Google
            </p>
            {userEmail && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {userEmail}
              </div>
            )}
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">¿Por qué agregar una contraseña?</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Podrás iniciar sesión con email y contraseña</li>
                  <li>Tendrás una opción alternativa si Google no está disponible</li>
                  <li>Seguirás pudiendo usar "Continuar con Google"</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors p-1 rounded-lg hover:bg-yellow-50"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && password.length > 0 && (
                <div className="space-y-2 animate-fadeInUp">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${getStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 min-w-[50px]">
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {password.length >= 8 ? '✓' : '○'} 8+ caracteres
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '○'} Mayús y minús
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {/[0-9]/.test(password) ? '✓' : '○'} Números
                    </div>
                    <div className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(password) ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'} Símbolos
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 pr-10 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm bg-white text-gray-900 placeholder-gray-400 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-yellow-400 focus:ring-yellow-400'
                      : 'border-gray-300 focus:ring-yellow-400'
                  }`}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors p-1 rounded-lg hover:bg-yellow-50"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600 animate-fadeInUp" role="alert">⚠️ Las contraseñas no coinciden</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-yellow-400 flex items-center gap-1 animate-fadeInUp">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Las contraseñas coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || password !== confirmPassword || passwordStrength.score < 2}
              className="w-full py-2.5 px-5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-400 hover:to-red-800 text-white font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 hover:shadow-xl disabled:transform-none text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Agregando contraseña...</span>
                </span>
              ) : (
                'Agregar contraseña'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-yellow-400 font-medium hover:underline"
            >
              Omitir por ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
