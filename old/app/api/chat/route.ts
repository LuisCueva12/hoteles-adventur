import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Forzar Node.js runtime — evita conflictos de Web Streams con Edge runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ChatIntent =
  | 'booking'
  | 'pricing'
  | 'romantic'
  | 'family'
  | 'location'
  | 'services'
  | 'nature'
  | 'general'

interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RoomRecord {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string
  tipo: string
  precio_base: number
  capacidad_maxima: number
  distrito: string | null
  provincia: string | null
  departamento: string | null
  fotos_alojamiento?: Array<{
    url: string
    es_principal: boolean
  }>
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

interface ChatAction {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}

function inferIntent(message: string): ChatIntent {
  const normalized = message.toLowerCase()

  if (/(reserv|disponib|fecha|check|agenda|book)/.test(normalized)) return 'booking'
  if (/(precio|costo|tarifa|econom|barat|presupuesto)/.test(normalized)) return 'pricing'
  if (/(romant|pareja|anivers|luna de miel)/.test(normalized)) return 'romantic'
  if (/(famil|ninos|niños|grupo|personas|huesped)/.test(normalized)) return 'family'
  if (/(ubic|direccion|donde|como llegar|cerca)/.test(normalized)) return 'location'
  if (/(spa|servicio|amenidad|restaurante|wifi|piscina|desayuno)/.test(normalized)) return 'services'
  if (/(naturaleza|cabana|cabaña|ecolodge|montana|montaña|bosque)/.test(normalized)) return 'nature'

  return 'general'
}

function buildSuggestions(intent: ChatIntent) {
  const suggestionsByIntent: Record<ChatIntent, string[]> = {
    booking: [
      'Que opcion me recomiendas para este fin de semana',
      'Que necesito para reservar',
      'Muestrame opciones para 2 personas',
    ],
    pricing: [
      'Cual es la opcion mas economica',
      'Comparame precios y capacidad',
      'Hay promociones o descuentos',
    ],
    romantic: [
      'Quiero una opcion premium para pareja',
      'Que alojamiento tiene mejor vista',
      'Muestrame una escapada romantica',
    ],
    family: [
      'Necesito espacio para 4 personas',
      'Que opcion conviene para familia',
      'Muestrame alojamientos amplios',
    ],
    location: [
      'Que alojamiento esta en zona tranquila',
      'Muestrame opciones en naturaleza',
      'Quiero ver todas las ubicaciones',
    ],
    services: [
      'Que incluye la estadia',
      'Tienen desayuno y estacionamiento',
      'Que servicios premium ofrecen',
    ],
    nature: [
      'Muestrame cabanas o ecolodges',
      'Quiero una experiencia en naturaleza',
      'Que opcion tiene mejor entorno',
    ],
    general: [
      'Recomiendame un alojamiento',
      'Cuales son los precios',
      'Ayudame a elegir segun mi viaje',
    ],
  }

  return suggestionsByIntent[intent]
}

function buildActions(intent: ChatIntent): ChatAction[] {
  if (intent === 'booking') {
    return [
      { label: 'Explorar alojamientos', href: '/hoteles', variant: 'primary' },
      { label: 'Ir a reservas', href: '/reservas', variant: 'secondary' },
    ]
  }

  if (intent === 'location') {
    return [
      { label: 'Ver ubicaciones', href: '/hoteles', variant: 'primary' },
      { label: 'Contactar', href: '/contacto', variant: 'secondary' },
    ]
  }

  return [
    { label: 'Ver alojamientos', href: '/hoteles', variant: 'primary' },
    { label: 'Contactar', href: '/contacto', variant: 'secondary' },
  ]
}

function selectRooms(intent: ChatIntent, rooms: RoomRecord[], message: string): RoomRecord[] {
  const normalized = message.toLowerCase()
  const base = [...rooms]

  if (intent === 'pricing') {
    return base.sort((a, b) => a.precio_base - b.precio_base).slice(0, 3)
  }

  if (intent === 'romantic') {
    return base
      .filter((room) => /parejas|premium/i.test(`${room.categoria} ${room.tipo}`))
      .sort((a, b) => b.precio_base - a.precio_base)
      .slice(0, 3)
  }

  if (intent === 'family') {
    return base
      .filter((room) => room.capacidad_maxima >= 3 || /familiar/i.test(room.categoria))
      .sort((a, b) => b.capacidad_maxima - a.capacidad_maxima)
      .slice(0, 3)
  }

  if (intent === 'nature') {
    return base
      .filter((room) => /naturaleza|ecolodge|caba/i.test(`${room.categoria} ${room.tipo}`))
      .slice(0, 3)
  }

  const textMatches = base.filter((room) =>
    `${room.nombre} ${room.descripcion ?? ''} ${room.categoria} ${room.tipo} ${room.distrito ?? ''} ${room.provincia ?? ''}`
      .toLowerCase()
      .includes(normalized),
  )

  if (textMatches.length) return textMatches.slice(0, 3)

  return base.sort((a, b) => a.precio_base - b.precio_base).slice(0, 3)
}

function mapRoom(room: RoomRecord): RoomRecommendation {
  const principal = room.fotos_alojamiento?.find((photo) => photo.es_principal)
  const fallback = room.fotos_alojamiento?.[0]

  return {
    id: room.id,
    name: room.nombre,
    description:
      room.descripcion?.trim() ||
      `${room.tipo} categoria ${room.categoria} con capacidad para ${room.capacidad_maxima} personas.`,
    image:
      principal?.url ||
      fallback?.url ||
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    price: Number(room.precio_base),
    capacity: room.capacidad_maxima,
    location: [room.distrito, room.provincia].filter(Boolean).join(', '),
    type: room.tipo,
  }
}

function buildHotelContext(rooms: RoomRecord[]) {
  const lines = rooms.map((room, index) => {
    const location = [room.distrito, room.provincia, room.departamento].filter(Boolean).join(', ')
    return `${index + 1}. ${room.nombre} | tipo: ${room.tipo} | categoria: ${room.categoria} | precio: S/. ${room.precio_base} | capacidad: ${room.capacidad_maxima} | ubicacion: ${location || 'No especificada'} | descripcion: ${room.descripcion || 'Sin descripcion'}`
  })

  return lines.join('\n')
}

function fallbackResponse(intent: ChatIntent, rooms: RoomRecommendation[]) {
  const roomLines = rooms.length
    ? rooms
        .map(
          (room) =>
            `- ${room.name}: S/. ${room.price} por noche, capacidad para ${room.capacity} personas, ${room.location || 'ubicacion Adventur'}.`,
        )
        .join('\n')
    : '- Ahora mismo no tengo alojamientos para sugerir, pero puedes revisar la lista completa en /hoteles.'

  const openingByIntent: Record<ChatIntent, string> = {
    booking:
      'Puedo ayudarte a avanzar rapido con tu reserva. Estas son las opciones que mejor encajan para empezar:',
    pricing:
      'Estas son algunas opciones ordenadas para que compares valor, capacidad y tipo de experiencia:',
    romantic:
      'Si buscas una experiencia de pareja, estas opciones son las mas recomendables:',
    family:
      'Para viaje familiar o grupos pequenos, estas opciones suelen funcionar mejor:',
    location:
      'Estas son algunas opciones utiles segun ubicacion y entorno:',
    services:
      'Adventur combina alojamiento, atencion y experiencia. Estas opciones te sirven como referencia:',
    nature:
      'Si quieres una experiencia mas conectada con naturaleza, revisa estas alternativas:',
    general:
      'Te dejo una seleccion inicial para que elijas mejor:',
  }

  return `${openingByIntent[intent]}\n\n${roomLines}\n\nSi quieres, tambien puedo filtrar por presupuesto, cantidad de huespedes o tipo de viaje.`
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = (await request.json()) as {
      message?: string
      history?: HistoryMessage[]
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje vacio' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('alojamientos')
      .select(
        'id, nombre, descripcion, categoria, tipo, precio_base, capacidad_maxima, distrito, provincia, departamento, fotos_alojamiento(url, es_principal)',
      )
      .eq('activo', true)
      .order('precio_base', { ascending: true })
      .limit(8)

    if (error) {
      throw error
    }

    const rooms = ((data as RoomRecord[] | null) ?? []).map((room) => ({
      ...room,
      precio_base: Number(room.precio_base),
    }))

    const intent = inferIntent(message)
    const selectedRooms = selectRooms(intent, rooms, message).map(mapRoom)
    const suggestions = buildSuggestions(intent)
    const actions = buildActions(intent)

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        response: fallbackResponse(intent, selectedRooms),
        suggestions,
        actions,
        rooms: selectedRooms,
      })
    }

    const prompt = `Eres el concierge de Adventur Hotels. Responde en español, breve y directo.

FORMATO OBLIGATORIO - NO usar markdown:
- Sin asteriscos, sin #, sin **, sin _, sin backticks
- Listas: empieza cada punto con "- " (guion espacio)
- Máximo 3 puntos de lista O 3 oraciones. Nunca más.
- Termina con una pregunta corta o acción

POLÍTICAS: Check-in 3PM, Check-out 12PM, adelanto 30%, cancelación gratis hasta 48h antes.

ALOJAMIENTOS DISPONIBLES:
${buildHotelContext(rooms)}

OPCIONES PARA ESTA CONSULTA:
${selectedRooms.map(r => `- ${r.name}: S/. ${r.price}/noche, ${r.capacity} personas`).join('\n')}

${(history ?? []).slice(-4).map(m => `${m.role === 'user' ? 'Cliente' : 'AI'}: ${m.content}`).join('\n')}

Cliente: ${message}
AI:`

    let responseText = ''

    try {
      // Usar fetch directo a la API REST de Gemini — evita el bug de TransformStream en Node 22
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
          }),
        }
      )

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json()
        responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
      } else {
        console.error('Gemini API error:', geminiRes.status, await geminiRes.text())
      }
    } catch (modelError) {
      console.error('Gemini fetch error:', modelError)
    }

    return NextResponse.json({
      response: responseText || fallbackResponse(intent, selectedRooms),
      suggestions,
      actions,
      rooms: selectedRooms,
    })
  } catch (error: any) {
    console.error('Chat route error:', error)

    return NextResponse.json(
      {
        error: 'No se pudo procesar la solicitud del chat.',
        details: error?.message,
      },
      { status: 500 },
    )
  }
}
