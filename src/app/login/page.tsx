'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Shield, Lock, Star, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/web/Logo'
import { LoginForm } from '@/components/auth/FormularioLogin'

export default function LoginPage() {
  const { loading, error, login, clearError } = useAuth()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  
  const [redirectTo] = useState(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const r = params.get('redirect')
    return r && r.startsWith('/') && r !== '/login' ? r : null
  })

  const testimonials = [
    {
      text: 'La mejor experiencia de reserva que he tenido. Proceso simple y rapido.',
      author: 'Maria Gonzalez',
      rating: 5,
    },
    {
      text: 'Excelente servicio al cliente y habitaciones increibles. Totalmente recomendado.',
      author: 'Carlos Rodriguez',
      rating: 5,
    },
    {
      text: 'Reservar nunca fue tan facil. La plataforma es intuitiva y segura.',
      author: 'Ana Martinez',
      rating: 5,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])


  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white lg:flex-row">
      <section className="relative hidden items-center justify-center overflow-hidden bg-slate-900 p-5 lg:flex lg:w-1/2 xl:w-[45%] xl:p-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/45 to-slate-800/40" />

        <div className="relative z-10 w-full max-w-[400px] space-y-6">
          <div className="space-y-5">
            <div className="space-y-3">
              <Link href="/" className="group inline-block">
                <div className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.03] bg-black/[0.05] p-3 backdrop-blur-[1px] transition-all hover:bg-black/[0.08]">
                  <Logo className="h-7 w-auto" variant="footer" />
                </div>
              </Link>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.03] bg-black/[0.05] px-3 py-1.5 backdrop-blur-[1px]">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white drop-shadow-lg">
                  Acceso interno
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="mb-2.5 text-3xl font-bold leading-tight text-white drop-shadow-lg xl:text-4xl">
                  Bienvenido a <br />
                  <span className="text-yellow-400">Adventur</span>
                </h2>
                <p className="text-sm font-light leading-relaxed text-slate-100 drop-shadow-md">
                  Plataforma privada para la gestion del sistema hotelero en Cajamarca.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Usuarios', value: '10K+', icon: 'U' },
                { label: 'Hoteles', value: '500+', icon: 'H' },
                { label: 'Rating', value: '4.9', icon: '*' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/[0.03] bg-black/[0.05] p-3 transition-all duration-300 hover:bg-black/[0.08]"
                >
                  <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-black/[0.03] text-lg">
                    {stat.icon}
                  </div>
                  <div className="mb-0.5 text-lg font-bold text-white drop-shadow-md">{stat.value}</div>
                  <div className="text-[10px] font-medium text-slate-200 drop-shadow">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.03] bg-black/[0.05] p-4 backdrop-blur-[1px]">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-yellow-400 drop-shadow" />
                ))}
              </div>
              <p className="mb-3.5 text-sm font-light italic leading-relaxed text-white drop-shadow-md">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-black/[0.08] font-semibold text-white">
                  {testimonials[currentTestimonial].author[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white drop-shadow-md">
                    {testimonials[currentTestimonial].author}
                  </div>
                  <div className="text-[10px] text-slate-200 drop-shadow">Usuario verificado</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-100 drop-shadow">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span>SSL Seguro</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Protegido</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative flex min-h-screen flex-1 flex-col bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-orange-50/20" />

        <header className="relative z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 p-3.5 backdrop-blur-sm sm:p-4 lg:hidden">
          <Logo className="h-6 w-auto sm:h-7" />
          <div className="flex items-center gap-1">
            <Link href="/" className="rounded-lg p-2 transition-colors hover:bg-slate-50" title="Ir al inicio">
              <Home className="h-4 w-4 text-slate-600" />
            </Link>
            <Link href="/" className="rounded-lg p-2 transition-colors hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Link>
          </div>
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="w-full max-w-[420px]">
            <div className="space-y-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xl sm:space-y-5 sm:p-5 md:p-6">
              <div className="space-y-2.5 sm:space-y-3">
                <Link
                  href="/"
                  className="group hidden items-center gap-1.5 text-xs text-slate-500 transition-all hover:text-orange-600 lg:inline-flex"
                >
                  <Home className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  Inicio
                </Link>

                <div className="text-center lg:text-left">
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                    Sistema privado
                  </div>
                  <h1 className="mb-1.5 text-xl font-bold text-slate-900 sm:mb-2 sm:text-2xl md:text-3xl">
                    Iniciar sesion
                  </h1>
                  <p className="text-xs text-slate-600 sm:text-sm">
                    Accede al sistema interno con tus credenciales autorizadas.
                  </p>
                </div>
              </div>

              <LoginForm 
                onSubmit={(data) => login(data, redirectTo)} 
                loading={loading} 
                error={error} 
                onClearError={clearError} 
              />
            </div>

            <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
              <div className="rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm sm:p-3.5">
                <div className="mb-2.5 flex flex-wrap items-center justify-center gap-4 sm:mb-3 sm:gap-6">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 sm:gap-2">
                    <Shield className="h-3.5 w-3.5 text-yellow-500 sm:h-4 sm:w-4" />
                    <span className="font-medium">Pago Seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 sm:gap-2">
                    <Lock className="h-3.5 w-3.5 text-yellow-500 sm:h-4 sm:w-4" />
                    <span className="font-medium">SSL 256-bit</span>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-600">
                  El acceso se administra internamente. Si necesitas credenciales, solicita el alta al administrador.
                </p>
              </div>

              <footer className="text-center text-[10px] uppercase tracking-wider text-slate-400">
                © 2026 Adventur Hotels
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
