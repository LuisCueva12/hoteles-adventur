'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
    {
        question: '¿Cuál es el horario de check-in y check-out?',
        answer: 'El check-in es a partir de las 3:00 PM y el check-out hasta las 12:00 PM. Ofrecemos check-in anticipado y check-out tardío sujeto a disponibilidad con cargo adicional.'
    },
    {
        question: '¿Ofrecen servicio de transporte desde el aeropuerto?',
        answer: 'Sí, ofrecemos servicio de traslado desde y hacia el aeropuerto. Puede reservarlo al momento de hacer su reserva o contactándonos directamente. El servicio tiene un costo adicional.'
    },
    {
        question: '¿Aceptan mascotas?',
        answer: 'Sí, somos pet-friendly. Aceptamos mascotas pequeñas y medianas con un cargo adicional de S/. 50 por noche. Por favor infórmenos al momento de la reserva.'
    },
    {
        question: '¿Está incluido el desayuno?',
        answer: 'El desayuno está incluido en las habitaciones Deluxe y Premium. Para las habitaciones Estándar y Superior, puede agregarse por S/. 35 por persona.'
    },
    {
        question: '¿Tienen estacionamiento?',
        answer: 'Sí, contamos con estacionamiento gratuito para nuestros huéspedes con seguridad 24/7. También ofrecemos servicio de valet parking.'
    },
    {
        question: '¿Cuál es la política de cancelación?',
        answer: 'Puede cancelar sin cargo hasta 48 horas antes de su llegada. Cancelaciones con menos de 48 horas de anticipación tienen un cargo del 50% de la primera noche.'
    },
    {
        question: '¿Tienen WiFi gratuito?',
        answer: 'Sí, ofrecemos WiFi de alta velocidad gratuito en todas las áreas del hotel, incluyendo habitaciones, lobby, restaurante y áreas comunes.'
    },
    {
        question: '¿Organizan eventos y conferencias?',
        answer: 'Sí, contamos con salones para eventos con capacidad de hasta 500 personas. Ofrecemos servicios completos de catering, equipamiento audiovisual y planificación de eventos.'
    }
]

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="px-4 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-semibold tracking-[0.3em] uppercase rounded-full">
                            FAQ
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
                        Preguntas <span className="text-yellow-600">Frecuentes</span>
                    </h2>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-red-600 to-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent via-red-600 to-yellow-400" />
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
                        Encuentra respuestas a las preguntas más comunes sobre tu estadía
                    </p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => (
                        <div 
                            key={index}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                aria-expanded={openIndex === index}
                            >
                                <span className="font-semibold text-gray-900 pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown 
                                    className={`w-5 h-5 text-yellow-600 flex-shrink-0 transition-transform duration-300 ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            
                            <div 
                                className={`overflow-hidden transition-all duration-300 ${
                                    openIndex === index ? 'max-h-96' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-4">
                        ¿No encuentras lo que buscas?
                    </p>
                    <a 
                        href="/contacto"
                        className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                        Contáctanos
                    </a>
                </div>
            </div>
        </section>
    )
}
