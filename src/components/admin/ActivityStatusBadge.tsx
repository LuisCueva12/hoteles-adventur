interface ActivityStatusBadgeProps {
  status: string
}

export function ActivityStatusBadge({ status }: ActivityStatusBadgeProps) {
  const getStatusColorClasses = (status: string): string => {
    const colorMap = {
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      info: 'bg-blue-100 text-blue-700'
    }
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-700'
  }

  const formatActivityStatus = (status: string): string => {
    const statusMap = {
      success: 'Completado',
      warning: 'Pendiente',
      info: 'Info'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColorClasses(status)}`}>
      {formatActivityStatus(status)}
    </span>
  )
}
