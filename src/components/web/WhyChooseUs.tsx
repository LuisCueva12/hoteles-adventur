'use client'

import { useState } from 'react'
import Link from 'next/link'

const FILTERS = ['Todo', 'Restaurante', 'Piscina', 'Spa', 'Eventos']

const GALLERY = [
    { img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80', cat: 'Restaurante' },
    { img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&q=80', cat: 'Restaurante' },
    { img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrHmKit7scCP3ikRIUdEYwKcH6SNllCtpvqQ&s', cat: 'Piscina' },
    { img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80', cat: 'Piscina' },
    { img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80', cat: 'Spa' },
    { img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&q=80', cat: 'Eventos' },
]

export function WhyChooseUs() {
    const [active, setActive] = useState('Todo')
    const filtered = active === 'Todo' ? GALLERY : GALLERY.filter((g) => g.cat === active)

    return (
        <section className="py-20 bg-gray-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white uppercase tracking-widest mb-3">
                        Por que elegirnos
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-px w-16 bg-red-600" />
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <div className="h-px w-16 bg-red-600" />
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {FILTERS.map((f) => (
                            <button key={f} onClick={() => setActive(f)}
                                className={`px-5 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors ${active === f
                                    ? 'bg-red-600 border-red-600 text-white'
                                    : 'border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-400'
                                    }`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                    {filtered.map((item, i) => (
                        <div key={i} className="group relative h-52 overflow-hidden">
                            <img src={item.img} alt={item.cat}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-4">
                                <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.cat}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/galeria"
                        className="inline-block px-10 py-3 border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-semibold text-sm uppercase tracking-wider transition-colors">
                        Ver todo
                    </Link>
                </div>
            </div>
        </section>
    )
}
