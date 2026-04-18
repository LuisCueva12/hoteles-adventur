'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Share2, Heart, Eye, Camera, Grid3x3, Sparkles, LayoutGrid, BedDouble, Dumbbell, UtensilsCrossed, Trees, MapPin, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

type Foto = {
  id: string
  url: string
  es_principal: boolean
  alojamiento_id: string
  alojamiento?: {
    nombre: string
    categoria: string
    tipo: string
  }
}

type FotoGaleria = {
  id: string
  src: string
  alt: string
  category: string
  views: number
  likes: number
}

const CATS = ['Todas', 'Cabaña', 'EcoLodge', 'Hotel', 'Hostal', 'Casa']

const CAT_ICONS: Record<string, React.ElementType> = {
  'Todas':    LayoutGrid,
  'Cabaña':   Trees,
  'EcoLodge': MapPin,
  'Hotel':    BedDouble,
  'Hostal':   Dumbbell,
  'Casa':     UtensilsCrossed,
}

const CAT_COLORS: Record<string, string> = {
  'Cabaña':   'bg-green-100 text-green-700',
  'EcoLodge': 'bg-emerald-100 text-emerald-700',
  'Hotel':    'bg-blue-100 text-blue-700',
  'Hostal':   'bg-purple-100 text-purple-700',
  'Casa':     'bg-orange-100 text-orange-700',
}

export default function GaleriaPage() {
  const [fotos, setFotos]       = useState<FotoGaleria[]>([])
  const [loading, setLoading]   = useState(true)
  const [cat, setCat]           = useState('Todas')
  const [sel, setSel]           = useState<FotoGaleria | null>(null)
  const [liked, setLiked]       = useState<Set<string>>(new Set())
  const [showThumbs, setShowThumbs] = useState(false)

  // Cargar fotos desde Supabase
  useEffect(() => {
    const supabase = createClient()

    const cargar = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('fotos_alojamiento')
        .select(`
          id,
          url,
          es_principal,
          alojamiento_id,
          alojamientos (
            nombre,
            categoria,
            tipo
          )
        `)
        .order('es_principal', { ascending: false })

      if (error) {
        console.error('Error cargando fotos:', error)
        setLoading(false)
        return
      }

      const mapped: FotoGaleria[] = (data || []).map((f: any, i: number) => ({
        id:       f.id,
        src:      f.url,
        alt:      f.alojamientos?.nombre ?? 'Foto',
        category: f.alojamientos?.tipo ?? 'Hotel',
        views:    Math.floor(Math.random() * 2000) + 500,
        likes:    Math.floor(Math.random() * 200) + 50,
      }))

      setFotos(mapped)
      setLoading(false)
    }

    cargar()

    // Suscripción en tiempo real
    const channel = supabase
      .channel('fotos_galeria')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fotos_alojamiento',
      }, () => {
        cargar()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const cats = ['Todas', ...Array.from(new Set(fotos.map(f => f.category))).sort()]
  const filtered = cat === 'Todas' ? fotos : fotos.filter(f => f.category === cat)
  const currentIdx = sel ? filtered.findIndex(f => f.id === sel.id) : -1

  const handlePrev = useCallback(() => {
    if (!sel) return
    const idx = filtered.findIndex(f => f.id === sel.id)
    setSel(filtered[idx > 0 ? idx - 1 : filtered.length - 1])
  }, [sel, filtered])

  const handleNext = useCallback(() => {
    if (!sel) return
    const idx = filtered.findIndex(f => f.id === sel.id)
    setSel(filtered[idx < filtered.length - 1 ? idx + 1 : 0])
  }, [sel, filtered])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!sel) return
      if (e.key === 'Escape')      setSel(null)
      if (e.key === 'ArrowLeft')   handlePrev()
      if (e.key === 'ArrowRight')  handleNext()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [sel, handlePrev, handleNext])

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const handleShare = async () => {
    if (!sel) return
    if (navigator.share) await navigator.share({ title: sel.alt, url: window.location.href })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=90"
          alt="Galería Adventur Hotels"
          fill className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-400 rounded-full text-gray-900 text-xs font-bold uppercase tracking-widest mb-6">
            <Camera size={12} />
            {loading ? '...' : fotos.length} fotografías
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 font-serif leading-tight drop-shadow-lg">
            Nuestra Galería
          </h1>
          <p className="text-white/90 text-lg max-w-lg mx-auto drop-shadow">
            Descubre los espacios y experiencias que hacen de Adventur un lugar único en Cajamarca.
          </p>
          <div className="flex items-center justify-center gap-10 mt-8">
            {[
              [loading ? '...' : fotos.length.toString(), 'Fotos'],
              [loading ? '...' : (cats.length - 1).toString(), 'Tipos'],
              ['15K+', 'Visitas'],
            ].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-bold text-yellow-400 drop-shadow">{n}</p>
                <p className="text-xs text-white/70 uppercase tracking-wider mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTROS ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {cats.map(c => {
                const count = c === 'Todas' ? fotos.length : fotos.filter(f => f.category === c).length
                const active = cat === c
                const Icon = CAT_ICONS[c] ?? LayoutGrid
                return (
                  <button key={c} onClick={() => setCat(c)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-yellow-400 text-gray-900 shadow-md scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />
                    {c}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-black/10' : 'bg-gray-200 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Sparkles size={12} />
              <span>{filtered.length} imagen{filtered.length !== 1 ? 'es' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
            <Loader2 size={40} className="animate-spin text-yellow-400" />
            <p className="text-sm">Cargando galería...</p>
          </div>
        ) : fotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
            <Camera size={48} className="opacity-30" />
            <p className="text-sm">No hay fotos disponibles aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((img) => (
              <div key={img.id}
                className="group relative cursor-pointer rounded-2xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => setSel(img)}
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src={img.src} alt={img.alt} fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge tipo */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-1 group-hover:translate-y-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${CAT_COLORS[img.category] || 'bg-white text-gray-700'}`}>
                    {img.category}
                  </span>
                </div>

                {/* Like */}
                <button
                  onClick={e => toggleLike(img.id, e)}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-md ${
                    liked.has(img.id) ? 'bg-yellow-400 scale-110' : 'bg-white/90 hover:bg-yellow-400'
                  }`}>
                  <Heart size={13} fill={liked.has(img.id) ? '#1f2937' : 'none'} className={liked.has(img.id) ? 'text-gray-900' : 'text-gray-600'} />
                </button>

                {/* Info bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white font-bold text-sm mb-1 drop-shadow line-clamp-1">{img.alt}</h3>
                  <div className="flex items-center gap-3 text-white/80 text-xs">
                    <span className="flex items-center gap-1"><Eye size={10} /> {img.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart size={10} /> {img.likes + (liked.has(img.id) ? 1 : 0)}</span>
                  </div>
                </div>

                {/* Zoom */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 scale-75 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn size={18} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
      {sel && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setSel(null)}>

          <button onClick={() => setSel(null)}
            className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-50">
            <X size={18} className="text-white" />
          </button>

          <div className="absolute top-5 left-5 flex items-center gap-2 z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-semibold">
              {currentIdx + 1} <span className="text-white/40">/ {filtered.length}</span>
            </div>
            <button onClick={e => { e.stopPropagation(); setShowThumbs(v => !v) }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showThumbs ? 'bg-yellow-400' : 'bg-white/10 hover:bg-white/20'}`}>
              <Grid3x3 size={15} className={showThumbs ? 'text-gray-900' : 'text-white'} />
            </button>
          </div>

          <button onClick={e => { e.stopPropagation(); handlePrev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-yellow-400 rounded-full flex items-center justify-center transition-all z-50 group">
            <ChevronLeft size={22} className="text-white group-hover:text-gray-900" />
          </button>
          <button onClick={e => { e.stopPropagation(); handleNext() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-yellow-400 rounded-full flex items-center justify-center transition-all z-50 group">
            <ChevronRight size={22} className="text-white group-hover:text-gray-900" />
          </button>

          <div className="max-w-5xl w-full px-16 md:px-20" onClick={e => e.stopPropagation()}>
            <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden mb-4 shadow-2xl bg-gray-900">
              <Image src={sel.src} alt={sel.alt} fill sizes="90vw" className="object-contain" priority />
            </div>

            {showThumbs && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {filtered.map(img => (
                  <div key={img.id} onClick={() => setSel(img)}
                    className={`relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      sel.id === img.id ? 'ring-2 ring-yellow-400 scale-110' : 'opacity-50 hover:opacity-100'
                    }`}>
                    <Image src={img.src} alt={img.alt} fill sizes="56px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between bg-white/8 backdrop-blur-md rounded-2xl px-5 py-3.5 border border-white/10">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${CAT_COLORS[sel.category] || 'bg-white/20 text-white'}`}>
                  {sel.category}
                </span>
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">{sel.alt}</h2>
                  <div className="flex items-center gap-3 text-white/40 text-xs mt-0.5">
                    <span className="flex items-center gap-1"><Eye size={10} /> {sel.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart size={10} /> {sel.likes + (liked.has(sel.id) ? 1 : 0)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleLike(sel.id, { stopPropagation: () => {} } as any)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${liked.has(sel.id) ? 'bg-yellow-400' : 'bg-white/10 hover:bg-yellow-400'}`}>
                  <Heart size={14} fill={liked.has(sel.id) ? '#1f2937' : 'none'} className={liked.has(sel.id) ? 'text-gray-900' : 'text-white'} />
                </button>
                <button onClick={handleShare}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                  <Share2 size={14} className="text-white" />
                </button>
                <button onClick={() => { const a = document.createElement('a'); a.href = sel.src; a.download = sel.alt + '.jpg'; a.click() }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-gray-900 text-sm font-bold transition-all">
                  <Download size={13} />
                  Descargar
                </button>
              </div>
            </div>
            <p className="text-center text-white/20 text-xs mt-3">← → navegar · ESC cerrar</p>
          </div>
        </div>
      )}
    </div>
  )
}
