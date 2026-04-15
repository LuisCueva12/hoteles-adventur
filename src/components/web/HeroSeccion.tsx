'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80&auto=format&fit=crop',
    title: 'Adventur Hotels',
    subtitle: 'El lugar donde buscas escaparte',
  },
  {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=70&auto=format&fit=crop',
    title: 'Experiencias Unicas',
    subtitle: 'Vive momentos inolvidables',
  },
  {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=70&auto=format&fit=crop',
    title: 'Lujo y Confort',
    subtitle: 'Tu descanso es nuestra prioridad',
  },
]

const TOTAL = HERO_IMAGES.length

export function HeroSeccion() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL)
    }, 5000)
  }, []) // sin dependencias — estable para siempre

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % TOTAL)
    startTimer()
  }, [startTimer])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + TOTAL) % TOTAL)
    startTimer()
  }, [startTimer])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
    startTimer()
  }, [startTimer])

  return (
    <section className="relative flex h-[88svh] min-h-[640px] items-center justify-center overflow-hidden">
      {/* Solo renderiza la imagen activa + preload de la siguiente */}
      {HERO_IMAGES.map((image, index) => {
        const isActive = index === currentSlide
        const isNext = index === (currentSlide + 1) % TOTAL
        // Ocultar completamente las que no son activas ni la siguiente
        if (!isActive && !isNext && index !== 0) return null

        return (
          <div
            key={image.url}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={!isActive}
          >
            <Image
              src={image.url}
              alt={isActive ? image.title : ''}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          </div>
        )
      })}

      <div className="relative z-10 max-w-4xl px-6 text-center text-white">
        <div className="mb-6 animate-fadeInDown">
          <span className="inline-block rounded-full border border-yellow-400/30 bg-yellow-400/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300 backdrop-blur-sm">
            Bienvenido a
          </span>
        </div>

        <h1 className="mb-6 font-serif text-5xl font-bold italic drop-shadow-2xl animate-fadeInUp animation-delay-100 md:text-7xl lg:text-8xl">
          {HERO_IMAGES[currentSlide].title}
        </h1>

        <div className="mb-8 flex items-center justify-center gap-3 animate-fadeInUp animation-delay-150">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-300" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-300" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-300" />
        </div>

        <p className="mb-10 text-xl font-light tracking-wide text-gray-200 animate-fadeInUp animation-delay-200 md:text-2xl">
          {HERO_IMAGES[currentSlide].subtitle}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 animate-fadeInUp animation-delay-300 sm:flex-row">
          <Link
            href="/hoteles"
            className="group relative min-h-12 overflow-hidden bg-yellow-400 px-10 py-4 text-sm font-semibold uppercase tracking-widest text-gray-900 transition-all duration-300 hover:scale-105 hover:bg-yellow-500 hover:shadow-2xl"
          >
            <span className="relative z-10">Explorar ahora</span>
          </Link>

          <Link
            href="/nosotros"
            className="min-h-12 border-2 border-white/50 px-10 py-4 text-sm font-semibold uppercase tracking-widest text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white hover:bg-white hover:text-gray-900"
          >
            Conocer mas
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 animate-fadeInUp animation-delay-400">
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold text-white md:text-4xl">150+</div>
            <div className="text-xs uppercase tracking-wider text-gray-300">Habitaciones</div>
          </div>
          <div className="border-x border-white/20 text-center">
            <div className="mb-1 text-3xl font-bold text-white md:text-4xl">4.9</div>
            <div className="text-xs uppercase tracking-wider text-gray-300">Calificacion</div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold text-white md:text-4xl">10K+</div>
            <div className="text-xs uppercase tracking-wider text-gray-300">Clientes</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={prevSlide}
        className="group absolute left-6 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-yellow-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 sm:flex"
        aria-label="Diapositiva anterior"
      >
        <svg className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="group absolute right-6 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-yellow-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 sm:flex"
        aria-label="Siguiente diapositiva"
      >
        <svg className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSlide(index)}
            className="flex min-h-10 min-w-10 items-center justify-center"
            aria-label={`Ir a la diapositiva ${index + 1}`}
            aria-pressed={index === currentSlide}
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'h-2.5 w-8 bg-yellow-400'
                  : 'h-2.5 w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="absolute bottom-10 right-10 z-10 hidden animate-bounce lg:block">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
