import { Metadata } from 'next'

interface SEOProps {
    title: string
    description: string
    keywords?: string[]
    image?: string
    url?: string
    type?: 'website' | 'article'
    publishedTime?: string
    modifiedTime?: string
    author?: string
    noIndex?: boolean
}

const SITE_NAME = 'Adventur Hotels'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://adventurhotels.com'
const DEFAULT_IMAGE = `${SITE_URL}/logo-adventur.png`

export function generarSEO({
    title,
    description,
    keywords = [],
    image = DEFAULT_IMAGE,
    url = SITE_URL,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    noIndex = false
}: SEOProps): Metadata {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`

    return {
        title: fullTitle,
        description,
        keywords: keywords.join(', '),
        authors: author ? [{ name: author }] : undefined,
        robots: noIndex ? 'noindex,nofollow' : 'index,follow',
        openGraph: {
            title: fullTitle,
            description,
            url: fullUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title
                }
            ],
            locale: 'es_PE',
            type,
            publishedTime,
            modifiedTime
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [image],
            creator: '@adventurhotels'
        },
        alternates: {
            canonical: fullUrl,
            languages: {
                'es-PE': fullUrl,
                'en-US': fullUrl.replace('/es/', '/en/')
            }
        },
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
            yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
        }
    }
}

// Structured Data (JSON-LD)
export function generarEsquemaHotel(hotel: {
    name: string
    description: string
    image: string
    address: string
    city: string
    country: string
    postalCode: string
    phone: string
    email: string
    rating?: number
    reviewCount?: number
    priceRange?: string
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: hotel.name,
        description: hotel.description,
        image: hotel.image,
        address: {
            '@type': 'PostalAddress',
            streetAddress: hotel.address,
            addressLocality: hotel.city,
            addressCountry: hotel.country,
            postalCode: hotel.postalCode
        },
        telephone: hotel.phone,
        email: hotel.email,
        aggregateRating: hotel.rating ? {
            '@type': 'AggregateRating',
            ratingValue: hotel.rating,
            reviewCount: hotel.reviewCount || 0
        } : undefined,
        priceRange: hotel.priceRange || '$$'
    }
}

export function generarEsquemaHabitacion(room: {
    name: string
    description: string
    image: string
    price: number
    currency?: string
    capacity: number
    amenities: string[]
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'HotelRoom',
        name: room.name,
        description: room.description,
        image: room.image,
        occupancy: {
            '@type': 'QuantitativeValue',
            maxValue: room.capacity
        },
        amenityFeature: room.amenities.map(amenity => ({
            '@type': 'LocationFeatureSpecification',
            name: amenity
        })),
        offers: {
            '@type': 'Offer',
            price: room.price,
            priceCurrency: room.currency || 'PEN',
            availability: 'https://schema.org/InStock'
        }
    }
}

export function generarEsquemaMigasPan(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.url}`
        }))
    }
}

export function generarEsquemaResena(review: {
    author: string
    rating: number
    reviewBody: string
    datePublished: string
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        author: {
            '@type': 'Person',
            name: review.author
        },
        reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5
        },
        reviewBody: review.reviewBody,
        datePublished: review.datePublished
    }
}
