import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

// Revalidar cada hora — los alojamientos no cambian frecuentemente
export const revalidate = 3600

type RoomCard = {
  id: string
  img: string
  title: string
  price: number
  capacity: number
  slug: string
}

type AlojamientoRow = {
  id: string
  nombre: string
  precio_base: number
  capacidad_maxima: number | null
  fotos_alojamiento?: Array<{
    url: string
    es_principal: boolean
  }> | null
}

const ROOMS_FALLBACK: RoomCard[] = [
  {
    id: 'fallback-1',
    img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=60&auto=format&fit=crop',
    title: 'Suite Deluxe',
    price: 350,
    capacity: 2,
    slug: 'fallback-1',
  },
  {
    id: 'fallback-2',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=60&auto=format&fit=crop',
    title: 'Habitacion Estandar',
    price: 180,
    capacity: 2,
    slug: 'fallback-2',
  },
  {
    id: 'fallback-3',
    img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=60&auto=format&fit=crop',
    title: 'Suite Premium',
    price: 520,
    capacity: 4,
    slug: 'fallback-3',
  },
]

async function getRooms(): Promise<RoomCard[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('alojamientos')
      .select(
        `
          id,
          nombre,
          precio_base,
          capacidad_maxima,
          fotos_alojamiento (
            url,
            es_principal
          )
        `,
      )
      .eq('activo', true)
      .order('precio_base', { ascending: true })
      .limit(3)

    if (error || !data?.length) {
      return ROOMS_FALLBACK
    }
    return (data as AlojamientoRow[]).map((alojamiento) => {
      const fotos = alojamiento.fotos_alojamiento ?? []
      const principal = fotos.find((foto) => foto.es_principal)
      const fallback = fotos[0]

      return {
        id: alojamiento.id,
        img:
          principal?.url ||
          fallback?.url ||
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=60&auto=format&fit=crop',
        title: alojamiento.nombre,
        price: alojamiento.precio_base,
        capacity: alojamiento.capacidad_maxima ?? 2,
        slug: alojamiento.id,
      }
    })
  } catch {
    return ROOMS_FALLBACK
  }
}

export async function HabitacionesSeccion() {
  const rooms = await getRooms()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white py-24">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-yellow-50 opacity-30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-50 opacity-30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center animate-fadeInUp">
          <div className="mb-4 inline-block">
            <span className="rounded-full bg-yellow-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-700">
              Alojamientos destacados
            </span>
          </div>

          <h2 className="mb-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
            Bienvenido al <span className="text-yellow-600">Hotel</span>
          </h2>

          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-400" />
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-400" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-400" />
          </div>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-700">
            Ofrecemos habitaciones de lujo con vistas espectaculares y servicios de primera clase para hacer
            de tu estadia una experiencia inolvidable.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <article
              key={room.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl animate-fadeInUp"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={room.img}
                  alt={room.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all group-hover:from-black/70" />

                <div className="absolute right-4 top-4 rounded-full bg-yellow-400 px-4 py-2 text-gray-900 shadow-lg">
                  <div className="text-xs font-semibold">desde</div>
                  <div className="text-lg font-bold">S/. {room.price}</div>
                  <div className="text-[10px]">/noche</div>
                </div>

                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
                  <div className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    Hasta {room.capacity} personas
                  </div>
                  <Link
                    href={`/hoteles/${room.slug}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-xl transition-all duration-300 hover:bg-yellow-400"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-yellow-700">
                    {room.title}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-500" aria-label="Calificacion destacada">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <svg key={index} className="h-4 w-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-slate-700">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                    {room.capacity} personas
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                    35m2
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {['WiFi', 'TV', 'A/C'].map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/hoteles"
            className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-yellow-400 px-12 py-4 text-sm font-semibold uppercase tracking-wider text-gray-900 transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-500 hover:shadow-xl"
          >
            Ver todas las habitaciones
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
