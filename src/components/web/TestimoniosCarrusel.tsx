'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Quote, ShieldCheck, Star } from 'lucide-react'

export type TestimonialItem = {
  name: string
  location: string
  rating: number
  comment: string
  trip: string
  highlight: string
  resume: string
  initials: string
}

const KPI_ITEMS = [
  { value: '4.9/5', label: 'Promedio general' },
  { value: '2,500+', label: 'Resenas positivas' },
  { value: '98%', label: 'Clientes satisfechos' },
  { value: '95%', label: 'Volverian a reservar' },
]

export function TestimoniosCarrusel({
  initialTestimonials,
}: {
  initialTestimonials: TestimonialItem[]
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const testimonials = initialTestimonials.length ? initialTestimonials : []
  const currentTestimonial = testimonials[currentIndex] ?? testimonials[0]
  const sectionRef = useRef<HTMLElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (testimonials.length <= 1) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6500)
  }, [testimonials.length])

  // Pausar autoplay cuando la sección no es visible (IntersectionObserver)
  useEffect(() => {
    const el = sectionRef.current
    if (!el || testimonials.length <= 1) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTimer()
        } else {
          if (timerRef.current) clearInterval(timerRef.current)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer, testimonials.length])

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    startTimer()
  }, [testimonials.length, startTimer])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    startTimer()
  }, [testimonials.length, startTimer])

  if (!currentTestimonial) {
    return null
  }

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fff9e8_52%,#fffefb_100%)] py-20 sm:py-24">
      <div className="absolute left-[-5rem] top-24 h-56 w-56 rounded-full bg-yellow-200/40 blur-3xl" />
      <div className="absolute right-[-5rem] bottom-16 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-yellow-700">
            <ShieldCheck className="h-4 w-4" />
            Testimonios reales
          </span>

          <h2 className="mt-5 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Opiniones que si se sienten
            <span className="block text-yellow-600">como un carrusel premium.</span>
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
            Una historia a la vez, mejor ritmo visual y foco total en la experiencia del huesped.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-[34px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-col gap-5 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Carrusel de testimonios</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                Historia destacada: {currentTestimonial.highlight}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prev}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-yellow-300 hover:bg-yellow-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Testimonio anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="rounded-full border border-yellow-100 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
                {currentIndex + 1} / {testimonials.length}
              </div>

              <button
                type="button"
                onClick={next}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-yellow-300 hover:bg-yellow-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Siguiente testimonio"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {testimonials.map((testimonial) => (
                <article key={`${testimonial.name}-${testimonial.highlight}`} className="min-w-full">
                  <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="bg-[linear-gradient(180deg,#111827_0%,#1f2937_100%)] p-6 text-white sm:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-yellow-300">
                          {testimonial.initials}
                        </div>
                        <Quote className="h-10 w-10 text-yellow-300/60" />
                      </div>

                      <div className="mt-6 flex gap-1">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className={`h-5 w-5 ${
                              starIndex < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>

                      <h4 className="mt-5 text-3xl font-bold">{testimonial.name}</h4>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                        <MapPin className="h-4 w-4 text-yellow-300" />
                        <span>{testimonial.location}</span>
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Tipo de viaje</p>
                          <p className="mt-2 text-base font-semibold text-white">{testimonial.trip}</p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Lo mejor</p>
                          <p className="mt-2 text-base font-semibold text-yellow-300">{testimonial.highlight}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between bg-[linear-gradient(180deg,#ffffff_0%,#fffdf7_100%)] p-6 sm:p-8 lg:p-10">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Experiencia destacada</p>
                        <p className="mt-6 text-xl leading-10 text-slate-700 sm:text-2xl">"{testimonial.comment}"</p>
                      </div>

                      <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Resumen</p>
                          <p className="mt-2 text-sm font-medium leading-7 text-slate-700">{testimonial.resume}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Valoracion</p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-3xl font-black text-yellow-600">{testimonial.rating}.0</span>
                            <span className="text-sm font-medium text-slate-600">sobre 5 estrellas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-5 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {testimonials.map((testimonial, index) => {
                const active = index === currentIndex

                return (
                  <button
                    key={`${testimonial.name}-${index}`}
                    type="button"
                    onClick={() => { setCurrentIndex(index); startTimer() }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      active ? 'border-yellow-300 bg-yellow-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-yellow-200 hover:bg-white'
                    }`}
                    aria-label={`Ir al testimonio de ${testimonial.name}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                          active ? 'bg-yellow-400 text-slate-950' : 'bg-white text-slate-700'
                        }`}
                      >
                        {testimonial.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{testimonial.name}</p>
                        <p className="truncate text-xs text-slate-600">{testimonial.highlight}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => { setCurrentIndex(index); startTimer() }}
                  className="flex min-h-10 min-w-10 items-center justify-center"
                  aria-label={`Ir al testimonio ${index + 1}`}
                  aria-pressed={index === currentIndex}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'h-2.5 w-8 bg-yellow-500'
                        : 'h-2.5 w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_ITEMS.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-slate-200/80 bg-white/90 px-5 py-5 text-center shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1"
            >
              <p className="text-3xl font-black text-yellow-600">{item.value}</p>
              <p className="mt-2 text-sm text-slate-700">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
