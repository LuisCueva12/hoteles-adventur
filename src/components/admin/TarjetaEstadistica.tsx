import { LucideIcon } from 'lucide-react'
import { ReactNode, isValidElement } from 'react'

interface StatCardProps {
    title: string
    value: string | number
    icon: string | ReactNode | LucideIcon
    trend?: {
        value: string
        isPositive: boolean
    }
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-yellow-100 text-yellow-400',
    red: 'bg-yellow-100 text-yellow-400',
    yellow: 'bg-yellow-100 text-yellow-400',
    purple: 'bg-purple-100 text-purple-600',
}

export function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
    const Icon = typeof icon === 'string' || isValidElement(icon) ? null : (icon as LucideIcon)
    const iconContent: ReactNode = Icon ? <Icon size={28} /> : (typeof icon === 'string' || isValidElement(icon) ? icon : null)

    return (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:scale-105 duration-200 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl ${colorClasses[color]} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                        {iconContent}
                    </div>
                    {trend && (
                        <div className="flex flex-col items-end gap-1">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 border ${trend.isPositive ? 'bg-yellow-100 text-yellow-400 border-yellow-200' : 'bg-yellow-100 text-yellow-400 border-yellow-200'}`}>
                                {trend.isPositive ? '↑' : '↓'} {trend.value}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">vs mes anterior</span>
                        </div>
                    )}
                </div>
                <h3 className="text-gray-600 text-sm mb-2 font-medium">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 transition-all">
                    {value}
                </p>
            </div>
        </div>
    )
}
