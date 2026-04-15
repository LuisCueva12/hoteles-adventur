import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface QuickStatsProps {
  checkinsHoy: number
  checkoutsHoy: number
  pendientes: number
  ocupacionActual: number
}

export function QuickStats({ checkinsHoy, checkoutsHoy, pendientes, ocupacionActual }: QuickStatsProps) {
  const statsItems = [
    {
      icon: Clock,
      color: 'blue',
      title: 'Check-ins Hoy',
      value: checkinsHoy
    },
    {
      icon: CheckCircle,
      color: 'green',
      title: 'Check-outs Hoy',
      value: checkoutsHoy
    },
    {
      icon: AlertCircle,
      color: 'yellow',
      title: 'Pendientes',
      value: pendientes
    },
    {
      icon: TrendingUp,
      color: 'purple',
      title: 'Ocupación Actual',
      value: `${ocupacionActual}%`
    }
  ]

  return (
    <div className="space-y-4">
      {statsItems.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 text-${item.color}-600`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{item.title}</p>
              <p className="text-lg font-semibold">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
