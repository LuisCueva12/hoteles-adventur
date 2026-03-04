'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Maximize, Heart, Star, Bed, Eye, Building2, ChevronLeft, ChevronRight, Info, Check, X, Calendar, CreditCard, Sparkles } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { ShareButtons } from '@/components/web/ShareButtons'
import Swal from 'sweetalert2'
import { createClient } from '@/utils/supabase/client'

// Datos de respaldo en caso de que no haya habitaciones en la BD
const ROOMS_FALLBACK = [
    {
        id: 1,
        name: 'Habitación Estándar',
        slug: 'estandar',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'
        ],
        price: 180,
        originalPrice: 220,
        capacity: 2,
        size: 25,
        beds: '1 cama Queen',
        view: 'Vista a la ciudad',
        floor: 'Pisos 2-5',
        description: 'Habitación cómoda y acogedora con todas las comodidades básicas para una estadía placentera. Perfecta para parejas o viajeros de negocios que buscan confort y funcionalidad.',
        amenities: ['WiFi gratuito', 'TV cable 42"', 'Aire acondicionado', 'Minibar', 'Baño privado', 'Caja fuerte', 'Escritorio', 'Secador de pelo'],
        services: ['Limpieza diaria', 'Servicio de habitación', 'Desayuno opcional', 'Cambio de toallas'],
        available: true,
        rating: 4.5,
        reviews: 128
    },
    {
        id: 2,
        name: 'Habitación Superior',
        slug: 'superior',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'
        ],
        price: 250,
        originalPrice: 310,
        capacity: 2,
        size: 30,
        beds: '1 cama King',
        view: 'Vista panorámica',
        floor: 'Pisos 6-10',
        description: 'Habitación espaciosa con vistas panorámicas a la ciudad y amenidades premium. Diseñada para quienes buscan mayor espacio y confort con detalles de lujo.',
        amenities: ['WiFi premium', 'TV Smart 50"', 'Aire acondicionado', 'Minibar premium', 'Baño con bañera', 'Escritorio ejecutivo', 'Cafetera Nespresso', 'Bata y pantuflas', 'Caja fuerte digital'],
        services: ['Limpieza 2 veces al día', 'Room service 24/7', 'Desayuno buffet', 'Servicio de planchado', 'Periódico diario'],
        available: true,
        rating: 4.7,
        reviews: 95
    },
    {
        id: 3,
        name: 'Suite Deluxe',
        slug: 'deluxe',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
        ],
        price: 350,
        originalPrice: 450,
        capacity: 3,
        size: 45,
        beds: '1 cama King + 1 sofá cama',
        view: 'Vista panorámica premium',
        floor: 'Pisos 11-15',
        description: 'Suite elegante con sala de estar separada y vistas panorámicas espectaculares. Perfecta para familias o estancias prolongadas que requieren espacio y privacidad.',
        amenities: ['WiFi ultra rápido', 'TV Smart 55" + 42"', 'Aire acondicionado dual', 'Minibar premium', 'Baño de lujo con bañera', 'Sala de estar', 'Balcón privado', 'Cocina pequeña', 'Comedor', 'Cafetera Nespresso', 'Sistema de sonido', 'Caja fuerte grande'],
        services: ['Limpieza 2 veces al día', 'Room service 24/7', 'Desayuno buffet incluido', 'Servicio de planchado', 'Periódico diario', 'Check-in privado', 'Amenidades de baño premium'],
        available: true,
        rating: 4.9,
        reviews: 156
    },
    {
        id: 4,
        name: 'Suite Premium',
        slug: 'premium',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'
        ],
        price: 520,
        originalPrice: 680,
        capacity: 4,
        size: 60,
        beds: '2 camas King',
        view: 'Vista 360° de la ciudad',
        floor: 'Pisos 16-18',
        description: 'Suite de lujo con dos habitaciones, sala de estar y comedor privado. Ideal para familias grandes o grupos que buscan el máximo confort y privacidad con servicios exclusivos.',
        amenities: ['WiFi ultra rápido', '3 TV Smart 55"', 'Aire acondicionado central', 'Bar completo', '2 baños de lujo', 'Sala de estar amplia', 'Comedor para 6', 'Balcón privado grande', 'Jacuzzi', 'Cocina completa', 'Lavadora/secadora', 'Sistema de sonido Bose', 'Caja fuerte grande', 'Vestidor'],
        services: ['Limpieza 3 veces al día', 'Mayordomo personal', 'Room service 24/7', 'Desayuno buffet incluido', 'Servicio de planchado ilimitado', 'Periódico diario', 'Check-in/out privado', 'Amenidades de baño de lujo', 'Servicio de lavandería express', 'Traslado aeropuerto incluido'],
        available: true,
        rating: 5.0,
        reviews: 87
    },
    {
        id: 5,
        name: 'Suite Ejecutiva',
        slug: 'ejecutiva',
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'
        ],
        price: 420,
        originalPrice: 530,
        capacity: 2,
        size: 50,
        beds: '1 cama King',
        view: 'Vista ejecutiva',
        floor: 'Piso ejecutivo 19',
        description: 'Suite diseñada específicamente para viajeros de negocios con área de trabajo amplia, sala de reuniones privada y acceso al lounge ejecutivo. Incluye servicios premium de negocios.',
        amenities: ['WiFi ultra rápido', 'TV Smart 55"', 'Aire acondicionado', 'Minibar ejecutivo', 'Baño de lujo', 'Escritorio ejecutivo grande', 'Sala de reuniones privada', 'Impresora/escáner', 'Videoconferencia', 'Silla ergonómica', 'Cafetera premium', 'Caja fuerte laptop'],
        services: ['Acceso lounge ejecutivo', 'Desayuno buffet incluido', 'Happy hour incluido', 'Servicio de secretaría', 'Impresión ilimitada', 'Room service 24/7', 'Check-in express', 'Late check-out incluido', 'Periódicos internacionales'],
        available: false,
        rating: 4.8,
        reviews: 64
    },
    {
        id: 6,
        name: 'Suite Presidencial',
        slug: 'presidencial',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'
        ],
        price: 850,
        originalPrice: 1200,
        capacity: 6,
        size: 120,
        beds: '3 camas King',
        view: 'Vista 360° panorámica',
        floor: 'Piso 20 (Penthouse)',
        description: 'La suite más exclusiva y lujosa del hotel con servicios personalizados de mayordomo 24/7, vistas panorámicas de 360 grados y amenidades de clase mundial. Una experiencia presidencial única.',
        amenities: ['WiFi dedicado', '4 TV Smart 65"', 'Aire acondicionado inteligente', 'Bar completo premium', '3 baños de mármol', 'Sala de estar de lujo', 'Comedor para 10', 'Cocina gourmet completa', 'Terraza privada 40m²', 'Jacuzzi exterior', 'Sauna privada', 'Gimnasio privado', 'Piano de cola', 'Sistema de cine', 'Vestidores amplios', 'Caja fuerte grande'],
        services: ['Mayordomo 24/7', 'Chef privado disponible', 'Chofer privado', 'Limpieza continua', 'Desayuno gourmet incluido', 'Cena de bienvenida', 'Spa en habitación', 'Servicio de lavandería premium', 'Concierge personal', 'Seguridad privada', 'Traslados ilimitados', 'Acceso VIP a todas las áreas'],
        available: true,
        rating: 5.0,
        reviews: 42
    },
]

interface ReservaModal {
    room: any | null
    checkIn: string
    checkOut: string
    guests: number
}

export default function HotelesPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()
    
    // Estado para habitaciones desde la BD
    const [rooms, setRooms] = useState<any[]>([])
    const [loadingRooms, setLoadingRooms] = useState(true)
    
    const [filter, setFilter] = useState<'all' | 'available'>('all')
    const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'capacity'>('price-asc')
    const [reservaModal, setReservaModal] = useState<ReservaModal>({
        room: null,
        checkIn: '',
        checkOut: '',
        guests: 1
    })
    const [showModal, setShowModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState<Record<number, number>>({})
    const [showDetailsModal, setShowDetailsModal] = useState<any | null>(null)
    const { toggleFavorite, isFavorite } = useFavorites()

    // Cargar habitaciones desde la base de datos
    useEffect(() => {
        loadRooms()
    }, [])

    const loadRooms = async () => {
        try {
            setLoadingRooms(true)
            const { data, error } = await supabase
                .from('alojamientos')
                .select(`
                    *,
                    fotos_alojamiento (
                        url,
                        es_principal
                    )
                `)
                .eq('activo', true)
                .order('precio_base', { ascending: true })

            if (error) throw error

            if (data && data.length > 0) {
                // Mapear datos de la BD al formato esperado
                const mappedRooms = data.map(aloj => {
                    // Ordenar fotos: principal primero
                    const fotos = aloj.fotos_alojamiento || []
                    const fotosPrincipales = fotos.filter((f: any) => f.es_principal)
                    const fotosSecundarias = fotos.filter((f: any) => !f.es_principal)
                    const fotosOrdenadas = [...fotosPrincipales, ...fotosSecundarias]
                    
                    const images = fotosOrdenadas.length > 0 
                        ? fotosOrdenadas.map((f: any) => f.url)
                        : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80']

                    return {
                        id: aloj.id,
                        name: aloj.nombre,
                        slug: aloj.id, // Usar ID como slug para que funcione la navegación
                        image: images[0], // Primera imagen (principal)
                        images: images,
                        price: aloj.precio_base,
                        originalPrice: null,
                        capacity: aloj.capacidad_maxima || 2,
                        size: 25,
                        beds: aloj.capacidad_maxima === 1 ? '1 cama Individual' : aloj.capacidad_maxima === 2 ? '1 cama Queen' : `${aloj.capacidad_maxima} camas`,
                        view: 'Vista panorámica',
                        floor: aloj.distrito || 'Cajamarca',
                        description: aloj.descripcion || 'Habitación cómoda y acogedora',
                        amenities: aloj.servicios_incluidos || ['WiFi gratuito', 'TV cable', 'Aire acondicionado', 'Minibar', 'Baño privado'],
                        services: ['Limpieza diaria', 'Servicio de habitación'],
                        available: aloj.activo,
                        rating: 4.5,
                        reviews: 0
                    }
                })
                setRooms(mappedRooms)
            } else {
                // Si no hay habitaciones en la BD, usar datos de respaldo
                setRooms(ROOMS_FALLBACK)
            }
        } catch (error) {
            console.error('Error cargando habitaciones:', error)
            // En caso de error, usar datos de respaldo
            setRooms(ROOMS_FALLBACK)
        } finally {
            setLoadingRooms(false)
        }
    }

    // Aplicar filtros de búsqueda
    useEffect(() => {
        const tipo = searchParams.get('tipo')
        const huespedes = searchParams.get('huespedes')
        
        if (tipo || huespedes) {
            console.log('Filtros aplicados:', { tipo, huespedes })
        }
    }, [searchParams])

    const handleReservar = (room: any) => {
        const checkIn = searchParams.get('checkIn') || ''
        const checkOut = searchParams.get('checkOut') || ''
        const guests = parseInt(searchParams.get('huespedes') || '1')
        
        setReservaModal({
            room,
            checkIn,
            checkOut,
            guests
        })
        setShowModal(true)
    }

    const calcularTotal = () => {
        if (!reservaModal.room || !reservaModal.checkIn || !reservaModal.checkOut) return 0
        
        const inicio = new Date(reservaModal.checkIn)
        const fin = new Date(reservaModal.checkOut)
        const noches = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
        
        return noches * reservaModal.room.price
    }

    const calcularNoches = () => {
        if (!reservaModal.checkIn || !reservaModal.checkOut) return 0
        const inicio = new Date(reservaModal.checkIn)
        const fin = new Date(reservaModal.checkOut)
        const diff = fin.getTime() - inicio.getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const handleConfirmarReserva = async () => {
        if (!reservaModal.room || !reservaModal.checkIn || !reservaModal.checkOut) {
            await Swal.fire({
                icon: 'warning',
                title: 'Datos incompletos',
                text: 'Por favor completa todos los campos',
                confirmButtonColor: '#DC2626'
            })
            return
        }

        const noches = calcularNoches()
        if (noches <= 0) {
            await Swal.fire({
                icon: 'error',
                title: 'Fechas inválidas',
                text: 'La fecha de salida debe ser posterior a la fecha de entrada',
                confirmButtonColor: '#DC2626'
            })
            return
        }

        setIsSubmitting(true)

        try {
            // Verificar autenticación
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                await Swal.fire({
                    icon: 'info',
                    title: 'Inicia sesión',
                    text: 'Debes iniciar sesión para realizar una reserva',
                    confirmButtonColor: '#DC2626',
                    confirmButtonText: 'Ir a Login'
                })
                router.push('/login')
                return
            }

            // Buscar el alojamiento correspondiente a esta habitación
            const { data: alojamiento, error: searchError } = await supabase
                .from('alojamientos')
                .select('id')
                .eq('nombre', reservaModal.room.name)
                .eq('activo', true)
                .single()

            if (searchError || !alojamiento) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Alojamiento no disponible',
                    text: 'Esta habitación no está disponible en este momento. Por favor contacta con el administrador.',
                    confirmButtonColor: '#DC2626'
                })
                return
            }

            const alojamientoId = alojamiento.id

            const total = calcularTotal()
            const adelanto = total * 0.3
            const codigoReserva = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

            // Crear reserva
            const { error } = await supabase
                .from('reservas')
                .insert([{
                    usuario_id: user.id,
                    alojamiento_id: alojamientoId,
                    fecha_inicio: reservaModal.checkIn,
                    fecha_fin: reservaModal.checkOut,
                    personas: reservaModal.guests,
                    total: total,
                    adelanto: adelanto,
                    codigo_reserva: codigoReserva,
                    estado: 'pendiente'
                }])

            if (error) throw error

            setShowModal(false)
            
            await Swal.fire({
                icon: 'success',
                title: '¡Reserva confirmada!',
                html: `
                    <div class="text-left space-y-3">
                        <p class="text-gray-700">Tu reserva ha sido creada exitosamente.</p>
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <p class="font-semibold text-blue-900 mb-2">Código de reserva:</p>
                            <p class="text-2xl font-bold text-blue-600">${codigoReserva}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p><span class="font-semibold">Habitación:</span> ${reservaModal.room.name}</p>
                            <p><span class="font-semibold">Check-in:</span> ${new Date(reservaModal.checkIn).toLocaleDateString('es-PE')}</p>
                            <p><span class="font-semibold">Check-out:</span> ${new Date(reservaModal.checkOut).toLocaleDateString('es-PE')}</p>
                            <p><span class="font-semibold">Noches:</span> ${noches}</p>
                            <p><span class="font-semibold">Huéspedes:</span> ${reservaModal.guests}</p>
                            <p class="text-xl font-bold text-green-600 pt-2 border-t">Total: S/. ${total.toLocaleString()}</p>
                            <p class="text-sm text-gray-600">Adelanto requerido: S/. ${adelanto.toLocaleString()}</p>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#DC2626',
                confirmButtonText: 'Ver mis reservas',
                showCancelButton: true,
                cancelButtonText: 'Cerrar',
                cancelButtonColor: '#6B7280'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/reservas')
                }
            })

            // Resetear
            setReservaModal({
                room: null,
                checkIn: '',
                checkOut: '',
                guests: 1
            })

        } catch (error) {
            console.error('Error al crear reserva:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al crear tu reserva. Por favor intenta nuevamente.',
                confirmButtonColor: '#DC2626'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    let filteredRooms = filter === 'available' ? rooms.filter(r => r.available) : rooms

    // Filtrar por tipo de búsqueda
    const tipoParam = searchParams.get('tipo')
    if (tipoParam) {
        filteredRooms = filteredRooms.filter(r => r.slug === tipoParam)
    }

    // Filtrar por capacidad
    const huespedesParam = searchParams.get('huespedes')
    if (huespedesParam) {
        filteredRooms = filteredRooms.filter(r => r.capacity >= parseInt(huespedesParam))
    }

    filteredRooms = [...filteredRooms].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        return b.capacity - a.capacity
    })

    // Mostrar loading
    if (loadingRooms) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando habitaciones...</p>
                </div>
            </div>
        )
    }

    // Mostrar mensaje si no hay habitaciones
    if (rooms.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay habitaciones disponibles</h2>
                    <p className="text-gray-600 mb-6">
                        Actualmente no hay habitaciones registradas en el sistema. 
                        Por favor contacta con el administrador.
                    </p>
                    <Link 
                        href="/"
                        className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white">
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
                    alt="Habitaciones"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        Nuestras Habitaciones
                    </h1>
                    <p className="text-gray-300 tracking-widest uppercase text-sm">Encuentra tu espacio perfecto</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg ${
                                filter === 'all' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Todas ({rooms.length})
                        </button>
                        <button
                            onClick={() => setFilter('available')}
                            className={`px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg ${
                                filter === 'available' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Disponibles ({rooms.filter(r => r.available).length})
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Ordenar por:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 bg-white transition-all"
                        >
                            <option value="price-asc">Precio: Menor a Mayor</option>
                            <option value="price-desc">Precio: Mayor a Menor</option>
                            <option value="capacity">Capacidad</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredRooms.map((room, index) => {
                        const currentImageIndex = selectedImageIndex[room.id] || 0
                        const roomImages = room.images || [room.image]
                        
                        return (
                        <div key={room.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col animate-fadeInUp hover:-translate-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={roomImages[currentImageIndex]}
                                    alt={`${room.name} - Imagen ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                {/* Navegación de imágenes */}
                                {roomImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImageIndex({
                                                ...selectedImageIndex,
                                                [room.id]: currentImageIndex === 0 ? roomImages.length - 1 : currentImageIndex - 1
                                            })}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all z-10"
                                            aria-label="Imagen anterior"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedImageIndex({
                                                ...selectedImageIndex,
                                                [room.id]: (currentImageIndex + 1) % roomImages.length
                                            })}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all z-10"
                                            aria-label="Siguiente imagen"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                        
                                        {/* Indicadores de imagen */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                            {roomImages.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedImageIndex({
                                                        ...selectedImageIndex,
                                                        [room.id]: idx
                                                    })}
                                                    className={`w-2 h-2 rounded-full transition-all ${
                                                        idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                                                    }`}
                                                    aria-label={`Ver imagen ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Badges */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    {!room.available && (
                                        <div className="bg-gray-900 text-white px-3 py-1 text-xs font-semibold rounded-full animate-fadeInDown">
                                            NO DISPONIBLE
                                        </div>
                                    )}
                                    {room.originalPrice && (
                                        <div className="bg-red-600 text-white px-3 py-1 text-xs font-semibold rounded-full animate-fadeInDown">
                                            {Math.round((1 - room.price / room.originalPrice) * 100)}% OFF
                                        </div>
                                    )}
                                </div>
                                
                                {/* Botones de acción */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <button
                                        onClick={() => toggleFavorite(room.id)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            isFavorite(room.id)
                                                ? 'bg-red-600 text-white scale-110'
                                                : 'bg-white/90 text-gray-700 hover:bg-red-600 hover:text-white'
                                        }`}
                                        aria-label="Agregar a favoritos"
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite(room.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                                
                                <div className="absolute bottom-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                                    {room.originalPrice && (
                                        <p className="text-xs line-through opacity-75">S/. {room.originalPrice}</p>
                                    )}
                                    <p className="text-xs font-medium">Desde</p>
                                    <p className="text-2xl font-bold">S/. {room.price}</p>
                                    <p className="text-xs">por noche</p>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">{room.name}</h3>
                                        {room.rating && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-4 h-4 ${i < Math.floor(room.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{room.rating}</span>
                                                <span className="text-sm text-gray-500">({room.reviews} reseñas)</span>
                                            </div>
                                        )}
                                    </div>
                                    <ShareButtons 
                                        title={room.name}
                                        description={room.description}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        <Users className="w-4 h-4 text-red-600" />
                                        <span>{room.capacity} personas</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        <Maximize className="w-4 h-4 text-red-600" />
                                        <span>{room.size}m²</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        <Bed className="w-4 h-4 text-red-600" />
                                        <span>{room.beds}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        <Eye className="w-4 h-4 text-red-600" />
                                        <span>{room.view}</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                                    {room.description}
                                </p>

                                <button
                                    onClick={() => setShowDetailsModal(room)}
                                    className="flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold mb-4 transition-colors hover:gap-3"
                                >
                                    <Info className="w-4 h-4" />
                                    Vista rápida
                                </button>

                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        Amenidades principales
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {room.amenities.slice(0, 6).map((amenity) => (
                                            <span
                                                key={amenity}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                            >
                                                {amenity}
                                            </span>
                                        ))}
                                        {room.amenities.length > 6 && (
                                            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full font-semibold">
                                                +{room.amenities.length - 6} más
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                                    <Building2 className="w-4 h-4" />
                                    <span>{room.floor}</span>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        href={`/hoteles/${room.slug}`}
                                        className="flex-1 px-6 py-3 border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold text-sm uppercase tracking-wider transition-all duration-300 rounded-lg text-center"
                                    >
                                        Ver Detalles
                                    </Link>
                                    <button
                                        onClick={() => handleReservar(room)}
                                        disabled={!room.available}
                                        className={`flex-1 px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all duration-300 rounded-lg ${
                                            room.available
                                                ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg transform hover:-translate-y-1'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {room.available ? 'Reservar' : 'No disponible'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        )
                    })}
                </div>
            </section>

            {/* Modal de Detalles Completos */}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">{showDetailsModal.name}</h2>
                                {showDetailsModal.rating && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-5 h-5 ${i < Math.floor(showDetailsModal.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">{showDetailsModal.rating}</span>
                                        <span className="text-sm text-gray-500">({showDetailsModal.reviews} reseñas)</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(null)}
                                className="text-gray-400 hover:text-gray-600 text-3xl transition-all duration-300 hover:rotate-90"
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Galería de imágenes */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {(showDetailsModal.images || [showDetailsModal.image]).map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`${showDetailsModal.name} - Vista ${idx + 1}`}
                                        className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    />
                                ))}
                            </div>

                            {/* Información detallada */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <Users className="w-5 h-5 text-red-600" />
                                                <span>Capacidad: {showDetailsModal.capacity} personas</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <Maximize className="w-5 h-5 text-red-600" />
                                                <span>Tamaño: {showDetailsModal.size}m²</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <Bed className="w-5 h-5 text-red-600" />
                                                <span>{showDetailsModal.beds}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <Eye className="w-5 h-5 text-red-600" />
                                                <span>{showDetailsModal.view}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <Building2 className="w-5 h-5 text-red-600" />
                                                <span>{showDetailsModal.floor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Precio</h3>
                                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg">
                                            {showDetailsModal.originalPrice && (
                                                <p className="text-sm line-through opacity-75">S/. {showDetailsModal.originalPrice}</p>
                                            )}
                                            <p className="text-3xl font-bold">S/. {showDetailsModal.price}</p>
                                            <p className="text-sm">por noche</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {showDetailsModal.description}
                                    </p>
                                </div>
                            </div>

                            {/* Amenidades completas */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenidades</h3>
                                <div className="grid md:grid-cols-3 gap-3">
                                    {showDetailsModal.amenities.map((amenity) => (
                                        <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Servicios */}
                            {showDetailsModal.services && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Servicios Incluidos</h3>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {showDetailsModal.services.map((service) => (
                                            <div key={service} className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span>{service}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowDetailsModal(null)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                                >
                                    Cerrar
                                </button>
                                <Link
                                    href={`/hoteles/${showDetailsModal.slug}`}
                                    className="flex-1 px-6 py-3 border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-all duration-300 text-center"
                                >
                                    Ver Página Completa
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(null)
                                        handleReservar(showDetailsModal)
                                    }}
                                    disabled={!showDetailsModal.available}
                                    className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
                                        showDetailsModal.available
                                            ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg transform hover:-translate-y-1'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {showDetailsModal.available ? 'Reservar' : 'No Disponible'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Reserva Mejorado */}
            {showModal && reservaModal.room && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                        {/* Header del Modal */}
                        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Reserva tu Habitación</h2>
                                    <p className="text-red-100">{reservaModal.room.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Contenido del Modal */}
                        <div className="p-6 space-y-6">
                            {/* Imagen de la habitación */}
                            <div className="relative h-48 rounded-xl overflow-hidden">
                                <img
                                    src={reservaModal.room.image}
                                    alt={reservaModal.room.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center justify-between text-white">
                                        <div>
                                            <p className="text-sm opacity-90">Precio por noche</p>
                                            <p className="text-3xl font-bold">S/. {reservaModal.room.price}</p>
                                        </div>
                                        {reservaModal.room.originalPrice && (
                                            <div className="bg-green-500 px-3 py-1 rounded-full text-sm font-semibold">
                                                -{Math.round((1 - reservaModal.room.price / reservaModal.room.originalPrice) * 100)}% OFF
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Información de la habitación */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                    <p className="text-xs text-gray-600 mb-1">Capacidad</p>
                                    <p className="font-bold text-gray-900">{reservaModal.room.capacity} personas</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl text-center">
                                    <Maximize className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                    <p className="text-xs text-gray-600 mb-1">Tamaño</p>
                                    <p className="font-bold text-gray-900">{reservaModal.room.size}m²</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl text-center">
                                    <Bed className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                    <p className="text-xs text-gray-600 mb-1">Cama</p>
                                    <p className="font-bold text-gray-900">{reservaModal.room.beds.split(' ')[2]}</p>
                                </div>
                            </div>

                            {/* Formulario de fechas */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Fecha de entrada
                                    </label>
                                    <input
                                        type="date"
                                        value={reservaModal.checkIn}
                                        onChange={(e) => setReservaModal({ ...reservaModal, checkIn: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all text-gray-900"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Fecha de salida
                                    </label>
                                    <input
                                        type="date"
                                        value={reservaModal.checkOut}
                                        onChange={(e) => setReservaModal({ ...reservaModal, checkOut: e.target.value })}
                                        min={reservaModal.checkIn || new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all text-gray-900"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Users className="w-4 h-4 inline mr-2" />
                                        Número de huéspedes
                                    </label>
                                    <input
                                        type="number"
                                        value={reservaModal.guests}
                                        onChange={(e) => setReservaModal({ ...reservaModal, guests: parseInt(e.target.value) })}
                                        min={1}
                                        max={reservaModal.room.capacity}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all text-gray-900"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Capacidad máxima: {reservaModal.room.capacity} personas</p>
                                </div>
                            </div>

                            {/* Resumen de la reserva */}
                            {reservaModal.checkIn && reservaModal.checkOut && calcularNoches() > 0 && (
                                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
                                    <h3 className="font-bold text-gray-900 mb-4 text-xl flex items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-purple-600" />
                                        Resumen de tu reserva
                                    </h3>
                                    <div className="space-y-4">
                                        {/* Desglose de noches */}
                                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-700 font-medium">Precio por noche</span>
                                                <span className="text-lg font-bold text-gray-900">S/. {reservaModal.room.price.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700 font-medium">Número de noches</span>
                                                <span className="text-lg font-bold text-blue-600">× {calcularNoches()}</span>
                                            </div>
                                        </div>

                                        {/* Fechas */}
                                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Check-in</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {new Date(reservaModal.checkIn).toLocaleDateString('es-PE', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Check-out</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {new Date(reservaModal.checkOut).toLocaleDateString('es-PE', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Huéspedes */}
                                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700 font-medium">Huéspedes</span>
                                                <span className="font-semibold text-gray-900">
                                                    {reservaModal.guests} {reservaModal.guests === 1 ? 'persona' : 'personas'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700 font-medium">Subtotal</span>
                                                <span className="text-xl font-bold text-gray-900">
                                                    S/. {(reservaModal.room.price * calcularNoches()).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 rounded-xl shadow-lg">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-red-100 text-sm mb-1">Total a pagar</p>
                                                    <p className="text-4xl font-bold text-white">S/. {calcularTotal().toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-red-100 text-xs">Incluye todos los cargos</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Adelanto */}
                                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <CreditCard className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-yellow-900 mb-1">Adelanto requerido (30%)</p>
                                                    <p className="text-2xl font-bold text-yellow-700">
                                                        S/. {(calcularTotal() * 0.3).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-yellow-800 mt-2">
                                                        El saldo restante de S/. {(calcularTotal() * 0.7).toLocaleString()} se paga al momento del check-in
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Beneficios */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-200 shadow-md">
                                <h4 className="font-bold text-green-900 mb-4 text-lg flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    Incluido en tu reserva
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-xl">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-900">Cancelación gratuita</p>
                                            <p className="text-xs text-green-700">Hasta 48 horas antes del check-in</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-xl">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-900">Confirmación inmediata</p>
                                            <p className="text-xs text-green-700">Recibirás tu código de reserva al instante</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-xl">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-900">Sin cargos ocultos</p>
                                            <p className="text-xs text-green-700">El precio que ves es el precio final</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-xl">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-900">Mejor precio garantizado</p>
                                            <p className="text-xs text-green-700">Encuentra un precio mejor y te lo igualamos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmarReserva}
                                    disabled={isSubmitting || !reservaModal.checkIn || !reservaModal.checkOut}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Procesando reserva...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Check className="w-5 h-5" />
                                            Confirmar Reserva
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Nota de seguridad */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                <p className="text-sm text-blue-800">
                                    🔒 <span className="font-semibold">Reserva segura</span> - Tus datos están protegidos con encriptación SSL
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
