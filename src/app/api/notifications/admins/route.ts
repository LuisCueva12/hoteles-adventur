import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!isNotifyBody(body)) {
      return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: admins, error: adminsError } = await admin
      .from('usuarios')
      .select('id')
      .eq('rol', 'admin_adventur')

    if (adminsError) {
      return NextResponse.json({ error: adminsError.message }, { status: 500 })
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, inserted: notifications.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
