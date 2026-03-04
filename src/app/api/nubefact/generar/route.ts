import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import NubefactService from '@/services/nubefact.service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario existe y está activo
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, activo')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (!userData.activo) {
      return NextResponse.json({ error: 'Cuenta inactiva' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      tipo_comprobante, // 'factura', 'boleta', 'nota_credito'
      reserva_id,
      cliente_tipo_documento,
      cliente_numero_documento,
      cliente_denominacion,
      cliente_direccion,
      cliente_email
    } = body

    // Obtener datos de la reserva
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .select(`
        *,
        alojamiento:alojamientos(*)
      `)
      .eq('id', reserva_id)
      .single()

    if (reservaError || !reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    // Verificar que la reserva pertenece al usuario
    if (reserva.usuario_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para generar comprobante de esta reserva' }, { status: 403 })
    }

    // Inicializar servicio de NubeFact
    const nubefactService = new NubefactService()

    // Generar items
    const items = nubefactService.generarItemsDesdeReserva(reserva)

    // Calcular totales
    const subtotal = Number((reserva.total / 1.18).toFixed(2))
    const igv = nubefactService.calcularIGV(subtotal)

    // Obtener el siguiente número de comprobante
    const { data: ultimoComprobante } = await supabase
      .from('comprobantes')
      .select('numero')
      .eq('tipo', tipo_comprobante)
      .order('numero', { ascending: false })
      .limit(1)
      .single()

    const siguienteNumero = ultimoComprobante ? ultimoComprobante.numero + 1 : 1

    // Preparar datos del comprobante
    const datosComprobante = {
      serie: tipo_comprobante === 'factura' ? 'F001' : tipo_comprobante === 'boleta' ? 'B001' : 'NC01',
      numero: siguienteNumero,
      cliente_tipo_de_documento: cliente_tipo_documento,
      cliente_numero_de_documento: cliente_numero_documento,
      cliente_denominacion: cliente_denominacion,
      cliente_direccion: cliente_direccion,
      cliente_email: cliente_email,
      total_gravada: subtotal,
      total_igv: igv,
      total: reserva.total,
      items: items
    }

    // Generar comprobante según tipo
    let resultado
    if (tipo_comprobante === 'factura') {
      resultado = await nubefactService.generarFactura(datosComprobante)
    } else if (tipo_comprobante === 'boleta') {
      resultado = await nubefactService.generarBoleta(datosComprobante)
    } else if (tipo_comprobante === 'nota_credito') {
      resultado = await nubefactService.generarNotaCredito(datosComprobante)
    } else {
      return NextResponse.json({ error: 'Tipo de comprobante inválido' }, { status: 400 })
    }

    // Guardar comprobante en la base de datos
    const { data: comprobanteGuardado, error: errorGuardar } = await supabase
      .from('comprobantes')
      .insert({
        tipo: tipo_comprobante,
        serie: datosComprobante.serie,
        numero: siguienteNumero,
        reserva_id: reserva_id,
        usuario_id: user.id,
        cliente_tipo_documento: cliente_tipo_documento,
        cliente_numero_documento: cliente_numero_documento,
        cliente_denominacion: cliente_denominacion,
        subtotal: subtotal,
        igv: igv,
        total: reserva.total,
        aceptada_sunat: resultado.aceptada_por_sunat,
        enlace_pdf: resultado.enlace_del_pdf,
        enlace_xml: resultado.enlace_del_xml,
        enlace_cdr: resultado.enlace_del_cdr,
        hash_cpe: resultado.hash_cpe,
        sunat_transaction_id: resultado.sunat_transaction_id,
        sunat_description: resultado.sunat_description,
        sunat_note: resultado.sunat_note
      })
      .select()
      .single()

    if (errorGuardar) {
      console.error('Error guardando comprobante:', errorGuardar)
    }

    return NextResponse.json({
      success: true,
      comprobante: comprobanteGuardado,
      nubefact: resultado
    })

  } catch (error: any) {
    console.error('Error generando comprobante:', error)
    return NextResponse.json(
      { error: error.message || 'Error generando comprobante' },
      { status: 500 }
    )
  }
}
