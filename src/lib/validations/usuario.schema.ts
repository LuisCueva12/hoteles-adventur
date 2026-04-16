import { z } from 'zod'
import { emailSchema, phoneSchema } from './common.schema'

export const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'propietario', label: 'Propietario' },
  { value: 'turista', label: 'Turista' },
] as const

export const TIPOS_DOCUMENTO = [
  { value: 'DNI', label: 'DNI' },
  { value: 'Pasaporte', label: 'Pasaporte' },
  { value: 'Carnet de Extranjería', label: 'C.E.' },
  { value: 'RUC', label: 'RUC' },
] as const

export const PAISES = [
  'Perú', 'Argentina', 'Chile', 'Colombia', 'Ecuador', 'España', 'México', 'Estados Unidos', 'Otros'
]

export const usuarioSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: emailSchema,
  telefono: phoneSchema,
  documento_identidad: z.string().optional(),
  tipo_documento: z.enum(['DNI', 'Pasaporte', 'Carnet de Extranjería', 'RUC']).optional(),
  pais: z.string().optional(),
  rol: z.enum(['admin', 'propietario', 'turista']),
  verificado: z.boolean().default(false),
})

export const usuarioCreateSchema = usuarioSchema.extend({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
})

export const usuarioUpdateSchema = usuarioSchema.partial()

export type UsuarioFormData = z.infer<typeof usuarioSchema>
export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>
export type ValidationErrors = Partial<Record<keyof UsuarioCreateInput, string>>

export class UsuarioValidator {
  static validateCreate(data: any): ValidationErrors {
    const result = usuarioCreateSchema.safeParse(data)
    if (result.success) return {}
    return this.formatErrors(result.error)
  }

  static validateUpdate(data: any): ValidationErrors {
    const result = usuarioUpdateSchema.safeParse(data)
    if (result.success) return {}
    return this.formatErrors(result.error)
  }

  private static formatErrors(error: z.ZodError): ValidationErrors {
    const errors: ValidationErrors = {}
    error.errors.forEach((err) => {
      const path = err.path[0] as keyof UsuarioCreateInput
      if (path && !errors[path]) {
        errors[path] = err.message
      }
    })
    return errors
  }
}
