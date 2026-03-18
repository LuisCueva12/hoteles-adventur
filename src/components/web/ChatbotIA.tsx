'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, Sparkles, Loader2, Minimize2, Maximize2, RotateCcw, Copy, Check, Mic, MicOff, Download, ThumbsUp, ThumbsDown, Moon, Sun, Search, Calendar, DollarSign, MapPin, Hotel, Wrench, Gift, BookOpen } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    feedback?: 'positive' | 'negative' | null
    rooms?: RoomCard[]
}

interface RoomCard {
    name: string
    slug: string
    price: string
    description: string
    image: string
}

interface Habitacion {
    id: string
    nombre: string
    precio_noche: number
    capacidad: number
    disponible: boolean
    fotos?: string[]
}

const QUICK_QUESTIONS = [
    { icon: Hotel,    text: '¿Qué habitaciones tienen disponibles?', category: 'rooms' },
    { icon: DollarSign, text: '¿Cuáles son los precios?', category: 'pricing' },
    { icon: Wrench,   text: '¿Qué servicios ofrecen?', category: 'services' },
    { icon: MapPin,   text: '¿Dónde están ubicados?', category: 'location' },
    { icon: Calendar, text: 'Quiero hacer una reserva', category: 'booking' },
    { icon: Gift,     text: '¿Tienen ofertas especiales?', category: 'offers' },
]

const SMART_SUGGESTIONS: Record<string, string[]> = {
    rooms: ['¿Cuántas personas pueden hospedarse?', '¿Tienen suite presidencial?', '¿Las habitaciones tienen vista al mar?'],
    pricing: ['¿Incluye desayuno?', '¿Hay descuentos por estadía larga?', '¿Aceptan tarjetas de crédito?'],
    services: ['¿Tienen spa?', '¿Hay restaurante en el hotel?', '¿Ofrecen transporte al aeropuerto?'],
    location: ['¿Cómo llego desde el aeropuerto?', '¿Qué atracciones hay cerca?', '¿Tienen estacionamiento?'],
    booking: ['¿Cómo puedo reservar?', '¿Cuál es la política de cancelación?', '¿Necesito dejar adelanto?'],
    offers: ['¿Tienen paquetes románticos?', '¿Hay descuentos para grupos?', '¿Ofrecen tours?'],
}

// Función para limpiar y formatear el texto de Gemini
const formatMessage = (text: string): string => {
    return text
        // Eliminar asteriscos de negritas (**texto**)
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        // Eliminar asteriscos simples (*texto*)
        .replace(/\*([^*]+)\*/g, '$1')
        // Eliminar asteriscos sueltos
        .replace(/\*/g, '')
        // Limpiar espacios múltiples
        .replace(/\s+/g, ' ')
        .trim()
}

// Función para formatear el mensaje con estructura visual
const formatMessageWithStructure = (text: string): React.ReactElement[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const elements: React.ReactElement[] = []
    
    lines.forEach((line, index) => {
        const trimmedLine = line.trim()
        
        // Detectar títulos (líneas cortas seguidas de dos puntos o líneas en mayúsculas)
        if (trimmedLine.endsWith(':') && trimmedLine.length < 60) {
            elements.push(
                <div key={index} className="font-bold text-base mt-4 mb-2 text-red-600 flex items-center gap-2">
                    <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                    {trimmedLine}
                </div>
            )
        }
        // Detectar listas (líneas que empiezan con -, •, números, o emojis)
        else if (/^[-•\d]+\.?\s/.test(trimmedLine) || /^[🏨✨🍽️🏊💪🚗🎯🌟📍⭐🎁👨‍👩‍👧‍👦💼🌙]/.test(trimmedLine)) {
            elements.push(
                <div key={index} className="flex gap-3 py-1.5 pl-2">
                    <span className="text-red-500 font-bold flex-shrink-0">•</span>
                    <span className="flex-1">{trimmedLine.replace(/^[-•\d]+\.?\s/, '')}</span>
                </div>
            )
        }
        // Detectar secciones importantes (líneas con emojis al inicio)
        else if (/^[🏨✨🍽️🏊💪🚗🎯🌟📍⭐🎁👨‍👩‍👧‍👦💼🌙]/.test(trimmedLine)) {
            elements.push(
                <div key={index} className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-3 rounded-lg my-2 border-l-4 border-red-500">
                    {trimmedLine}
                </div>
            )
        }
        // Texto normal
        else {
            elements.push(
                <p key={index} className="py-1 leading-relaxed">
                    {trimmedLine}
                </p>
            )
        }
    })
    
    return elements
}

// Función para extraer tarjetas de habitaciones del mensaje
const extractRoomCards = (text: string): { cleanText: string; rooms: RoomCard[] } => {
    const rooms: RoomCard[] = []
    const lines = text.split('\n')
    let i = 0
    const cleanLines: string[] = []
    
    while (i < lines.length) {
        const line = lines[i].trim()
        
        // Detectar inicio de tarjeta de habitación
        if (line.startsWith('[ROOM:') && line.endsWith(']')) {
            const slug = line.substring(6, line.length - 1).trim()
            
            // Extraer las siguientes 3 líneas (nombre, precio, descripción)
            if (i + 3 < lines.length) {
                const name = lines[i + 1].trim()
                const price = lines[i + 2].trim()
                const description = lines[i + 3].trim()
                
                // Mapeo de imágenes por slug
                const imageMap: Record<string, string> = {
                    'suite-presidencial': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
                    'suite-ejecutiva': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
                    'habitacion-deluxe': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
                    'habitacion-superior': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
                }
                
                if (name && price && description) {
                    rooms.push({
                        name,
                        slug,
                        price,
                        description,
                        image: imageMap[slug] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'
                    })
                    
                    // Saltar las 4 líneas procesadas (marcador + 3 líneas de datos)
                    i += 4
                    continue
                }
            }
        }
        
        // Si no es una tarjeta, agregar la línea al texto limpio
        if (line) {
            cleanLines.push(line)
        }
        i++
    }
    
    const cleanText = cleanLines.join('\n').trim()
    
    return { cleanText, rooms }
}

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showQuickQuestions, setShowQuickQuestions] = useState(true)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [isListening, setIsListening] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [smartSuggestions, setSmartSuggestions] = useState<string[]>([])
    const [currentCategory, setCurrentCategory] = useState<string>('')
    const [habitaciones, setHabitaciones] = useState<Habitacion[]>([])
    const [showRoomSearch, setShowRoomSearch] = useState(false)
    const [messageCount, setMessageCount] = useState(0)
    const [avgResponseTime, setAvgResponseTime] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const recognitionRef = useRef<any>(null)
    const supabase = createClient()

    // Cargar historial del localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatbot_history')
        const savedStats = localStorage.getItem('chatbot_stats')
        
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages)
                setMessages(parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                })))
            } catch (e) {
                console.error('Error loading history:', e)
                initializeChat()
            }
        } else {
            initializeChat()
        }

        if (savedStats) {
            try {
                const stats = JSON.parse(savedStats)
                setMessageCount(stats.messageCount || 0)
                setAvgResponseTime(stats.avgResponseTime || 0)
            } catch (e) {
                console.error('Error loading stats:', e)
            }
        }
    }, [])

    // Guardar historial en localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatbot_history', JSON.stringify(messages))
        }
    }, [messages])

    // Guardar estadísticas
    useEffect(() => {
        localStorage.setItem('chatbot_stats', JSON.stringify({
            messageCount,
            avgResponseTime
        }))
    }, [messageCount, avgResponseTime])

    // Cargar habitaciones disponibles
    useEffect(() => {
        if (isOpen) {
            loadHabitaciones()
        }
    }, [isOpen])

    const initializeChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: '¡Hola! Soy tu asistente inteligente de Adventur, tu hotel de lujo.\n\nPuedo ayudarte con:\n• Información de habitaciones en tiempo real\n• Precios y disponibilidad\n• Servicios y amenidades\n• Reservas y consultas\n\n¿En qué puedo ayudarte hoy?',
                timestamp: new Date(),
                feedback: null
            }
        ])
    }

    const loadHabitaciones = async () => {
        try {
            const { data, error } = await supabase
                .from('alojamientos')
                .select('id, nombre, precio_noche, capacidad, disponible, fotos')
                .eq('disponible', true)
                .limit(10)

            if (error) throw error
            if (data) setHabitaciones(data)
        } catch (error) {
            console.error('Error loading rooms:', error)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen, isMinimized])

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input.trim()
        if (!textToSend || isLoading) return

        const startTime = Date.now()
        const userMessage: Message = {
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
            feedback: null
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        setShowQuickQuestions(false)

        // Detectar categoría para sugerencias inteligentes
        const lowerText = textToSend.toLowerCase()
        let detectedCategory = ''
        if (lowerText.includes('habitacion') || lowerText.includes('suite') || lowerText.includes('cuarto')) {
            detectedCategory = 'rooms'
        } else if (lowerText.includes('precio') || lowerText.includes('costo') || lowerText.includes('pagar')) {
            detectedCategory = 'pricing'
        } else if (lowerText.includes('servicio') || lowerText.includes('spa') || lowerText.includes('restaurante')) {
            detectedCategory = 'services'
        } else if (lowerText.includes('ubicacion') || lowerText.includes('direccion') || lowerText.includes('llegar')) {
            detectedCategory = 'location'
        } else if (lowerText.includes('reserva') || lowerText.includes('booking')) {
            detectedCategory = 'booking'
        } else if (lowerText.includes('oferta') || lowerText.includes('descuento') || lowerText.includes('promocion')) {
            detectedCategory = 'offers'
        }

        if (detectedCategory && SMART_SUGGESTIONS[detectedCategory]) {
            setSmartSuggestions(SMART_SUGGESTIONS[detectedCategory])
            setCurrentCategory(detectedCategory)
        }

        try {
            // Agregar información de habitaciones disponibles al contexto
            let roomsContext = ''
            if (habitaciones.length > 0 && (lowerText.includes('habitacion') || lowerText.includes('disponible') || lowerText.includes('precio'))) {
                roomsContext = '\n\nHabitaciones disponibles actualmente:\n'
                habitaciones.forEach(h => {
                    roomsContext += `- ${h.nombre}: S/ ${h.precio_noche} por noche, capacidad ${h.capacidad} personas\n`
                })
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content + roomsContext,
                    history: messages.slice(1).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            })

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error)
            }

            const endTime = Date.now()
            const responseTime = endTime - startTime

            // Actualizar estadísticas
            setMessageCount(prev => prev + 1)
            setAvgResponseTime(prev => {
                if (prev === 0) return responseTime
                return Math.round((prev + responseTime) / 2)
            })

            // Extraer tarjetas de habitaciones del mensaje
            const { cleanText, rooms } = extractRoomCards(data.response)

            const assistantMessage: Message = {
                role: 'assistant',
                content: cleanText || data.response,
                timestamp: new Date(),
                feedback: null,
                rooms: rooms.length > 0 ? rooms : undefined
            }

            setMessages(prev => [...prev, assistantMessage])

            // Síntesis de voz (opcional)
            if ('speechSynthesis' in window && isDarkMode) {
                const utterance = new SpeechSynthesisUtterance(formatMessage(data.response))
                utterance.lang = 'es-ES'
                utterance.rate = 0.9
                // window.speechSynthesis.speak(utterance)
            }
        } catch (error: any) {
            console.error('Error:', error)
            const errorMessage: Message = {
                role: 'assistant',
                content: `Lo siento, hubo un error: ${error.message}. Por favor, intenta de nuevo o contacta directamente al hotel.`,
                timestamp: new Date(),
                feedback: null
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleQuickQuestion = (question: string, category: string) => {
        setCurrentCategory(category)
        if (SMART_SUGGESTIONS[category]) {
            setSmartSuggestions(SMART_SUGGESTIONS[category])
        }
        handleSend(question)
    }

    const handleReset = () => {
        localStorage.removeItem('chatbot_history')
        setSmartSuggestions([])
        setCurrentCategory('')
        initializeChat()
        setShowQuickQuestions(true)
    }

    const handleFeedback = (index: number, feedback: 'positive' | 'negative') => {
        setMessages(prev => prev.map((msg, i) => 
            i === index ? { ...msg, feedback } : msg
        ))
    }

    const toggleVoiceRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Tu navegador no soporta reconocimiento de voz. Intenta con Chrome.')
            return
        }

        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
        } else {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            const recognition = new SpeechRecognition()
            recognition.lang = 'es-ES'
            recognition.continuous = false
            recognition.interimResults = false

            recognition.onstart = () => {
                setIsListening(true)
            }

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setInput(transcript)
                setIsListening(false)
            }

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error)
                setIsListening(false)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current = recognition
            recognition.start()
        }
    }

    const exportConversation = () => {
        const text = messages.map(m => 
            `[${m.timestamp.toLocaleString('es-PE')}] ${m.role === 'user' ? 'Tú' : 'Asistente'}: ${formatMessage(m.content)}`
        ).join('\n\n')

        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `conversacion-adventur-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    return (
        <>
            {/* Botón flotante mejorado */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-[88px] z-50 group"
                    aria-label="Abrir chat IA"
                >
                    <div className="relative">
                        {/* Anillo pulsante */}
                        <div className="absolute inset-0 w-16 h-16 bg-red-600 rounded-full animate-ping opacity-20" />
                        
                        {/* Botón principal */}
                        <div className="relative w-16 h-16 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-red-600/50">
                            <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                            
                            {/* Badge de IA */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                            
                            {/* Indicador en línea */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                            
                            {/* Contador de mensajes */}
                            {messageCount > 0 && (
                                <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-white">{messageCount}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </button>
            )}

            {/* Ventana del chat mejorada */}
            {isOpen && (
                <div className={`fixed bottom-6 right-[88px] z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} transition-all duration-300 ${
                    isMinimized ? 'w-[350px] h-[80px]' : 'w-[500px] h-[700px]'
                } animate-fadeInUp`}>
                    {/* Header mejorado */}
                    <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white p-5 flex items-center justify-between relative overflow-hidden">
                        {/* Elementos decorativos animados */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-900/30 rounded-full blur-3xl" />
                        
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="relative">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                                    <Bot className="w-7 h-7" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl flex items-center gap-2">
                                    Asistente IA
                                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                                </h3>
                                <p className="text-sm text-red-100 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                                    </span>
                                    {avgResponseTime > 0 ? `~${(avgResponseTime / 1000).toFixed(1)}s respuesta` : 'En línea'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 relative z-10">
                            {!isMinimized && (
                                <>
                                    <button
                                        onClick={() => setShowRoomSearch(!showRoomSearch)}
                                        className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all border border-white/20"
                                        aria-label="Buscar habitaciones"
                                        title="Ver habitaciones disponibles"
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsDarkMode(!isDarkMode)}
                                        className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all border border-white/20"
                                        aria-label="Cambiar tema"
                                        title="Cambiar tema"
                                    >
                                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={exportConversation}
                                        className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all border border-white/20"
                                        aria-label="Exportar conversación"
                                        title="Descargar conversación"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleReset}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all border border-white/20"
                                aria-label="Reiniciar conversación"
                                title="Nueva conversación"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all border border-white/20"
                                aria-label={isMinimized ? "Maximizar" : "Minimizar"}
                            >
                                {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all border border-white/20"
                                aria-label="Cerrar chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Panel de búsqueda de habitaciones */}
                            {showRoomSearch && habitaciones.length > 0 && (
                                <div className={`p-4 ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-blue-50 border-b border-blue-100'}`}>
                                    <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <Search className="w-4 h-4" />
                                        Habitaciones Disponibles
                                    </h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {habitaciones.slice(0, 5).map((hab) => (
                                            <button
                                                key={hab.id}
                                                onClick={() => handleSend(`Cuéntame más sobre ${hab.nombre}`)}
                                                className={`w-full text-left rounded-xl transition-all hover:scale-[1.02] overflow-hidden ${
                                                    isDarkMode 
                                                        ? 'bg-gray-700 hover:bg-gray-600' 
                                                        : 'bg-white hover:bg-blue-100'
                                                }`}
                                            >
                                                <div className="flex gap-3 p-3">
                                                    {hab.fotos && hab.fotos.length > 0 && (
                                                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                                            <Image
                                                                src={hab.fotos[0]}
                                                                alt={hab.nombre}
                                                                fill
                                                                className="object-cover"
                                                                sizes="80px"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {hab.nombre}
                                                        </p>
                                                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            Capacidad: {hab.capacidad} personas
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-bold text-red-600 text-sm">S/ {hab.precio_noche}</p>
                                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>por noche</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Mensajes mejorados */}
                            <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fadeInUp group`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                                            message.role === 'user'
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                                : 'bg-gradient-to-br from-red-500 to-red-600'
                                        }`}>
                                            {message.role === 'user' ? (
                                                <User className="w-5 h-5 text-white" />
                                            ) : (
                                                <Bot className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                                            <div className={`inline-block max-w-[85%] px-5 py-4 rounded-2xl shadow-md transition-all hover:shadow-lg ${
                                                message.role === 'user'
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-md'
                                                    : isDarkMode
                                                    ? 'bg-gray-800 border-2 border-gray-700 text-white rounded-tl-md'
                                                    : 'bg-white border-2 border-gray-100 text-gray-900 rounded-tl-md'
                                            }`}>
                                                {/* Contenido del mensaje con formato mejorado */}
                                                {message.role === 'user' ? (
                                                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                        {formatMessage(message.content)}
                                                    </p>
                                                ) : (
                                                    <div className="text-sm space-y-1">
                                                        {formatMessageWithStructure(formatMessage(message.content))}
                                                    </div>
                                                )}
                                                
                                                {/* Tarjetas de habitaciones con imágenes */}
                                                {message.rooms && message.rooms.length > 0 && (
                                                    <div className="mt-4 space-y-3">
                                                        {message.rooms.map((room, roomIndex) => (
                                                            <div
                                                                key={roomIndex}
                                                                className={`rounded-xl overflow-hidden transition-all hover:scale-[1.02] cursor-pointer shadow-lg ${
                                                                    isDarkMode
                                                                        ? 'bg-gray-700 border border-gray-600'
                                                                        : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
                                                                }`}
                                                                onClick={() => handleSend(`Quiero más información sobre ${room.name}`)}
                                                            >
                                                                <div className="relative h-48 w-full">
                                                                    <Image
                                                                        src={room.image}
                                                                        alt={room.name}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="(max-width: 500px) 100vw, 500px"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-1">
                                                                        <DollarSign className="w-4 h-4" />
                                                                        {room.price}
                                                                    </div>
                                                                    <div className="absolute bottom-3 left-3 right-3">
                                                                        <h4 className="font-bold text-xl text-white drop-shadow-lg">
                                                                            {room.name}
                                                                        </h4>
                                                                    </div>
                                                                </div>
                                                                <div className="p-4">
                                                                    <p className={`text-sm mb-3 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        {room.description}
                                                                    </p>
                                                                    <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                                                        <Sparkles className="w-4 h-4" />
                                                                        Ver más detalles
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center justify-between mt-2 gap-2">
                                                    <p className={`text-xs ${
                                                        message.role === 'user' 
                                                            ? 'text-blue-100' 
                                                            : isDarkMode 
                                                            ? 'text-gray-400' 
                                                            : 'text-gray-400'
                                                    }`}>
                                                        {message.timestamp.toLocaleTimeString('es-PE', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        {message.role === 'assistant' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleFeedback(index, 'positive')}
                                                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                                                        message.feedback === 'positive' 
                                                                            ? 'bg-green-100 text-green-600' 
                                                                            : isDarkMode 
                                                                            ? 'hover:bg-gray-700 text-gray-400' 
                                                                            : 'hover:bg-gray-100 text-gray-400'
                                                                    }`}
                                                                    title="Útil"
                                                                >
                                                                    <ThumbsUp className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleFeedback(index, 'negative')}
                                                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                                                        message.feedback === 'negative' 
                                                                            ? 'bg-red-100 text-red-600' 
                                                                            : isDarkMode 
                                                                            ? 'hover:bg-gray-700 text-gray-400' 
                                                                            : 'hover:bg-gray-100 text-gray-400'
                                                                    }`}
                                                                    title="No útil"
                                                                >
                                                                    <ThumbsDown className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => copyToClipboard(message.content, index)}
                                                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                                                        isDarkMode 
                                                                            ? 'hover:bg-gray-700 text-gray-400' 
                                                                            : 'hover:bg-gray-100 text-gray-400'
                                                                    }`}
                                                                    title="Copiar mensaje"
                                                                >
                                                                    {copiedIndex === index ? (
                                                                        <Check className="w-3 h-3 text-green-600" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3" />
                                                                    )}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Preguntas rápidas mejoradas */}
                                {showQuickQuestions && messages.length === 1 && !isLoading && (
                                    <div className="space-y-3 animate-fadeInUp pt-2">
                                        <p className={`text-xs font-bold text-center mb-4 flex items-center justify-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <Sparkles className="w-4 h-4 text-red-600" />
                                            Preguntas frecuentes
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {QUICK_QUESTIONS.map((question, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleQuickQuestion(question.text, question.category)}
                                                    className={`text-left px-4 py-3 rounded-2xl text-sm transition-all hover:shadow-lg transform hover:-translate-y-1 group ${
                                                        isDarkMode
                                                            ? 'bg-gray-800 border-2 border-gray-700 hover:border-red-500 hover:bg-gray-700 text-white'
                                                            : 'bg-white border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-600'
                                                    }`}
                                                >
                                                    <span className="mb-2 block group-hover:scale-110 transition-transform">
                                                        {React.createElement(question.icon, { className: 'w-5 h-5' })}
                                                    </span>
                                                    <span className="font-medium">{question.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sugerencias inteligentes */}
                                {smartSuggestions.length > 0 && !isLoading && (
                                    <div className="space-y-2 animate-fadeInUp">
                                        <p className={`text-xs font-semibold flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <Sparkles className="w-3 h-3 text-yellow-500" />
                                            También puedes preguntar:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {smartSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSend(suggestion)}
                                                    className={`text-xs px-3 py-2 rounded-full transition-all hover:scale-105 ${
                                                        isDarkMode
                                                            ? 'bg-gray-800 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-white'
                                                            : 'bg-gray-100 border border-gray-200 hover:border-red-500 text-gray-700 hover:bg-red-50 hover:text-red-600'
                                                    }`}
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {isLoading && (
                                    <div className="flex gap-3 animate-fadeInUp">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div className={`px-5 py-4 rounded-2xl rounded-tl-md shadow-md ${
                                            isDarkMode 
                                                ? 'bg-gray-800 border-2 border-gray-700' 
                                                : 'bg-white border-2 border-gray-100'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:150ms]" />
                                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:300ms]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input mejorado con voz */}
                            <div className={`p-5 border-t-2 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <div className="flex gap-3">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={isListening ? "Escuchando..." : "Escribe tu mensaje..."}
                                        disabled={isLoading || isListening}
                                        className={`flex-1 px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all disabled:cursor-not-allowed text-sm ${
                                            isDarkMode
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 disabled:bg-gray-800'
                                                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50'
                                        } ${isListening ? 'ring-2 ring-red-500 border-red-500' : ''}`}
                                    />
                                    <button
                                        onClick={toggleVoiceRecognition}
                                        disabled={isLoading}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed ${
                                            isListening
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white animate-pulse'
                                                : isDarkMode
                                                ? 'bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200'
                                        }`}
                                        aria-label={isListening ? "Detener grabación" : "Grabar voz"}
                                        title={isListening ? "Detener grabación" : "Grabar voz"}
                                    >
                                        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                    </button>
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim() || isLoading || isListening}
                                        className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:shadow-red-600/30 transform hover:-translate-y-1 disabled:transform-none"
                                        aria-label="Enviar mensaje"
                                    >
                                        <Send className="w-6 h-6" />
                                    </button>
                                </div>
                                
                                {/* Estadísticas y powered by */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {messageCount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                {messageCount} mensajes
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Powered by</p>
                                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                                            isDarkMode 
                                                ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30' 
                                                : 'bg-gradient-to-r from-blue-50 to-purple-50'
                                        }`}>
                                            <Sparkles className="w-3 h-3 text-purple-600" />
                                            <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                Gemini AI
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    )
}
