import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/utils/supabase/admin'

interface CreateUserBody {
  email: string
  password: string
  nombre: string
  apellido: string
  telefono?: string
  documento_identidad?: string
  tipo_documento?: string
  pais?: string
  rol: 'turista' | 'propietario' | 'admin'
}

function isValidBody(body: unknown): body is CreateUserBody {
  if (!body || typeof body !== 'object') return false
  const candidate = body as Record<string, unknown>

  return (
    typeof candidate.email === 'string' &&
    typeof candidate.password === 'string' &&
    typeof candidate.nombre === 'string' &&
    typeof candidate.apellido === 'string' &&
    typeof candidate.rol === 'string'
  )
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdminUser()
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  try {
    const body = await request.json()
    if (!isValidBody(body)) {
      return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
    }

    const payload = {
      email: body.email.trim().toLowerCase(),
      password: body.password,
      nombre: body.nombre.trim(),
      apellido: body.apellido.trim(),
      telefono: body.telefono?.trim() || null,
      documento_identidad: body.documento_identidad?.trim() || null,
      tipo_documento: body.tipo_documento?.trim() || null,
      pais: body.pais?.trim() || null,
      rol: body.rol,
    }

    if (!payload.email || !payload.password || !payload.nombre || !payload.apellido) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (payload.password.length < 6) {
      return NextResponse.json({ error: 'La contrasena debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const admin = createAdminClient()
    
    // Test connectivity/key validity
    const { error: testError } = await admin.from('usuarios').select('id').limit(1)
    if (testError && testError.message.includes('Invalid API key')) {
        console.error('[API Create User] Key test failed:', testError.message)
        return NextResponse.json({ error: 'La clave de rol de servicio (SERVICE_ROLE_KEY) es inválida o ha expirado.' }, { status: 401 })
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        nombre: payload.nombre,
        apellido: payload.apellido,
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'No se pudo crear el usuario' }, { status: 400 })
    }

    const { error: profileError } = await admin
      .from('usuarios')
      .upsert({
        id: authData.user.id,
        email: payload.email,
        nombre: payload.nombre,
        apellido: payload.apellido,
        telefono: payload.telefono,
        documento_identidad: payload.documento_identidad,
        tipo_documento: payload.tipo_documento,
        pais: payload.pais,
        rol: payload.rol,
        verificado: true,
      })

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: payload.email,
        nombre: payload.nombre,
        apellido: payload.apellido,
        rol: payload.rol,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
