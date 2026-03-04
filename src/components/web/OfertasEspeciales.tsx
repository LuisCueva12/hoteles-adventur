'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Tag, TrendingUp } from 'lucide-react'

const OFERTAS = [
    {
        id: 1,
        titulo: 'Escapada de Fin de Semana',
        descripcion: 'Reserva 2 noches y obtén la 3ra noche gratis',
        descuento: '33% OFF',
        imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        validoHasta: '2026-03-31',
        codigo: 'WEEKEND33',
        destacado: true
    },
    {
        id: 2,
        titulo: 'Oferta Romántica',
        descripcion: 'Incluye cena para dos, champagne y decoración especial',
        descuento: '25% OFF',
        imagen: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
        validoHasta: '2026-04-15',
        codigo: 'ROMANCE25',
        destacado: false
    },
    {
        id: 3,
        titulo: 'Reserva Anticipada',
        descripcion: 'Reserva con 30 días de anticipación y ahorra',
        descuento: '20% OFF',
        imagen: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        validoHasta: '2026-12-31',
        codigo: 'EARLY20',
        destacado: false
    }
]

export function OfertasEspeciales() {
    const [timeLeft, setTimeLeft] = useState<Record<number, string>>({})

    useEffect(() => {
        const calculateTimeLeft = () => {
            const newTimeLeft: Record<number, string> = {}
            
            OFERTAS.forEach(oferta => {
                const difference = new Date(oferta.validoHasta).getTime() - new Date().getTime()
                
                if (difference > 0) {
                    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
                    newTimeLeft[oferta.id] = `${days} días restantes`
                } else {
                    newTimeLeft[oferta.id] = 'Oferta expirada'
                }
            })
            
            setTimeLeft(newTimeLeft)
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000 * 60 * 60) // Actualizar cada hora

        return () => clearInterval(timer)
    }, [])

    return (
        <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full mb-4 animate-pulse-slow">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Ofertas Limitadas</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                        Ofertas Especiales
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Aprovecha nuestras promociones exclusivas y vive una experiencia inolvidable
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {OFERTAS.map((oferta, index) => (
                        <div 
                            key={oferta.id} 
                            className={`group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 animate-fadeInUp hover:-translate-y-2 ${
                                oferta.destacado ? 'ring-4 ring-red-600 ring-offset-4' : ''
                            }`}
                        >
                            {oferta.destacado && (
                                <div className="absolute top-4 left-4 z-10 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg animate-pulse-slow">
                                    ⭐ Más Popular
                                </div>
                            )}
                            
                            <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                {oferta.descuento}
                            </div>

                            <div className="relative h-56 overflow-hidden">
                                <img 
                                    src={oferta.imagen} 
                                    alt={oferta.titulo}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">
                                    {oferta.titulo}
                                </h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {oferta.descripcion}
                                </p>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <Clock className="w-4 h-4" />
                                    <span>{timeLeft[oferta.id]}</span>
                                </div>

                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg mb-4">
                                    <Tag className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-mono font-semibold text-gray-900">
                                        {oferta.codigo}
                                    </span>
                                </div>

                                <Link 
                                    href={`/hoteles?oferta=${oferta.codigo}`}
                                    className="block w-full text-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                                >
                                    Reservar Ahora
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-600 mb-4">
                        * Las ofertas están sujetas a disponibilidad y términos y condiciones
                    </p>
                    <Link 
                        href="/hoteles"
                        className="inline-block px-8 py-3 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Ver Todas las Habitaciones
                    </Link>
                </div>
            </div>
        </section>
    )
}
