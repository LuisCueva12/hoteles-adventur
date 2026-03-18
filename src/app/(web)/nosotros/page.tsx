import { Star, Handshake, Leaf, Gem, Award, Users, TrendingUp, Heart, Shield, Zap, Target, Globe } from 'lucide-react'

export default function NosotrosPage() {
    return (
        <div className="bg-white">
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80"
                    alt="Sobre nosotros"
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
                            Nuestra Historia
                        </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp animation-delay-100 drop-shadow-2xl font-serif">
                        Sobre <span className="text-red-500">Nosotros</span>
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3 mb-6 animate-fadeInUp animation-delay-150">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-500" />
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-500" />
                    </div>
                    
                    <p className="text-xl text-gray-200 tracking-wide animate-fadeInUp animation-delay-200 max-w-2xl mx-auto">
                        Conoce nuestra historia y descubre por qué somos el destino preferido de miles de viajeros
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div className="animate-fadeInLeft">
                        <div className="mb-6">
                            <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold tracking-[0.3em] uppercase rounded-full">
                                Nuestra Historia
                            </span>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
                            Bienvenido a <span className="text-red-600">Adventur Hotels</span>
                        </h2>
                        
                        <div className="space-y-4 text-gray-600 leading-relaxed">
                            <p className="text-lg">
                                Desde <span className="font-bold text-red-600">1995</span>, Adventur Hotels ha sido sinónimo de lujo, confort y hospitalidad excepcional en el corazón de Lima. Nuestra misión es crear experiencias memorables que superen las expectativas de cada huésped.
                            </p>
                            <p>
                                Con más de <span className="font-semibold text-gray-900">25 años de experiencia</span> en la industria hotelera, nos hemos consolidado como uno de los destinos preferidos tanto para viajeros de negocios como para turistas que buscan una experiencia única.
                            </p>
                            <p>
                                Nuestro compromiso con la excelencia se refleja en cada detalle, desde nuestras elegantes habitaciones hasta nuestro servicio personalizado de clase mundial.
                            </p>
                        </div>
                        
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-white flex items-center justify-center text-white font-bold">
                                        {i === 1 ? '👤' : i === 2 ? '👥' : i === 3 ? '🌟' : '✨'}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">+50,000 huéspedes satisfechos</p>
                                <p className="text-xs text-gray-500">Calificación promedio: 4.9/5 ⭐</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative animate-fadeInRight">
                        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl group">
                            <img
                                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"
                                alt="Hotel interior"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            
                            {/* Badge flotante */}
                            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Premio Excelencia</p>
                                        <p className="text-xs text-gray-600">Mejor Hotel 2023</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Elemento decorativo */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50" />
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50" />
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-24">
                    {[
                        { num: '150+', label: 'Habitaciones de lujo', icon: '🏨', color: 'from-blue-500 to-blue-600' },
                        { num: '50K+', label: 'Huéspedes satisfechos', icon: '😊', color: 'from-green-500 to-green-600' },
                        { num: '25+', label: 'Años de experiencia', icon: '⭐', color: 'from-yellow-500 to-yellow-600' },
                        { num: '4.9★', label: 'Calificación promedio', icon: '🏆', color: 'from-red-500 to-red-600' },
                    ].map((stat, index) => (
                        <div key={stat.label} className="relative text-center p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl hover:shadow-2xl transition-all duration-500 animate-fadeInUp hover:-translate-y-3 group border border-gray-100 overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
                            {/* Efecto de brillo */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            
                            <div className="relative z-10">
                                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                                    <span className="text-3xl">{stat.icon}</span>
                                </div>
                                <p className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors font-sans">{stat.num}</p>
                                <p className="text-gray-600 text-sm uppercase tracking-wider font-medium">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mb-16">
                    <div className="mb-6">
                        <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold tracking-[0.3em] uppercase rounded-full">
                            Lo que nos define
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
                        Nuestros <span className="text-red-600">Valores</span>
                    </h2>
                    
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-red-600 to-red-600" />
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent via-red-600 to-red-600" />
                    </div>
                    
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Estos son los pilares fundamentales que guían cada decisión y acción en Adventur Hotels
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-20">
                    {[
                        { Icon: Star, title: 'Excelencia', desc: 'Compromiso con la calidad en cada servicio', color: 'from-yellow-500 to-orange-500' },
                        { Icon: Handshake, title: 'Hospitalidad', desc: 'Atención cálida y personalizada', color: 'from-blue-500 to-cyan-500' },
                        { Icon: Leaf, title: 'Sostenibilidad', desc: 'Respeto por el medio ambiente', color: 'from-green-500 to-emerald-500' },
                        { Icon: Gem, title: 'Innovación', desc: 'Mejora continua de nuestros servicios', color: 'from-purple-500 to-pink-500' },
                    ].map((value, index) => {
                        const IconComponent = value.Icon
                        return (
                            <div key={value.title} className="relative text-center p-8 bg-white border-2 border-gray-100 rounded-2xl hover:shadow-2xl transition-all duration-500 animate-fadeInUp hover:-translate-y-3 hover:border-red-600 group overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
                                {/* Fondo animado */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                
                                <div className="relative z-10">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">{value.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{value.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                {/* Nueva sección: Por qué elegirnos */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
                            ¿Por qué elegir <span className="text-red-600">Adventur Hotels</span>?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Descubre las razones que nos hacen únicos en la industria hotelera
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { Icon: Shield, title: 'Seguridad Garantizada', desc: 'Protocolos de seguridad de clase mundial para tu tranquilidad' },
                            { Icon: Heart, title: 'Atención Personalizada', desc: 'Cada huésped es único y merece un servicio excepcional' },
                            { Icon: Zap, title: 'Tecnología Avanzada', desc: 'Habitaciones inteligentes con las últimas innovaciones' },
                            { Icon: Target, title: 'Ubicación Estratégica', desc: 'En el corazón de Lima, cerca de todo lo importante' },
                            { Icon: Users, title: 'Equipo Profesional', desc: 'Personal altamente capacitado y comprometido' },
                            { Icon: Globe, title: 'Estándares Internacionales', desc: 'Calidad reconocida a nivel mundial' },
                        ].map((item, index) => {
                            const IconComponent = item.Icon
                            return (
                                <div key={item.title} className="flex gap-4 p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 group animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300">
                                            <IconComponent className="w-6 h-6 text-red-600 group-hover:text-white transition-colors duration-300" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{item.title}</h4>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
        </div>
    )
}
