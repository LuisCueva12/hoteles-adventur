'use client'

import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'

export function WhatsAppButton() {
    const [isOpen, setIsOpen] = useState(false)
    const phoneNumber = '51976123456'
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus servicios.')

    const handleWhatsAppClick = () => {
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
        setIsOpen(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 animate-pulse-slow"
                aria-label="Contactar por WhatsApp"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl animate-slideInUp overflow-hidden">
                    <div className="bg-green-500 text-white p-4">
                        <h3 className="font-semibold text-lg">¿Necesitas ayuda?</h3>
                        <p className="text-sm text-green-50">Estamos aquí para ayudarte</p>
                    </div>
                    <div className="p-4">
                        <p className="text-gray-600 text-sm mb-4">
                            Haz clic en el botón de abajo para iniciar una conversación con nosotros en WhatsApp.
                        </p>
                        <button
                            onClick={handleWhatsAppClick}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Iniciar chat
                        </button>
                        <p className="text-xs text-gray-500 mt-3 text-center">
                            Horario: Lun - Dom, 8:00 AM - 10:00 PM
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
