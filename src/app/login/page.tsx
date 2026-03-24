'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/hooks/useNotificacion'
import { type LoginInput, type RegisterInput } from '@/lib/validaciones'
import { Registrador } from '@/lib/errores'
import Link from 'next/link'
import { Logo } from '@/components/web/Logo'
import { LoginForm } from '@/components/auth/FormularioLogin'
import { RegisterForm } from '@/components/auth/FormularioRegistro'
import { 
  ArrowLeft, Shield, Lock, Star
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
  }, [testimonials.length])

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
        await new Promise(resolve => setTimeout(resolve, 500))
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden">
      {/* --- PANEL IZQUIERDO: VISUAL (Oculto en móviles pequeños, visible desde LG) --- */}
      <section className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative bg-slate-900 items-center justify-center p-5 xl:p-6 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/45 to-slate-800/40" />
        
        <div className="relative z-10 w-full max-w-[400px] space-y-6">
          <div className="space-y-5">
            <div className="space-y-3">
              <Link href="/" className="inline-block group">
                <div className="bg-black/[0.05] backdrop-blur-[1px] border border-white/[0.03] rounded-xl p-3 inline-flex items-center gap-2.5 hover:bg-black/[0.08] transition-all">
                  <Logo className="h-7 w-auto" variant="footer" />
                </div>
              </Link>

              <div className="inline-flex items-center gap-1.5 bg-black/[0.05] backdrop-blur-[1px] border border-white/[0.03] rounded-full px-3 py-1.5">
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                <span className="text-[10px] font-semibold text-white uppercase tracking-widest drop-shadow-lg">Premium</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-2.5 drop-shadow-lg">
                  Bienvenido a <br />
                  <span className="text-yellow-400">Adventur</span>
                </h2>
                <p className="text-sm text-slate-100 font-light leading-relaxed drop-shadow-md">
                  Experiencias exclusivas en los mejores hoteles de Cajamarca
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Viajeros', value: '10K+', icon: '👥' },
                { label: 'Hoteles', value: '500+', icon: '🏨' },
                { label: 'Rating', value: '4.9★', icon: '⭐' }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-black/[0.05] backdrop-blur-[1px] border border-white/[0.03] p-3 rounded-xl hover:bg-black/[0.08] transition-all duration-300"
                >
                  <div className="text-lg mb-1.5 w-9 h-9 bg-black/[0.03] rounded-lg flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-lg font-bold text-white mb-0.5 drop-shadow-md">{stat.value}</div>
                  <div className="text-[10px] text-slate-200 font-medium drop-shadow">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-black/[0.05] backdrop-blur-[1px] border border-white/[0.03] p-4 rounded-xl">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-3.5 h-3.5 fill-amber-400 text-yellow-400 drop-shadow" 
                  />
                ))}
              </div>
              <p className="text-white text-sm font-light leading-relaxed mb-3.5 italic drop-shadow-md">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-black/[0.08] flex items-center justify-center font-semibold text-white border border-white/[0.08]">
                  {testimonials[currentTestimonial].author[0]}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm drop-shadow-md">{testimonials[currentTestimonial].author}</div>
                  <div className="text-[10px] text-slate-200 drop-shadow">Cliente verificado</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-100 text-[10px] drop-shadow">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>SSL Seguro</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Protegido</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PANEL DERECHO: FORMULARIO (Principal en móviles) --- */}
      <main className="flex-1 flex flex-col relative bg-white min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-orange-50/20" />
        
        <header className="lg:hidden flex items-center justify-between p-3.5 sm:p-4 relative z-10 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
          <Logo className="h-6 sm:h-7 w-auto" />
          <Link href="/" className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-5 lg:p-6 relative z-10">
          <div className="w-full max-w-[420px]">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
              
              <div className="space-y-2.5 sm:space-y-3">
                <Link 
                  href="/" 
                  className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 transition-all group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  Volver
                </Link>
                
                <div className="text-center lg:text-left">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1.5 sm:mb-2">
                    {isSignUp ? (
                      <>
                        Crear cuenta
                      </>
                    ) : (
                      <>
                        Iniciar sesión
                      </>
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {isSignUp ? 'Únete a nuestra comunidad' : 'Accede a tu cuenta'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-1 flex gap-1">
                <button 
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Entrar
                </button>
                <button 
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Registrarse
                </button>
              </div>

              <div>
                {isSignUp ? (
                  <RegisterForm onSubmit={handleAuth} loading={loading} />
                ) : (
                  <LoginForm onSubmit={handleAuth} loading={loading} />
                )}
              </div>

            </div>

            <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-3 sm:p-3.5">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-600">
                    <Shield className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-yellow-400" />
                    <span className="font-medium">Pago Seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-600">
                    <Lock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-yellow-400" />
                    <span className="font-medium">SSL 256-bit</span>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-600">
                  {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                  {' '}
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    {isSignUp ? 'Inicia sesión' : 'Regístrate'}
                  </button>
                </p>
              </div>

              <footer className="text-center text-[10px] text-slate-400 uppercase tracking-wider">
                © 2026 Adventur Hotels
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}