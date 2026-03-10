'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/hooks/useNotificacion'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/web/Logo'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { obtenerFortalezaContrasena } from '@/lib/seguridad'

export default function ActualizarPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] })
  const supabase = createClient()
  const { success, error } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (password) {
      const strength = obtenerFortalezaContrasena(password)
      setPasswordStrength(strength)
    }
  }, [password])

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

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      success('Contraseña actualizada exitosamente')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      error(err.message || 'Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500'
    if (score === 2) return 'bg-yellow-500'
    if (score === 3) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (score: number) => {
    if (score <= 1) return 'Débil'
    if (score === 2) return 'Media'
    if (score === 3) return 'Buena'
    return 'Fuerte'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="h-12 mx-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Nueva contraseña
            </h1>
            <p className="text-sm text-gray-600">
              Ingresa tu nueva contraseña segura
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-600" />
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
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
                    <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      {password.length >= 8 ? '✓' : '○'} 8+ caracteres
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '○'} Mayús y minús
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[0-9]/.test(password) ? '✓' : '○'} Números
                    </div>
                    <div className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
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
                      ? 'border-red-400 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600 animate-fadeInUp">⚠️ Las contraseñas no coinciden</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-600 flex items-center gap-1 animate-fadeInUp">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Las contraseñas coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || password !== confirmPassword}
              className="w-full py-2.5 px-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 hover:shadow-xl disabled:transform-none text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Actualizando...</span>
                </span>
              ) : (
                'Actualizar contraseña'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
