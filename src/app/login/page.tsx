'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu email antes de iniciar sesión.',
  'Email rate limit exceeded': '⏱️ Demasiados intentos. Espera unos minutos.',
}

function parseAuthError(message: string): string {
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) return value
  }
  const waitMatch = message.match(/after (\d+) seconds/)
  if (waitMatch) {
    return `⏱️ Espera ${waitMatch[1]} segundos antes de intentar nuevamente.`
  }
  return message || 'Ocurrió un error inesperado.'
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setNombre('')
    setApellido('')
    setFeedback(null)
  }

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nombre, apellido },
      },
    })

    if (error) throw error

    if (data?.user?.identities?.length === 0) {
      setFeedback({ message: 'Este email ya está registrado. Inicia sesión.', success: false })
      setIsSignUp(false)
      return
    }

    if (data.user) {
      await supabase.from('usuarios').upsert({
        id: data.user.id,
        email: data.user.email,
        nombre,
        apellido,
      }, { onConflict: 'id' })

      router.push('/')
      router.refresh()
    }
  }

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setFeedback({ message: 'Confirma tu email antes de iniciar sesión. Revisa tu bandeja.', success: false })
        return
      }
      throw error
    }

    if (data.user) {
      const supabase = createClient()
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', data.user.id)
        .single()

      router.push(usuario?.rol === 'admin_adventur' ? '/admin' : '/')
      router.refresh()
    }
  }

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setFeedback(null)

    try {
      if (isSignUp) {
        await handleSignUp()
      } else {
        await handleSignIn()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setFeedback({ message: parseAuthError(message), success: false })
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp((prev) => !prev)
    setFeedback(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 p-8 text-center border-b border-white/10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl mb-4 shadow-lg border border-white/20">
              <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {isSignUp ? '✨ Crear Cuenta' : '👋 Bienvenido'}
            </h1>
            <p className="text-white/80 text-lg">
              {isSignUp ? 'Únete a Adventur' : 'Nos alegra verte de nuevo'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="p-8 space-y-5">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="block text-sm font-semibold text-white/90 ml-1">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required={isSignUp}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all text-white placeholder-white/50 font-medium"
                    placeholder="Luis"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="apellido" className="block text-sm font-semibold text-white/90 ml-1">
                    Apellido
                  </label>
                  <input
                    id="apellido"
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required={isSignUp}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all text-white placeholder-white/50 font-medium"
                    placeholder="Cueva"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-white/90 ml-1">
                📧 Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all text-white placeholder-white/50 font-medium shadow-lg hover:bg-white/15"
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white/90 ml-1">
                🔒 Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all text-white placeholder-white/50 font-medium shadow-lg hover:bg-white/15 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {feedback && (
              <div className={`p-4 rounded-2xl text-sm font-medium backdrop-blur-xl border-2 ${feedback.success
                ? 'bg-green-500/20 text-green-100 border-green-400/30'
                : 'bg-red-500/20 text-red-100 border-red-400/30'
                }`}>
                <div className="flex items-center gap-2">
                  {feedback.success ? (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span>{feedback.message}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-white to-white/90 text-purple-600 font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    {isSignUp ? '🚀 Crear mi cuenta' : '✨ Iniciar Sesión'}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          </form>

          <div className="px-8 pb-8 text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
            <button
              type="button"
              onClick={toggleMode}
              className="text-base text-white/80 hover:text-white transition-colors font-medium group"
            >
              {isSignUp ? (
                <span>¿Ya tienes cuenta? <span className="font-bold text-white group-hover:underline">Inicia sesión aquí</span></span>
              ) : (
                <span>¿No tienes cuenta? <span className="font-bold text-white group-hover:underline">Regístrate gratis</span></span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">🔐 Tus datos están protegidos y encriptados</p>
        </div>
      </div>
    </div>
  )
}
