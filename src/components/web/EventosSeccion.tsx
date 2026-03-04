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
                    <p className="text-red-600 text-xs font-semibold tracking-[0.3em] uppercase mb-2">Proximos</p>
                    <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                        Eventos
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="h-px w-16 bg-red-600" />
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <div className="h-px w-16 bg-red-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {EVENTS.map((event, index) => (
                        <div key={event.title} className="group bg-white shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden rounded-sm hover:-translate-y-2 animate-fadeInUp">
                            <div className="relative h-48 overflow-hidden">
                                <img src={event.img} alt={event.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute bottom-0 left-0 bg-red-600 text-white px-4 py-2 text-center min-w-[60px]">
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
