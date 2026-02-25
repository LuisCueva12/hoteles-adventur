'use client'

import { useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Modal } from '@/components/admin/Modal'

interface Usuario {
    id: number
    nombre: string
    email: string
    telefono: string
    rol: 'cliente' | 'admin_adventur'
    estado: 'activo' | 'inactivo' | 'bloqueado'
    fechaRegistro: string
    ultimoAcceso: string
    reservasTotal: number
}

const INITIAL_USUARIOS: Usuario[] = [
    { id: 1, nombre: 'María González', email: 'maria@email.com', telefono: '+51 999 111 222', rol: 'cliente', estado: 'activo', fechaRegistro: '2025-01-15', ultimoAcceso: '2026-02-24', reservasTotal: 5 },
    { id: 2, nombre: 'Carlos Rodríguez', email: 'carlos@email.com', telefono: '+51 999 222 333', rol: 'cliente', estado: 'activo', fechaRegistro: '2025-03-20', ultimoAcceso: '2026-02-23', reservasTotal: 3 },
    { id: 3, nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '+51 999 333 444', rol: 'cliente', estado: 'activo', fechaRegistro: '2025-06-10', ultimoAcceso: '2026-02-25', reservasTotal: 2 },
    { id: 4, nombre: 'Jorge Silva', email: 'jorge@email.com', telefono: '+51 999 444 555', rol: 'cliente', estado: 'inactivo', fechaRegistro: '2024-11-05', ultimoAcceso: '2025-12-15', reservasTotal: 8 },
    { id: 5, nombre: 'Laura Pérez', email: 'laura@email.com', telefono: '+51 999 555 666', rol: 'cliente', estado: 'activo', fechaRegistro: '2025-08-22', ultimoAcceso: '2026-02-20', reservasTotal: 1 },
    { id: 6, nombre: 'Admin Principal', email: 'admin@adventurhotels.com', telefono: '+51 999 000 000', rol: 'admin_adventur', estado: 'activo', fechaRegistro: '2024-01-01', ultimoAcceso: '2026-02-25', reservasTotal: 0 },
]

export default function UsuariosAdminPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS)
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
    const [filterRol, setFilterRol] = useState<string>('todos')

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'email', label: 'Email' },
        { key: 'telefono', label: 'Teléfono' },
        { 
            key: 'rol', 
            label: 'Rol',
            render: (value: string) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    value === 'admin_adventur' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                    {value === 'admin_adventur' ? 'Admin' : 'Cliente'}
                </span>
            )
        },
        { 
            key: 'estado', 
            label: 'Estado',
            render: (value: string) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    value === 'activo' ? 'bg-green-500/10 text-green-400' :
                    value === 'inactivo' ? 'bg-gray-500/10 text-gray-400' :
                    'bg-red-500/10 text-red-400'
                }`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            )
        },
        { key: 'reservasTotal', label: 'Reservas' },
    ]

    const handleView = (usuario: Usuario) => {
        setSelectedUsuario(usuario)
        setIsModalOpen(true)
    }

    const handleEdit = (usuario: Usuario) => {
        setEditingUsuario(usuario)
        setIsEditModalOpen(true)
    }

    const handleDelete = (usuario: Usuario) => {
        if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`)) {
            setUsuarios(usuarios.filter(u => u.id !== usuario.id))
        }
    }

    const handleSaveEdit = () => {
        if (editingUsuario) {
            setUsuarios(usuarios.map(u => u.id === editingUsuario.id ? editingUsuario : u))
            setIsEditModalOpen(false)
            setEditingUsuario(null)
        }
    }

    const filteredUsuarios = filterRol === 'todos' 
        ? usuarios 
        : usuarios.filter(u => u.rol === filterRol)

    const stats = [
        { label: 'Total Usuarios', value: usuarios.length, color: 'text-blue-400' },
        { label: 'Clientes', value: usuarios.filter(u => u.rol === 'cliente').length, color: 'text-green-400' },
        { label: 'Administradores', value: usuarios.filter(u => u.rol === 'admin_adventur').length, color: 'text-purple-400' },
        { label: 'Activos', value: usuarios.filter(u => u.estado === 'activo').length, color: 'text-yellow-400' },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
                <p className="text-gray-400">Administra todos los usuarios del sistema</p>
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
                <span className="text-sm text-gray-400">Filtrar por rol:</span>
                {['todos', 'cliente', 'admin_adventur'].map((rol) => (
                    <button
                        key={rol}
                        onClick={() => setFilterRol(rol)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            filterRol === rol
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        {rol === 'todos' ? 'Todos' : rol === 'admin_adventur' ? 'Administradores' : 'Clientes'}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={filteredUsuarios}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Detalles del Usuario"
                size="lg"
            >
                {selectedUsuario && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Información Personal</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Nombre Completo</p>
                                        <p className="text-white">{selectedUsuario.nombre}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-white">{selectedUsuario.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Teléfono</p>
                                        <p className="text-white">{selectedUsuario.telefono}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Información de Cuenta</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Rol</p>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                            selectedUsuario.rol === 'admin_adventur' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                            {selectedUsuario.rol === 'admin_adventur' ? 'Administrador' : 'Cliente'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Estado</p>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                            selectedUsuario.estado === 'activo' ? 'bg-green-500/10 text-green-400' :
                                            selectedUsuario.estado === 'inactivo' ? 'bg-gray-500/10 text-gray-400' :
                                            'bg-red-500/10 text-red-400'
                                        }`}>
                                            {selectedUsuario.estado.charAt(0).toUpperCase() + selectedUsuario.estado.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Fecha de Registro</p>
                                        <p className="text-white">{new Date(selectedUsuario.fechaRegistro).toLocaleDateString('es-PE')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Último Acceso</p>
                                        <p className="text-white">{new Date(selectedUsuario.ultimoAcceso).toLocaleDateString('es-PE')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-6">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Estadísticas</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-400">{selectedUsuario.reservasTotal}</p>
                                    <p className="text-xs text-gray-400 mt-1">Reservas Totales</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-green-400">S/. {selectedUsuario.reservasTotal * 350}</p>
                                    <p className="text-xs text-gray-400 mt-1">Gasto Total</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-yellow-400">{Math.floor(Math.random() * 100)}</p>
                                    <p className="text-xs text-gray-400 mt-1">Puntos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar Usuario"
                size="md"
            >
                {editingUsuario && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Nombre</label>
                            <input
                                type="text"
                                value={editingUsuario.nombre}
                                onChange={(e) => setEditingUsuario({ ...editingUsuario, nombre: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={editingUsuario.email}
                                onChange={(e) => setEditingUsuario({ ...editingUsuario, email: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Teléfono</label>
                            <input
                                type="tel"
                                value={editingUsuario.telefono}
                                onChange={(e) => setEditingUsuario({ ...editingUsuario, telefono: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Rol</label>
                            <select
                                value={editingUsuario.rol}
                                onChange={(e) => setEditingUsuario({ ...editingUsuario, rol: e.target.value as any })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                            >
                                <option value="cliente">Cliente</option>
                                <option value="admin_adventur">Administrador</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Estado</label>
                            <select
                                value={editingUsuario.estado}
                                onChange={(e) => setEditingUsuario({ ...editingUsuario, estado: e.target.value as any })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                            >
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                                <option value="bloqueado">Bloqueado</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
