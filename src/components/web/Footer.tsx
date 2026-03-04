'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Music, MessageCircle } from 'lucide-react'
import { Logo } from './Logo'

const FOOTER_LINKS = {
    Informacion: [
        { label: 'Sobre nosotros', href: '/nosotros' },
        { label: 'Politica de privacidad', href: '/privacidad' },
        { label: 'Terminos y condiciones', href: '/terminos' },
        { label: 'Preguntas frecuentes', href: '/contacto' }
    ],
    'Mi cuenta': [
        { label: 'Iniciar sesión', href: '/login' },
        { label: 'Mi perfil', href: '/perfil' },
        { label: 'Mis reservas', href: '/reservas' },
        { label: 'Mis pagos', href: '/pagos' }
    ],
}

export function Footer() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Newsletter suscripción:', email)
        setMessage('¡Gracias por suscribirte!')
        setEmail('')
        setTimeout(() => setMessage(''), 3000)
    }

    return (
        <footer className="bg-gray-950 text-gray-400">
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div>
                    <div className="mb-4">
                        <Logo className="h-10" variant="footer" />
                    </div>
                    <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-widest">Direccion</h4>
                    <p className="text-sm leading-relaxed">Jr. Amalia Puga 635</p>
                    <p className="text-sm mt-1">Cajamarca, Perú</p>
                    <p className="text-sm mt-3">+51 976 123 456</p>
                    <p className="text-sm mt-1">+51 976 654 321</p>
                    <p className="text-sm mt-3">info@adventurhotels.com</p>
                    <p className="text-sm">reservas@adventurhotels.com</p>
                </div>

                {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                    <div key={title}>
                        <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-widest">{title}</h4>
                        <ul className="space-y-2">
                            {links.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-widest">Newsletter</h4>
                    <p className="text-sm mb-4">Suscribete para recibir las ultimas noticias y ofertas.</p>
                    <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Tu email"
                            className="flex-1 px-3 py-2 text-sm bg-gray-800 text-white border border-gray-700 rounded-l outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all"
                            required
                            aria-label="Email para newsletter"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-r transition-all duration-300 hover:shadow-lg"
                            aria-label="Suscribirse al newsletter"
                        >
                            OK
                        </button>
                    </form>
                    {message && (
                        <p className="text-sm text-green-400 mt-2 animate-fadeIn">{message}</p>
                    )}
                    <div className="flex gap-3">
                        <a
                            href="https://facebook.com/adventurhotels"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-all duration-300 text-white transform hover:scale-110"
                            title="Facebook"
                            aria-label="Síguenos en Facebook"
                        >
                            <Facebook className="w-4 h-4" />
                        </a>
                        <a
                            href="https://instagram.com/adventurhotels"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-all duration-300 text-white transform hover:scale-110"
                            title="Instagram"
                            aria-label="Síguenos en Instagram"
                        >
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a
                            href="https://tiktok.com/@adventurhotels"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-all duration-300 text-white transform hover:scale-110"
                            title="TikTok"
                            aria-label="Síguenos en TikTok"
                        >
                            <Music className="w-4 h-4" />
                        </a>
                        <a
                            href="https://wa.me/51976123456"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-all duration-300 text-white transform hover:scale-110"
                            title="WhatsApp"
                            aria-label="Contáctanos por WhatsApp"
                        >
                            <MessageCircle className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
                &copy; 2026 Adventur Hotels. Todos los derechos reservados.
            </div>
        </footer>
    )
}
