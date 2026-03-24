import { Shield, Award, Clock, ThumbsUp } from 'lucide-react'

export function InsigniasConfianza() {
    const badges = [
        {
            icon: Shield,
            title: 'Pago Seguro',
            description: 'Transacciones 100% seguras'
        },
        {
            icon: Award,
            title: 'Certificado',
            description: 'Hotel 5 estrellas certificado'
        },
        {
            icon: Clock,
            title: 'Atención 24/7',
            description: 'Soporte siempre disponible'
        },
        {
            icon: ThumbsUp,
            title: 'Satisfacción',
            description: '98% clientes satisfechos'
        }
    ]

    return (
        <section className="py-12 bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {badges.map((badge, index) => {
                        const Icon = badge.icon
                        return (
                            <div 
                            key={badge.title} 
                            className="flex flex-col items-center text-center p-4 hover:bg-white rounded-lg transition-all duration-300 hover:shadow-md animate-fadeInUp"
                        >
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3 transform hover:scale-110 transition-transform duration-300">
                                    <Icon className="w-6 h-6 text-yellow-400" />
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                    {badge.title}
                                </h3>
                                <p className="text-xs text-gray-600">
                                    {badge.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
