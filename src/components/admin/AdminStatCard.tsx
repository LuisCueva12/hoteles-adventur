import type { LucideIcon } from 'lucide-react'
import { cn } from './cn'

const toneClasses = {
  blue: 'bg-blue-600',
  green: 'bg-emerald-500',
  purple: 'bg-violet-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
} as const

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  tone = 'blue',
  helper,
}: {
  title: string
  value: string | number
  icon: LucideIcon
  tone?: keyof typeof toneClasses
  helper?: string
}) {
  return (
    <article className="admin-stat-card flex items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-slate-950">{value}</p>
          {helper ? <p className="text-sm text-slate-500">{helper}</p> : null}
        </div>
      </div>
      <div className={cn('admin-stat-icon', toneClasses[tone])}>
        <Icon className="h-6 w-6" />
      </div>
    </article>
  )
}
