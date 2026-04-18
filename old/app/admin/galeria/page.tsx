'use client'

import { useEffect, useMemo, useState } from 'react'
import { Camera, ImagePlus, RefreshCw, Sparkles, Star } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import {
  AdminBadge,
  AdminDialog,
  AdminEmptyState,
  AdminPageShell,
  AdminPanel,
  AdminStatCard,
} from '@/components/admin'

type GalleryPhoto = {
  id: string
  url: string
  es_principal: boolean
  alojamientos: {
    nombre: string
    categoria: string
    tipo: string
  } | null
}

export default function AdminGaleriaPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)

  const loadPhotos = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('fotos_alojamiento')
        .select(
          `
            id,
            url,
            es_principal,
            alojamientos (
              nombre,
              categoria,
              tipo
            )
          `,
        )
        .order('es_principal', { ascending: false })

      if (error) {
        throw error
      }

      const normalized: GalleryPhoto[] = (data || []).map((item: any) => ({
        id: item.id,
        url: item.url,
        es_principal: item.es_principal,
        alojamientos: Array.isArray(item.alojamientos) ? item.alojamientos[0] || null : item.alojamientos || null,
      }))

      setPhotos(normalized)
    } catch (loadError) {
      console.error(loadError)
      setError('No se pudo cargar la galería del panel.')
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(photos.map((photo) => photo.alojamientos?.tipo).filter(Boolean))).sort()],
    [photos],
  )

  const filteredPhotos = useMemo(() => {
    const term = query.trim().toLowerCase()

    return photos.filter((photo) => {
      const matchesCategory = category === 'Todas' || photo.alojamientos?.tipo === category
      const matchesQuery =
        !term ||
        [photo.alojamientos?.nombre, photo.alojamientos?.categoria, photo.alojamientos?.tipo]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term)

      return matchesCategory && matchesQuery
    })
  }, [category, photos, query])

  const principales = photos.filter((photo) => photo.es_principal).length
  const alojamientosConFotos = new Set(photos.map((photo) => photo.alojamientos?.nombre).filter(Boolean)).size

  return (
    <AdminPageShell
      title="Galería"
      description="Visión general de las fotografías cargadas por alojamiento dentro del sistema."
      actions={
        <button type="button" className="admin-button-secondary" onClick={loadPhotos}>
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
        <AdminStatCard title="Fotos" value={photos.length} helper="Activos visuales" icon={Camera} tone="blue" />
        <AdminStatCard
          title="Principales"
          value={principales}
          helper="Portadas destacadas"
          icon={Star}
          tone="amber"
        />
        <AdminStatCard
          title="Alojamientos"
          value={alojamientosConFotos}
          helper="Con contenido visual"
          icon={ImagePlus}
          tone="green"
        />
        <AdminStatCard
          title="Tipos"
          value={Math.max(categories.length - 1, 0)}
          helper="Categorías activas"
          icon={Sparkles}
          tone="purple"
        />
      </section>

      <AdminPanel className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Biblioteca visual</h2>
            <p className="mt-1 text-sm text-slate-500">
              Filtra por tipo de alojamiento o por nombre para revisar la galería cargada.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="admin-input min-w-[240px]"
              placeholder="Buscar por nombre o categoría"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              className="admin-input w-full sm:w-52"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </AdminPanel>

      {filteredPhotos.length === 0 ? (
        <AdminEmptyState
          icon={Camera}
          title={loading ? 'Cargando galería' : 'No hay fotos para mostrar'}
          description={
            loading
              ? 'Estamos recuperando el material visual del sistema.'
              : 'No hay imágenes que coincidan con el filtro actual.'
          }
        />
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPhotos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className="admin-panel overflow-hidden text-left transition hover:-translate-y-1"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <img src={photo.url} alt={photo.alojamientos?.nombre || 'Foto'} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">
                      {photo.alojamientos?.nombre || 'Alojamiento sin nombre'}
                    </p>
                    <p className="text-sm text-slate-500">{photo.alojamientos?.categoria || 'Sin categoría'}</p>
                  </div>
                  <AdminBadge tone={photo.es_principal ? 'accent' : 'neutral'}>
                    {photo.es_principal ? 'Principal' : 'Secundaria'}
                  </AdminBadge>
                </div>
                <div className="flex items-center gap-2">
                  <AdminBadge tone="info">{photo.alojamientos?.tipo || 'Sin tipo'}</AdminBadge>
                </div>
              </div>
            </button>
          ))}
        </section>
      )}

      <AdminDialog
        open={Boolean(selectedPhoto)}
        title={selectedPhoto?.alojamientos?.nombre || 'Vista previa'}
        description={selectedPhoto?.alojamientos?.categoria || 'Detalle de la imagen seleccionada.'}
        onClose={() => setSelectedPhoto(null)}
      >
        {selectedPhoto ? (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[28px] bg-slate-100">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.alojamientos?.nombre || 'Foto seleccionada'}
                className="max-h-[65vh] w-full object-cover"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <AdminBadge tone={selectedPhoto.es_principal ? 'accent' : 'neutral'}>
                {selectedPhoto.es_principal ? 'Imagen principal' : 'Imagen secundaria'}
              </AdminBadge>
              <AdminBadge tone="info">{selectedPhoto.alojamientos?.tipo || 'Sin tipo'}</AdminBadge>
              <AdminBadge tone="neutral">{selectedPhoto.alojamientos?.categoria || 'Sin categoría'}</AdminBadge>
            </div>
          </div>
        ) : null}
      </AdminDialog>
    </AdminPageShell>
  )
}
