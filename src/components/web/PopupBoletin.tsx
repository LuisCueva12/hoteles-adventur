'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Check } from 'lucide-react'

export function NewsletterPopup() {
    const [isVisible, setIsVisible] = useState(false)
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        const hasSeenPopup = localStorage.getItem('newsletter-popup-seen')
        
        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 10000) // Mostrar después de 10 segundos

            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        setIsVisible(false)
        localStorage.setItem('newsletter-popup-seen', 'true')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Aquí conectar con servicio de email
        console.log('Newsletter signup:', email)
        
        setIsSubmitted(true)
        setTimeout(() => {
            handleClose()
        }, 2000)
    }

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
            <div className="bg-white rounded-lg max-w-md w-full p-8 relative animate-scaleIn shadow-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:rotate-90"
                    aria-label="Cerrar"
                >
                    <X className="w-6 h-6" />
                </button>

                {!isSubmitted ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-yellow-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                ¡Ofertas Exclusivas!
                            </h3>
                            <p className="text-gray-600">
                                Suscríbete y recibe un 15% de descuento en tu primera reserva
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Tu email"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-all"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                Obtener Descuento
                            </button>
                        </form>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            No spam. Puedes darte de baja en cualquier momento.
                        </p>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Gracias!
                        </h3>
                        <p className="text-gray-600">
                            Revisa tu email para obtener tu código de descuento
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
