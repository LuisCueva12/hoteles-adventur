import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}

// GET: obtener opiniones de un alojamiento
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const alojamiento_id = searchParams.get('alojamiento_id')

    if (!alojamiento_id) {
        return NextResponse.json({ error: 'alojamiento_id requerido' }, { status: 400 })
    }

    const client = getAdminClient()
    const { data, error } = await client
        .from('opiniones')
        // NOTA: la tabla NO tiene columna nombre_autor, se usa usuarios.nombre/apellido
        .select('id, calificacion, comentario, fecha, usuario_id, usuarios:usuario_id ( nombre, apellido )')
        .eq('alojamiento_id', alojamiento_id)
        .order('fecha', { ascending: false })

    if (error) {
        console.error('GET /api/resenas error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
}

// POST: crear opinión (anónima o autenticada)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { alojamiento_id, calificacion, comentario, usuario_id } = body

        if (!alojamiento_id || !calificacion || !comentario?.trim()) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        if (calificacion < 1 || calificacion > 5) {
            return NextResponse.json({ error: 'Calificación inválida' }, { status: 400 })
        }

        const client = getAdminClient()

        const insertData: Record<string, unknown> = {
            alojamiento_id,
            calificacion: Number(calificacion),
            comentario: comentario.trim(),
            fecha: new Date().toISOString(),
        }

        // usuario_id es nullable: incluirlo solo si viene
        if (usuario_id) {
            insertData.usuario_id = usuario_id
        }

        const { data, error } = await client
            .from('opiniones')
            .insert([insertData])
            .select('id, calificacion, comentario, fecha, usuario_id, usuarios:usuario_id ( nombre, apellido )')
            .single()

        if (error) {
            console.error('POST /api/resenas error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        console.error('API /resenas error:', err)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
