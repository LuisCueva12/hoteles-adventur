'use client'

import { useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Modal } from '@/components/admin/Modal'

interface Reserva {
    id: number
    usuario: string
    email: string
    habitacion: string
    checkIn: string
    checkOut: string
    huespedes: number
    total: number
    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
    fechaReserva: string
}

const INITIAL_RESERVAS: Reserva[] = [
    { id: 1, usuario: 'María González', email: 'maria@email.com', habitacion: 'Suite Deluxe 101', checkIn: '2026-03-15', checkOut: '2026-03-18', huespedes: 2, total: 1050, estado: 'confirmada', fechaReserva: '2026-02-20' },
    { id: 2, usuario: 'Carlos Rodríguez', email: 'carlos@email.com', habitacion: 'Suite Premium 301', checkIn: '2026-03-10', checkOut: '2026-03-12', huespedes: 3, total: 1040, estado: 'confirmada', fechaReserva: '2026-02-18' },
    { id: 3, usuario: 'Ana Martínez', email: 'ana@email.com', habitacion: 'Habitación Estándar 201', checkIn: '2026-03-20', checkOut: '2026-03-22', huespedes: 2, total: 360, estado: 'pendiente', fechaReserva: '2026-02-24' },
    { id: 4, usuario: 'Jorge Silva', email: 'jorge@email.com', habitacion: 'Suite Ejecutiva 401', checkIn: '2026-02-28', checkOut: '2026-03-02', huespedes: 1, total: 840, estado: 'cancelada', fechaReserva: '2026-02-15' },
    { id: 5, usuario: 'Laura Pérez', email: 'laura@email.com', habitacion: 'Habitación Superior 202', checkIn: '2026-02-26', checkOut: '2026-02-28', huespedes: 2, total: 500, estado: 'completada', fechaReserva: '2026-02-10' },
]

export default function ReservasAdminPage() {
    const [reservas, setReservas] = useState<Reserva[]>(INITIAL_RESERVAS)
    const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filterEstado, setFilterEstado] = useState<string>('todas')

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'usuario', label: 'Usuario' },
        { key: 'habitacion', label: 'Habitación' },
        { 
            key: 'checkIn', 
            label: 'Check-in',
            render: (value: string) => new Date(value).toLocaleDateString('es-PE')
        },
        { 
            key: 'checkOut', 
            label: 'Check-out',
            render: (value: string) => new Date(value).toLocaleDateString('es-PE')
        },
        { key: 'huespedes', label: 'Huéspedes' },
        { 
            key: 'total', 
            label: 'Total',
            render: (value: number) => `S/. ${value}`
        },
        { 
            key: 'estado', 
            label: 'Estado',
            render: (value: string) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    value === 'confirmada' ? 'bg-green-500/10 text-green-400' :
                    value === 'pendiente' ? 'bg-yellow-500/10 text-yellow-400' :
                    value === 'cancelada' ? 'bg-red-500/10 text-red-400' :
                    'bg-blue-500/10 text-blue-400'
                }`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            )
        },
    ]

    const handleView = (reserva: Reserva) => {
        setSelectedReserva(reserva)
        setIsModalOpen(true)
    }

    const handleChangeStatus = (newStatus: Reserva['estado']) => {
        if (selectedReserva) {
            setReservas(reservas.map(r => 
                r.id === selectedReserva.id ? { ...r, estado: newStatus } : r
            ))
            setSelectedReserva({ ...selectedReserva, estado: newStatus })
        }
    }

    const handleDelete = (reserva: Reserva) => {
        if (confirm(`¿Estás seguro de eliminar la reserva #${reserva.id}?`)) {
            setReservas(reservas.filter(r => r.id !== reserva.id))
        }
    }

    const filteredReservas = filterEstado === 'todas' 
        ? reservas 
        : reservas.filter(r => r.estado === filterEstado)

    const stats = [
        { label: 'Total Reservas', value: reservas.length, color: 'text-blue-400' },
        { label: 'Confirmadas', value: reservas.filter(r => r.estado === 'confirmada').length, color: 'text-green-400' },
        { label: 'Pendientes', value: reservas.filter(r => r.estado === 'pendiente').length, color: 'text-yellow-400' },
        { label: 'Canceladas', value: reservas.filter(r => r.estado === 'cancelada').length, color: 'text-red-400' },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Gestión de Reservas</h1>
                <p className="text-gray-400">Administra todas las reservas del hotel</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="mb-6 flex items-center gap-3">
                <span className="text-sm text-gray-400">Filtrar por estado:</span>
                {['todas', 'pendiente', 'confirmada', 'cancelada', 'completada'].map((estado) => (
                    <button
                        key={estado}
                        onClick={() => setFilterEstado(estado)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            filterEstado === estado
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={filteredReservas}
                onView={handleView}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Detalles de Reserva #${selectedReserva?.id}`}
                size="lg"
            >
                {selectedReserva && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Información del Cliente</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500">Nombre</p>
                                        <p className="text-white">{selectedReserva.usuario}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-white">{selectedReserva.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Número de Huéspedes</p>
                                        <p className="text-white">{selectedReserva.huespedes} personas</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Información de la Reserva</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500">Habitación</p>
                                        <p className="text-white">{selectedReserva.habitacion}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Check-in</p>
                                        <p className="text-white">{new Date(selectedReserva.checkIn).toLocaleDateString('es-PE')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Check-out</p>
                                        <p className="text-white">{new Date(selectedReserva.checkOut).toLocaleDateString('es-PE')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Fecha de Reserva</p>
                                        <p className="text-white">{new Date(selectedReserva.fechaReserva).toLocaleDateString('es-PE')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-400">Estado de la Reserva</h3>
                                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                                    selectedReserva.estado === 'confirmada' ? 'bg-green-500/10 text-green-400' :
                                    selectedReserva.estado === 'pendiente' ? 'bg-yellow-500/10 text-yellow-400' :
                                    selectedReserva.estado === 'cancelada' ? 'bg-red-500/10 text-red-400' :
                                    'bg-blue-500/10 text-blue-400'
                                }`}>
                                    {selectedReserva.estado.charAt(0).toUpperCase() + selectedReserva.estado.slice(1)}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleChangeStatus('confirmada')}
                                    className="flex-1 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                >
                                    Confirmar
                                </button>
                                <button
                                    onClick={() => handleChangeStatus('pendiente')}
                                    className="flex-1 px-4 py-2 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                                >
                                    Pendiente
                                </button>
                                <button
                                    onClick={() => handleChangeStatus('completada')}
                                    className="flex-1 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                >
                                    Completada
                                </button>
                                <button
                                    onClick={() => handleChangeStatus('cancelada')}
                                    className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-400">Total</span>
                                <span className="text-2xl font-bold text-white">S/. {selectedReserva.total}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
