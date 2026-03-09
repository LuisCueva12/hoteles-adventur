'use client'

import { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

export function LiveChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
        { text: '¡Hola! ¿En qué puedo ayudarte hoy?', isUser: false }
    ])
    const [inputMessage, setInputMessage] = useState('')

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!inputMessage.trim()) return

        // Agregar mensaje del usuario
        setMessages([...messages, { text: inputMessage, isUser: true }])
        
        // Simular respuesta automática
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: 'Gracias por tu mensaje. Un agente te responderá pronto. También puedes contactarnos por WhatsApp para atención inmediata.',
                isUser: false
            }])
        }, 1000)

        setInputMessage('')
    }

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 animate-pulse-slow"
                    aria-label="Abrir chat en vivo"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl animate-slideInUp overflow-hidden">
                    <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Chat en Vivo</h3>
                                <p className="text-xs text-blue-100">Estamos aquí para ayudarte</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-blue-100 transition-all duration-300 hover:rotate-90"
                            aria-label="Cerrar chat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                        message.isUser
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-900 shadow-sm'
                                    }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:shadow-lg"
                                aria-label="Enviar mensaje"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}
