import Image from 'next/image'

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
                    <div>
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
                    <div className="relative h-96 rounded-sm overflow-hidden shadow-xl">
                        <img
                            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"
                            alt="Hotel interior"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        { num: '150+', label: 'Habitaciones de lujo' },
                        { num: '50K+', label: 'Huéspedes satisfechos' },
                        { num: '25+', label: 'Años de experiencia' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center p-8 bg-gray-50 rounded-sm">
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
                        { icon: '⭐', title: 'Excelencia', desc: 'Compromiso con la calidad en cada servicio' },
                        { icon: '🤝', title: 'Hospitalidad', desc: 'Atención cálida y personalizada' },
                        { icon: '🌿', title: 'Sostenibilidad', desc: 'Respeto por el medio ambiente' },
                        { icon: '💎', title: 'Innovación', desc: 'Mejora continua de nuestros servicios' },
                    ].map((value) => (
                        <div key={value.title} className="text-center p-6 border border-gray-200 rounded-sm hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">{value.icon}</div>
                            <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                            <p className="text-sm text-gray-600">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
