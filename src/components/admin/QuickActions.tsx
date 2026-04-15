import Link from 'next/link'
import { Calendar, Users, Hotel } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      href: '/admin/reservas',
      icon: Calendar,
      label: 'Gestionar Reservas'
    },
    {
      href: '/admin/usuarios',
      icon: Users,
      label: 'Gestionar Usuarios'
    },
    {
      href: '/admin/hoteles',
      icon: Hotel,
      label: 'Gestionar Hoteles'
    }
  ]

  return (
    <div className="space-y-3">
      {actions.map((action, index) => (
        <Link
          key={index}
          href={action.href}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <action.icon className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">{action.label}</span>
        </Link>
      ))}
    </div>
  )
}
