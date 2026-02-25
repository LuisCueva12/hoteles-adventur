import { Check, Car, Wifi, Briefcase, Bell, Sparkles, Lock, Dog, Accessibility } from 'lucide-react'

export default function ServiciosPage() {
    return (
        <div className="bg-white">
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80"
                    alt="Servicios"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        Nuestros Servicios
                    </h1>
                    <p className="text-gray-300 tracking-widest uppercase text-sm">Experiencias inolvidables</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <p className="text-red-600 text-xs font-semibold tracking-[0.3em] uppercase mb-3">
                        Lo que ofrecemos
                    </p>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                        Servicios Premium
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Disfruta de una amplia gama de servicios diseñados para hacer de tu estadía una experiencia excepcional
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {[
                        {
                            img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
                            title: 'Restaurante Gourmet',
                            desc: 'Cocina internacional y local preparada por chefs de renombre. Desayuno buffet, almuerzo y cena a la carta.',
                            features: ['Desayuno buffet', 'Menú a la carta', 'Bar de vinos', 'Servicio 24/7']
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
                            title: 'Piscina Infinity',
                            desc: 'Piscina climatizada en la azotea con vistas panorámicas de la ciudad. Incluye área de jacuzzi y bar.',
                            features: ['Piscina climatizada', 'Jacuzzi', 'Bar poolside', 'Camastros premium']
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
                            title: 'Spa & Wellness',
                            desc: 'Centro de bienestar completo con tratamientos de spa, masajes terapéuticos y gimnasio equipado.',
                            features: ['Masajes', 'Sauna', 'Gimnasio', 'Yoga']
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80',
                            title: 'Salones de Eventos',
                            desc: 'Espacios versátiles para conferencias, bodas y eventos corporativos con capacidad hasta 500 personas.',
                            features: ['Salones privados', 'Equipamiento AV', 'Catering', 'Planificación']
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
                            title: 'Centro de Negocios',
                            desc: 'Instalaciones modernas para reuniones de trabajo, con internet de alta velocidad y servicios de secretaría.',
                            features: ['Salas de reuniones', 'WiFi premium', 'Impresión', 'Videoconferencia']
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80',
                            title: 'Concierge Premium',
                            desc: 'Servicio personalizado para reservas de tours, transporte, restaurantes y recomendaciones locales.',
                            features: ['Tours privados', 'Transporte', 'Reservas', 'Asistencia 24/7']
                        },
                    ].map((service, index) => (
                        <div key={service.title} className="group bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fadeInUp hover:-translate-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={service.img}
                                    alt={service.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">{service.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.desc}</p>
                                <ul className="space-y-2">
                                    {service.features.map((feature) => (
                                        <li key={feature} className="flex items-center text-sm text-gray-600">
                                            <Check className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-950 text-white rounded-sm p-12 text-center">
                    <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                        Servicios Adicionales
                    </h3>
                    <div className="grid md:grid-cols-4 gap-6 mt-8">
                        {[
                            { Icon: Car, label: 'Estacionamiento gratuito' },
                            { Icon: Wifi, label: 'WiFi de alta velocidad' },
                            { Icon: Briefcase, label: 'Servicio de equipaje' },
                            { Icon: Bell, label: 'Room service 24/7' },
                            { Icon: Sparkles, label: 'Limpieza diaria' },
                            { Icon: Lock, label: 'Caja de seguridad' },
                            { Icon: Dog, label: 'Pet friendly' },
                            { Icon: Accessibility, label: 'Accesibilidad total' },
                        ].map((item) => {
                            const IconComponent = item.Icon
                            return (
                                <div key={item.label} className="flex flex-col items-center">
                                    <IconComponent className="w-8 h-8 text-red-600 mb-2" />
                                    <p className="text-sm text-gray-300">{item.label}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
        </div>
    )
}
