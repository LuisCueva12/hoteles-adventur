'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const WHATSAPP_DEFAULT = '51918146783'

const QUICK_REPLIES = [
    '¿Cuáles son los precios?',
    '¿Tienen disponibilidad?',
    '¿Cómo hago una reserva?',
    '¿Cuál es el horario de check-in?',
]

// Memoizar botones de respuesta rápida para evitar re-renders
const QuickReplyButton = memo(function QuickReplyButton({
    text,
    onClick,
}: {
    text: string
    onClick: (text: string) => void
}) {
    return (
        <button
            onClick={() => onClick(text)}
            className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
            {text}
        </button>
    )
})

export function LiveChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [whatsapp, setWhatsapp] = useState(WHATSAPP_DEFAULT)
    const [inputMessage, setInputMessage] = useState('')
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
        { text: '¡Hola! Soy el asistente de Hotel Adventur. ¿En qué puedo ayudarte? Puedes escribirme aquí o contactarnos directamente por WhatsApp para atención inmediata.', isUser: false }
    ])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    // Crear cliente una sola vez con useRef para evitar re-creaciones en cada render
    const supabaseRef = useRef(createClient())

    useEffect(() => {
        supabaseRef.current.from('configuracion').select('whatsapp').maybeSingle().then(({ data }) => {
            if (data?.whatsapp) setWhatsapp(data.whatsapp.replace(/\D/g, ''))
        })
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const openWhatsApp = useCallback((text?: string) => {
        const msg = text || inputMessage.trim()
        const encoded = encodeURIComponent(msg || '¡Hola! Me gustaría obtener más información sobre sus alojamientos.')
        window.open(`https://wa.me/${whatsapp}?text=${encoded}`, '_blank')
    }, [inputMessage, whatsapp])

    const handleSend = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        if (!inputMessage.trim()) return

        const userMsg = inputMessage.trim()
        setMessages(prev => [...prev, { text: userMsg, isUser: true }])
        setInputMessage('')

        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: 'Gracias por tu mensaje. Para una respuesta inmediata, te recomendamos contactarnos por WhatsApp. ¡Haz clic en el botón de abajo!',
                isUser: false
            }])
        }, 800)
    }, [inputMessage])

    const handleQuickReply = useCallback((text: string) => {
        openWhatsApp(text)
    }, [openWhatsApp])

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Abrir chat en vivo"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '560px' }}>
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Chat en Vivo</h3>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <p className="text-xs text-blue-100">En línea ahora</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-100 transition-colors" aria-label="Cerrar chat">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                                    msg.isUser
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick replies */}
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                        <p className="text-xs text-gray-400 mb-2">Preguntas frecuentes:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_REPLIES.map(q => (
                                <QuickReplyButton key={q} text={q} onClick={handleQuickReply} />
                            ))}
                        </div>
                    </div>

                    {/* WhatsApp CTA */}
                    <div className="px-4 py-2 bg-green-50 border-t border-green-100 flex-shrink-0">
                        <button
                            onClick={() => openWhatsApp()}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Continuar en WhatsApp
                            <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={e => setInputMessage(e.target.value)}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                            />
                            <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors" aria-label="Enviar">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}
