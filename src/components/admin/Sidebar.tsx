'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Hotel, 
  BedDouble, 
  CalendarCheck, 
  Users, 
  Settings, 
  LayoutDashboard,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Hotel, label: 'Hoteles', href: '/admin/hoteles' },
  { icon: BedDouble, label: 'Habitaciones', href: '/admin/habitaciones' },
  { icon: CalendarCheck, label: 'Reservas', href: '/admin/reservas' },
  { icon: Users, label: 'Usuarios', href: '/admin/usuarios' },
  { icon: Settings, label: 'Configuración', href: '/admin/configuracion' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col bg-[#09090b] text-white lg:flex sticky top-0 h-screen shadow-2xl border-r border-white/5">
      <div className="flex h-20 items-center px-8 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter uppercase leading-none">Adventur</span>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase opacity-80">Management</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 p-6 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-zinc-500 group-hover:text-primary")} />
                {item.label}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-primary">AD</div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate">Administrador</span>
            <span className="text-[10px] text-zinc-500 truncate">Soporte Premium</span>
          </div>
        </div>

        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-400 transition-all hover:bg-red-500/10 active:scale-95">
          <LogOut className="h-4 w-4" />
          Desconectar
        </button>
      </div>
    </aside>
  );
}
