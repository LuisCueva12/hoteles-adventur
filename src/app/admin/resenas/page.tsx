'use client'

import { useEffect, useMemo, useState } from 'react'
import { MessageSquareText, RefreshCw, Sparkles, Star } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import {
  AdminBadge,
  AdminDataTable,
  AdminPageShell,
  AdminPanel,
  AdminStatCard,
} from '@/components/admin'
import { formatDate } from '@/components/admin/formatters'

type ReviewItem = {
  id: string
  comentario: string
  calificacion: number
  fecha: string
  usuarios: {
    nombre: string
    apellido: string
  } | null
  alojamientos: {
    nombre: string
    tipo: string
  } | null
}

function renderStars(value: number) {
  return Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
    />
  ))
}

export default function AdminResenasPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ratingFilter, setRatingFilter] = useState('todas')

  const loadReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { data, error } = await supabase
        .from('opiniones')
        .select(
          `
            id,
            comentario,
            calificacion,
            fecha,
            usuarios:usuario_id (
              nombre,
              apellido
            ),
            alojamientos:alojamiento_id (
              nombre,
              tipo
            )
          `,
        )
        .order('fecha', { ascending: false })

      if (error) {
        throw error
      }

      const normalized: ReviewItem[] = (data || []).map((item: any) => ({
        id: item.id,
        comentario: item.comentario,
        calificacion: item.calificacion,
        fecha: item.fecha,
        usuarios: Array.isArray(item.usuarios) ? item.usuarios[0] || null : item.usuarios || null,
        alojamientos: Array.isArray(item.alojamientos) ? item.alojamientos[0] || null : item.alojamientos || null,
      }))

      setReviews(normalized)
    } catch (loadError) {
      console.error(loadError)
      setError('No se pudieron cargar las reseñas del sistema.')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const filteredReviews = useMemo(() => {
    if (ratingFilter === 'todas') {
      return reviews
    }

    return reviews.filter((review) => String(review.calificacion) === ratingFilter)
  }, [ratingFilter, reviews])

  const average = reviews.length
    ? (reviews.reduce((total, review) => total + Number(review.calificacion || 0), 0) / reviews.length).toFixed(1)
    : '0.0'
  const thisMonth = reviews.filter((review) => {
    const reviewDate = new Date(review.fecha)
    const now = new Date()

    return reviewDate.getMonth() === now.getMonth() && reviewDate.getFullYear() === now.getFullYear()
  }).length
  const fiveStars = reviews.filter((review) => review.calificacion === 5).length

  const columns = [
    {
      key: 'huesped',
      header: 'Huésped',
      cell: (review: ReviewItem) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            {[review.usuarios?.nombre, review.usuarios?.apellido].filter(Boolean).join(' ') || 'Usuario anónimo'}
          </p>
          <p className="text-sm text-slate-500">{formatDate(review.fecha)}</p>
        </div>
      ),
    },
    {
      key: 'alojamiento',
      header: 'Alojamiento',
      cell: (review: ReviewItem) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-700">{review.alojamientos?.nombre || 'Sin alojamiento'}</p>
          <p className="text-sm text-slate-500">{review.alojamientos?.tipo || 'Sin tipo'}</p>
        </div>
      ),
    },
    {
      key: 'calificacion',
      header: 'Calificación',
      cell: (review: ReviewItem) => (
        <div className="space-y-2">
          <div className="flex items-center gap-1">{renderStars(review.calificacion)}</div>
          <AdminBadge tone="accent">{review.calificacion}/5</AdminBadge>
        </div>
      ),
    },
    {
      key: 'comentario',
      header: 'Comentario',
      cell: (review: ReviewItem) => (
        <p className="max-w-xl text-sm leading-6 text-slate-600">{review.comentario || 'Sin comentario'}</p>
      ),
    },
  ]

  return (
    <AdminPageShell
      title="Reseñas"
      description="Seguimiento de la satisfacción de huéspedes y comentarios registrados por alojamiento."
      actions={
        <button type="button" className="admin-button-secondary" onClick={loadReviews}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      }
    >
      {error ? (
        <AdminPanel className="border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-600">
          {error}
        </AdminPanel>
      ) : null}

      <section className="admin-grid">
        <AdminStatCard title="Reseñas" value={reviews.length} helper="Opiniones registradas" icon={MessageSquareText} tone="blue" />
        <AdminStatCard title="Promedio" value={average} helper="Calificación global" icon={Star} tone="amber" />
        <AdminStatCard title="Cinco estrellas" value={fiveStars} helper="Máxima valoración" icon={Sparkles} tone="green" />
        <AdminStatCard title="Este mes" value={thisMonth} helper="Actividad reciente" icon={RefreshCw} tone="purple" />
      </section>

      <AdminPanel className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Bandeja de reseñas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Filtra por calificación para revisar la percepción de huéspedes.
            </p>
          </div>
          <select
            className="admin-input w-full max-w-xs"
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
          >
            <option value="todas">Todas las calificaciones</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
        </div>

        <AdminDataTable
          columns={columns}
          data={filteredReviews}
          getRowId={(review) => review.id}
          emptyTitle={loading ? 'Cargando reseñas' : 'No hay reseñas para mostrar'}
          emptyDescription={
            loading
              ? 'Estamos recuperando la opinión de los huéspedes.'
              : 'No existen reseñas con el filtro seleccionado.'
          }
        />
      </AdminPanel>
    </AdminPageShell>
  )
}
