import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

interface NotifyAdminsBody {
  tipo: 'success' | 'warning' | 'info' | 'error'
  titulo: string
  mensaje: string
  url?: string
  metadata?: unknown
}

function isNotifyBody(body: unknown): body is NotifyAdminsBody {
  if (!body || typeof body !== 'object') return false
  const candidate = body as Record<string, unknown>
  return (
    typeof candidate.tipo === 'string' &&
    typeof candidate.titulo === 'string' &&
    typeof candidate.mensaje === 'string'
  )
}

export async function POST(request: NextRequest) {
  // Verificar sesión del solicitante
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!isNotifyBody(body)) {
      return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
    }

    // Usar service role para saltarse RLS
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceKey || !supabaseUrl) {
      // Sin service key, no podemos notificar — fallo silencioso
      return NextResponse.json({ success: true, inserted: 0, note: 'service key not configured' })
    }

    const admin = createServiceClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    })

    // Obtener admins
    const { data: admins, error: adminsError } = await admin
      .from('usuarios')
      .select('id')
      .eq('rol', 'admin')

    if (adminsError) {
      // Fallo silencioso — no bloquear el flujo principal
      return NextResponse.json({ success: true, inserted: 0, note: adminsError.message })
    }

    if (!admins || admins.length === 0) {
      return NextResponse.json({ success: true, inserted: 0 })
    }

    const notifications = admins.map((adminUser) => ({
      usuario_id: adminUser.id,
      tipo: body.tipo,
      titulo: body.titulo.trim(),
      mensaje: body.mensaje.trim(),
      url: body.url?.trim() || null,
      metadata: body.metadata ?? null,
      leida: false,
    }))

    const { error } = await admin.from('notificaciones').insert(notifications)
    if (error) {
      // Fallo silencioso
      return NextResponse.json({ success: true, inserted: 0, note: error.message })
    }

    return NextResponse.json({ success: true, inserted: notifications.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ success: true, inserted: 0, note: message })
  }
}
