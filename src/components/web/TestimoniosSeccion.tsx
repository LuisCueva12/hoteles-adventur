'use client'

import { useState } from 'react'

const TESTIMONIALS = [
    {
        name: 'María González',
        location: 'Lima, Perú',
        rating: 5,
        comment: 'Una experiencia inolvidable. El servicio es excepcional y las instalaciones son de primera clase. Definitivamente volveré.',
        image: 'https://i.pravatar.cc/150?img=1'
    },
    {
        name: 'Carlos Rodríguez',
        location: 'Buenos Aires, Argentina',
        rating: 5,
        comment: 'El mejor hotel en el que me he hospedado. La atención al detalle y el profesionalismo del personal son impresionantes.',
        image: 'https://i.pravatar.cc/150?img=12'
    },
    {
        name: 'Ana Martínez',
        location: 'Madrid, España',
        rating: 5,
        comment: 'Perfecto para una escapada romántica. Las vistas son espectaculares y el spa es increíble. Muy recomendado.',
        image: 'https://i.pravatar.cc/150?img=5'
    },
    {
        name: 'Jorge Silva',
        location: 'Santiago, Chile',
        rating: 4,
        comment: 'Excelente ubicación y servicios. El restaurante ofrece una gastronomía excepcional. Una gran experiencia.',
        image: 'https://i.pravatar.cc/150?img=13'
    },
]

export function TestimoniosSeccion() {
    const [currentIndex, setCurrentIndex] = useState(0)

    const next = () => setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    const prev = () => setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)

    const current = TESTIMONIALS[currentIndex]

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-14">
                    <p className="text-red-600 text-xs font-semibold tracking-[0.3em] uppercase mb-3">
                        Testimonios
                    </p>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
                        Lo que dicen nuestros huéspedes
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-16 bg-red-600" />
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <div className="h-px w-16 bg-red-600" />
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-50 p-8 md:p-12 rounded-sm relative">
                        <div className="text-red-600 text-6xl absolute top-4 left-4 opacity-20">"</div>
                        
                        <div className="flex flex-col items-center text-center relative z-10">
                            <img
                                src={current.image}
                                alt={current.name}
                                className="w-20 h-20 rounded-full object-cover mb-6 border-4 border-white shadow-lg"
                            />
                            
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-xl ${i < current.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                        ★
                                    </span>
                                ))}
                            </div>

                            <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                                {current.comment}
                            </p>

                            <h4 className="font-semibold text-gray-900 text-lg">{current.name}</h4>
                            <p className="text-gray-500 text-sm">{current.location}</p>
                        </div>

                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={prev}
                                className="w-10 h-10 bg-white hover:bg-red-600 hover:text-white text-gray-600 rounded-full flex items-center justify-center transition-all duration-300 shadow focus:outline-none focus:ring-2 focus:ring-red-600"
                                aria-label="Testimonio anterior"
                            >
                                ←
                            </button>
                            
                            <div className="flex gap-2">
                                {TESTIMONIALS.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            idx === currentIndex ? 'bg-red-600 w-8' : 'bg-gray-300'
                                        }`}
                                        aria-label={`Ir al testimonio ${idx + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={next}
                                className="w-10 h-10 bg-white hover:bg-red-600 hover:text-white text-gray-600 rounded-full flex items-center justify-center transition-all duration-300 shadow focus:outline-none focus:ring-2 focus:ring-red-600"
                                aria-label="Siguiente testimonio"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mt-16">
                    {[
                        { value: '4.9/5', label: 'Calificación promedio' },
                        { value: '2,500+', label: 'Reseñas positivas' },
                        { value: '98%', label: 'Clientes satisfechos' },
                        { value: '95%', label: 'Recomendarían' },
                    ].map((stat, index) => (
                        <div key={stat.label} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeInUp">
                            <p className="text-3xl font-bold text-red-600 mb-2">{stat.value}</p>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
