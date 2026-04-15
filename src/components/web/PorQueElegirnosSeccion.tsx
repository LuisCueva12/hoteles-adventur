'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const FILTERS = ['Todo', 'Restaurante', 'Piscina', 'Spa', 'Eventos']

const GALLERY = [
    { img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', cat: 'Restaurante', alt: 'Restaurante gourmet del hotel' },
    { img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', cat: 'Restaurante', alt: 'Platos gourmet' },
    { img: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80', cat: 'Piscina', alt: 'Piscina del hotel' },
    { img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', cat: 'Piscina', alt: 'Área de piscina' },
    { img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', cat: 'Spa', alt: 'Spa y wellness' },
    { img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', cat: 'Eventos', alt: 'Salón de eventos' },
    { img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', cat: 'Restaurante', alt: 'Bar del hotel' },
    { img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80', cat: 'Spa', alt: 'Tratamientos de spa' },
]

export function PorQueElegirnosSeccion() {
    const [active, setActive] = useState('Todo')
    const filtered = active === 'Todo' ? GALLERY : GALLERY.filter((g) => g.cat === active)

    return (
        <section className="py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 animate-fadeInUp">
                    <div className="inline-block mb-4">
                        <span className="px-4 py-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold tracking-[0.3em] uppercase rounded-full">
                            Nuestras Instalaciones
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">
                        Por qué <span className="text-yellow-400">elegirnos</span>
                    </h2>
                    
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-400" />
                    </div>
                    
                    <p className="text-gray-300 max-w-2xl mx-auto text-base leading-relaxed mb-10">
                        Descubre nuestras increíbles instalaciones diseñadas para tu comodidad y disfrute
                    </p>
                    
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        {FILTERS.map((f) => (
                            <button key={f} type="button" onClick={() => setActive(f)}
                                className={`min-h-[44px] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full border-2 transition-all duration-300 ${active === f
                                    ? 'bg-yellow-400 border-yellow-400 text-gray-900 shadow-lg shadow-red-600/30 scale-105'
                                    : 'border-gray-500 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 hover:bg-yellow-400/5'
                                    }`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                    {filtered.map((item, i) => (
                        <div key={i} className="group relative h-64 overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fadeInUp">
                            <Image
                                src={item.img}
                                alt={item.alt}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                loading="lazy"
                                />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all" />
                            
                            {/* Contenido */}
                            <div className="absolute inset-0 flex flex-col justify-end p-5">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <span className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-semibold rounded-full mb-2">
                                        {item.cat}
                                    </span>
                                    <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Descubre nuestras instalaciones
                                    </p>
                                </div>
                            </div>
                            
                            {/* Icono de zoom */}
                            <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/galeria"
                        className="inline-flex items-center gap-3 px-12 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 rounded-full group">
                        Ver galería completa
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    )
}
