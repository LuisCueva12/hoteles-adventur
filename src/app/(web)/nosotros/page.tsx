import { Star, Handshake, Leaf, Gem } from 'lucide-react'

export default function NosotrosPage() {
    return (
        <div className="bg-white">
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80"
                    alt="Sobre nosotros"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        Sobre Nosotros
                    </h1>
                    <p className="text-gray-300 tracking-widest uppercase text-sm">Conoce nuestra historia</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div className="animate-fadeInLeft">
                        <p className="text-red-600 text-xs font-semibold tracking-[0.3em] uppercase mb-3">
                            Nuestra Historia
                        </p>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                            Bienvenido a Adventur Hotels
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Desde 1995, Adventur Hotels ha sido sinónimo de lujo, confort y hospitalidad excepcional en el corazón de Lima. Nuestra misión es crear experiencias memorables que superen las expectativas de cada huésped.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Con más de 25 años de experiencia en la industria hotelera, nos hemos consolidado como uno de los destinos preferidos tanto para viajeros de negocios como para turistas que buscan una experiencia única.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Nuestro compromiso con la excelencia se refleja en cada detalle, desde nuestras elegantes habitaciones hasta nuestro servicio personalizado de clase mundial.
                        </p>
                    </div>
                    <div className="relative h-96 rounded-sm overflow-hidden shadow-xl animate-fadeInRight hover:shadow-2xl transition-shadow duration-500">
                        <img
                            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"
                            alt="Hotel interior"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        { num: '150+', label: 'Habitaciones de lujo' },
                        { num: '50K+', label: 'Huéspedes satisfechos' },
                        { num: '25+', label: 'Años de experiencia' },
                    ].map((stat, index) => (
                        <div key={stat.label} className="text-center p-8 bg-gray-50 rounded-sm hover:bg-red-50 transition-all duration-500 animate-fadeInUp hover:shadow-lg hover:-translate-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                            <p className="text-4xl font-bold text-red-600 mb-2">{stat.num}</p>
                            <p className="text-gray-600 text-sm uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                        Nuestros Valores
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-px w-16 bg-red-600" />
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <div className="h-px w-16 bg-red-600" />
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {[
                        { Icon: Star, title: 'Excelencia', desc: 'Compromiso con la calidad en cada servicio' },
                        { Icon: Handshake, title: 'Hospitalidad', desc: 'Atención cálida y personalizada' },
                        { Icon: Leaf, title: 'Sostenibilidad', desc: 'Respeto por el medio ambiente' },
                        { Icon: Gem, title: 'Innovación', desc: 'Mejora continua de nuestros servicios' },
                    ].map((value, index) => {
                        const IconComponent = value.Icon
                        return (
                            <div key={value.title} className="text-center p-6 border border-gray-200 rounded-sm hover:shadow-xl transition-all duration-500 animate-fadeInUp hover:-translate-y-2 hover:border-red-600 group" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="flex justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    <IconComponent className="w-10 h-10 text-red-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">{value.title}</h3>
                                <p className="text-sm text-gray-600">{value.desc}</p>
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}
