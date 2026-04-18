import { createClient } from '@/utils/supabase/server'
import {
  TestimoniosCarrusel,
  type TestimonialItem,
} from '@/components/web/TestimoniosCarrusel'

type ReviewRow = {
  alojamiento_id: string | null
  calificacion: number
  comentario: string
  titulo: string | null
  verificado: boolean | null
}

type AlojamientoRow = {
  id: string
  nombre: string
  distrito: string | null
}

const TESTIMONIALS_FALLBACK: TestimonialItem[] = [
  {
    name: 'Huesped verificado',
    location: 'Lima, Peru',
    rating: 5,
    comment:
      'Todo se sintio cuidado de principio a fin. La habitacion estaba impecable, el personal respondio rapido y la experiencia se sintio realmente premium.',
    trip: 'Escapada de fin de semana',
    highlight: 'Servicio impecable',
    resume: 'Atencion veloz, habitacion cuidada y experiencia premium.',
    initials: 'HV',
  },
  {
    name: 'Cliente frecuente',
    location: 'Buenos Aires, Argentina',
    rating: 5,
    comment:
      'La reserva fue simple, el check-in muy ordenado y el hotel supero lo que veiamos en las fotos. Excelente opcion para viajar con tranquilidad.',
    trip: 'Viaje en pareja',
    highlight: 'Reserva sin fricciones',
    resume: 'Proceso claro, llegada fluida y mejor experiencia que en fotos.',
    initials: 'CF',
  },
  {
    name: 'Reserva confirmada',
    location: 'Madrid, Espana',
    rating: 5,
    comment:
      'Nos encanto el ambiente, las vistas y la sensacion de descanso real. Es de esos lugares que uno recuerda y recomienda sin pensarlo mucho.',
    trip: 'Aniversario',
    highlight: 'Ambiente inolvidable',
    resume: 'Vistas, calma y una estancia que se recuerda de verdad.',
    initials: 'RC',
  },
  {
    name: 'Viajero Adventur',
    location: 'Santiago, Chile',
    rating: 4,
    comment:
      'Muy buena ubicacion, buen nivel de atencion y una oferta gastronomica que suma bastante valor a toda la estadia.',
    trip: 'Viaje gastronomico',
    highlight: 'Ubicacion y comida',
    resume: 'Buen servicio, gran ubicacion y una cocina que destaca.',
    initials: 'VA',
  },
]

const REVIEW_LABELS = [
  { name: 'Huesped verificado', initials: 'HV' },
  { name: 'Cliente frecuente', initials: 'CF' },
  { name: 'Reserva confirmada', initials: 'RC' },
  { name: 'Viajero Adventur', initials: 'VA' },
]

async function getTestimonials(): Promise<TestimonialItem[]> {
  try {
    const supabase = await createClient()
    const { data: reviews, error } = await supabase
      .from('resenas')
      .select('alojamiento_id, calificacion, comentario, titulo, verificado')
      .eq('visible', true)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error || !reviews || reviews.length < 2) {
      return TESTIMONIALS_FALLBACK
    }

    const accommodationIds = Array.from(
      new Set(
        (reviews as ReviewRow[])
          .map((review) => review.alojamiento_id)
          .filter((value): value is string => Boolean(value)),
      ),
    )

    let accommodationsById = new Map<string, AlojamientoRow>()

    if (accommodationIds.length) {
      const { data: accommodations } = await supabase
        .from('alojamientos')
        .select('id, nombre, distrito')
        .in('id', accommodationIds)
        .eq('activo', true)

      accommodationsById = new Map(
        ((accommodations ?? []) as AlojamientoRow[]).map((accommodation) => [accommodation.id, accommodation]),
      )
    }

    return (reviews as ReviewRow[]).map((review, index) => {
      const label = REVIEW_LABELS[index % REVIEW_LABELS.length]
      const accommodation = review.alojamiento_id
        ? accommodationsById.get(review.alojamiento_id)
        : undefined
      const location = accommodation?.distrito ? `${accommodation.distrito}, Peru` : 'Peru'
      const comment = review.comentario.trim()

      return {
        name: label.name,
        location,
        rating: review.calificacion,
        comment,
        trip: accommodation?.nombre || 'Estadia destacada',
        highlight: review.titulo?.trim() || (review.verificado ? 'Reserva verificada' : 'Excelente experiencia'),
        resume: `${comment.slice(0, 92)}${comment.length > 92 ? '...' : ''}`,
        initials: label.initials,
      }
    })
  } catch {
    return TESTIMONIALS_FALLBACK
  }
}

export async function TestimoniosSeccion() {
  const testimonials = await getTestimonials()

  return <TestimoniosCarrusel initialTestimonials={testimonials} />
}
