'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Bot,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  X,
} from 'lucide-react'

type MessageRole = 'user' | 'assistant'

interface ChatAction {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}

interface RoomRecommendation {
  id: string
  name: string
  description: string
  image: string
  price: number
  capacity: number
  location: string
  type: string
}

interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  actions?: ChatAction[]
  suggestions?: string[]
  rooms?: RoomRecommendation[]
}

interface ChatResponse {
  response: string
  suggestions?: string[]
  actions?: ChatAction[]
  rooms?: RoomRecommendation[]
}

const STORAGE_KEY = 'adventur-chat-v2'

const STARTER_PROMPTS = [
  'Quiero una recomendacion romantica',
  'Busco algo para 4 personas',
  'Cuales son los alojamientos mas economicos',
  'Que incluye la reserva',
]

const QUICK_ACTIONS = [
  { label: 'Precios', prompt: 'Muestrame precios y opciones destacadas' },
  { label: 'Familia', prompt: 'Necesito una opcion comoda para familia' },
  { label: 'Romantico', prompt: 'Quiero una escapada romantica' },
  { label: 'Reservar', prompt: 'Ayudame a reservar' },
]

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  timestamp: new Date().toISOString(),
  content:
    'Hola. Soy Adventur AI Concierge. Puedo recomendar alojamientos, explicar precios, resolver dudas de reserva y llevarte directo a la mejor opcion para tu viaje.',
  actions: [
    { label: 'Ver alojamientos', href: '/hoteles', variant: 'primary' },
    { label: 'Contactar', href: '/contacto', variant: 'secondary' },
  ],
  suggestions: STARTER_PROMPTS,
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sanitizeText(text: string) {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').trim()
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [copyState, setCopyState] = useState<string | null>(null)
  const [sessionStartedAt] = useState(Date.now())
  const bodyRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return

      const parsed = JSON.parse(saved) as { messages?: Message[] }
      if (parsed.messages?.length) {
        setMessages(parsed.messages)
      }
    } catch (error) {
      console.error('Error loading chatbot state:', error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        messages,
      }),
    )
  }, [messages])

  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen && !isCollapsed) {
      textareaRef.current?.focus()
    }
  }, [isOpen, isCollapsed])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen((value) => !value)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const assistantMessages = useMemo(
    () => messages.filter((message) => message.role === 'assistant').length,
    [messages],
  )

  const sessionMinutes = useMemo(
    () => Math.max(1, Math.round((Date.now() - sessionStartedAt) / 60000)),
    [sessionStartedAt],
  )

  const sendMessage = async (preset?: string) => {
    const content = (preset ?? input).trim()
    if (!content || isLoading) return

    const nextUserMessage: Message = {
      id: uid(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    const nextHistory = [...messages, nextUserMessage]
    setMessages(nextHistory)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: nextHistory.slice(-8).map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`No se pudo completar la consulta (${response.status})`)
      }

      const data = (await response.json()) as ChatResponse
      const assistantMessage: Message = {
        id: uid(),
        role: 'assistant',
        content: sanitizeText(data.response),
        timestamp: new Date().toISOString(),
        actions: data.actions,
        suggestions: data.suggestions,
        rooms: data.rooms,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          timestamp: new Date().toISOString(),
          content:
            error?.message ||
            'No pude responder ahora mismo. Intenta otra vez o revisa la pagina de alojamientos.',
          actions: [
            { label: 'Ver alojamientos', href: '/hoteles', variant: 'primary' },
            { label: 'Ir a contacto', href: '/contacto', variant: 'secondary' },
          ],
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setMessages([INITIAL_MESSAGE])
    setInput('')
    setIsCollapsed(false)
  }

  const handleCopyTranscript = async () => {
    const transcript = messages
      .map((message) => `${message.role === 'user' ? 'Cliente' : 'Adventur AI'}: ${message.content}`)
      .join('\n\n')

    await navigator.clipboard.writeText(transcript)
    setCopyState('transcript')
    window.setTimeout(() => setCopyState(null), 1600)
  }

  const handleExport = () => {
    const transcript = messages
      .map(
        (message) =>
          `[${new Date(message.timestamp).toLocaleString('es-PE')}] ${message.role === 'user' ? 'Cliente' : 'Adventur AI'}: ${message.content}`,
      )
      .join('\n\n')

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `adventur-chat-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const toggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      window.alert('Tu navegador no soporta reconocimiento de voz.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-PE'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ''
      setInput(transcript)
      setIsListening(false)
      textareaRef.current?.focus()
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Abrir chat de Adventur"
        >
          <div className="absolute inset-0 rounded-full bg-amber-400/35 blur-2xl transition-opacity group-hover:opacity-90" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl border border-amber-200/70 bg-white text-amber-400 shadow-[0_20px_60px_rgba(251,191,36,0.28)] transition-transform group-hover:-translate-y-1">
            <Bot className="h-6 w-6" />
          </div>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:w-[380px] lg:w-[395px]">
          <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_40px_100px_rgba(15,23,42,0.28)] backdrop-blur-xl">
            <div className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_60%,#7c2d12_100%)] px-4 py-3 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-400/30">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold leading-tight">Adventur AI Concierge</span>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        En línea
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                      {assistantMessages} respuestas · {sessionMinutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsCollapsed((value) => !value)}
                    className="rounded-xl border border-white/15 bg-white/10 p-1.5 text-white/80 transition hover:bg-white/20"
                    aria-label={isCollapsed ? 'Expandir chat' : 'Colapsar chat'}
                  >
                    {isCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-white/15 bg-white/10 p-1.5 text-white/80 transition hover:bg-white/20"
                    aria-label="Cerrar chat"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {!isCollapsed && (
              <>
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => void sendMessage(action.prompt)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={bodyRef} className="max-h-[46vh] space-y-4 overflow-y-auto px-4 py-4">
                  {messages.map((message) => (
                    <div key={message.id} className={message.role === 'user' ? 'ml-10' : 'mr-10'}>
                      <div
                        className={
                          message.role === 'user'
                            ? 'rounded-[24px] rounded-br-md bg-gradient-to-br from-gray-800 to-gray-900 px-4 py-3 text-sm text-white shadow-lg'
                            : 'rounded-[24px] rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm'
                        }
                      >
                        <div className="whitespace-pre-wrap leading-6">{message.content}</div>

                        {message.rooms?.length ? (
                          <div className="mt-4 grid gap-3">
                            {message.rooms.map((room) => (
                              <div
                                key={room.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                              >
                                <div className="relative h-32 overflow-hidden">
                                  <img
                                    src={room.image}
                                    alt={room.name}
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                                  <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900">
                                    S/. {room.price.toLocaleString('es-PE')} / noche
                                  </div>
                                  <div className="absolute bottom-3 left-3 right-3">
                                    <div className="text-lg font-semibold text-white">{room.name}</div>
                                    <div className="text-xs text-white/80">
                                      {room.type} · {room.location || 'Adventur'}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-3 p-4">
                                  <p className="line-clamp-3 text-sm text-slate-600">{room.description}</p>
                                  <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                      <Star className="h-3.5 w-3.5 text-amber-500" />
                                      Hasta {room.capacity} huespedes
                                    </span>
                                    <Link
                                      href={`/hoteles/${room.id}`}
                                      className="rounded-full bg-slate-900 px-3 py-1.5 font-semibold text-white transition hover:bg-yellow-500"
                                    >
                                      Ver detalle
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {message.actions?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.actions.map((action) => (
                              <Link
                                key={`${message.id}-${action.href}-${action.label}`}
                                href={action.href}
                                className={
                                  action.variant === 'primary'
                                    ? 'rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-yellow-500'
                                    : 'rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-yellow-300 hover:text-yellow-700'
                                }
                              >
                                {action.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}

                        {message.suggestions?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion) => (
                              <button
                                key={`${message.id}-${suggestion}`}
                                onClick={() => void sendMessage(suggestion)}
                                className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 transition hover:bg-yellow-100"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400">
                        <span>{message.role === 'user' ? 'Tu' : 'Adventur AI'}</span>
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="mr-10">
                      <div className="rounded-[24px] rounded-bl-md border border-slate-200 bg-white px-4 py-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                          <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-yellow-500" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-yellow-400 [animation-delay:120ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:240ms]" />
                          </div>
                          <span className="text-sm text-slate-500">Preparando una recomendacion precisa...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-red-500" />
                      Usa Enter para enviar y Shift + Enter para salto de linea
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReset}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-yellow-300 hover:text-yellow-600"
                        title="Reiniciar chat"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCopyTranscript}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-yellow-300 hover:text-yellow-600"
                        title="Copiar conversacion"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleExport}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-yellow-300 hover:text-yellow-600"
                        title="Exportar conversacion"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-2 shadow-inner">
                    <div className="flex items-end gap-2">
                      <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            void sendMessage()
                          }
                        }}
                        placeholder={isListening ? 'Escuchando...' : 'Escribe tu consulta sobre Adventur'}
                        className="max-h-28 min-h-[50px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                      />

                      <button
                        onClick={toggleVoice}
                        disabled={isLoading}
                        className={
                          isListening
                            ? 'mb-1 rounded-2xl bg-amber-400 p-3 text-white transition hover:bg-amber-500'
                            : 'mb-1 rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:border-amber-200 hover:text-amber-500 disabled:opacity-50'
                        }
                        title={isListening ? 'Detener grabacion' : 'Dictar mensaje'}
                      >
                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </button>

                      <button
                        onClick={() => void sendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="mb-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-3 text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Enviar mensaje"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Concierge con recomendaciones de alojamientos y reserva.</span>
                    <span>{copyState === 'transcript' ? 'Copiado' : 'Ctrl/Cmd + K para abrir'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
