import { z } from 'zod'

export const reservaSchema = z.object({
  alojamiento_id: z.string().uuid('ID de alojamiento inválido'),
  fecha_inicio: z.string().refine((date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today
  }, 'La fecha de inicio debe ser hoy o posterior'),
  fecha_fin: z.string(),
  personas: z
    .number()
    .int()
    .min(1)
    .max(20),
  adelanto: z.number().min(0).optional(),
  notas: z.string().max(500).optional(),
}).refine((data) => {
  const inicio = new Date(data.fecha_inicio)
  const fin = new Date(data.fecha_fin)
  return fin > inicio
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fecha_fin'],
})

export type ReservaInput = z.infer<typeof reservaSchema>
