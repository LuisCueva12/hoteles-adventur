'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, MessageCircle, Twitter } from 'lucide-react';
import { Logo } from './Logo';

const FOOTER_LINKS = {
  Información: [
    { label: 'Sobre nosotros', href: '/nosotros' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Términos y condiciones', href: '/terminos' },
    { label: 'Preguntas frecuentes', href: '/faq' },
  ],
  Cuenta: [
    { label: 'Iniciar sesión', href: '/login' },
    { label: 'Mis Reservas', href: '/perfil' },
  ],
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('¡Suscrito con éxito!');
    setEmail('');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <footer className="w-full bg-secondary text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-20 text-center md:text-left">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          
          <div className="flex flex-col items-center md:items-start space-y-6">
            <Logo className="h-12" variant="footer" />
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Contacto</h3>
              <div className="space-y-2 text-sm">
                <p>Av. Principal #123</p>
                <p>Bogotá, Colombia</p>
                <p className="pt-2 text-primary font-bold">+57 300 123 4567</p>
                <p>contacto@adventurhotels.com</p>
              </div>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col items-center md:items-start space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Newsletter</h3>
            <p className="text-sm">Suscríbete para recibir noticias y ofertas exclusivas.</p>
            <form onSubmit={handleSubscribe} className="flex w-full overflow-hidden rounded-xl bg-white/5 p-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo"
                className="flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-secondary transition-all hover:bg-primary-hover"
              >
                OK
              </button>
            </form>
            {status && <p className="text-xs text-primary font-medium">{status}</p>}

            <div className="flex items-center gap-4 pt-4">
              {[Facebook, Instagram, Twitter, MessageCircle].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all hover:bg-primary hover:text-secondary hover:scale-110"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-20 border-t border-white/5 pt-8 text-center text-xs tracking-wider">
          &copy; {currentYear} Adventur Hotels. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
