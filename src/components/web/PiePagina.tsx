'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, MessageCircle, Twitter } from 'lucide-react'
import { useSiteConfig } from '@/components/providers/ProveedorConfiguracionSitio'
import { getFullAddress, getWhatsappPhone } from '@/lib/site-config'
import { Logo } from './Logo'

const FOOTER_LINKS = {
  Informacion: [
    { label: 'Sobre nosotros', href: '/nosotros' },
    { label: 'Politica de privacidad', href: '/privacidad' },
    { label: 'Terminos y condiciones', href: '/terminos' },
    { label: 'Preguntas frecuentes', href: '/contacto' },
  ],
  'Mi cuenta': [
    { label: 'Iniciar sesion', href: '/login' },
    { label: 'Mis pagos', href: '/pagos' },
  ],
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const { config } = useSiteConfig()

  const whatsappPhone = getWhatsappPhone(config)
  const address = getFullAddress(config)
  const currentYear = new Date().getFullYear()

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Gracias por suscribirte')
    setEmail('')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="mb-4">
            <Logo className="h-10" variant="footer" />
          </div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Contacto</h2>
          <p className="text-sm leading-relaxed">{config.direccion}</p>
          <p className="mt-1 text-sm">{config.ciudad}, {config.pais}</p>
          <p className="mt-3 text-sm">{config.telefono}</p>
          {config.telefono_secundario ? <p className="mt-1 text-sm">{config.telefono_secundario}</p> : null}
          <p className="mt-3 text-sm">{config.email}</p>
          {config.email_reservas ? <p className="text-sm">{config.email_reservas}</p> : null}
          {config.sitio_web ? (
            <a
              href={config.sitio_web}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-yellow-400 transition hover:text-yellow-300"
            >
              {config.sitio_web}
            </a>
          ) : null}
        </div>

        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">{title}</h2>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Newsletter</h2>
          <p className="mb-4 text-sm">Suscribete para recibir las ultimas noticias y ofertas.</p>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu email"
              className="flex-1 rounded-l border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50"
              required
              aria-label="Email para newsletter"
            />
            <button
              type="submit"
              className="rounded-r bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 transition-all duration-300 hover:bg-yellow-500 hover:shadow-lg"
              aria-label="Suscribirse al newsletter"
            >
              OK
            </button>
          </form>
          {message ? <p className="mt-2 text-sm text-green-400">{message}</p> : null}
          <div className="mt-4 flex items-center gap-3">
            {config.facebook ? (
              <a
                href={config.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-yellow-400 hover:text-gray-900"
                title="Facebook"
                aria-label="Siguenos en Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            ) : null}
            {config.instagram ? (
              <a
                href={config.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-yellow-400 hover:text-gray-900"
                title="Instagram"
                aria-label="Siguenos en Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}
            {config.twitter ? (
              <a
                href={config.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-yellow-400 hover:text-gray-900"
                title="X"
                aria-label="Siguenos en X"
              >
                <Twitter className="h-4 w-4" />
              </a>
            ) : null}
            <a
              href={`https://wa.me/${whatsappPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-yellow-400 hover:text-gray-900"
              title="WhatsApp"
              aria-label="Contactanos por WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
          {address ? <p className="mt-4 text-xs leading-6 text-gray-500">{address}</p> : null}
        </div>
      </div>

      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
        &copy; {currentYear} {config.nombre_hotel}. Todos los derechos reservados.
      </div>
    </footer>
  )
}
