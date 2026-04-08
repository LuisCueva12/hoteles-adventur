import Image from 'next/image'

const EVENTS = [
    {
        day: '25',
        month: 'ABR',
        title: 'Noche de Gala Culinaria',
        desc: 'Una velada exclusiva con los mejores chefs del Peru y cena de autor.',
        img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80',
    },
    {
        day: '22',
        month: 'JUN',
        title: 'Festival de Musica Andina',
        desc: 'Disfruta de musica en vivo con artistas de talla nacional e internacional.',
        img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
    },
    {
        day: '15',
        month: 'AGO',
        title: 'Retiro de Bienestar y Spa',
        desc: 'Fin de semana de relajacion con tratamientos exclusivos y actividades de mindfulness.',
        img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
    },
]

export function EventosSeccion() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-14">
                    <div className="inline-block mb-4">
                        <span className="px-4 py-1.5 bg-yellow-50 text-yellow-400 text-xs font-semibold tracking-[0.3em] uppercase rounded-full">
                            Próximos Eventos
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
                        Eventos <span className="text-yellow-400">Especiales</span>
                    </h2>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-400" />
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
                        Vive experiencias únicas en nuestros eventos exclusivos diseñados para cada ocasión
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {EVENTS.map((event, index) => (
                        <div key={event.title} className="group bg-white shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden rounded-2xl hover:-translate-y-2 animate-fadeInUp">
                            <div className="relative h-48 overflow-hidden">
                                <Image src={event.img} alt={event.title}
                                    fill sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy" quality={75} />
                                <div className="absolute bottom-0 left-0 bg-yellow-400 text-gray-900 px-4 py-2 text-center min-w-[60px]">
                                    <p className="text-2xl font-bold leading-none">{event.day}</p>
                                    <p className="text-xs tracking-widest">{event.month}</p>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{event.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
