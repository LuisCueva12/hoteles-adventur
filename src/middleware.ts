import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/hoteles',
    '/nosotros',
    '/servicios',
    '/contacto',
    '/galeria',
    '/privacidad',
    '/terminos'
]

// Rutas que requieren autenticación de usuario
const USER_ROUTES = ['/reservas', '/pagos', '/perfil']

// Rutas que solo pueden acceder administradores
const ADMIN_ROUTES = ['/admin']

// Rutas de API que requieren autenticación
const API_PROTECTED_ROUTES = ['/api/nubefact', '/api/admin']

// Headers de seguridad
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    try {
        const { supabaseResponse, user, supabase } = await updateSession(request)

        // Aplicar headers de seguridad
        Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value)
        })

        // Verificar si es una ruta pública
        const isPublicRoute = PUBLIC_ROUTES.some(route => 
            pathname === route || pathname.startsWith(`${route}/`)
        )

        // Verificar si es una ruta de usuario autenticado
        const isUserRoute = USER_ROUTES.some(route => 
            pathname.startsWith(route)
        )

        // Verificar si es una ruta de admin
        const isAdminRoute = ADMIN_ROUTES.some(route => 
            pathname.startsWith(route)
        )

        // Verificar si es una ruta de API protegida
        const isProtectedAPI = API_PROTECTED_ROUTES.some(route => 
            pathname.startsWith(route)
        )

        // Si es ruta pública, permitir acceso
        if (isPublicRoute && !isAdminRoute && !isUserRoute) {
            return supabaseResponse
        }

        // Si no hay usuario y la ruta requiere autenticación
        if (!user && (isUserRoute || isAdminRoute || isProtectedAPI)) {
            if (isProtectedAPI) {
                return NextResponse.json(
                    { error: 'No autenticado' },
                    { status: 401 }
                )
            }
            
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Si hay usuario y es ruta de admin, verificar permisos
        if (user && isAdminRoute) {
            const { data: userData, error } = await supabase
                .from('usuarios')
                .select('rol')
                .eq('id', user.id)
                .maybeSingle()

            if (error || !userData) {
                console.warn('User not found in database:', user.id)
                return NextResponse.redirect(new URL('/acceso-denegado', request.url))
            }

            if (userData.rol !== 'admin_adventur') {
                console.warn('Unauthorized admin access attempt:', user.id, userData.rol)
                return NextResponse.redirect(new URL('/acceso-denegado', request.url))
            }
        }

        // Si usuario autenticado intenta acceder a login, redirigir
        if (user && pathname === '/login') {
            const { data: userData } = await supabase
                .from('usuarios')
                .select('rol')
                .eq('id', user.id)
                .maybeSingle()

            const redirectUrl = userData?.rol === 'admin_adventur' ? '/admin' : '/perfil'
            return NextResponse.redirect(new URL(redirectUrl, request.url))
        }

        return supabaseResponse
    } catch (error) {
        console.error('Middleware error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
