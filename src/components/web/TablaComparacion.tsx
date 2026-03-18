import { Check, X } from 'lucide-react'

interface Feature {
    name: string
    estandar: boolean
    superior: boolean
    deluxe: boolean
    premium: boolean
}

const FEATURES: Feature[] = [
    { name: 'WiFi gratuito', estandar: true, superior: true, deluxe: true, premium: true },
    { name: 'TV Smart', estandar: false, superior: true, deluxe: true, premium: true },
    { name: 'Minibar', estandar: true, superior: true, deluxe: true, premium: true },
    { name: 'Aire acondicionado', estandar: true, superior: true, deluxe: true, premium: true },
    { name: 'Balcón privado', estandar: false, superior: false, deluxe: true, premium: true },
    { name: 'Jacuzzi', estandar: false, superior: false, deluxe: false, premium: true },
    { name: 'Sala de estar', estandar: false, superior: false, deluxe: true, premium: true },
    { name: 'Servicio de habitación 24/7', estandar: false, superior: true, deluxe: true, premium: true },
    { name: 'Desayuno incluido', estandar: false, superior: false, deluxe: true, premium: true },
    { name: 'Mayordomo personal', estandar: false, superior: false, deluxe: false, premium: true },
]

export function ComparisonTable() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
                        Compara Nuestras Habitaciones
                    </h2>
                    <p className="text-gray-600">
                        Encuentra la habitación perfecta para ti
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">
                                    Características
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b">
                                    Estándar
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b">
                                    Superior
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b bg-red-50">
                                    Deluxe
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b">
                                    Premium
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURES.map((feature, index) => (
                                <tr 
                                    key={feature.name}
                                    className={`hover:bg-gray-50 transition-colors ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                    }`}
                                >
                                    <td className="px-6 py-4 text-sm text-gray-700 border-b">
                                        {feature.name}
                                    </td>
                                    <td className="px-6 py-4 text-center border-b">
                                        {feature.estandar ? (
                                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                                        ) : (
                                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center border-b">
                                        {feature.superior ? (
                                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                                        ) : (
                                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center border-b bg-red-50/50">
                                        {feature.deluxe ? (
                                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                                        ) : (
                                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center border-b">
                                        {feature.premium ? (
                                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                                        ) : (
                                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
