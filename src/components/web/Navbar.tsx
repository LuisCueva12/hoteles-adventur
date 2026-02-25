'use client'

import { useState } from 'react'
import Link from 'next/link'

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

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">H</span>
                    <span className="text-gray-900 font-bold text-lg tracking-wide">otel Adventur</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.href} href={link.href}
                            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        Iniciar sesion
                    </Link>
                    <Link href="/hoteles"
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors">
                        Reservar ahora
                    </Link>
                </div>

                <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-600">
                    <span className="block w-6 h-0.5 bg-current mb-1.5" />
                    <span className="block w-6 h-0.5 bg-current mb-1.5" />
                    <span className="block w-6 h-0.5 bg-current" />
                </button>
            </div>

            {open && (
                <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} className="text-sm text-gray-700 hover:text-red-600">
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/login" className="text-sm text-gray-600">Iniciar sesion</Link>
                    <Link href="/hoteles" className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded text-center">
                        Reservar ahora
                    </Link>
                </div>
            )}
        </header>
    )
}
