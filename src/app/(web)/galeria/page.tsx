'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Share2, Heart, Eye, Camera, Grid3x3, Sparkles, LayoutGrid, BedDouble, Dumbbell, UtensilsCrossed, Trees } from 'lucide-react'

const CATS = ['Todas', 'Habitaciones', 'Instalaciones', 'Gastronomía', 'Exterior']

const IMAGES = [
  { id: 1,  src: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=85', alt: 'Suite Presidencial',   category: 'Habitaciones',  views: 1890, likes: 145, span: 'col-span-2 row-span-2' },
  { id: 2,  src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=85',  alt: 'Habitación Deluxe',    category: 'Habitaciones',  views: 1654, likes: 132, span: '' },
  { id: 3,  src: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=85',  alt: 'Suite Ejecutiva',      category: 'Habitaciones',  views: 1423, likes: 98,  span: '' },
  { id: 4,  src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=85', alt: 'Piscina Infinity',     category: 'Instalaciones', views: 2341, likes: 234, span: 'col-span-2' },
  { id: 5,  src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=85',  alt: 'Spa de Lujo',          category: 'Instalaciones', views: 1876, likes: 167, span: '' },
  { id: 6,  src: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=85',  alt: 'Gimnasio',             category: 'Instalaciones', views: 1234, likes: 89,  span: '' },
  { id: 7,  src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85', alt: 'Restaurante Gourmet',  category: 'Gastronomía',   views: 2156, likes: 198, span: 'row-span-2' },
  { id: 8,  src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=85',     alt: 'Desayuno Premium',     category: 'Gastronomía',   views: 1987, likes: 176, span: '' },
  { id: 9,  src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=85',     alt: 'Bar Lounge',           category: 'Gastronomía',   views: 1765, likes: 154, span: '' },
  { id: 10, src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=85',    alt: 'Vista Exterior',       category: 'Exterior',      views: 2543, likes: 267, span: 'col-span-2' },
  { id: 11, src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=85',     alt: 'Jardines',             category: 'Exterior',      views: 1998, likes: 187, span: '' },
  { id: 12, src: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=85',  alt: 'Terraza',              category: 'Exterior',      views: 1876, likes: 165, span: '' },
]

const CAT_ICONS: Record<string, React.ElementType> = {
  'Todas': LayoutGrid,
  'Habitaciones': BedDouble,
  'Instalaciones': Dumbbell,
  'Gastronomía': UtensilsCrossed,
  'Exterior': Trees,
}

export default function GaleriaPage() {
  const [cat, setCat] = useState('Todas')
  const [sel, setSel] = useState<typeof IMAGES[0] | null>(null)
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [showThumbs, setShowThumbs] = useState(false)

  const filtered = cat === 'Todas' ? IMAGES : IMAGES.filter(i => i.category === cat)
  const currentIdx = sel ? filtered.findIndex(i => i.id === sel.id) : -1

  const handlePrev = useCallback(() => {
    if (!sel) return
    const idx = filtered.findIndex(i => i.id === sel.id)
    setSel(filtered[idx > 0 ? idx - 1 : filtered.length - 1])
  }, [sel, filtered])

  const handleNext = useCallback(() => {
    if (!sel) return
    const idx = filtered.findIndex(i => i.id === sel.id)
    setSel(filtered[idx < filtered.length - 1 ? idx + 1 : 0])
  }, [sel, filtered])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!sel) return
      if (e.key === 'Escape') setSel(null)
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [sel, handlePrev, handleNext])

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const handleShare = async () => {
    if (!sel) return
    if (navigator.share) await navigator.share({ title: sel.alt, url: window.location.href })
  }

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── HERO con imagen real ─────────────────────────────────────────── */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=90"
          alt="Galería Adventur"
          fill className="object-cover scale-105"
          priority
        />
        {/* Overlay multicapa */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-gray-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 via-transparent to-red-950/40" />

        {/* Partículas decorativas */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-red-400 rounded-full opacity-80 animate-ping" style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full opacity-40 animate-ping" style={{ animationDelay: '0.8s', animationDuration: '3.5s' }} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-xs font-bold uppercase tracking-widest mb-8 border border-white/20">
            <Camera size={13} />
            Galería Visual · {IMAGES.length} imágenes
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 font-serif leading-none">
            Nuestra<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Galería</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            Cada imagen cuenta una historia. Descubre los espacios que hacen de Adventur un lugar único.
          </p>
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-10">
            {[['12', 'Fotografías'], ['5', 'Categorías'], ['24K', 'Visualizaciones']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="text-3xl font-bold text-white">{n}</p>
                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-10 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs uppercase tracking-widest">Explorar</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── FILTROS ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c => {
                const count = c === 'Todas' ? IMAGES.length : IMAGES.filter(i => i.category === c).length
                const active = cat === c
                return (
                  <button key={c} onClick={() => setCat(c)}
                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      active
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}>
                    {(() => { const Icon = CAT_ICONS[c]; return <Icon className="w-4 h-4" /> })()}
                    {c}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Sparkles size={12} />
              <span>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID MASONRY ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[220px] gap-4">
          {filtered.map((img, i) => {
            // En vista filtrada, no aplicar spans para evitar huecos
            const spanClass = cat === 'Todas' ? img.span : ''
            return (
              <div key={img.id}
                className={`group relative cursor-pointer rounded-2xl overflow-hidden ${spanClass} bg-gray-900`}
                onClick={() => setSel(img)}
              >
                <Image
                  src={img.src} alt={img.alt} fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400" />

                {/* Badge categoría */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <span className="px-2.5 py-1 bg-red-600/90 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                    {img.category}
                  </span>
                </div>

                {/* Like button */}
                <button
                  onClick={e => toggleLike(img.id, e)}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                    liked.has(img.id) ? 'bg-red-600 scale-110' : 'bg-black/40 backdrop-blur-sm hover:bg-red-600'
                  }`}>
                  <Heart size={14} fill={liked.has(img.id) ? 'white' : 'none'} className="text-white" />
                </button>

                {/* Info bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white font-bold text-sm mb-1.5 line-clamp-1">{img.alt}</h3>
                  <div className="flex items-center gap-3 text-white/60 text-xs">
                    <span className="flex items-center gap-1"><Eye size={11} /> {img.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart size={11} /> {img.likes + (liked.has(img.id) ? 1 : 0)}</span>
                  </div>
                </div>

                {/* Zoom icon center */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 scale-75 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn size={20} className="text-white" />
                  </div>
                </div>

                {/* Número de imagen */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-white/40 text-xs font-mono">#{String(i + 1).padStart(2, '0')}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── LIGHTBOX ────────────────────────────────────────────────────── */}
      {sel && (
        <div className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center" onClick={() => setSel(null)}>

          {/* Cerrar */}
          <button onClick={() => setSel(null)}
            className="absolute top-5 right-5 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-50 group">
            <X size={18} className="text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Contador */}
          <div className="absolute top-5 left-5 flex items-center gap-3 z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-semibold">
              {currentIdx + 1} <span className="text-white/40">/ {filtered.length}</span>
            </div>
            <button onClick={e => { e.stopPropagation(); setShowThumbs(v => !v) }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showThumbs ? 'bg-red-600' : 'bg-white/10 hover:bg-white/20'}`}>
              <Grid3x3 size={16} className="text-white" />
            </button>
          </div>

          {/* Nav prev */}
          <button onClick={e => { e.stopPropagation(); handlePrev() }}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-50 hover:scale-110 group">
            <ChevronLeft size={22} className="text-white" />
          </button>

          {/* Nav next */}
          <button onClick={e => { e.stopPropagation(); handleNext() }}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-50 hover:scale-110 group">
            <ChevronRight size={22} className="text-white" />
          </button>

          <div className="max-w-5xl w-full px-20" onClick={e => e.stopPropagation()}>
            {/* Imagen principal */}
            <div className="relative w-full h-[62vh] rounded-2xl overflow-hidden mb-4 shadow-2xl">
              <Image src={sel.src} alt={sel.alt} fill sizes="90vw" className="object-contain" priority />
            </div>

            {/* Thumbnails */}
            {showThumbs && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {filtered.map(img => (
                  <div key={img.id} onClick={() => setSel(img)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      sel.id === img.id ? 'ring-2 ring-red-500 scale-110' : 'opacity-50 hover:opacity-100'
                    }`}>
                    <Image src={img.src} alt={img.alt} fill sizes="64px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Info bar */}
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-red-600/80 rounded-full text-white text-xs font-bold">{sel.category}</span>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">{sel.alt}</h2>
                  <div className="flex items-center gap-4 text-white/40 text-xs mt-0.5">
                    <span className="flex items-center gap-1"><Eye size={11} /> {sel.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart size={11} /> {sel.likes + (liked.has(sel.id) ? 1 : 0)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleLike(sel.id, { stopPropagation: () => {} } as any)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${liked.has(sel.id) ? 'bg-red-600' : 'bg-white/10 hover:bg-red-600'}`}>
                  <Heart size={15} fill={liked.has(sel.id) ? 'white' : 'none'} className="text-white" />
                </button>
                <button onClick={handleShare}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                  <Share2 size={15} className="text-white" />
                </button>
                <button onClick={() => { const a = document.createElement('a'); a.href = sel.src; a.download = sel.alt + '.jpg'; a.click() }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-semibold transition-all">
                  <Download size={14} />
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
