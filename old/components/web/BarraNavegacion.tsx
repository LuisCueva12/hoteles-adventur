'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'

const NAV_LINKS = [
    { label: 'Inicio', href: '/' },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Habitaciones', href: '/hoteles' },
    { label: 'Servicios', href: '/servicios' },
    { label: 'Galeria', href: '/galeria' },
    { label: 'Contacto', href: '/contacto' },
]

export function Navbar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md backdrop-blur-sm bg-white/95">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link href="/" className="transition-transform duration-300 hover:scale-105">
                    <Logo className="h-12" />
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-2 text-sm font-medium transition-colors ${
                                isActive(link.href)
                                    ? 'text-yellow-600 border-b-2 border-yellow-500'
                                    : 'text-gray-700 hover:text-yellow-600'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/hoteles"
                        className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Reservar ahora
                    </Link>
                </div>

                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                    aria-label="Menu de navegacion"
                    aria-expanded={open}
                >
                    <span className={`block w-6 h-0.5 bg-current mb-1.5 transition-transform duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-current mb-1.5 transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-current transition-transform duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {open && (
                <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3 animate-slideInUp">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`py-3 px-2 text-sm min-h-[44px] flex items-center ${
                                isActive(link.href) ? 'text-yellow-500 font-semibold' : 'text-gray-700 hover:text-yellow-500'
                            }`}
                            onClick={() => setOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/hoteles"
                        className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold rounded-lg text-center transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        Reservar ahora
                    </Link>
                </div>
            )}
        </header>
    )
}
