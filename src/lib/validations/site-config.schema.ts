import { z } from 'zod'

export const hotelIdentitySchema = z.object({
  nombre: z.string().min(3).max(120),
  slogan: z.string().max(120),
  descripcion: z.string().max(1000),
})

export const contactInfoSchema = z.object({
  direccion: z.string().max(200),
  ciudad: z.string().max(80),
  pais: z.string().max(80),
  telefono: z.string(),
  telefono_secundario: z.string().optional(),
  email: z.string().email(),
  email_reservas: z.string().email(),
  redes_sociales: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    sitio_web: z.string().url().optional().or(z.literal('')),
  })
})

export const businessPoliciesSchema = z.object({
  cancelacion: z.string().max(2000),
  checkinout: z.string().max(2000),
  hora_checkin: z.string().regex(/^\d{2}:\d{2}$/),
  hora_checkout: z.string().regex(/^\d{2}:\d{2}$/),
  moneda: z.enum(['PEN', 'USD', 'EUR']),
  porcentaje_adelanto: z.number().min(0).max(100),
})

export const legalInfoSchema = z.object({
  ruc: z.string().length(11).optional().or(z.literal('')),
  razon_social: z.string().max(160).optional().or(z.literal('')),
})

export const systemSettingsSchema = z.object({
  modo_mantenimiento: z.boolean().default(false),
  mensaje_mantenimiento: z.string().max(500).default(''),
  fecha_reanudacion: z.string().optional(),
  mostrar_contador: z.boolean().default(false),
  permitir_admin: z.boolean().default(true),
})

export const siteConfigSchema = z.object({
  identity: hotelIdentitySchema,
  contact: contactInfoSchema,
  policies: businessPoliciesSchema,
  legal: legalInfoSchema,
  system: systemSettingsSchema,
})

export type SiteConfig = z.infer<typeof siteConfigSchema>

export const defaultSiteConfig: SiteConfig = {
  identity: {
    nombre: 'Hotel Adventur',
    slogan: 'Tu viaje, tu hogar',
    descripcion: '',
  },
  contact: {
    direccion: 'Jr. Amalia Puga 635',
    ciudad: 'Cajamarca',
    pais: 'Peru',
    telefono: '+51 976 123 456',
    telefono_secundario: '+51 976 654 321',
    email: 'info@adventurhotels.com',
    email_reservas: 'reservas@adventurhotels.com',
    redes_sociales: {
      facebook: 'https://facebook.com/adventurhotels',
      instagram: 'https://instagram.com/adventurhotels',
      twitter: '',
      sitio_web: '',
    },
  },
  policies: {
    cancelacion: 'Las cancelaciones deben realizarse con al menos 48 horas de anticipacion.',
    checkinout: 'El check-in inicia a las 14:00 y el check-out finaliza a las 12:00.',
    hora_checkin: '14:00',
    hora_checkout: '12:00',
    moneda: 'PEN',
    porcentaje_adelanto: 30,
  },
  legal: {
    ruc: '',
    razon_social: '',
  },
  system: {
    modo_mantenimiento: false,
    mensaje_mantenimiento: 'Estamos realizando mejoras para brindarte un mejor servicio. Volveremos pronto.',
    fecha_reanudacion: '',
    mostrar_contador: false,
    permitir_admin: true,
  },
}
