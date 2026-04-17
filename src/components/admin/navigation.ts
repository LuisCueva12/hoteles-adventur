import {
  BarChart3,
  BedDouble,
  Camera,
  Gauge,
  MessageSquareText,
  Settings,
  Users,
  CalendarDays,
} from 'lucide-react'

export const adminNavigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/admin/hoteles', label: 'Habitaciones', icon: BedDouble },
  { href: '/admin/galeria', label: 'Galería', icon: Camera },
  { href: '/admin/reservas', label: 'Reservas', icon: CalendarDays },
  { href: '/admin/resenas', label: 'Reseñas', icon: MessageSquareText },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
] as const

export function getAdminSection(pathname: string) {
  return (
    adminNavigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    adminNavigation[0]
  )
}
