// ============================================================
// components/layout/Navbar.tsx
// Barra de navegación pública
// ============================================================

import Link from 'next/link';

export function Navbar() {
  return (
    <header className="border-b border-gray-100 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-green-700">
          Hoteles Adventur
        </Link>
        <ul className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <li>
            <Link href="/hoteles" className="hover:text-green-700 transition-colors">
              Hoteles
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
            >
              Admin
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
