/**
 * Servicio de integración con NubeFact API
 * Documentación: https://www.nubefact.com/api
 */

interface NubefactConfig {
  ruc: string
  usuario: string
  token: string
  url: string
}

interface ClienteData {
  tipo_documento: '1' | '6' // 1: DNI, 6: RUC
  numero_documento: string
  denominacion: string
  direccion: string
  email?: string
  telefono?: string
}

interface ItemFactura {
  unidad_de_medida: string // NIU, ZZ, etc
  codigo: string
  descripcion: string
  cantidad: number
  valor_unitario: number
  precio_unitario: number
  descuento?: number
  subtotal: number
  tipo_de_igv: number // 1: Gravado, 2: Exonerado, 3: Inafecto
  igv: number
  total: number
  anticipo_regularizacion?: boolean
}

interface FacturaData {
  operacion: 'generar_comprobante' | 'generar_guia' | 'consultar_comprobante'
  tipo_de_comprobante: 1 | 2 | 3 // 1: Factura, 2: Boleta, 3: Nota de crédito
  serie: string
  numero: number
  sunat_transaction?: 1 | 2 // 1: Venta interna, 2: Exportación
  cliente_tipo_de_documento: '1' | '6'
  cliente_numero_de_documento: string
  cliente_denominacion: string
  cliente_direccion: string
  cliente_email?: string
  cliente_email_1?: string
  cliente_email_2?: string
  fecha_de_emision: string // YYYY-MM-DD
  fecha_de_vencimiento?: string
  moneda: 1 | 2 // 1: Soles, 2: Dólares
  tipo_de_cambio?: number
  porcentaje_de_igv: number // 18.00
  descuento_global?: number
  total_descuento?: number
  total_anticipo?: number
  total_gravada: number
  total_inafecta?: number
  total_exonerada?: number
  total_igv: number
  total_gratuita?: number
  total_otros_cargos?: number
  total: number
  percepcion_tipo?: string
  percepcion_base_imponible?: number
  total_percepcion?: number
  total_incluido_percepcion?: number
  detraccion?: boolean
  observaciones?: string
  documento_que_se_modifica_tipo?: string
  documento_que_se_modifica_serie?: string
  documento_que_se_modifica_numero?: string
  tipo_de_nota_de_credito?: string
  tipo_de_nota_de_debito?: string
  enviar_automaticamente_a_la_sunat: boolean
  enviar_automaticamente_al_cliente: boolean
  codigo_unico?: string
  condiciones_de_pago?: string
  medio_de_pago?: string
  placa_vehiculo?: string
  orden_compra_servicio?: string
  tabla_personalizada_codigo?: string
  formato_de_pdf?: string
  items: ItemFactura[]
}

interface NubefactResponse {
  errors?: string
  sunat_description?: string
  sunat_note?: string
  sunat_responsecode?: string
  sunat_soap_error?: string
  pdf_zip_base64?: string
  xml_zip_base64?: string
  cdr_zip_base64?: string
  enlace_del_pdf?: string
  enlace_del_xml?: string
  enlace_del_cdr?: string
  aceptada_por_sunat: boolean
  sunat_transaction_id?: string
  hash_cpe?: string
  hash_cdr?: string
  numero_comprobante?: string
}

class NubefactService {
  private config: NubefactConfig

  constructor() {
    this.config = {
      ruc: process.env.NUBEFACT_RUC || '',
      usuario: process.env.NUBEFACT_USUARIO || '',
      token: process.env.NUBEFACT_TOKEN || '',
      url: process.env.NUBEFACT_URL || 'https://api.nubefact.com/api/v1'
    }
  }

  /**
   * Genera una factura electrónica
   */
  async generarFactura(data: Partial<FacturaData>): Promise<NubefactResponse> {
    // Obtener la fecha actual en zona horaria de Perú (UTC-5)
    const now = new Date()
    const peruTime = new Date(now.getTime() - 5*60*60*1000)
    const fechaEmision = peruTime.toISOString().split('T')[0]

    const facturaCompleta: FacturaData = {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: 1, // Factura
      serie: data.serie || 'F001',
      numero: data.numero || 1,
      sunat_transaction: 1,
      cliente_tipo_de_documento: data.cliente_tipo_de_documento || '6',
      cliente_numero_de_documento: data.cliente_numero_de_documento || '',
      cliente_denominacion: data.cliente_denominacion || '',
      cliente_direccion: data.cliente_direccion || '',
      cliente_email: data.cliente_email,
      fecha_de_emision: fechaEmision,
      moneda: 1, // Soles
      porcentaje_de_igv: 18.00,
      total_gravada: data.total_gravada || 0,
      total_igv: data.total_igv || 0,
      total: data.total || 0,
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: data.cliente_email ? true : false,
      items: data.items || []
    }

    return this.enviarComprobante(facturaCompleta)
  }

  /**
   * Genera una boleta electrónica
   */
  async generarBoleta(data: Partial<FacturaData>): Promise<NubefactResponse> {
    // Obtener la fecha actual en zona horaria de Perú (UTC-5)
    const now = new Date()
    const peruTime = new Date(now.getTime() - 5*60*60*1000)
    const fechaEmision = peruTime.toISOString().split('T')[0]

    const boletaCompleta: FacturaData = {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: 2, // Boleta
      serie: data.serie || 'B001',
      numero: data.numero || 1,
      sunat_transaction: 1,
      cliente_tipo_de_documento: data.cliente_tipo_de_documento || '1',
      cliente_numero_de_documento: data.cliente_numero_de_documento || '',
      cliente_denominacion: data.cliente_denominacion || '',
      cliente_direccion: data.cliente_direccion || '',
      cliente_email: data.cliente_email,
      fecha_de_emision: fechaEmision,
      moneda: 1, // Soles
      porcentaje_de_igv: 18.00,
      total_gravada: data.total_gravada || 0,
      total_igv: data.total_igv || 0,
      total: data.total || 0,
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: data.cliente_email ? true : false,
      items: data.items || []
    }

    return this.enviarComprobante(boletaCompleta)
  }

  /**
   * Genera una nota de crédito
   */
  async generarNotaCredito(data: Partial<FacturaData>): Promise<NubefactResponse> {
    const notaCompleta: FacturaData = {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: 3, // Nota de crédito
      serie: data.serie || 'NC01',
      numero: data.numero || 1,
      sunat_transaction: 1,
      cliente_tipo_de_documento: data.cliente_tipo_de_documento || '6',
      cliente_numero_de_documento: data.cliente_numero_de_documento || '',
      cliente_denominacion: data.cliente_denominacion || '',
      cliente_direccion: data.cliente_direccion || '',
      cliente_email: data.cliente_email,
      fecha_de_emision: data.fecha_de_emision || new Date().toISOString().split('T')[0],
      moneda: 1,
      porcentaje_de_igv: 18.00,
      total_gravada: data.total_gravada || 0,
      total_igv: data.total_igv || 0,
      total: data.total || 0,
      documento_que_se_modifica_tipo: data.documento_que_se_modifica_tipo || '01',
      documento_que_se_modifica_serie: data.documento_que_se_modifica_serie || '',
      documento_que_se_modifica_numero: data.documento_que_se_modifica_numero || '',
      tipo_de_nota_de_credito: data.tipo_de_nota_de_credito || '01',
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: data.cliente_email ? true : false,
      items: data.items || []
    }

    return this.enviarComprobante(notaCompleta)
  }

  /**
   * Consulta un comprobante existente
   */
  async consultarComprobante(tipo: number, serie: string, numero: number): Promise<NubefactResponse> {
    const url = `${this.config.url}/consultar_comprobante`
    
    const data = {
      operacion: 'consultar_comprobante',
      tipo_de_comprobante: tipo,
      serie: serie,
      numero: numero
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token token="${this.config.token}"`
        },
        body: JSON.stringify(data)
      })

      return await response.json()
    } catch (error) {
      console.error('Error consultando comprobante:', error)
      throw error
    }
  }

  /**
   * Envía el comprobante a NubeFact
   */
  private async enviarComprobante(data: FacturaData): Promise<NubefactResponse> {
    // La URL ya incluye el endpoint completo con el identificador único
    const url = this.config.url

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token token="${this.config.token}"`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors)
      }

      return result
    } catch (error) {
      console.error('Error enviando comprobante:', error)
      throw error
    }
  }

  /**
   * Calcula el IGV (18%)
   */
  calcularIGV(subtotal: number): number {
    return Number((subtotal * 0.18).toFixed(2))
  }

  /**
   * Calcula el total con IGV
   */
  calcularTotal(subtotal: number): number {
    return Number((subtotal * 1.18).toFixed(2))
  }

  /**
   * Genera items desde una reserva
   */
  generarItemsDesdeReserva(reserva: any): ItemFactura[] {
    const subtotal = Number((reserva.total / 1.18).toFixed(2))
    const igv = this.calcularIGV(subtotal)

    return [
      {
        unidad_de_medida: 'NIU',
        codigo: `HAB-${reserva.alojamiento_id}`,
        descripcion: `Reserva de alojamiento - ${reserva.alojamiento?.nombre || 'Habitación'}`,
        cantidad: 1,
        valor_unitario: subtotal,
        precio_unitario: reserva.total,
        subtotal: subtotal,
        tipo_de_igv: 1, // Gravado
        igv: igv,
        total: reserva.total,
        anticipo_regularizacion: false
      }
    ]
  }
}

export default NubefactService
export type { FacturaData, ItemFactura, NubefactResponse, ClienteData }
