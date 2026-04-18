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
    <aside className="w-64 shrink-0 border-r border-secondary bg-secondary min-h-screen text-white">
      <div className="p-6 border-b border-white/10">
        <span className="text-lg font-bold text-primary">Admin Panel</span>
      </div>
      <nav className="p-4 space-y-2">
        {MENU.map((item) => {
          const activo = ruta === item.href || ruta.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                activo
                  ? 'bg-primary text-secondary font-bold'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white',
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
