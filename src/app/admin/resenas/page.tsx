'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Star, Trash2, RefreshCw, MessageSquare, Loader2, Building2 } from 'lucide-react'
import Swal from 'sweetalert2'

interface Opinion {
    id: string
    alojamiento_id: string | null
    usuario_id: string | null
    reserva_id: string | null
    calificacion: number
    comentario: string | null
    fecha: string
    usuarios: { nombre: string; apellido: string; email: string } | null
    alojamientos: { nombre: string } | null
}

const STAR_LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']

export default function ResenasAdminPage() {
    const supabase = createClient()
    const [opiniones, setOpiniones] = useState<Opinion[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [filtroCalif, setFiltroCalif] = useState<number | null>(null)
    const [filtroAloj, setFiltroAloj] = useState<string>('todos')

    useEffect(() => { cargar() }, [])

    async function cargar() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('opiniones')
                .select(`
                    *,
                    usuarios:usuario_id ( nombre, apellido, email ),
                    alojamientos:alojamiento_id ( nombre )
                `)
                .order('fecha', { ascending: false })

            if (error) throw error
            setOpiniones((data ?? []) as Opinion[])
        } catch (err: any) {
            console.error(err)
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar',
                text: err?.message || 'No se pudieron cargar las opiniones',
                confirmButtonColor: '#3B82F6'
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleEliminar(op: Opinion) {
        const result = await Swal.fire({
            title: '¿Eliminar opinión?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        })
        if (!result.isConfirmed) return

        const { error } = await supabase.from('opiniones').delete().eq('id', op.id)
        if (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar', confirmButtonColor: '#3B82F6' })
            return
        }
        setOpiniones(prev => prev.filter(o => o.id !== op.id))
        Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1500, showConfirmButton: false })
    }

    // Lista única de alojamientos para el filtro
    const alojamientosUnicos = Array.from(
        new Map(
            opiniones
                .filter(o => o.alojamiento_id && o.alojamientos?.nombre)
                .map(o => [o.alojamiento_id!, o.alojamientos!.nombre])
        ).entries()
    )

    const filtradas = opiniones.filter(o => {
        if (filtroCalif !== null && o.calificacion !== filtroCalif) return false
        if (filtroAloj !== 'todos' && o.alojamiento_id !== filtroAloj) return false
        return true
    })

    const promedio = opiniones.length
        ? (opiniones.reduce((s, o) => s + o.calificacion, 0) / opiniones.length).toFixed(1)
        : '—'

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Opiniones de huéspedes</h1>
                    <p className="text-gray-500">Revisa y modera las opiniones registradas</p>
                </div>
                <button
                    onClick={async () => { setRefreshing(true); await cargar(); setRefreshing(false) }}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 font-semibold"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 text-blue-700 rounded-2xl p-5 flex items-center gap-4">
                    <MessageSquare className="w-8 h-8 opacity-70 flex-shrink-0" />
                    <div>
                        <p className="text-2xl font-bold">{opiniones.length}</p>
                        <p className="text-sm font-medium opacity-80">Total opiniones</p>
                    </div>
                </div>
                <div className="bg-yellow-50 text-yellow-700 rounded-2xl p-5 flex items-center gap-4">
                    <Star className="w-8 h-8 opacity-70 flex-shrink-0" />
                    <div>
                        <p className="text-2xl font-bold">{promedio}</p>
                        <p className="text-sm font-medium opacity-80">Promedio general</p>
                    </div>
                </div>
                <div className="bg-green-50 text-green-700 rounded-2xl p-5 flex items-center gap-4">
                    <Building2 className="w-8 h-8 opacity-70 flex-shrink-0" />
                    <div>
                        <p className="text-2xl font-bold">{alojamientosUnicos.length}</p>
                        <p className="text-sm font-medium opacity-80">Alojamientos con opiniones</p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
                {/* Filtro por alojamiento — select para escalar con muchos hoteles */}
                <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <label className="text-sm font-semibold text-gray-600 flex-shrink-0">Alojamiento:</label>
                    <select
                        value={filtroAloj}
                        onChange={e => setFiltroAloj(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-[180px] max-w-[260px]"
                    >
                        <option value="todos">Todos los alojamientos</option>
                        {alojamientosUnicos.map(([id, nombre]) => (
                            <option key={id} value={id}>{nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="w-px h-6 bg-gray-200 hidden sm:block" />

                {/* Filtro por calificación */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-semibold text-gray-600 flex-shrink-0">Calificación:</span>
                    <button onClick={() => setFiltroCalif(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                            filtroCalif === null ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                        Todas
                    </button>
                    {[5, 4, 3, 2, 1].map(n => (
                        <button key={n} onClick={() => setFiltroCalif(filtroCalif === n ? null : n)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border flex items-center gap-1 ${
                                filtroCalif === n ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}>
                            {n} <Star className="w-3 h-3 fill-current" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Contador */}
            <p className="text-sm text-gray-500 mb-3">
                Mostrando <span className="font-semibold text-gray-900">{filtradas.length}</span> de {opiniones.length} opiniones
            </p>

            {/* Lista */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {filtradas.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No hay opiniones con estos filtros</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtradas.map(op => {
                            const nombre = op.usuarios
                                ? `${op.usuarios.nombre || ''} ${op.usuarios.apellido || ''}`.trim()
                                : 'Huésped'
                            const inicial = nombre.charAt(0).toUpperCase()

                            return (
                                <div key={op.id} className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm flex-shrink-0">
                                            {inicial}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{nombre}</p>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                                        {op.alojamientos?.nombre && (
                                                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                                                                <Building2 className="w-3 h-3" />
                                                                {op.alojamientos.nombre}
                                                            </span>
                                                        )}
                                                        {op.usuarios?.email && (
                                                            <span className="text-xs text-gray-400">{op.usuarios.email}</span>
                                                        )}
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(op.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {[1,2,3,4,5].map(s => (
                                                        <Star key={s} className={`w-4 h-4 ${s <= op.calificacion ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                                    ))}
                                                    <span className="text-xs text-gray-500 ml-1">{STAR_LABELS[op.calificacion]}</span>
                                                </div>
                                            </div>

                                            {op.comentario && (
                                                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{op.comentario}</p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleEliminar(op)}
                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
