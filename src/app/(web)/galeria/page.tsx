'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Share2, Heart, Eye, Calendar, Maximize2, Grid3x3 } from 'lucide-react'

const categories = ['Todas', 'Habitaciones', 'Instalaciones', 'Gastronomía', 'Exterior']

const images = [
  { id: 1, src: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', alt: 'Suite Presidencial', category: 'Habitaciones', views: 1890, likes: 145, date: '5 de enero de 2024' },
  { id: 2, src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', alt: 'Habitación Deluxe', category: 'Habitaciones', views: 1654, likes: 132, date: '3 de enero de 2024' },
  { id: 3, src: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', alt: 'Suite Ejecutiva', category: 'Habitaciones', views: 1423, likes: 98, date: '1 de enero de 2024' },
  { id: 4, src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', alt: 'Piscina Infinity', category: 'Instalaciones', views: 2341, likes: 234, date: '28 de diciembre de 2023' },
  { id: 5, src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', alt: 'Spa de Lujo', category: 'Instalaciones', views: 1876, likes: 167, date: '25 de diciembre de 2023' },
  { id: 6, src: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', alt: 'Gimnasio', category: 'Instalaciones', views: 1234, likes: 89, date: '20 de diciembre de 2023' },
  { id: 7, src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', alt: 'Restaurante Gourmet', category: 'Gastronomía', views: 2156, likes: 198, date: '15 de diciembre de 2023' },
  { id: 8, src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', alt: 'Desayuno Premium', category: 'Gastronomía', views: 1987, likes: 176, date: '10 de diciembre de 2023' },
  { id: 9, src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', alt: 'Bar Lounge', category: 'Gastronomía', views: 1765, likes: 154, date: '5 de diciembre de 2023' },
  { id: 10, src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', alt: 'Vista Exterior', category: 'Exterior', views: 2543, likes: 267, date: '1 de diciembre de 2023' },
  { id: 11, src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', alt: 'Jardines', category: 'Exterior', views: 1998, likes: 187, date: '25 de noviembre de 2023' },
  { id: 12, src: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', alt: 'Terraza', category: 'Exterior', views: 1876, likes: 165, date: '20 de noviembre de 2023' },
]

export default function GaleriaPage() {
  const [cat, setCat] = useState('Todas')
  const [sel, setSel] = useState<typeof images[0] | null>(null)
  const [liked, setLiked] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [showThumbs, setShowThumbs] = useState(false)
  const filtered = cat === 'Todas' ? images : images.filter(i => i.category === cat)
  
  useEffect(() => {
    if (sel) {
      setLiked(false)
      setZoomed(false)
    }
  }, [sel])
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sel) return
      if (e.key === 'Escape') setSel(null)
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'z' || e.key === 'Z') setZoomed(!zoomed)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sel, zoomed])
  
  const handlePrev = () => {
    if (!sel) return
    const idx = filtered.findIndex(i => i.id === sel.id)
    setSel(filtered[idx > 0 ? idx - 1 : filtered.length - 1])
  }
  
  const handleNext = () => {
    if (!sel) return
    const idx = filtered.findIndex(i => i.id === sel.id)
    setSel(filtered[idx < filtered.length - 1 ? idx + 1 : 0])
  }
  
  const handleDownload = () => {
    if (!sel) return
    const link = document.createElement('a')
    link.href = sel.src
    link.download = `${sel.alt}.jpg`
    link.click()
  }
  
  const handleShare = async () => {
    if (!sel) return
    if (navigator.share) {
      await navigator.share({
        title: sel.alt,
        text: `Mira esta imagen de ${sel.alt} en Adventur`,
        url: window.location.href
      })
    }
  }
  
  const currentIndex = sel ? filtered.findIndex(i => i.id === sel.id) + 1 : 0
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="relative h-[450px] bg-gradient-to-r from-red-600 via-red-700 to-red-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-900/30 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6 border border-white/30">
            GALERÍA VISUAL • {images.length} IMÁGENES
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif">
            Nuestra <span className="text-yellow-300">Galería</span>
          </h1>
          <p className="text-xl text-red-100 max-w-2xl">
            Descubre la elegancia y el lujo que te espera en cada rincón de Adventur
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-gray-100 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(c => {
              const count = c === 'Todas' ? images.length : images.filter(i => i.category === c).length
              return (
                <button 
                  key={c} 
                  onClick={() => setCat(c)} 
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all transform hover:scale-105 ${cat === c ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-600/30' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {c} <span className="text-xs opacity-70">({count})</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(img => (
            <div 
              key={img.id} 
              className="group relative aspect-square cursor-pointer rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" 
              onClick={() => setSel(img)}
            >
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="inline-block px-3 py-1 bg-red-600 rounded-full text-white text-xs font-semibold mb-2">{img.category}</div>
                  <h3 className="text-white font-bold text-xl mb-2">{img.alt}</h3>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {img.views}</span>
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {img.likes}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSel(null)}>
          <button onClick={() => setSel(null)} className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-50 group">
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
          </button>
          
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white text-sm font-semibold">
              {currentIndex} / {filtered.length}
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowThumbs(!showThumbs); }} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all">
              <Grid3x3 className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-50 hover:scale-110">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-50 hover:scale-110">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className={`relative w-full rounded-2xl overflow-hidden shadow-2xl mb-4 transition-all duration-300 ${zoomed ? 'h-[80vh]' : 'h-[60vh]'}`}>
              <Image src={sel.src} alt={sel.alt} fill sizes="90vw" className={`transition-all duration-300 ${zoomed ? 'object-cover' : 'object-contain'}`} priority />
              <button onClick={() => setZoomed(!zoomed)} className="absolute bottom-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all">
                {zoomed ? <ZoomOut className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
              </button>
            </div>
            
            {showThumbs && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {filtered.map(img => (
                  <div key={img.id} onClick={() => setSel(img)} className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${sel.id === img.id ? 'border-red-600 scale-110' : 'border-white/20 hover:border-white/50'}`}>
                    <Image src={img.src} alt={img.alt} fill sizes="80px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 bg-red-600 rounded-full text-white text-xs font-semibold mb-2">{sel.category}</div>
                  <h2 className="text-2xl font-bold text-white mb-1">{sel.alt}</h2>
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {sel.views}</span>
                    <span className="flex items-center gap-1"><Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} /> {sel.likes + (liked ? 1 : 0)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {sel.date}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setLiked(!liked)} 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${liked ? 'bg-red-600 scale-110' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-white text-white' : 'text-white'}`} />
                </button>
              </div>
              
              <div className="flex gap-2">
                <button onClick={handleDownload} className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-105">
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
                <button onClick={handleShare} className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-105">
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
              </div>
              
              <div className="mt-3 text-xs text-white/50 text-center">
                Usa ← → para navegar • ESC para cerrar • Z para zoom
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}