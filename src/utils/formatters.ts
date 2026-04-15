export const formatActivityType = (type: string): string => 
  type === 'reserva' ? 'Reserva' : 'Pago'

export const formatActivityStatus = (status: string): string => {
  const statusMap = {
    success: 'Completado',
    warning: 'Pendiente',
    info: 'Info'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

export const getStatusColorClasses = (status: string): string => {
  const colorMap = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700'
  }
  return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-700'
}

export const formatCurrency = (amount: number): string => 
  `S/. ${amount.toLocaleString()}`

export const formatTimeAgo = (timeStr: string): string => timeStr
