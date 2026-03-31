import { z } from 'zod'

export interface SiteConfig {
  id?: string
  nombre_hotel: string
  slogan: string
  descripcion: string
  direccion: string
  ciudad: string
  pais: string
  telefono: string
  telefono_secundario: string
  email: string
  email_reservas: string
  sitio_web: string
  facebook: string
  instagram: string
  twitter: string
  politica_cancelacion: string
  politica_checkin: string
  hora_checkin: string
  hora_checkout: string
  moneda: string
  porcentaje_adelanto: number
  ruc: string
  razon_social: string
  created_at?: string
  updated_at?: string
}

export const defaultSiteConfig: SiteConfig = {
  nombre_hotel: 'Hotel Adventur',
  slogan: 'Tu viaje, tu hogar',
  descripcion: '',
  direccion: 'Jr. Amalia Puga 635',
  ciudad: 'Cajamarca',
  pais: 'Peru',
  telefono: '+51 976 123 456',
  telefono_secundario: '+51 976 654 321',
  email: 'info@adventurhotels.com',
  email_reservas: 'reservas@adventurhotels.com',
  sitio_web: '',
  facebook: 'https://facebook.com/adventurhotels',
  instagram: 'https://instagram.com/adventurhotels',
  twitter: '',
  politica_cancelacion: 'Las cancelaciones deben realizarse con al menos 48 horas de anticipacion.',
  politica_checkin: 'El check-in inicia a las 14:00 y el check-out finaliza a las 12:00.',
  hora_checkin: '14:00',
  hora_checkout: '12:00',
  moneda: 'PEN',
  porcentaje_adelanto: 30,
  ruc: '',
  razon_social: '',
}

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\/.+/i.test(value), 'Ingresa una URL valida')

const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === '' || z.string().email().safeParse(value).success, 'Ingresa un email valido')

const optionalPhone = z
  .string()
  .trim()
  .refine((value) => value === '' || value.replace(/\D/g, '').length >= 9, 'Ingresa un telefono valido')

export const siteConfigSchema = z.object({
  nombre_hotel: z.string().trim().min(3, 'Escribe un nombre de hotel valido').max(120, 'Nombre demasiado largo'),
  slogan: z.string().trim().max(120, 'Slogan demasiado largo'),
  descripcion: z.string().trim().max(1000, 'Descripcion demasiado larga'),
  direccion: z.string().trim().max(200, 'Direccion demasiado larga'),
  ciudad: z.string().trim().max(80, 'Ciudad demasiado larga'),
  pais: z.string().trim().max(80, 'Pais demasiado largo'),
  telefono: optionalPhone,
  telefono_secundario: optionalPhone,
  email: optionalEmail,
  email_reservas: optionalEmail,
  sitio_web: optionalUrl,
  facebook: optionalUrl,
  instagram: optionalUrl,
  twitter: optionalUrl,
  politica_cancelacion: z.string().trim().max(2000, 'Politica de cancelacion demasiado larga'),
  politica_checkin: z.string().trim().max(2000, 'Politica de check-in demasiado larga'),
  hora_checkin: z.string().regex(/^\d{2}:\d{2}$/, 'Hora de check-in invalida'),
  hora_checkout: z.string().regex(/^\d{2}:\d{2}$/, 'Hora de check-out invalida'),
  moneda: z.enum(['PEN', 'USD', 'EUR']),
  porcentaje_adelanto: z.number().min(0, 'El adelanto no puede ser menor a 0').max(100, 'El adelanto no puede superar 100'),
  ruc: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{11}$/.test(value), 'El RUC debe tener 11 digitos'),
  razon_social: z.string().trim().max(160, 'Razon social demasiado larga'),
})

export type SiteConfigInput = z.infer<typeof siteConfigSchema>
export type SiteConfigFieldErrors = Partial<Record<keyof SiteConfigInput, string>>

export function normalizeSiteConfig(config?: Partial<SiteConfig> | null): SiteConfig {
  return {
    ...defaultSiteConfig,
    ...(config ?? {}),
    porcentaje_adelanto:
      typeof config?.porcentaje_adelanto === 'number'
        ? config.porcentaje_adelanto
        : Number(config?.porcentaje_adelanto ?? defaultSiteConfig.porcentaje_adelanto),
  }
}

export function toSiteConfigFieldErrors(error: z.ZodError<SiteConfigInput>): SiteConfigFieldErrors {
  const fields = error.flatten().fieldErrors

  return {
    nombre_hotel: fields.nombre_hotel?.[0],
    slogan: fields.slogan?.[0],
    descripcion: fields.descripcion?.[0],
    direccion: fields.direccion?.[0],
    ciudad: fields.ciudad?.[0],
    pais: fields.pais?.[0],
    telefono: fields.telefono?.[0],
    telefono_secundario: fields.telefono_secundario?.[0],
    email: fields.email?.[0],
    email_reservas: fields.email_reservas?.[0],
    sitio_web: fields.sitio_web?.[0],
    facebook: fields.facebook?.[0],
    instagram: fields.instagram?.[0],
    twitter: fields.twitter?.[0],
    politica_cancelacion: fields.politica_cancelacion?.[0],
    politica_checkin: fields.politica_checkin?.[0],
    hora_checkin: fields.hora_checkin?.[0],
    hora_checkout: fields.hora_checkout?.[0],
    moneda: fields.moneda?.[0],
    porcentaje_adelanto: fields.porcentaje_adelanto?.[0],
    ruc: fields.ruc?.[0],
    razon_social: fields.razon_social?.[0],
  }
}

export function getWhatsappPhone(config: Pick<SiteConfig, 'telefono'>) {
  return config.telefono.replace(/\D/g, '') || '51976123456'
}

export function getFullAddress(config: Pick<SiteConfig, 'direccion' | 'ciudad' | 'pais'>) {
  return [config.direccion, config.ciudad, config.pais].filter(Boolean).join(', ')
}
