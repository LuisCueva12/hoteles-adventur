'use client'

import { useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Modal } from '@/components/admin/Modal'

interface Room {
    id: number
    nombre: string
    tipo: string
    precio: number
    capacidad: number
    tamano: number
    estado: 'disponible' | 'ocupada' | 'mantenimiento'
    amenidades: string[]
}

const INITIAL_ROOMS: Room[] = [
    { id: 1, nombre: 'Suite Deluxe 101', tipo: 'Suite Deluxe', precio: 350, capacidad: 3, tamano: 45, estado: 'disponible', amenidades: ['WiFi', 'TV Smart', 'Minibar'] },
    { id: 2, nombre: 'Habitación Estándar 201', tipo: 'Estándar', precio: 180, capacidad: 2, tamano: 25, estado: 'ocupada', amenidades: ['WiFi', 'TV'] },
    { id: 3, nombre: 'Suite Premium 301', tipo: 'Suite Premium', precio: 520, capacidad: 4, tamano: 60, estado: 'disponible', amenidades: ['WiFi', 'TV Smart', 'Jacuzzi'] },
    { id: 4, nombre: 'Habitación Superior 202', tipo: 'Superior', precio: 250, capacidad: 2, tamano: 30, estado: 'mantenimiento', amenidades: ['WiFi', 'TV Smart'] },
    { id: 5, nombre: 'Suite Ejecutiva 401', tipo: 'Suite Ejecutiva', precio: 420, capacidad: 2, tamano: 50, estado: 'disponible', amenidades: ['WiFi premium', 'Escritorio'] },
]

export default function HotelesAdminPage() {
    const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)
    const [formData, setFormData] = useState<Partial<Room>>({
        nombre: '',
        tipo: '',
        precio: 0,
        capacidad: 1,
        tamano: 0,
        estado: 'disponible',
        amenidades: []
    })

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'tipo', label: 'Tipo' },
        { 
            key: 'precio', 
            label: 'Precio',
            render: (value: number) => `S/. ${value}`
        },
        { 
            key: 'capacidad', 
            label: 'Capacidad',
            render: (value: number) => `${value} personas`
        },
        { 
            key: 'tamano', 
            label: 'Tamaño',
            render: (value: number) => `${value}m²`
        },
        { 
            key: 'estado', 
            label: 'Estado',
            render: (value: string) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    value === 'disponible' ? 'bg-green-500/10 text-green-400' :
                    value === 'ocupada' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                }`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            )
        },
    ]

    const handleEdit = (room: Room) => {
        setEditingRoom(room)
        setFormData(room)
        setIsModalOpen(true)
    }

    const handleDelete = (room: Room) => {
        if (confirm(`¿Estás seguro de eliminar ${room.nombre}?`)) {
            setRooms(rooms.filter(r => r.id !== room.id))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingRoom) {
            setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...formData } as Room : r))
        } else {
            const newRoom = { ...formData, id: Math.max(...rooms.map(r => r.id)) + 1 } as Room
            setRooms([...rooms, newRoom])
        }
        closeModal()
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingRoom(null)
        setFormData({ nombre: '', tipo: '', precio: 0, capacidad: 1, tamano: 0, estado: 'disponible', amenidades: [] })
    }

    const stats = [
        { label: 'Total Habitaciones', value: rooms.length, color: 'text-blue-400' },
        { label: 'Disponibles', value: rooms.filter(r => r.estado === 'disponible').length, color: 'text-green-400' },
        { label: 'Ocupadas', value: rooms.filter(r => r.estado === 'ocupada').length, color: 'text-red-400' },
        { label: 'Mantenimiento', value: rooms.filter(r => r.estado === 'mantenimiento').length, color: 'text-yellow-400' },
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Gestión de Habitaciones</h1>
                    <p className="text-gray-400">Administra todas las habitaciones del hotel</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                    + Nueva Habitación
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={rooms}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingRoom ? 'Editar Habitación' : 'Nueva Habitación'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Nombre de la Habitación
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Tipo
                            </label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                                required
                            >
                                <option value="">Seleccionar</option>
                                <option value="Estándar">Estándar</option>
                                <option value="Superior">Superior</option>
                                <option value="Suite Deluxe">Suite Deluxe</option>
                                <option value="Suite Premium">Suite Premium</option>
                                <option value="Suite Ejecutiva">Suite Ejecutiva</option>
                                <option value="Suite Presidencial">Suite Presidencial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Precio por Noche (S/.)
                            </label>
                            <input
                                type="number"
                                value={formData.precio}
                                onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Capacidad (personas)
                            </label>
                            <input
                                type="number"
                                value={formData.capacidad}
                                onChange={(e) => setFormData({ ...formData, capacidad: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Tamaño (m²)
                            </label>
                            <input
                                type="number"
                                value={formData.tamano}
                                onChange={(e) => setFormData({ ...formData, tamano: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Estado
                            </label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                                required
                            >
                                <option value="disponible">Disponible</option>
                                <option value="ocupada">Ocupada</option>
                                <option value="mantenimiento">Mantenimiento</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            {editingRoom ? 'Guardar Cambios' : 'Crear Habitación'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
