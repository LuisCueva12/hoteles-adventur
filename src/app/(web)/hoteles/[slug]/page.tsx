'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
    ChevronLeft, ChevronRight, Users, Maximize, Bed, Eye, Building2, 
    Check, Star, Heart, Share2, Calendar, Clock, Wifi, Tv, Wind,
    Coffee, Bath, Shield, Phone, MapPin, Award, Sparkles, X, Loader2
} from 'lucide-react'
import { useFavorites } from '@/hooks/useFavoritos'
import Swal from 'sweetalert2'
import { createClient } from '@/utils/supabase/client'

// Datos de respaldo para habitaciones (si no hay en BD)
const ROOMS_DATA_FALLBACK = {
    'estandar': {
        id: 1,
        name: 'Habitación Estándar',
        slug: 'estandar',
        tagline: 'Confort y funcionalidad en perfecta armonía',
        images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'
        ],
        price: 180,
        originalPrice: 220,
        capacity: 2,
        size: 25,
        beds: '1 cama Queen size',
        view: 'Vista a la ciudad',
        floor: 'Pisos 2-5',
        rating: 4.5,
        reviews: 128,
        description: 'Nuestra Habitación Estándar ofrece el equilibrio perfecto entre confort y funcionalidad. Diseñada pensando en el viajero moderno, cada detalle ha sido cuidadosamente seleccionado para garantizar una estadía placentera y relajante.',
        longDescription: `
            Disfruta de una experiencia acogedora en nuestra Habitación Estándar, perfectamente equipada para satisfacer todas tus necesidades. 
            Con 25m² de espacio inteligentemente distribuido, esta habitación combina elegancia contemporánea con comodidad práctica.
            
            El diseño interior presenta tonos neutros y cálidos que crean un ambiente relajante, ideal para descansar después de un día 
            explorando la ciudad o trabajando. La iluminación ajustable te permite crear el ambiente perfecto para cualquier momento del día.
        `,
        amenities: [
            { icon: Wifi, name: 'WiFi gratuito de alta velocidad', description: 'Conexión ilimitada en toda la habitación' },
            { icon: Tv, name: 'TV cable 42 pulgadas', description: 'Canales nacionales e internacionales' },
            { icon: Wind, name: 'Aire acondicionado', description: 'Control de temperatura individual' },
            { icon: Coffee, name: 'Minibar', description: 'Bebidas y snacks disponibles' },
            { icon: Bath, name: 'Baño privado completo', description: 'Con ducha, amenidades y secador' },
            { icon: Shield, name: 'Caja fuerte digital', description: 'Para tus objetos de valor' },
            { icon: Phone, name: 'Teléfono directo', description: 'Llamadas locales gratuitas' },
            { icon: Sparkles, name: 'Escritorio de trabajo', description: 'Espacio cómodo para trabajar' }
        ],
        services: [
            'Limpieza diaria de habitación',
            'Cambio de toallas diario',
            'Cambio de sábanas cada 2 días',
            'Servicio de habitación disponible',
            'Desayuno buffet (opcional S/. 35)',
            'Servicio de lavandería',
            'Plancha y tabla disponible',
            'Almohadas adicionales'
        ],
        policies: {
            checkIn: '3:00 PM',
            checkOut: '12:00 PM',
            cancellation: 'Cancelación gratuita hasta 48 horas antes',
            pets: 'No se permiten mascotas',
            smoking: 'Habitación para no fumadores',
            children: 'Niños menores de 5 años gratis'
        },
        highlights: [
            'Ideal para parejas o viajeros de negocios',
            'Ubicación en pisos intermedios',
            'Excelente relación calidad-precio',
            'Acceso rápido a todas las áreas del hotel'
        ],
        nearbyAttractions: [
            { name: 'Plaza de Armas', distance: '500m', time: '6 min caminando' },
            { name: 'Centro Comercial', distance: '1.2km', time: '15 min caminando' },
            { name: 'Museo Regional', distance: '800m', time: '10 min caminando' }
        ]
    },
    'superior': {
        id: 2,
        name: 'Habitación Superior',
        slug: 'superior',
        tagline: 'Espacio premium con vistas espectaculares',
        images: [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'
        ],
        price: 250,
        originalPrice: 310,
        capacity: 2,
        size: 30,
        beds: '1 cama King size',
        view: 'Vista panorámica a la ciudad',
        floor: 'Pisos 6-10',
        rating: 4.7,
        reviews: 95,
        description: 'Eleva tu experiencia con nuestra Habitación Superior. Más espacio, mejores vistas y amenidades premium para una estadía inolvidable.',
        longDescription: `
            La Habitación Superior representa el siguiente nivel en confort y lujo. Con 30m² de espacio elegantemente diseñado,
            esta habitación ofrece vistas panorámicas impresionantes de la ciudad desde pisos elevados.
            
            Perfecta para quienes buscan algo más que una simple habitación, este espacio combina funcionalidad con toques
            de lujo que harán de tu estadía una experiencia memorable. El mobiliario de alta calidad y los acabados premium
            reflejan nuestro compromiso con la excelencia.
        `,
        amenities: [
            { icon: Wifi, name: 'WiFi premium', description: 'Velocidad ultra rápida garantizada' },
            { icon: Tv, name: 'TV Smart 50 pulgadas', description: 'Netflix, YouTube y más' },
            { icon: Wind, name: 'Aire acondicionado dual', description: 'Zonas de temperatura independientes' },
            { icon: Coffee, name: 'Minibar premium', description: 'Selección de bebidas premium' },
            { icon: Bath, name: 'Baño con bañera', description: 'Bañera de hidromasaje y ducha separada' },
            { icon: Shield, name: 'Caja fuerte digital grande', description: 'Capacidad para laptop' },
            { icon: Coffee, name: 'Cafetera Nespresso', description: 'Cápsulas de cortesía' },
            { icon: Sparkles, name: 'Escritorio ejecutivo', description: 'Silla ergonómica incluida' }
        ],
        services: [
            'Limpieza 2 veces al día',
            'Room service 24/7',
            'Desayuno buffet incluido',
            'Servicio de planchado gratuito',
            'Periódico diario',
            'Bata y pantuflas de cortesía',
            'Amenidades de baño premium',
            'Turn-down service nocturno'
        ],
        policies: {
            checkIn: '2:00 PM',
            checkOut: '1:00 PM',
            cancellation: 'Cancelación gratuita hasta 48 horas antes',
            pets: 'No se permiten mascotas',
            smoking: 'Habitación para no fumadores',
            children: 'Niños menores de 8 años gratis'
        },
        highlights: [
            'Vistas panorámicas espectaculares',
            'Baño con bañera de hidromasaje',
            'Desayuno buffet incluido',
            'Pisos elevados con mejor vista',
            'Amenidades premium de cortesía'
        ],
        nearbyAttractions: [
            { name: 'Plaza de Armas', distance: '500m', time: '6 min caminando' },
            { name: 'Restaurantes gourmet', distance: '300m', time: '4 min caminando' },
            { name: 'Teatro Municipal', distance: '1km', time: '12 min caminando' }
        ]
    }
}

export default function HabitacionDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const supabase = createClient()
    
    const [room, setRoom] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showReservaModal, setShowReservaModal] = useState(false)
    const { toggleFavorite, isFavorite } = useFavorites()

    const [formData, setFormData] = useState({
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        huespedes: 1,
    })
    const [minDate, setMinDate] = useState('')

    useEffect(() => {
        setMinDate(new Date().toISOString().split('T')[0])
        if (typeof window !== 'undefined') {
            const sp = new URLSearchParams(window.location.search)
            const checkIn = sp.get('checkIn')
            const checkOut = sp.get('checkOut')
            const huespedes = sp.get('huespedes')
            if (checkIn || checkOut || huespedes) {
                setFormData(prev => ({
                    ...prev,
                    fechaInicio: checkIn || prev.fechaInicio,
                    fechaFin: checkOut || prev.fechaFin,
                    huespedes: huespedes ? Number(huespedes) : prev.huespedes,
                }))
            }
        }
    }, [])

    // Cargar alojamiento desde la base de datos
    useEffect(() => {
        loadAlojamiento()
    }, [slug])

    const loadAlojamiento = async () => {
        try {
            setLoading(true)
            
            // Primero intentar buscar por ID (UUID)
            let alojamiento = null
            let error = null

            // Verificar si el slug parece ser un UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            
            if (uuidRegex.test(slug)) {
                // Buscar por ID
                const result = await supabase
                    .from('alojamientos')
                    .select(`
                        *,
                        fotos_alojamiento (
                            url,
                            es_principal
                        )
                    `)
                    .eq('id', slug)
                    .eq('activo', true)
                    .maybeSingle()
                
                alojamiento = result.data
                error = result.error
            }
            
            // Si no se encontró por ID, buscar por nombre
            if (!alojamiento) {
                const result = await supabase
                    .from('alojamientos')
                    .select(`
                        *,
                        fotos_alojamiento (
                            url,
                            es_principal
                        )
                    `)
                    .eq('activo', true)
                    .ilike('nombre', `%${slug}%`)
                    .limit(1)
                    .maybeSingle()
                
                alojamiento = result.data
                error = result.error
            }

            if (error) {
                console.error('Error loading alojamiento:', error)
            }

            if (!alojamiento) {
                console.log('No se encontró alojamiento para slug:', slug)
                // Si no se encuentra, usar datos de respaldo
                const fallbackRoom = ROOMS_DATA_FALLBACK[slug as keyof typeof ROOMS_DATA_FALLBACK]
                if (fallbackRoom) {
                    setRoom(fallbackRoom)
                } else {
                    setRoom(null)
                }
                return
            }

            console.log('Alojamiento encontrado:', alojamiento.nombre)
            setRoom(transformAlojamiento(alojamiento))
        } catch (error) {
            console.error('Error:', error)
            setRoom(null)
        } finally {
            setLoading(false)
        }
    }

    const transformAlojamiento = (alojamiento: any) => {
        // Ordenar fotos: principal primero
        const fotos = alojamiento.fotos_alojamiento || []
        const fotosPrincipales = fotos.filter((f: any) => f.es_principal)
        const fotasSecundarias = fotos.filter((f: any) => !f.es_principal)
        const fotosOrdenadas = [...fotosPrincipales, ...fotasSecundarias]
        
        const images = fotosOrdenadas.length > 0 
            ? fotosOrdenadas.map((f: any) => f.url)
            : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80']

        return {
            id: alojamiento.id,
            name: alojamiento.nombre,
            slug: slug,
            tagline: `Experiencia única en ${alojamiento.tipo}`,
            images: images,
            price: alojamiento.precio_base,
            originalPrice: null,
            capacity: alojamiento.capacidad_maxima || 2,
            size: 25,
            beds: `${alojamiento.capacidad_maxima || 2} personas`,
            view: 'Vista panorámica',
            floor: alojamiento.distrito || 'Cajamarca',
            rating: 4.5,
            reviews: 50,
            description: alojamiento.descripcion || 'Disfruta de una experiencia única en nuestro alojamiento.',
            longDescription: alojamiento.descripcion || 'Disfruta de una experiencia única en nuestro alojamiento con todas las comodidades que necesitas.',
            amenities: (alojamiento.servicios_incluidos || []).slice(0, 8).map((servicio: string) => ({
                icon: getServiceIcon(servicio),
                name: servicio,
                description: 'Disponible en la habitación'
            })),
            services: alojamiento.servicios_incluidos || [],
            policies: {
                checkIn: '3:00 PM',
                checkOut: '12:00 PM',
                cancellation: 'Cancelación gratuita hasta 48 horas antes',
                pets: 'Consultar disponibilidad',
                smoking: 'Habitación para no fumadores',
                children: 'Niños menores de 5 años gratis'
            },
            highlights: [
                `Capacidad para ${alojamiento.capacidad_maxima || 2} personas`,
                `Ubicado en ${alojamiento.distrito || 'Cajamarca'}`,
                'Excelente relación calidad-precio',
                'Todas las comodidades incluidas'
            ],
            nearbyAttractions: [
                { name: 'Plaza de Armas', distance: '500m', time: '6 min caminando' },
                { name: 'Centro Comercial', distance: '1.2km', time: '15 min caminando' },
                { name: 'Museo Regional', distance: '800m', time: '10 min caminando' }
            ]
        }
    }

    const getServiceIcon = (servicio: string) => {
        const servicioLower = servicio.toLowerCase()
        if (servicioLower.includes('wifi')) return Wifi
        if (servicioLower.includes('tv') || servicioLower.includes('televisión')) return Tv
        if (servicioLower.includes('aire') || servicioLower.includes('clima')) return Wind
        if (servicioLower.includes('café') || servicioLower.includes('cocina')) return Coffee
        if (servicioLower.includes('baño') || servicioLower.includes('ducha')) return Bath
        if (servicioLower.includes('segur')) return Shield
        return Sparkles
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando habitación...</p>
                </div>
            </div>
        )
    }

    if (!room) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Habitación no encontrada</h1>
                    <Link href="/hoteles" className="text-red-600 hover:underline">
                        Volver a habitaciones
                    </Link>
                </div>
            </div>
        )
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
    }

    const calcularNoches = () => {
        if (!formData.fechaInicio || !formData.fechaFin) return 0
        const diff = new Date(formData.fechaFin).getTime() - new Date(formData.fechaInicio).getTime()
        return Math.max(0, Math.ceil(diff / 86400000))
    }

    const handleEnviarWhatsApp = (e: React.FormEvent) => {
        e.preventDefault()
        const noches = calcularNoches()
        const total = noches * room.price
        const fechaFmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

        const msg = [
            `🏨 *SOLICITUD DE RESERVA - Adventur Hotels*`,
            ``,
            `👤 *Nombre:* ${formData.nombre}`,
            ``,
            `🛏 *Habitación:* ${room.name}`,
            `💰 *Precio por noche:* S/. ${room.price}`,
            ``,
            `📅 *Fechas de estadía*`,
            `• Check-in: ${fechaFmt(formData.fechaInicio)}`,
            `• Check-out: ${fechaFmt(formData.fechaFin)}`,
            `• Noches: ${noches}`,
            `• Huéspedes: ${formData.huespedes}`,
            ``,
            `💵 *Total estimado: S/. ${total.toLocaleString('es-PE')}*`,
            ``,
            `Por favor confirmar disponibilidad. ¡Gracias! 🙏`,
        ].join('\n')

        window.open(`https://wa.me/51918146783?text=${encodeURIComponent(msg)}`, '_blank')
        setShowReservaModal(false)
        setFormData({ nombre: '', fechaInicio: '', fechaFin: '', huespedes: 1 })
    }

    return (
        <div className="bg-white">
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-gray-600 hover:text-red-600">Inicio</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link href="/hoteles" className="text-gray-600 hover:text-red-600">Habitaciones</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-semibold">{room.name}</span>
                    </div>
                </div>
            </div>

            {/* Hero Section con Galería */}
            <section className="relative">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{room.name}</h1>
                            <p className="text-xl text-gray-600 mb-4">{room.tagline}</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-5 h-5 ${i < Math.floor(room.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">{room.rating}</span>
                                    <span className="text-gray-500">({room.reviews} reseñas)</span>
                                </div>
                                <span className="text-gray-400">|</span>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{room.floor}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => toggleFavorite(room.id)}
                                className={`p-3 rounded-full border-2 transition-all duration-300 ${
                                    isFavorite(room.id)
                                        ? 'border-red-600 bg-red-50 text-red-600'
                                        : 'border-gray-300 text-gray-700 hover:border-red-600'
                                }`}
                            >
                                <Heart className={`w-6 h-6 ${isFavorite(room.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button className="p-3 rounded-full border-2 border-gray-300 text-gray-700 hover:border-red-600 transition-all">
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Galería de Imágenes */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="col-span-4 md:col-span-2 md:row-span-2 relative h-96 md:h-full rounded-lg overflow-hidden group">
                            <img
                                src={room.images[currentImageIndex]}
                                alt={`${room.name} - Vista ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {room.images.map((_: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                        {room.images.slice(1, 5).map((img: string, idx: number) => (
                            <div 
                                key={idx}
                                className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
                                onClick={() => setCurrentImageIndex(idx + 1)}
                            >
                                <img
                                    src={img}
                                    alt={`${room.name} - Vista ${idx + 2}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contenido Principal */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Columna Principal */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Características Principales */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Características</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Capacidad</p>
                                    <p className="font-semibold text-gray-900">{room.capacity} personas</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <Maximize className="w-8 h-8 text-red-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Tamaño</p>
                                    <p className="font-semibold text-gray-900">{room.size}m²</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <Bed className="w-8 h-8 text-red-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Cama</p>
                                    <p className="font-semibold text-gray-900">{room.beds.split(' ')[2]}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <Eye className="w-8 h-8 text-red-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Vista</p>
                                    <p className="font-semibold text-gray-900">{room.view.split(' ')[1]}</p>
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">{room.description}</p>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{room.longDescription}</p>
                        </div>

                        {/* Puntos Destacados */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lo que hace especial esta habitación</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {room.highlights.map((highlight: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                                        <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{highlight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Amenidades Detalladas */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenidades</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {room.amenities.map((amenity: { icon: any; name: string; description: string }, idx: number) => {
                                    const Icon = amenity.icon
                                    return (
                                        <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-red-600 hover:shadow-md transition-all">
                                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-6 h-6 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">{amenity.name}</h3>
                                                <p className="text-sm text-gray-600">{amenity.description}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Servicios Incluidos */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Servicios Incluidos</h2>
                            <div className="grid md:grid-cols-2 gap-3">
                                {room.services.map((service: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                                        <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <span className="text-gray-700">{service}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Políticas */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Políticas de la Habitación</h2>
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Check-in / Check-out</p>
                                        <p className="text-gray-600">Entrada: {room.policies.checkIn} | Salida: {room.policies.checkOut}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Cancelación</p>
                                        <p className="text-gray-600">{room.policies.cancellation}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Niños</p>
                                        <p className="text-gray-600">{room.policies.children}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Atracciones Cercanas */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Atracciones Cercanas</h2>
                            <div className="space-y-3">
                                {room.nearbyAttractions.map((attraction: { name: string; distance: string; time: string }, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-red-600" />
                                            <span className="font-semibold text-gray-900">{attraction.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">{attraction.distance}</p>
                                            <p className="text-xs text-gray-600">{attraction.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar de Reserva */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
                            <div className="mb-6">
                                {room.originalPrice && (
                                    <p className="text-lg text-gray-500 line-through">S/. {room.originalPrice}</p>
                                )}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">S/. {room.price}</span>
                                    <span className="text-gray-600">/ noche</span>
                                </div>
                                {room.originalPrice && (
                                    <div className="mt-2 inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                                        Ahorra {Math.round((1 - room.price / room.originalPrice) * 100)}%
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowReservaModal(true)}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl mb-4"
                            >
                                Reservar Ahora
                            </button>

                            <p className="text-center text-sm text-gray-600 mb-6">
                                No se realizará ningún cargo todavía
                            </p>

                            <div className="space-y-3 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span>Cancelación gratuita</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span>Confirmación inmediata</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span>Mejor precio garantizado</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <Link 
                                    href="/contacto"
                                    className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-semibold"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>¿Necesitas ayuda?</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal de Reserva */}
            {showReservaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="relative overflow-hidden h-40 flex-shrink-0">
                            <img src={room.images[0]} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-red-700/60 to-transparent" />
                            <div className="relative z-10 flex items-end justify-between px-6 pb-5 h-full">
                                <div>
                                    <span className="inline-block bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2">Solicitar reserva</span>
                                    <h2 className="text-xl font-bold text-white leading-tight">Reserva tu Habitación</h2>
                                    <p className="text-white/75 text-sm mt-0.5">{room.name}</p>
                                </div>
                                <button onClick={() => setShowReservaModal(false)}
                                    className="w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center border border-white/20 transition-all flex-shrink-0">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Info precio */}
                        <div className="flex items-center justify-between px-6 py-3.5 bg-gray-900 flex-shrink-0">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold text-white">S/. {room.price}</span>
                                <span className="text-gray-400 text-sm">/ noche</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-300">
                                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-red-400" />{room.capacity} pers.</span>
                                <span className="w-px h-3 bg-gray-600" />
                                <span className="flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5 text-red-400" />{room.size}m²</span>
                                <span className="w-px h-3 bg-gray-600" />
                                <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-red-400" />{room.beds.split(' ')[2] || '1'} cama</span>
                            </div>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleEnviarWhatsApp} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">Nombre completo</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="¿Cómo te llamas?"
                                    required
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 text-sm transition-colors placeholder-gray-400"
                                />
                            </div>

                            {/* Fechas */}
                            <div>
                                <p className="text-sm font-bold text-gray-800 mb-2">Fechas de estadía</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Check-in</label>
                                        <input
                                            type="date"
                                            value={formData.fechaInicio}
                                            min={minDate}
                                            onChange={e => setFormData({ ...formData, fechaInicio: e.target.value, fechaFin: '' })}
                                            required
                                            suppressHydrationWarning
                                            className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 text-sm transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Check-out {calcularNoches() > 0 && <span className="text-red-500 normal-case font-bold">· {calcularNoches()} noche{calcularNoches() > 1 ? 's' : ''}</span>}
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.fechaFin}
                                            min={formData.fechaInicio || minDate}
                                            onChange={e => setFormData({ ...formData, fechaFin: e.target.value })}
                                            required
                                            suppressHydrationWarning
                                            className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 text-sm transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Huéspedes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">Huéspedes</label>
                                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                    <button type="button"
                                        onClick={() => setFormData(f => ({ ...f, huespedes: Math.max(1, f.huespedes - 1) }))}
                                        className="w-14 h-12 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 text-xl font-bold transition-colors border-r-2 border-gray-200">
                                        −
                                    </button>
                                    <div className="flex-1 text-center">
                                        <span className="text-xl font-bold text-gray-900">{formData.huespedes}</span>
                                        <span className="text-xs text-gray-400 ml-2">/ máx. {room.capacity}</span>
                                    </div>
                                    <button type="button"
                                        onClick={() => setFormData(f => ({ ...f, huespedes: Math.min(room.capacity, f.huespedes + 1) }))}
                                        className="w-14 h-12 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 text-xl font-bold transition-colors border-l-2 border-gray-200">
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Resumen */}
                            {calcularNoches() > 0 && (
                                <div className="bg-gray-900 rounded-2xl p-4 text-white">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Resumen</p>
                                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                                        <span>S/. {room.price} × {calcularNoches()} {calcularNoches() === 1 ? 'noche' : 'noches'}</span>
                                        <span>S/. {(room.price * calcularNoches()).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                                        <span className="font-semibold text-gray-200">Total estimado</span>
                                        <span className="text-2xl font-bold text-red-400">S/. {(room.price * calcularNoches()).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3 pb-2">
                                <button type="button" onClick={() => setShowReservaModal(false)}
                                    className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all text-sm">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    disabled={!formData.nombre || !formData.fechaInicio || !formData.fechaFin}
                                    className="flex-1 py-3.5 bg-[#25D366] hover:bg-[#20c05c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all hover:shadow-lg flex items-center justify-center gap-2 text-sm">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    Enviar por WhatsApp
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
