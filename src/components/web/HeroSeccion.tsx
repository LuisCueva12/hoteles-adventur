'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

export function HeroSeccion() {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)
    }

    return (
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
            {HERO_IMAGES.map((image, index) => (
                <img
                    key={index}
                    src={image.url}
                    alt={image.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                        index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

            <div className="relative z-10 text-center text-white px-6 max-w-3xl">
                <p className="text-red-400 text-sm font-semibold tracking-[0.3em] uppercase mb-4 animate-fadeInDown">
                    Bienvenido a
                </p>
                <h1 className="text-5xl md:text-7xl font-bold italic mb-4 animate-fadeInUp animation-delay-100" style={{ fontFamily: 'Georgia, serif' }}>
                    {HERO_IMAGES[currentSlide].title}
                </h1>
                <p className="text-lg text-gray-300 mb-10 tracking-widest uppercase animate-fadeInUp animation-delay-200">
                    {HERO_IMAGES[currentSlide].subtitle}
                </p>
                <Link href="/hoteles"
                    className="inline-block px-10 py-3.5 border-2 border-white text-white font-semibold text-sm tracking-widest uppercase hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeInUp animation-delay-300">
                    Explorar ahora
                </Link>
            </div>

            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 z-20"
            >
                &lt;
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 z-20"
            >
                &gt;
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {HERO_IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/70'
                        }`}
                    />
                ))}
            </div>
        </section>
    )
}
