'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu email antes de iniciar sesión.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos.',
}

function parseAuthError(message: string): string {
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) return value
  }
  const waitMatch = message.match(/after (\d+) seconds/)
  if (waitMatch) {
    return `Espera ${waitMatch[1]} segundos antes de intentar nuevamente.`
  }
  return message || 'Ocurrió un error inesperado.'
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')

  const router = useRouter()
  const supabase = createClient()
  const { success, error, info } = useToast()

  const handleSignUp = async () => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/perfil`,
        data: { nombre, apellido },
      },
    })

    if (signUpError) throw signUpError

    if (data?.user?.identities?.length === 0) {
      error('Este email ya está registrado. Inicia sesión.')
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

      success(`Bienvenido ${nombre}! Tu cuenta ha sido creada exitosamente.`)
      
      setTimeout(() => {
        router.push('/perfil')
        router.refresh()
      }, 1500)
    }
  }

  const handleSignIn = async () => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        info('Confirma tu email antes de iniciar sesión. Revisa tu bandeja.')
        return
      }
      throw signInError
    }

    if (data.user) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('nombre, rol')
        .eq('id', data.user.id)
        .single()

      success(`Bienvenido de nuevo${usuario?.nombre ? `, ${usuario.nombre}` : ''}!`)
      
      setTimeout(() => {
        router.push(usuario?.rol === 'admin_adventur' ? '/admin' : '/perfil')
        router.refresh()
      }, 1500)
    }
  }

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)

    try {
      if (isSignUp) {
        await handleSignUp()
      } else {
        await handleSignIn()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      error(parseAuthError(message))
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp((prev) => !prev)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Volver al inicio</span>
          </Link>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">H</span>
            <span className="text-gray-900 font-bold text-xl tracking-wide">otel Adventur</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="text-gray-500">
            {isSignUp ? 'Únete a nuestra comunidad' : 'Bienvenido de nuevo'}
          </p>
        </div>

        <div className="bg-white rounded-sm shadow-md border border-gray-100 p-8">
          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required={isSignUp}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900"
                    placeholder="Luis"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700">
                    Apellido
                  </label>
                  <input
                    id="apellido"
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required={isSignUp}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900"
                    placeholder="Cueva"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSignUp ? 'Crear mi cuenta' : 'Iniciar sesión'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isSignUp ? (
                <span>¿Ya tienes cuenta? <span className="font-semibold text-red-600 hover:text-red-700">Inicia sesión</span></span>
              ) : (
                <span>¿No tienes cuenta? <span className="font-semibold text-red-600 hover:text-red-700">Regístrate</span></span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Tus datos están protegidos y encriptados
          </p>
        </div>
      </div>
    </div>
  )
}
