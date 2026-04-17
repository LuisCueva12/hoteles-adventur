import type { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import { siteConfigSchema, defaultSiteConfig, type SiteConfig } from '@/lib/validations/site-config.schema'

export class SiteConfigRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase)
  }

  async getConfig(): Promise<SiteConfig> {
    const { data, error } = await this.supabase
      .from('configuracion')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return defaultSiteConfig
    }

    return this.mapToDomain(data)
  }

  private mapToDomain(row: any): SiteConfig {
    const domainModel: SiteConfig = {
      identity: {
        nombre: row.nombre_hotel || defaultSiteConfig.identity.nombre,
        slogan: row.slogan || defaultSiteConfig.identity.slogan,
        descripcion: row.descripcion || defaultSiteConfig.identity.descripcion,
      },
      contact: {
        direccion: row.direccion || defaultSiteConfig.contact.direccion,
        ciudad: row.ciudad || defaultSiteConfig.contact.ciudad,
        pais: row.pais || defaultSiteConfig.contact.pais,
        telefono: row.telefono || defaultSiteConfig.contact.telefono,
        telefono_secundario: row.telefono_secundario,
        email: row.email || defaultSiteConfig.contact.email,
        email_reservas: row.email_reservas || defaultSiteConfig.contact.email_reservas,
        redes_sociales: {
          facebook: row.facebook,
          instagram: row.instagram,
          twitter: row.twitter,
          sitio_web: row.sitio_web,
        },
      },
      policies: {
        cancelacion: row.politica_cancelacion || defaultSiteConfig.policies.cancelacion,
        checkinout: row.politica_checkin || defaultSiteConfig.policies.checkinout,
        hora_checkin: row.hora_checkin || defaultSiteConfig.policies.hora_checkin,
        hora_checkout: row.hora_checkout || defaultSiteConfig.policies.hora_checkout,
        moneda: row.moneda || defaultSiteConfig.policies.moneda,
        porcentaje_adelanto: row.porcentaje_adelanto ?? defaultSiteConfig.policies.porcentaje_adelanto,
      },
      legal: {
        ruc: row.ruc,
        razon_social: row.razon_social,
      },
      system: {
        modo_mantenimiento: !!row.modo_mantenimiento,
        mensaje_mantenimiento: row.mensaje_mantenimiento || defaultSiteConfig.system.mensaje_mantenimiento,
        fecha_reanudacion: row.fecha_reanudacion,
        mostrar_contador: !!row.mostrar_contador,
        permitir_admin: row.permitir_admin ?? defaultSiteConfig.system.permitir_admin,
      },
    }

    const result = siteConfigSchema.safeParse(domainModel)
    return result.success ? result.data : defaultSiteConfig
  }

  static getWhatsappPhone(config: SiteConfig) {
    return config.contact.telefono.replace(/\D/g, '') || '51976123456'
  }

  static getFullAddress(config: SiteConfig) {
    const { direccion, ciudad, pais } = config.contact
    return [direccion, ciudad, pais].filter(Boolean).join(', ')
  }

  async updateConfig(config: SiteConfig): Promise<SiteConfig> {
    const payload = this.mapToRow(config)
    const { data: current } = await this.supabase.from('configuracion').select('id').limit(1).maybeSingle()

    if (current?.id) {
      const { data, error } = await this.supabase
        .from('configuracion')
        .update(payload)
        .eq('id', current.id)
        .select('*')
        .single()
      if (error) throw error
      return this.mapToDomain(data)
    }

    const { data, error } = await this.supabase
      .from('configuracion')
      .insert([payload])
      .select('*')
      .single()
    if (error) throw error
    return this.mapToDomain(data)
  }

  private mapToRow(config: SiteConfig) {
    return {
      nombre_hotel: config.identity.nombre,
      slogan: config.identity.slogan,
      descripcion: config.identity.descripcion,
      direccion: config.contact.direccion,
      ciudad: config.contact.ciudad,
      pais: config.contact.pais,
      telefono: config.contact.telefono,
      telefono_secundario: config.contact.telefono_secundario,
      email: config.contact.email,
      email_reservas: config.contact.email_reservas,
      facebook: config.contact.redes_sociales.facebook,
      instagram: config.contact.redes_sociales.instagram,
      twitter: config.contact.redes_sociales.twitter,
      sitio_web: config.contact.redes_sociales.sitio_web,
      politica_cancelacion: config.policies.cancelacion,
      politica_checkin: config.policies.checkinout,
      hora_checkin: config.policies.hora_checkin,
      hora_checkout: config.policies.hora_checkout,
      moneda: config.policies.moneda,
      porcentaje_adelanto: config.policies.porcentaje_adelanto,
      ruc: config.legal.ruc,
      razon_social: config.legal.razon_social,
      modo_mantenimiento: config.system.modo_mantenimiento,
      mensaje_mantenimiento: config.system.mensaje_mantenimiento,
      fecha_reanudacion: config.system.fecha_reanudacion,
      mostrar_contador: config.system.mostrar_contador,
      permitir_admin: config.system.permitir_admin,
    }
  }
}
