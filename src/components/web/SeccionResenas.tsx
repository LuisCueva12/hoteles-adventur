'use client'

import { useState } from 'react'
import { Star, ThumbsUp, MessageCircle, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'

interface Review {
    id: string
    usuario_id: string
    calificacion: number
    titulo: string
    comentario: string
    respuesta_admin?: string
    fecha_respuesta?: string
    verificado: boolean
    created_at: string
    usuarios?: {
        nombre_completo: string
        foto_perfil?: string
    }
}

interface SeccionResenasProps {
    alojamientoId: string
}

export function SeccionResenas({ alojamientoId }: SeccionResenasProps) {
    const supabase = createClient()
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        calificacion: 5,
        titulo: '',
        comentario: ''
    })

    // Cargar reseñas
    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ['reviews', alojamientoId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('resenas')
                .select(`
                    *,
                    usuarios:usuario_id (
                        nombre_completo,
                        foto_perfil
                    )
                `)
                .eq('alojamiento_id', alojamientoId)
                .eq('visible', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Review[]
        }
    })

    // Cargar estadísticas
    const { data: stats } = useQuery({
        queryKey: ['review-stats', alojamientoId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('estadisticas_resenas')
                .select('*')
                .eq('alojamiento_id', alojamientoId)
                .single()

            if (error) return null
            return data
        }
    })

    // Crear reseña
    const createReview = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Debes iniciar sesión')

            const { error } = await supabase
                .from('resenas')
                .insert([{
                    alojamiento_id: alojamientoId,
                    usuario_id: user.id,
                    ...formData
                }])

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', alojamientoId] })
            queryClient.invalidateQueries({ queryKey: ['review-stats', alojamientoId] })
            setShowForm(false)
            setFormData({ calificacion: 5, titulo: '', comentario: '' })
            Swal.fire({
                icon: 'success',
                title: '¡Reseña publicada!',
                text: 'Gracias por compartir tu experiencia',
                confirmButtonColor: '#DC2626'
            })
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo publicar la reseña',
                confirmButtonColor: '#DC2626'
            })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.comentario.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Comentario requerido',
                text: 'Por favor escribe tu experiencia',
                confirmButtonColor: '#DC2626'
            })
            return
        }
        createReview.mutate()
    }

    const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
        const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClass} ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            {stats && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900">
                                {stats.calificacion_promedio}
                            </div>
                            <div className="mt-2">{renderStars(Math.round(stats.calificacion_promedio), 'lg')}</div>
                            <div className="text-sm text-gray-600 mt-2">
                                {stats.total_resenas} reseñas
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = stats[`${['una', 'dos', 'tres', 'cuatro', 'cinco'][star - 1]}_estrella${star === 1 ? '' : 's'}`] || 0
                                const percentage = stats.total_resenas > 0 ? (count / stats.total_resenas) * 100 : 0
                                return (
                                    <div key={star} className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 w-12">{star} ★</span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Botón para escribir reseña */}
            <button
                onClick={() => setShowForm(!showForm)}
                className="w-full py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
                <MessageCircle className="w-5 h-5 inline mr-2" />
                Escribir una reseña
            </button>

            {/* Formulario */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Calificación</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, calificacion: star })}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 transition-colors ${
                                            star <= formData.calificacion
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 hover:text-yellow-200'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Título (opcional)</label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="Resume tu experiencia"
                            maxLength={200}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Tu experiencia</label>
                        <textarea
                            value={formData.comentario}
                            onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 min-h-[120px]"
                            placeholder="Cuéntanos sobre tu estadía..."
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={createReview.isPending}
                            className="flex-1 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {createReview.isPending ? 'Publicando...' : 'Publicar reseña'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Lista de reseñas */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white border rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {review.usuarios?.foto_perfil ? (
                                    <img src={review.usuarios.foto_perfil} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {review.usuarios?.nombre_completo || 'Usuario'}
                                            {review.verificado && (
                                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    Verificado
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString('es-PE', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    {renderStars(review.calificacion)}
                                </div>
                                {review.titulo && (
                                    <h4 className="font-semibold text-gray-900 mb-2">{review.titulo}</h4>
                                )}
                                <p className="text-gray-700 leading-relaxed">{review.comentario}</p>
                                
                                {review.respuesta_admin && (
                                    <div className="mt-4 pl-4 border-l-2 border-red-600 bg-red-50 p-4 rounded">
                                        <div className="text-sm font-semibold text-red-900 mb-1">
                                            Respuesta del hotel
                                        </div>
                                        <p className="text-sm text-gray-700">{review.respuesta_admin}</p>
                                        {review.fecha_respuesta && (
                                            <div className="text-xs text-gray-500 mt-2">
                                                {new Date(review.fecha_respuesta).toLocaleDateString('es-PE')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
