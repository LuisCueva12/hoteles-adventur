'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useNotificacion'
import { type LoginInput, type RegisterInput } from '@/lib/validaciones'
import { Registrador } from '@/lib/errores'
import Link from 'next/link'
import { Logo } from '@/components/web/Logo'
import { LoginForm } from '@/components/auth/FormularioLogin'
import { RegisterForm } from '@/components/auth/FormularioRegistro'
import { 
  ArrowLeft, Shield, Lock, Sparkles, Hotel, Star, Award, CheckCircle
} from 'lucide-react'

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
  const [loading, setLoading] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const router = useRouter()
  const supabase = createClient()
  const { success, error, info } = useToast()

  const testimonials = [
    {
      text: "La mejor experiencia de reserva que he tenido. Proceso simple y rápido.",
      author: "María González",
      rating: 5
    },
    {
      text: "Excelente servicio al cliente y habitaciones increíbles. Totalmente recomendado.",
      author: "Carlos Rodríguez",
      rating: 5
    },
    {
      text: "Reservar nunca fue tan fácil. La plataforma es intuitiva y segura.",
      author: "Ana Martínez",
      rating: 5
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSignUp = async (data: RegisterInput) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/perfil`,
          data: { 
            nombre: data.nombre, 
            apellido: data.apellido 
          },
        },
      })

      if (signUpError) throw signUpError

      if (authData?.user?.identities?.length === 0) {
        error('Este email ya está registrado. Inicia sesión.')
        setIsSignUp(false)
        return
      }

      if (authData.user) {
        // El trigger handle_new_user creará automáticamente el usuario en la tabla usuarios
        // No necesitamos hacer upsert manual
        
        // Notificar a los administradores
        try {
          const { notificationsService } = await import('@/services/notificaciones.servicio')
          await notificationsService.notifyAdmins(
            'success',
            '🎉 Nuevo usuario registrado',
            `${data.nombre} ${data.apellido} (${data.email}) se ha registrado en el sistema`,
            '/admin/usuarios',
            { usuarioId: authData.user.id, email: data.email, nombre: data.nombre, apellido: data.apellido }
          )
        } catch (notifError) {
          Registrador.advertencia('Error enviando notificación de registro', notifError as Error)
        }

        success(`Bienvenido ${data.nombre}! Tu cuenta ha sido creada exitosamente.`)
        
        // Usar window.location para forzar recarga completa y actualizar sesión
        setTimeout(() => {
          window.location.href = '/perfil'
        }, 1500)
      }
    } catch (err) {
      Registrador.error(err as Error, { action: 'signup' })
      throw err
    }
  }

  const handleSignIn = async (data: LoginInput) => {
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email: data.email, 
        password: data.password 
      })

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          info('Confirma tu email antes de iniciar sesión. Revisa tu bandeja.')
          return
        }
        throw signInError
      }

      if (authData.user) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('nombre, rol')
          .eq('id', authData.user.id)
          .maybeSingle()

        Registrador.info('User logged in', { userId: authData.user.id })
        success(`Bienvenido de nuevo${usuario?.nombre ? `, ${usuario.nombre}` : ''}!`)
        
        // Esperar un poco más para asegurar que la sesión se guarde
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Usar window.location para forzar recarga completa y actualizar sesión
        window.location.href = usuario?.rol === 'admin_adventur' ? '/admin' : '/perfil'
      }
    } catch (err) {
      Registrador.error(err as Error, { action: 'signin' })
      throw err
    }
  }

  const handleAuth = async (data: LoginInput | RegisterInput) => {
    if (loading) return

    setLoading(true)

    try {
      if (isSignUp) {
        await handleSignUp(data as RegisterInput)
      } else {
        await handleSignIn(data as LoginInput)
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
    <div className="min-h-screen flex bg-gray-50">
      {/* Panel Izquierdo - Imagen/Info */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden">
        {/* Patrón de fondo animado */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse animation-delay-2000" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo y Header */}
          <div>
            <Link href="/" className="inline-block mb-8 hover:scale-105 transition-transform duration-300">
              <Logo className="h-14" variant="footer" />
            </Link>
            
            <h2 className="text-5xl font-bold mb-4 animate-fadeInUp leading-tight">
              Descubre tu próxima<br />
              <span className="text-red-200">aventura</span>
            </h2>
            <p className="text-lg text-red-100 mb-10 animate-fadeInUp animation-delay-100 max-w-md">
              Reserva experiencias únicas en los mejores hoteles de Cajamarca
            </p>

            {/* Estadísticas mejoradas */}
            <div className="grid grid-cols-3 gap-4 mb-10 animate-fadeInUp animation-delay-150">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-xs text-red-200">Clientes felices</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-xs text-red-200">Hoteles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-3xl font-bold text-white mb-1">4.9★</div>
                <div className="text-xs text-red-200">Calificación</div>
              </div>
            </div>

            {/* Beneficios con diseño moderno */}
            <div className="space-y-3 animate-fadeInUp animation-delay-200">
              {[
                { icon: CheckCircle, text: 'Reservas instantáneas' },
                { icon: Star, text: 'Ofertas exclusivas para miembros' },
                { icon: Award, text: 'Programa de puntos y recompensas' },
                { icon: Shield, text: 'Pago 100% seguro y protegido' }
              ].map((benefit, idx) => {
                const Icon = benefit.icon
                return (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-red-50 text-sm">{benefit.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Testimonial mejorado */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-fadeInUp animation-delay-300 hover:bg-white/15 transition-all">
            <div className="flex gap-1 mb-3">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-white mb-4 italic leading-relaxed text-sm">
              "{testimonials[currentTestimonial].text}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {testimonials[currentTestimonial].author.charAt(0)}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{testimonials[currentTestimonial].author}</p>
                <p className="text-red-200 text-xs">Cliente verificado</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentTestimonial ? 'bg-white w-8' : 'bg-white/30 w-1.5 hover:bg-white/50'
                  }`}
                  aria-label={`Ver testimonio ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Header Mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo className="h-12" />
            </div>
          </div>

          <div className="text-center mb-6 animate-fadeInUp">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-all mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Volver al inicio</span>
            </Link>
            
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">
                  {isSignUp ? 'Bienvenido de nuevo' : 'Únete a más de 10,000 viajeros'}
                </span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </h1>
            <p className="text-sm text-gray-600">
              {isSignUp 
                ? 'Completa el formulario para comenzar' 
                : 'Ingresa tus credenciales para continuar'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fadeInUp animation-delay-100">
            {/* Tabs de Login/Registro */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  !isSignUp
                    ? 'bg-white text-red-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  isSignUp
                    ? 'bg-white text-red-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Renderizar el formulario correspondiente */}
            {isSignUp ? (
              <RegisterForm onSubmit={handleAuth} loading={loading} />
            ) : (
              <LoginForm onSubmit={handleAuth} loading={loading} />
            )}

            {/* Beneficios adicionales */}
            {!isSignUp && (
              <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 animate-fadeInUp">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      ¿Sabías que los miembros obtienen hasta 20% de descuento?
                    </h4>
                    <p className="text-xs text-gray-600">
                      Regístrate gratis y accede a ofertas exclusivas.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isSignUp ? (
                <span>
                  ¿Ya tienes cuenta?{' '}
                  <span className="font-semibold text-red-600 hover:text-red-700">
                    Inicia sesión
                  </span>
                </span>
              ) : (
                <span>
                  ¿No tienes cuenta?{' '}
                  <span className="font-semibold text-red-600 hover:text-red-700">
                    Regístrate gratis
                  </span>
                </span>
              )}
            </button>
          </div>

          {/* Footer de seguridad */}
          <div className="mt-8 text-center space-y-3 animate-fadeInUp animation-delay-300">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span>Conexión segura</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-green-600" />
                <span>Datos encriptados</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              © 2026 Adventur Hotels. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
