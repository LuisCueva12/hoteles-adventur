'use client'

import { useState, useEffect } from 'react'
import { Star, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import Swal from 'sweetalert2'

interface Opinion {
    id: string
    calificacion: number
    comentario: string | null
    fecha: string
    usuario_id?: string | null
    usuarios?: { nombre: string; apellido: string } | null
}

interface SeccionResenasProps {
    alojamientoId: string
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
    const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`${cls} ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
            ))}
        </div>
    )
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0)
    const labels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
    return (
        <div className="flex items-center gap-3">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button"
                        onClick={() => onChange(s)}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                        aria-label={`${s} estrellas`}
                    >
                        <Star className={`w-8 h-8 transition-colors ${
                            s <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                        }`} />
                    </button>
                ))}
            </div>
            {(hover || value) > 0 && (
                <span className="text-sm font-semibold text-yellow-600">{labels[hover || value]}</span>
            )}
        </div>
    )
}

function OpinionCard({ op }: { op: Opinion }) {
    const [expanded, setExpanded] = useState(false)
    const texto = op.comentario?.trim() || ''
    const isLong = texto.length > 200
    const display = isLong && !expanded ? texto.slice(0, 200) + '…' : texto
    const nombre = op.usuarios
        ? `${op.usuarios.nombre || ''} ${op.usuarios.apellido || ''}`.trim() || 'Huésped'
        : 'Huésped'
    const inicial = nombre.charAt(0).toUpperCase()

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {inicial}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{nombre}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(op.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <StarRating rating={op.calificacion} size="sm" />
                    </div>
                    {texto ? (
                        <>
                            <p className="text-gray-600 text-sm mt-2 leading-relaxed">{display}</p>
                            {isLong && (
                                <button onClick={() => setExpanded(v => !v)}
                                    className="mt-1 text-xs text-yellow-600 font-semibold flex items-center gap-1 hover:text-yellow-700">
                                    {expanded
                                        ? <><ChevronUp className="w-3 h-3" /> Ver menos</>
                                        : <><ChevronDown className="w-3 h-3" /> Ver más</>}
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-400 text-sm mt-2 italic">Sin comentario</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export function SeccionResenas({ alojamientoId }: SeccionResenasProps) {
    const supabase = createClient()
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ calificacion: 5, comentario: '' })
    const [usuarioId, setUsuarioId] = useState<string | null>(null)

    // Detectar sesión activa
    useEffect(() => {
        supabase.auth.getUser().then((result: { data: { user: { id: string } | null }; error: unknown }) => {
            setUsuarioId(result.data.user?.id ?? null)
        })
    }, [])

    // ── LEER opiniones directamente desde Supabase (sin API)
    const { data: opiniones = [], isLoading, isError } = useQuery({
        queryKey: ['opiniones', alojamientoId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('opiniones')
                .select('id, calificacion, comentario, fecha, usuario_id, usuarios:usuario_id(nombre, apellido)')
                .eq('alojamiento_id', alojamientoId)
                .order('fecha', { ascending: false })

            if (error) {
                console.error('Error cargando opiniones:', error.message)
                throw new Error(error.message)
            }
            return (data ?? []) as unknown as Opinion[]
        },
        staleTime: 0,
        retry: 1,
    })

    // ── INSERTAR opinión directamente desde Supabase (sin API)
    const createOpinion = useMutation({
        mutationFn: async () => {
            const insertData: Record<string, unknown> = {
                alojamiento_id: alojamientoId,
                calificacion: formData.calificacion,
                comentario: formData.comentario.trim(),
                fecha: new Date().toISOString(),
            }
            if (usuarioId) insertData.usuario_id = usuarioId

            const { data, error } = await supabase
                .from('opiniones')
                .insert([insertData])
                .select('id, calificacion, comentario, fecha, usuario_id, usuarios:usuario_id(nombre, apellido)')
                .single()

            if (error) throw new Error(error.message)
            return data ? [data] : []
        },
        onSuccess: (nuevaOpinion) => {
            // Agregar la opinión inmediatamente al estado local
            queryClient.setQueryData(['opiniones', alojamientoId], (prev: Opinion[] = []) => [
                nuevaOpinion,
                ...prev,
            ])
            setShowForm(false)
            setFormData({ calificacion: 5, comentario: '' })
            Swal.fire({
                icon: 'success',
                title: '¡Opinión publicada!',
                text: 'Gracias por compartir tu experiencia',
                confirmButtonColor: '#FBBF24',
                confirmButtonText: 'Genial'
            })
        },
        onError: (error: Error) => {
            console.error('Error al publicar opinión:', error.message)
            Swal.fire({
                icon: 'error',
                title: 'Error al publicar',
                text: error.message.includes('permission')
                    ? 'Sin permisos. Contacta al administrador.'
                    : error.message || 'No se pudo publicar la opinión',
                confirmButtonColor: '#FBBF24'
            })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.comentario.trim()) {
            Swal.fire({ icon: 'warning', title: 'Falta el comentario', text: 'Por favor escribe tu experiencia', confirmButtonColor: '#FBBF24' })
            return
        }
        createOpinion.mutate()
    }

    const avg = opiniones.length
        ? opiniones.reduce((s, o) => s + o.calificacion, 0) / opiniones.length
        : 0

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
        )
    }

    if (isError) {
        return (
            <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-500 text-sm font-medium">No se pudieron cargar las opiniones.</p>
                <p className="text-red-400 text-xs mt-1">Verifica los permisos de la tabla en Supabase.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Resumen */}
            {opiniones.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="text-center flex-shrink-0 sm:border-r sm:border-gray-200 sm:pr-5">
                        <p className="text-5xl font-black text-gray-900">{avg.toFixed(1)}</p>
                        <StarRating rating={Math.round(avg)} />
                        <p className="text-sm text-gray-500 mt-1">{opiniones.length} opinión{opiniones.length !== 1 ? 'es' : ''}</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map(n => {
                            const count = opiniones.filter(o => o.calificacion === n).length
                            const pct = opiniones.length ? Math.round((count / opiniones.length) * 100) : 0
                            return (
                                <div key={n} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-3 text-right">{n}</span>
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-400 w-5">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Botón abrir formulario */}
            {!showForm && (
                <button onClick={() => setShowForm(true)}
                    className="w-full py-3 px-4 border-2 border-yellow-400 text-yellow-600 font-semibold rounded-xl hover:bg-yellow-50 transition-all flex items-center justify-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4" />
                    Escribir una opinión
                </button>
            )}

            {/* Formulario */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">Tu opinión</h3>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Calificación</label>
                        <InteractiveStars value={formData.calificacion} onChange={v => setFormData(f => ({ ...f, calificacion: v }))} />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tu experiencia</label>
                        <textarea
                            value={formData.comentario}
                            onChange={e => setFormData(f => ({ ...f, comentario: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all resize-none"
                            placeholder="Cuéntanos sobre tu estadía, el servicio, la habitación..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button"
                            onClick={() => { setShowForm(false); setFormData({ calificacion: 5, comentario: '' }) }}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={createOpinion.isPending}
                            className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-all text-sm disabled:opacity-60">
                            {createOpinion.isPending ? 'Publicando…' : 'Publicar opinión'}
                        </button>
                    </div>
                </form>
            )}

            {/* Lista */}
            {opiniones.length > 0 ? (
                <div className="space-y-3">
                    {opiniones.map(op => <OpinionCard key={op.id} op={op} />)}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-7 h-7 text-yellow-400" />
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">Aún no hay opiniones</p>
                    <p className="text-sm text-gray-400">¡Sé el primero en compartir tu experiencia!</p>
                </div>
            )}
        </div>
    )
}
