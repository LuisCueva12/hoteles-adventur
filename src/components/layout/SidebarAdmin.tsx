// ============================================================
// components/layout/SidebarAdmin.tsx
// Sidebar del panel de administración
// ============================================================
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = [
  { href: '/admin/dashboard', etiqueta: '📊 Dashboard' },
  { href: '/admin/hoteles', etiqueta: '🏨 Hoteles' },
  { href: '/admin/habitaciones', etiqueta: '🛏 Habitaciones' },
  { href: '/admin/reservas', etiqueta: '📋 Reservas' },
  { href: '/admin/usuarios', etiqueta: '👥 Usuarios' },
];

export function SidebarAdmin() {
  const ruta = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white min-h-screen">
      <div className="p-6 border-b border-gray-100">
        <span className="text-base font-bold text-green-700">Admin Panel</span>
      </div>
      <nav className="p-4 space-y-1">
        {MENU.map((item) => {
          const activo = ruta === item.href || ruta.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                activo
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')}
            >
              {item.etiqueta}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
