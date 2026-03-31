export type Locale = 'es' | 'en'

export const defaultLocale: Locale = 'es'

export const locales: Locale[] = ['es', 'en']

export const translations = {
    es: {
        common: {
            home: 'Inicio',
            about: 'Nosotros',
            rooms: 'Habitaciones',
            services: 'Servicios',
            gallery: 'Galería',
            contact: 'Contacto',
            login: 'Iniciar sesión',
            register: 'Registrarse',
            bookNow: 'Reservar ahora',
            learnMore: 'Conocer más',
            viewDetails: 'Ver detalles',
            close: 'Cerrar',
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            edit: 'Editar',
            search: 'Buscar',
            filter: 'Filtrar',
            sort: 'Ordenar',
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            warning: 'Advertencia',
            info: 'Información'
        },
        hero: {
            welcome: 'Bienvenido a',
            title: 'Adventur Hotels',
            subtitle: 'El lugar donde buscas escaparte',
            exploreNow: 'Explorar ahora',
            knowMore: 'Conocer más'
        },
        search: {
            email: 'Email',
            roomType: 'Tipo de habitación',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            guests: 'Huéspedes',
            searchAvailability: 'Buscar disponibilidad',
            allRooms: 'Todas',
            standard: 'Estándar',
            superior: 'Superior',
            deluxe: 'Suite Deluxe',
            premium: 'Suite Premium',
            executive: 'Suite Ejecutiva',
            presidential: 'Suite Presidencial'
        },
        rooms: {
            ourRooms: 'Nuestras Habitaciones',
            findYourSpace: 'Encuentra tu espacio perfecto',
            all: 'Todas',
            available: 'Disponibles',
            sortBy: 'Ordenar por',
            priceLowToHigh: 'Precio: Menor a Mayor',
            priceHighToLow: 'Precio: Mayor a Menor',
            capacity: 'Capacidad',
            perNight: 'por noche',
            guests: 'huéspedes',
            size: 'Tamaño',
            beds: 'Camas',
            view: 'Vista',
            floor: 'Piso',
            amenities: 'Amenidades',
            services: 'Servicios',
            bookRoom: 'Reservar habitación',
            notAvailable: 'No disponible',
            addToFavorites: 'Agregar a favoritos',
            removeFromFavorites: 'Quitar de favoritos',
            share: 'Compartir'
        },
        booking: {
            confirmBooking: 'Confirmar reserva',
            bookingSummary: 'Resumen de reserva',
            room: 'Habitación',
            nights: 'noches',
            total: 'Total',
            deposit: 'Adelanto requerido',
            bookingConfirmed: '¡Reserva confirmada!',
            bookingCode: 'Código de reserva',
            viewMyBookings: 'Ver mis reservas',
            incompleteData: 'Datos incompletos',
            invalidDates: 'Fechas inválidas',
            loginRequired: 'Debes iniciar sesión para realizar una reserva',
            bookingError: 'Hubo un problema al crear tu reserva'
        },
        footer: {
            address: 'Dirección',
            information: 'Información',
            myAccount: 'Mi cuenta',
            newsletter: 'Newsletter',
            newsletterText: 'Suscríbete para recibir las últimas noticias y ofertas',
            subscribe: 'Suscribirse',
            thankYou: '¡Gracias por suscribirte!',
            allRightsReserved: 'Todos los derechos reservados'
        },
        dates: {
            format: 'dd/MM/yyyy',
            locale: 'es-PE'
        },
        currency: {
            symbol: 'S/.',
            code: 'PEN',
            locale: 'es-PE'
        }
    },
    en: {
        common: {
            home: 'Home',
            about: 'About',
            rooms: 'Rooms',
            services: 'Services',
            gallery: 'Gallery',
            contact: 'Contact',
            login: 'Login',
            register: 'Register',
            bookNow: 'Book now',
            learnMore: 'Learn more',
            viewDetails: 'View details',
            close: 'Close',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search',
            filter: 'Filter',
            sort: 'Sort',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            warning: 'Warning',
            info: 'Information'
        },
        hero: {
            welcome: 'Welcome to',
            title: 'Adventur Hotels',
            subtitle: 'The place where you seek to escape',
            exploreNow: 'Explore now',
            knowMore: 'Know more'
        },
        search: {
            email: 'Email',
            roomType: 'Room type',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            guests: 'Guests',
            searchAvailability: 'Search availability',
            allRooms: 'All',
            standard: 'Standard',
            superior: 'Superior',
            deluxe: 'Deluxe Suite',
            premium: 'Premium Suite',
            executive: 'Executive Suite',
            presidential: 'Presidential Suite'
        },
        rooms: {
            ourRooms: 'Our Rooms',
            findYourSpace: 'Find your perfect space',
            all: 'All',
            available: 'Available',
            sortBy: 'Sort by',
            priceLowToHigh: 'Price: Low to High',
            priceHighToLow: 'Price: High to Low',
            capacity: 'Capacity',
            perNight: 'per night',
            guests: 'guests',
            size: 'Size',
            beds: 'Beds',
            view: 'View',
            floor: 'Floor',
            amenities: 'Amenities',
            services: 'Services',
            bookRoom: 'Book room',
            notAvailable: 'Not available',
            addToFavorites: 'Add to favorites',
            removeFromFavorites: 'Remove from favorites',
            share: 'Share'
        },
        booking: {
            confirmBooking: 'Confirm booking',
            bookingSummary: 'Booking summary',
            room: 'Room',
            nights: 'nights',
            total: 'Total',
            deposit: 'Deposit required',
            bookingConfirmed: 'Booking confirmed!',
            bookingCode: 'Booking code',
            viewMyBookings: 'View my bookings',
            incompleteData: 'Incomplete data',
            invalidDates: 'Invalid dates',
            loginRequired: 'You must login to make a booking',
            bookingError: 'There was a problem creating your booking'
        },
        footer: {
            address: 'Address',
            information: 'Information',
            myAccount: 'My account',
            newsletter: 'Newsletter',
            newsletterText: 'Subscribe to receive the latest news and offers',
            subscribe: 'Subscribe',
            thankYou: 'Thank you for subscribing!',
            allRightsReserved: 'All rights reserved'
        },
        dates: {
            format: 'MM/dd/yyyy',
            locale: 'en-US'
        },
        currency: {
            symbol: 'S/.',
            code: 'PEN',
            locale: 'en-US'
        }
    }
}

export function getTranslation(locale: Locale = defaultLocale) {
    return translations[locale] || translations[defaultLocale]
}

export function formatCurrency(amount: number, locale: Locale = defaultLocale): string {
    const t = getTranslation(locale)
    return new Intl.NumberFormat(t.currency.locale, {
        style: 'currency',
        currency: t.currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

export function formatDate(date: Date | string, locale: Locale = defaultLocale): string {
    const t = getTranslation(locale)
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(t.dates.locale).format(dateObj)
}
