import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    icon: string | LucideIcon
    trend?: {
        value: string
        isPositive: boolean
    }
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
    const Icon = typeof icon === 'string' ? null : icon

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all hover:scale-105 duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} border flex items-center justify-center text-2xl`}>
                    {Icon ? <Icon size={24} /> : icon}
                </div>
                {trend && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${trend.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    )
}
