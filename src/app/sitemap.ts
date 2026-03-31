import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://adventurhotels.com'
    
    // Páginas estáticas
    const staticPages = [
        '',
        '/nosotros',
        '/hoteles',
        '/servicios',
        '/galeria',
        '/contacto',
        '/privacidad',
        '/terminos',
        '/login'
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8
    }))

    // Páginas dinámicas de hoteles
    try {
        const supabase = createClient()
        const { data: alojamientos } = await supabase
            .from('alojamientos')
            .select('id, updated_at')
            .eq('activo', true)

        const hotelPages = (alojamientos || []).map(aloj => ({
            url: `${baseUrl}/hoteles/${aloj.id}`,
            lastModified: new Date(aloj.updated_at || Date.now()),
            changeFrequency: 'daily' as const,
            priority: 0.7
        }))

        return [...staticPages, ...hotelPages]
    } catch (error) {
        console.error('Error generating sitemap:', error)
        return staticPages
    }
}
