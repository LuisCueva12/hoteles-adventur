'use client'

import { useState } from 'react'

const CATEGORIES = ['Todas', 'Habitaciones', 'Restaurante', 'Piscina', 'Spa', 'Eventos', 'Instalaciones']

const IMAGES = [
    { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', cat: 'Habitaciones', title: 'Suite Deluxe' },
    { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', cat: 'Habitaciones', title: 'Suite Premium' },
    { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', cat: 'Habitaciones', title: 'Habitación Estándar' },
    { url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80', cat: 'Habitaciones', title: 'Suite Ejecutiva' },
    { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', cat: 'Restaurante', title: 'Restaurante Principal' },
    { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', cat: 'Restaurante', title: 'Bar Lounge' },
    { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', cat: 'Restaurante', title: 'Terraza Gourmet' },
    { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrHmKit7scCP3ikRIUdEYwKcH6SNllCtpvqQ&s', cat: 'Piscina', title: 'Piscina Infinity' },
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', cat: 'Piscina', title: 'Área de Piscina' },
    { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', cat: 'Spa', title: 'Spa & Wellness' },
    { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80', cat: 'Spa', title: 'Sala de Masajes' },
    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', cat: 'Eventos', title: 'Salón de Eventos' },
    { url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80', cat: 'Eventos', title: 'Salón de Conferencias' },
    { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', cat: 'Instalaciones', title: 'Lobby Principal' },
    { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', cat: 'Instalaciones', title: 'Centro de Negocios' },
    { url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', cat: 'Instalaciones', title: 'Recepción' },
]

export default function GaleriaPage() {
    const [activeCategory, setActiveCategory] = useState('Todas')
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const filteredImages = activeCategory === 'Todas' 
        ? IMAGES 
        : IMAGES.filter(img => img.cat === activeCategory)

    return (
        <div className="bg-white">
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80"
                    alt="Galería"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        Galería
                    </h1>
                    <p className="text-gray-300 tracking-widest uppercase text-sm">Descubre nuestras instalaciones</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 text-sm font-semibold uppercase tracking-wider border transition-colors ${
                                activeCategory === cat
                                    ? 'bg-red-600 border-red-600 text-white'
                                    : 'border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredImages.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedImage(img.url)}
                            className="group relative h-64 overflow-hidden rounded-sm cursor-pointer"
                        >
                            <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center text-white px-4">
                                    <p className="font-semibold mb-1">{img.title}</p>
                                    <p className="text-xs text-gray-300">{img.cat}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white text-4xl hover:text-red-500 transition-colors"
                    >
                        ×
                    </button>
                    <img
                        src={selectedImage}
                        alt="Vista ampliada"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}
        </div>
    )
}
