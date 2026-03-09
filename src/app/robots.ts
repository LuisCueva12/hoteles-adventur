import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://adventurhotels.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/perfil/',
                    '/reservas/',
                    '/pagos/',
                    '/acceso-denegado'
                ]
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/api/']
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl
    }
}
