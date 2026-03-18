import { Check, Car, Wifi, Briefcase, Bell, Sparkles, Lock, Dog, Accessibility, Clock, Coffee, Utensils, Dumbbell, Calendar, Shield, MapPin } from 'lucide-react'

export default function ServiciosPage() {
    return (
        <div className="bg-white">
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80"
                    alt="Servicios"
                    className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
                
                {/* Partículas flotantes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${8 + Math.random() * 12}s`
                            }}
                        />
                    ))}
                </div>
                
                <div className="relative z-10 text-center text-white px-6 max-w-4xl">
                    <div className="mb-6 animate-fadeInDown">
                        <span className="inline-block px-4 py-1.5 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full text-red-400 text-xs font-semibold tracking-[0.3em] uppercase">
                            Experiencias Premium
                        </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp animation-delay-100 drop-shadow-2xl font-serif">
                        Nuestros <span className="text-red-500">Servicios</span>
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3 mb-6 animate-fadeInUp animation-delay-150">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-500" />
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-500" />
                    </div>
                    
                    <p className="text-xl text-gray-200 tracking-wide animate-fadeInUp animation-delay-200 max-w-2xl mx-auto">
                        Descubre una experiencia inolvidable con servicios diseñados para tu comodidad
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16 animate-fadeInUp">
                    <div className="mb-6">
                        <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold tracking-[0.3em] uppercase rounded-full">
                            Lo que ofrecemos
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
                        Servicios <span className="text-red-600">Premium</span>
                    </h2>
                    
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-red-600 to-red-600" />
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent via-red-600 to-red-600" />
                    </div>
                    
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Disfruta de una amplia gama de servicios diseñados para hacer de tu estadía una experiencia excepcional
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-24">
                    {[
                        {
                            img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
                            title: 'Restaurante Gourmet',
                            desc: 'Cocina internacional y local preparada por chefs de renombre. Desayuno buffet, almuerzo y cena a la carta.',
                            features: ['Desayuno buffet', 'Menú a la carta', 'Bar de vinos', 'Servicio 24/7'],
                            icon: Utensils,
                            color: 'from-orange-500 to-red-500'
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
                            title: 'Piscina Infinity',
                            desc: 'Piscina climatizada en la azotea con vistas panorámicas de la ciudad. Incluye área de jacuzzi y bar.',
                            features: ['Piscina climatizada', 'Jacuzzi', 'Bar poolside', 'Camastros premium'],
                            icon: Coffee,
                            color: 'from-blue-500 to-cyan-500'
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
                            title: 'Spa & Wellness',
                            desc: 'Centro de bienestar completo con tratamientos de spa, masajes terapéuticos y gimnasio equipado.',
                            features: ['Masajes', 'Sauna', 'Gimnasio', 'Yoga'],
                            icon: Sparkles,
                            color: 'from-purple-500 to-pink-500'
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80',
                            title: 'Salones de Eventos',
                            desc: 'Espacios versátiles para conferencias, bodas y eventos corporativos con capacidad hasta 500 personas.',
                            features: ['Salones privados', 'Equipamiento AV', 'Catering', 'Planificación'],
                            icon: Calendar,
                            color: 'from-yellow-500 to-orange-500'
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
                            title: 'Centro de Negocios',
                            desc: 'Instalaciones modernas para reuniones de trabajo, con internet de alta velocidad y servicios de secretaría.',
                            features: ['Salas de reuniones', 'WiFi premium', 'Impresión', 'Videoconferencia'],
                            icon: Briefcase,
                            color: 'from-gray-600 to-gray-800'
                        },
                        {
                            img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80',
                            title: 'Concierge Premium',
                            desc: 'Servicio personalizado para reservas de tours, transporte, restaurantes y recomendaciones locales.',
                            features: ['Tours privados', 'Transporte', 'Reservas', 'Asistencia 24/7'],
                            icon: MapPin,
                            color: 'from-green-500 to-emerald-500'
                        },
                    ].map((service, index) => {
                        const IconComponent = service.icon
                        return (
                            <div key={service.title} className="group bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-red-600 transition-all duration-500 animate-fadeInUp hover:-translate-y-3" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={service.img}
                                        alt={service.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    
                                    {/* Icono flotante */}
                                    <div className={`absolute top-4 right-4 w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                                        <IconComponent className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">{service.title}</h3>
                                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">{service.desc}</p>
                                    
                                    <div className="space-y-3">
                                        {service.features.map((feature) => (
                                            <div key={feature} className="flex items-center text-sm text-gray-700 group/item hover:text-red-600 transition-colors">
                                                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover/item:bg-red-600 transition-colors">
                                                    <Check className="w-3 h-3 text-red-600 group-hover/item:text-white transition-colors" />
                                                </div>
                                                <span className="font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white rounded-3xl p-12 relative overflow-hidden">
                    {/* Elementos decorativos */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                        <div className="text-center mb-12">
                            <div className="mb-4">
                                <span className="inline-block px-4 py-1.5 bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-semibold tracking-[0.3em] uppercase rounded-full">
                                    Incluido en tu estadía
                                </span>
                            </div>
                            
                            <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
                                Servicios <span className="text-red-500">Adicionales</span>
                            </h3>
                            
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Todos estos servicios están incluidos para hacer tu experiencia aún más cómoda
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                { Icon: Car, label: 'Estacionamiento gratuito', color: 'from-blue-500 to-blue-600' },
                                { Icon: Wifi, label: 'WiFi de alta velocidad', color: 'from-purple-500 to-purple-600' },
                                { Icon: Briefcase, label: 'Servicio de equipaje', color: 'from-yellow-500 to-yellow-600' },
                                { Icon: Bell, label: 'Room service 24/7', color: 'from-green-500 to-green-600' },
                                { Icon: Sparkles, label: 'Limpieza diaria', color: 'from-pink-500 to-pink-600' },
                                { Icon: Lock, label: 'Caja de seguridad', color: 'from-red-500 to-red-600' },
                                { Icon: Dog, label: 'Pet friendly', color: 'from-orange-500 to-orange-600' },
                                { Icon: Accessibility, label: 'Accesibilidad total', color: 'from-cyan-500 to-cyan-600' },
                            ].map((item, index) => {
                                const IconComponent = item.Icon
                                return (
                                    <div key={item.label} className="flex flex-col items-center text-center animate-fadeInUp hover:scale-110 transition-all duration-300 group" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-300`}>
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">{item.label}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
