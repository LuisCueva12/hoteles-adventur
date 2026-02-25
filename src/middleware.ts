import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Rutas que requieren sesion activa
const PROTECTED = ['/reservas', '/pagos', '/perfil', '/admin']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const { supabaseResponse, user } = await updateSession(request)

    const isProtected = PROTECTED.some((p) => pathname.startsWith(p))

    // Sin sesion en ruta protegida → /login
    if (!user && isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
