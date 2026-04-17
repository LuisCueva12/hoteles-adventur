import { z } from 'zod'

export const alojamientoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  tipo: z.enum(['habitacion', 'suite', 'cabaña', 'apartamento', 'villa']),
  categoria: z.enum(['economica', 'estandar', 'superior', 'deluxe', 'presidencial']),
  precio_noche: z
    .number()
    .min(0)
    .max(10000),
  capacidad_maxima: z
    .number()
    .int()
    .min(1)
    .max(20),
  servicios_incluidos: z.array(z.string()).optional(),
  activo: z.boolean().default(true),
})

export type AlojamientoInput = z.infer<typeof alojamientoSchema>
