'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const routeNames: Record<string, string> = {
    '': 'Inicio',
    'nosotros': 'Nosotros',
    'hoteles': 'Habitaciones',
    'servicios': 'Servicios',
    'galeria': 'Galería',
    'contacto': 'Contacto',
    'privacidad': 'Política de Privacidad',
    'terminos': 'Términos y Condiciones'
}

export function Breadcrumbs() {
    const pathname = usePathname()
    const paths = pathname.split('/').filter(Boolean)

    if (paths.length === 0) return null

    return (
        <nav className="bg-gray-50 border-b border-gray-200 py-3 animate-fadeInDown">
            <div className="max-w-7xl mx-auto px-6">
                <ol className="flex items-center gap-2 text-sm">
                    <li>
                        <Link 
                            href="/" 
                            className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            <span>Inicio</span>
                        </Link>
                    </li>
                    {paths.map((path, index) => {
                        const href = '/' + paths.slice(0, index + 1).join('/')
                        const isLast = index === paths.length - 1
                        const name = routeNames[path] || path

                        return (
                            <li key={path} className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                {isLast ? (
                                    <span className="text-gray-900 font-medium">{name}</span>
                                ) : (
                                    <Link 
                                        href={href}
                                        className="text-gray-600 hover:text-red-600 transition-colors"
                                    >
                                        {name}
                                    </Link>
                                )}
                            </li>
                        )
                    })}
                </ol>
            </div>
        </nav>
    )
}
