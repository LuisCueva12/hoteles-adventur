'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ClientOnly } from '@/components/ui'

const HERO_IMAGES = [
    {
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
        title: 'Adventur Hotels',
        subtitle: 'El lugar donde buscas escaparte'
    },
    {
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80',
        title: 'Experiencias Únicas',
        subtitle: 'Vive momentos inolvidables'
    },
    {
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80',
        title: 'Lujo y Confort',
        subtitle: 'Tu descanso es nuestra prioridad'
    }
]

// Generar partículas una sola vez
const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 12
}))

export function HeroSeccion() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        if (!isAutoPlaying) return
        
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlaying])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
        setIsAutoPlaying(false)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)
        setIsAutoPlaying(false)
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
        setIsAutoPlaying(false)
    }

    return (
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Imágenes del carrusel */}
            {HERO_IMAGES.map((image, index) => (
                <div key={index} className={`absolute inset-0 transition-all duration-1000 ${
                    index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                }`}>
                    <img
                        src={image.url}
                        alt={image.title}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay con gradiente animado */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                    
                    {/* Efecto de partículas flotantes */}
                    <ClientOnly>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {PARTICLES.map((particle) => (
                                <div
                                    key={particle.id}
                                    className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
                                    style={{
                                        left: `${particle.left}%`,
                                        top: `${particle.top}%`,
                                        animationDelay: `${particle.delay}s`,
                                        animationDuration: `${particle.duration}s`
                                    }}
                                />
                            ))}
                        </div>
                    </ClientOnly>
                </div>
            ))}

            <div className="relative z-10 text-center text-white px-6 max-w-4xl">
                <div className="mb-6 animate-fadeInDown">
                    <span className="inline-block px-4 py-1.5 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full text-red-400 text-xs font-semibold tracking-[0.3em] uppercase">
                        Bienvenido a
                    </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold italic mb-6 animate-fadeInUp animation-delay-100 drop-shadow-2xl" style={{ fontFamily: 'Georgia, serif' }}>
                    {HERO_IMAGES[currentSlide].title}
                </h1>
                
                <div className="flex items-center justify-center gap-3 mb-8 animate-fadeInUp animation-delay-150">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-red-500" />
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-500" />
                </div>
                
                <p className="text-xl md:text-2xl text-gray-200 mb-10 tracking-wide animate-fadeInUp animation-delay-200 font-light">
                    {HERO_IMAGES[currentSlide].subtitle}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp animation-delay-300">
                    <Link href="/hoteles"
                        className="group relative px-10 py-4 bg-red-600 text-white font-semibold text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/50 hover:scale-105">
                        <span className="relative z-10">Explorar ahora</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                    </Link>
                    
                    <Link href="/nosotros"
                        className="px-10 py-4 border-2 border-white/50 backdrop-blur-sm text-white font-semibold text-sm tracking-widest uppercase hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105 hover:border-white">
                        Conocer más
                    </Link>
                </div>
                
                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-6 mt-16 animate-fadeInUp animation-delay-400">
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1">150+</div>
                        <div className="text-xs text-gray-300 uppercase tracking-wider">Habitaciones</div>
                    </div>
                    <div className="text-center border-x border-white/20">
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9★</div>
                        <div className="text-xs text-gray-300 uppercase tracking-wider">Calificación</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
                        <div className="text-xs text-gray-300 uppercase tracking-wider">Clientes</div>
                    </div>
                </div>
            </div>

            <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-red-600 backdrop-blur-md text-white flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 z-20 focus:outline-none focus:ring-2 focus:ring-red-500 border border-white/20 group"
                aria-label="Diapositiva anterior"
            >
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-red-600 backdrop-blur-md text-white flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 z-20 focus:outline-none focus:ring-2 focus:ring-red-500 border border-white/20 group"
                aria-label="Siguiente diapositiva"
            >
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {HERO_IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide 
                                ? 'bg-red-600 w-12 shadow-lg shadow-red-600/50' 
                                : 'bg-white/40 w-2 hover:bg-white/70 hover:w-8'
                        }`}
                        aria-label={`Ir a la diapositiva ${index + 1}`}
                    />
                ))}
            </div>
            
            {/* Scroll indicator */}
            <div className="absolute bottom-10 right-10 z-10 animate-bounce">
                <div className="flex flex-col items-center gap-2 text-white/60">
                    <span className="text-xs uppercase tracking-wider">Scroll</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </section>
    )
}
