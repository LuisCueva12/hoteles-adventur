'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const LABELS: Record<string, string> = {
    hoteles: 'Hoteles',
    servicios: 'Servicios',
    galeria: 'Galería',
    nosotros: 'Nosotros',
    contacto: 'Contacto',
    reservas: 'Mis Reservas',
    pagos: 'Mis Pagos',
    perfil: 'Mi Perfil',
    privacidad: 'Privacidad',
    terminos: 'Términos',
    login: 'Iniciar Sesión',
    admin: 'Administración',
    usuarios: 'Usuarios',
    reportes: 'Reportes',
    configuracion: 'Configuración',
}

export function MigasPan() {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean)

    const breadcrumbs = [
        { label: 'Inicio', href: '/' },
        ...pathSegments.map((segment, index) => {
            const href = '/' + pathSegments.slice(0, index + 1).join('/')
            // Si es UUID, mostrar "Detalle"
            const label = UUID_REGEX.test(segment)
                ? 'Detalle'
                : LABELS[segment.toLowerCase()] ?? (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '))
            return { label, href }
        })
    ]

    if (pathname === '/') return null

    return (
        <nav aria-label="Breadcrumb" className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-3">
                <ol className="flex items-center gap-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <li key={crumb.href} className="flex items-center gap-2">
                            {index > 0 && (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            {index === breadcrumbs.length - 1 ? (
                                <span className="text-gray-900 font-semibold flex items-center gap-1">
                                    {index === 0 && <Home className="w-4 h-4" />}
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link
                                    href={crumb.href}
                                    className="text-gray-600 hover:text-yellow-400 transition-colors flex items-center gap-1"
                                >
                                    {index === 0 && <Home className="w-4 h-4" />}
                                    {crumb.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    )
}
