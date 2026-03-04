import { z } from 'zod'

/**
 * Validaciones comunes reutilizables
 */

// Validaciones de usuario
export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Email inválido')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial')

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido')
  .optional()
  .or(z.literal(''))

export const dniSchema = z
  .string()
  .regex(/^\d{8}$/, 'DNI debe tener 8 dígitos')
  .optional()
  .or(z.literal(''))

export const rucSchema = z
  .string()
  .regex(/^\d{11}$/, 'RUC debe tener 11 dígitos')
  .optional()
  .or(z.literal(''))

// Schema de registro de usuario
export const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  telefono: phoneSchema,
  documento_identidad: z.string().optional(),
  tipo_documento: z.enum(['DNI', 'Pasaporte', 'Carnet de Extranjería', 'RUC']).optional(),
  pais: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Schema de login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
})

// Schema de perfil de usuario
export const profileSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  telefono: phoneSchema,
  documento_identidad: z.string().optional(),
  tipo_documento: z.enum(['DNI', 'Pasaporte', 'Carnet de Extranjería', 'RUC']).optional(),
  pais: z.string().optional(),
})

// Schema de reserva
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
    .int('El número de personas debe ser un entero')
    .min(1, 'Debe haber al menos 1 persona')
    .max(20, 'No se permiten más de 20 personas'),
  adelanto: z
    .number()
    .min(0, 'El adelanto no puede ser negativo')
    .optional(),
  notas: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
}).refine((data) => {
  const inicio = new Date(data.fecha_inicio)
  const fin = new Date(data.fecha_fin)
  return fin > inicio
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fecha_fin'],
})

// Schema de alojamiento
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
    .min(0, 'El precio no puede ser negativo')
    .max(10000, 'El precio no puede exceder 10,000'),
  capacidad_maxima: z
    .number()
    .int('La capacidad debe ser un entero')
    .min(1, 'La capacidad mínima es 1')
    .max(20, 'La capacidad máxima es 20'),
  servicios_incluidos: z.array(z.string()).optional(),
  activo: z.boolean().default(true),
})

// Schema de contacto
export const contactSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: emailSchema,
  telefono: phoneSchema,
  asunto: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres'),
  mensaje: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede exceder 1000 caracteres'),
})

// Schema de pago
export const pagoSchema = z.object({
  reserva_id: z.string().uuid('ID de reserva inválido'),
  monto: z
    .number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(100000, 'El monto no puede exceder 100,000'),
  metodo: z.enum(['yape', 'plin', 'tarjeta', 'transferencia', 'efectivo']),
  numero_operacion: z.string().optional(),
  comprobante_url: z.string().url('URL de comprobante inválida').optional(),
})

// Schema de búsqueda
export const searchSchema = z.object({
  destino: z.string().optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  personas: z
    .number()
    .int()
    .min(1, 'Debe haber al menos 1 persona')
    .max(20, 'No se permiten más de 20 personas')
    .optional(),
  tipo: z.enum(['habitacion', 'suite', 'cabaña', 'apartamento', 'villa']).optional(),
  categoria: z.enum(['economica', 'estandar', 'superior', 'deluxe', 'presidencial']).optional(),
  precio_min: z.number().min(0).optional(),
  precio_max: z.number().min(0).optional(),
})

// Schema de opinión/review
export const opinionSchema = z.object({
  alojamiento_id: z.string().uuid('ID de alojamiento inválido'),
  calificacion: z
    .number()
    .int('La calificación debe ser un entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),
  comentario: z
    .string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede exceder 500 caracteres'),
})

// Schema de newsletter
export const newsletterSchema = z.object({
  email: emailSchema,
  nombre: z.string().optional(),
})

/**
 * Tipos TypeScript derivados de los schemas
 */
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ReservaInput = z.infer<typeof reservaSchema>
export type AlojamientoInput = z.infer<typeof alojamientoSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type PagoInput = z.infer<typeof pagoSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type OpinionInput = z.infer<typeof opinionSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>

/**
 * Helper para validar datos
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return { success: false, errors: { _general: ['Error de validación'] } }
  }
}
