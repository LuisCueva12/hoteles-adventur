'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
    ChevronLeft, ChevronRight, Users, Maximize, Bed, Eye, Building2, 
    Check, Star, Heart, Share2, Calendar, Clock, Wifi, Tv, Wind,
    Coffee, Bath, Shield, Phone, MapPin, Award, Sparkles, Loader2,
    MessageCircle, X
} from 'lucide-react'
import { SeccionResenas } from '@/components/web/SeccionResenas'
import { useFavorites } from '@/hooks/useFavoritos'
import { createClient } from '@/utils/supabase/client'
import { useSiteConfig } from '@/components/providers/ProveedorConfiguracionSitio'
import { SiteConfigRepository } from '@/lib/repositories/site-config.repository'

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
    const slug = params.slug as string
    const supabase = createClient()
    const { config } = useSiteConfig()
    
    const [room, setRoom] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const { toggleFavorite, isFavorite } = useFavorites()
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({
        nombre: '',
        telefono: '',
        email: '',
        checkIn: '',
        checkOut: '',
        huespedes: 1,
        comentario: '',
    })

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
                    <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
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
                    <Link href="/hoteles" className="text-yellow-400 hover:underline">
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
        if (!form.checkIn || !form.checkOut) return 0
        const diff = new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()
        return Math.max(0, Math.ceil(diff / 86400000))
    }

    const handleEnviarWhatsApp = (e: React.FormEvent) => {
        e.preventDefault()
        const whatsappPhone = SiteConfigRepository.getWhatsappPhone(config)
        const noches = calcularNoches()
        const totalNum = room.price * noches * form.huespedes
        const total = noches > 0 ? `S/. ${totalNum.toLocaleString()}` : 'Por confirmar'
        const fmtFecha = (d: string) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : '-'

        const linea = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'

        const msg = [
            `*RESERVA ADVENTUR HOTELS*`,
            `${linea}`,
            `*${room.name}*`,
            ``,
            `*CLIENTE*`,
            `› Nombre:   ${form.nombre}`,
            `› Telefono: ${form.telefono}`,
            form.email ? `› Email:    ${form.email}` : null,
            ``,
            `*ESTADIA*`,
            `› Check-in:   ${fmtFecha(form.checkIn)}`,
            `› Check-out:  ${fmtFecha(form.checkOut)}`,
            noches > 0 ? `› Noches:     ${noches}` : null,
            `› Huespedes:  ${form.huespedes} persona${form.huespedes > 1 ? 's' : ''}`,
            ``,
            `*PRECIO*`,
            `› Tarifa/noche:  S/. ${room.price}`,
            noches > 0 ? `› Noches:        ${noches}` : null,
            form.huespedes > 1 ? `› Huespedes:     ${form.huespedes}` : null,
            `${linea}`,
            `*TOTAL:  ${total}*`,
            `${linea}`,
            form.comentario ? `\n*NOTA DEL CLIENTE*\n${form.comentario}\n` : null,
            `_hoteles.adventur.pe_`,
        ].filter(Boolean).join('\n')

        window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`, '_blank')
        setShowModal(false)
        setForm({ nombre: '', telefono: '', email: '', checkIn: '', checkOut: '', huespedes: 1, comentario: '' })
    }

    return (
        <div className="bg-white">
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-gray-600 hover:text-yellow-400">Inicio</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link href="/hoteles" className="text-gray-600 hover:text-yellow-400">Habitaciones</Link>
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
                                        ? 'border-yellow-400 bg-yellow-50 text-yellow-400'
                                        : 'border-gray-300 text-gray-700 hover:border-yellow-400'
                                }`}
                            >
                                <Heart className={`w-6 h-6 ${isFavorite(room.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button className="p-3 rounded-full border-2 border-gray-300 text-gray-700 hover:border-yellow-400 transition-all">
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
                                    <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Capacidad</p>
                                    <p className="font-semibold text-gray-900">{room.capacity} personas</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <Maximize className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Tamaño</p>
                                    <p className="font-semibold text-gray-900">{room.size}m²</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <Bed className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">Cama</p>
                                    <p className="font-semibold text-gray-900">{room.beds.split(' ')[2]}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <Eye className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
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
                                    <div key={idx} className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg">
                                        <Award className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
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
                                        <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-yellow-400 hover:shadow-md transition-all">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-6 h-6 text-yellow-400" />
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
                                            <MapPin className="w-5 h-5 text-yellow-400" />
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

                        {/* Reseñas */}
                        {room.id && !room.id.startsWith('fallback') && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas de huéspedes</h2>
                                <SeccionResenas alojamientoId={room.id} />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Reserva */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                            <div className="mb-6">
                                {room.originalPrice && (
                                    <p className="text-lg text-gray-500 line-through">S/. {room.originalPrice}</p>
                                )}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">S/. {room.price}</span>
                                    <span className="text-gray-600">/ noche</span>
                                </div>
                                {room.originalPrice && (
                                    <div className="mt-2 inline-block bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-semibold">
                                        Ahorra {Math.round((1 - room.price / room.originalPrice) * 100)}%
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-3 flex items-center justify-center gap-3 text-base"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Reservar por WhatsApp
                            </button>

                            <p className="text-center text-xs text-gray-500 mb-6">
                                Completa el formulario y te contactamos en minutos
                            </p>

                            <div className="space-y-3 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <span>Atención personalizada</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <span>Confirmación inmediata</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <span>Mejor precio garantizado</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <Link 
                                    href="/contacto"
                                    className="flex items-center justify-center gap-2 text-yellow-500 hover:text-yellow-600 font-semibold text-sm"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>Otras formas de contacto</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal de Reserva */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="relative h-32 rounded-t-3xl overflow-hidden flex-shrink-0">
                            {room.images[0] && (
                                <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute bottom-4 left-5 right-12">
                                <span className="inline-block bg-yellow-400 text-gray-900 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-1">Solicitar reserva</span>
                                <h2 className="text-lg font-bold text-white leading-tight">{room.name}</h2>
                                <p className="text-white/70 text-xs">S/. {room.price}/noche</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-3 right-3 w-9 h-9 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center border border-white/20 transition-all"
                                aria-label="Cerrar"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleEnviarWhatsApp} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="res-nombre" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Nombre completo *</label>
                                    <input
                                        id="res-nombre"
                                        type="text"
                                        required
                                        value={form.nombre}
                                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                        placeholder="Tu nombre"
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="res-telefono" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Teléfono / WhatsApp *</label>
                                    <input
                                        id="res-telefono"
                                        type="tel"
                                        required
                                        value={form.telefono}
                                        onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                                        placeholder="+51 999 999 999"
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="res-email" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email (opcional)</label>
                                <input
                                    id="res-email"
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="tu@email.com"
                                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="res-checkin" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Check-in *</label>
                                    <input
                                        id="res-checkin"
                                        type="date"
                                        required
                                        value={form.checkIn}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setForm(f => ({ ...f, checkIn: e.target.value, checkOut: '' }))}
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="res-checkout" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                        Check-out *{calcularNoches() > 0 && <span className="text-green-600 normal-case font-bold ml-1">· {calcularNoches()}n</span>}
                                    </label>
                                    <input
                                        id="res-checkout"
                                        type="date"
                                        required
                                        value={form.checkOut}
                                        min={form.checkIn || new Date().toISOString().split('T')[0]}
                                        onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
                                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Huéspedes</label>
                                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                    <button type="button" onClick={() => setForm(f => ({ ...f, huespedes: Math.max(1, f.huespedes - 1) }))}
                                        className="w-12 h-11 flex items-center justify-center text-gray-600 hover:bg-yellow-50 hover:text-yellow-500 text-xl font-bold transition-colors border-r-2 border-gray-200">−</button>
                                    <div className="flex-1 text-center">
                                        <span className="text-lg font-bold text-gray-900">{form.huespedes}</span>
                                        <span className="text-xs text-gray-400 ml-1">/ máx. {room.capacity}</span>
                                    </div>
                                    <button type="button" onClick={() => setForm(f => ({ ...f, huespedes: Math.min(room.capacity, f.huespedes + 1) }))}
                                        className="w-12 h-11 flex items-center justify-center text-gray-600 hover:bg-yellow-50 hover:text-yellow-500 text-xl font-bold transition-colors border-l-2 border-gray-200">+</button>
                                </div>
                            </div>

                            {calcularNoches() > 0 && (
                                <div className="bg-gray-900 rounded-2xl p-4 text-white">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Resumen estimado</p>
                                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                                        <span>S/. {room.price} × {calcularNoches()} noche{calcularNoches() > 1 ? 's' : ''}</span>
                                        <span>S/. {(room.price * calcularNoches()).toLocaleString()}</span>
                                    </div>
                                    {form.huespedes > 1 && (
                                        <div className="flex justify-between text-sm text-gray-300 mb-1">
                                            <span>× {form.huespedes} huéspedes</span>
                                            <span>S/. {(room.price * calcularNoches() * form.huespedes).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2">
                                        <span className="font-semibold text-gray-200 text-sm">Total estimado</span>
                                        <span className="text-xl font-bold text-yellow-400">
                                            S/. {(room.price * calcularNoches() * form.huespedes).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="res-comentario" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Comentario (opcional)</label>
                                <textarea
                                    id="res-comentario"
                                    rows={2}
                                    value={form.comentario}
                                    onChange={e => setForm(f => ({ ...f, comentario: e.target.value }))}
                                    placeholder="Alguna solicitud especial, hora de llegada..."
                                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all text-sm">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:shadow-lg flex items-center justify-center gap-2 text-sm">
                                    <MessageCircle className="w-4 h-4" />
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
