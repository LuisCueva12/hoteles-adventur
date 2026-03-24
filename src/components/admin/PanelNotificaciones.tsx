'use client'

import { X, Check, AlertCircle, Info, Calendar, Users, DollarSign } from 'lucide-react'

interface Notification {
    id: string
    type: 'success' | 'warning' | 'info' | 'error'
    title: string
    message: string
    time: string
    read: boolean
}

interface NotificationsPanelProps {
    isOpen: boolean
    onClose: () => void
    notifications: Notification[]
    onMarkAsRead: (id: string) => void
    onMarkAllAsRead: () => void
    onClearAll: () => void
}

export function NotificationsPanel({ 
    isOpen, 
    onClose, 
    notifications, 
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll 
}: NotificationsPanelProps) {
    if (!isOpen) return null

    const unreadCount = notifications.filter(n => !n.read).length

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <Check className="w-5 h-5 text-yellow-400" />
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-400" />
            case 'error':
                return <AlertCircle className="w-5 h-5 text-yellow-400" />
            default:
                return <Info className="w-5 h-5 text-blue-600" />
        }
    }

    const getIconBg = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-yellow-100'
            case 'warning':
                return 'bg-yellow-100'
            case 'error':
                return 'bg-yellow-100'
            default:
                return 'bg-blue-100'
        }
    }

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 animate-slideInRight flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-gray-900">Notificaciones</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white rounded-lg transition-all"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <p className="text-sm text-gray-600">
                            Tienes <span className="font-bold text-blue-600">{unreadCount}</span> notificaciones sin leer
                        </p>
                    )}
                </div>

                {/* Actions */}
                {notifications.length > 0 && (
                    <div className="p-3 border-b border-gray-200 flex gap-2">
                        <button
                            onClick={onMarkAllAsRead}
                            className="flex-1 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                        >
                            Marcar todas como leídas
                        </button>
                        <button
                            onClick={onClearAll}
                            className="flex-1 px-3 py-2 text-xs font-semibold text-yellow-400 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all"
                        >
                            Limpiar todo
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Check className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                ¡Todo al día!
                            </h3>
                            <p className="text-sm text-gray-500">
                                No tienes notificaciones pendientes
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-all cursor-pointer ${
                                        !notification.read ? 'bg-blue-50/50' : ''
                                    }`}
                                    onClick={() => onMarkAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${getIconBg(notification.type)} flex items-center justify-center flex-shrink-0`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="text-sm font-semibold text-gray-900">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
