'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Habitaciones', href: '/hoteles' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Galería', href: '/galeria' },
  { label: 'Contacto', href: '/contacto' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="transition-transform duration-300 hover:scale-105">
          <Logo className="h-10" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-semibold transition-colors rounded-lg ${
                isActive(link.href)
                  ? 'text-primary bg-secondary'
                  : 'text-secondary hover:text-primary hover:bg-secondary/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action */}
        <div className="hidden md:flex items-center justify-end">
          <Link
            href="/hoteles"
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:scale-105"
          >
            Reservar ahora
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-secondary focus:outline-none"
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-5">
            <span className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'top-2 rotate-45' : 'top-0'}`} />
            <span className={`absolute block w-6 h-0.5 bg-current top-2 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'top-2 -rotate-45' : 'top-4'}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-2 animate-in slide-in-from-top duration-300">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? 'bg-secondary text-primary'
                  : 'text-secondary hover:bg-secondary/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/hoteles"
            onClick={() => setIsOpen(false)}
            className="mt-2 rounded-xl bg-primary py-3 text-center text-sm font-bold text-secondary"
          >
            Reservar ahora
          </Link>
        </div>
      )}
    </header>
  );
}
