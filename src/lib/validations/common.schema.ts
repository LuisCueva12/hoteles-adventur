import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Email inválido')
  .toLowerCase()
  .trim()

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

export const commonSchemas = {
  email: emailSchema,
  phone: phoneSchema,
  dni: dniSchema,
}
