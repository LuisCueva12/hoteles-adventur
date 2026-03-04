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

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    try {
        const { supabaseResponse, user, supabase } = await updateSession(request)

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

        // PROTECCIÓN: Si no hay usuario y la ruta no es pública
        if (!user && !isPublicRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('redirect', pathname)
            return NextResponse.redirect(url)
        }

        // PROTECCIÓN: Rutas de API protegidas
        if (isProtectedAPI && !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // PROTECCIÓN: Rutas de administrador
        if (user && isAdminRoute) {
            try {
                const { data: userData, error } = await supabase
                    .from('usuarios')
                    .select('rol')
                    .eq('id', user.id)
                    .single()

                // Si hay error o el usuario no es admin, redirigir
                if (error || !userData || userData.rol !== 'admin_adventur') {
                    console.warn(`Acceso denegado a ${pathname} para usuario ${user.id}`)
                    const url = request.nextUrl.clone()
                    url.pathname = '/'
                    url.searchParams.set('error', 'unauthorized')
                    return NextResponse.redirect(url)
                }
            } catch (error) {
                console.error('Error verificando rol de admin:', error)
                const url = request.nextUrl.clone()
                url.pathname = '/'
                url.searchParams.set('error', 'auth_error')
                return NextResponse.redirect(url)
            }
        }

        // PROTECCIÓN: Rutas de usuario autenticado
        if (user && isUserRoute) {
            try {
                // Verificar que el usuario existe en la base de datos
                const { data: userData, error } = await supabase
                    .from('usuarios')
                    .select('id, rol, activo')
                    .eq('id', user.id)
                    .single()

                if (error || !userData) {
                    console.warn(`Usuario ${user.id} no encontrado en la base de datos`)
                    const url = request.nextUrl.clone()
                    url.pathname = '/login'
                    url.searchParams.set('error', 'user_not_found')
                    return NextResponse.redirect(url)
                }

                // Verificar que el usuario está activo
                if (!userData.activo) {
                    console.warn(`Usuario ${user.id} está inactivo`)
                    const url = request.nextUrl.clone()
                    url.pathname = '/'
                    url.searchParams.set('error', 'account_inactive')
                    return NextResponse.redirect(url)
                }
            } catch (error) {
                console.error('Error verificando usuario:', error)
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                url.searchParams.set('error', 'auth_error')
                return NextResponse.redirect(url)
            }
        }

        // Si el usuario está autenticado y trata de acceder a /login, redirigir
        if (user && pathname === '/login') {
            const url = request.nextUrl.clone()
            
            // Si es admin, redirigir al dashboard de admin
            try {
                const { data: userData } = await supabase
                    .from('usuarios')
                    .select('rol')
                    .eq('id', user.id)
                    .single()

                if (userData?.rol === 'admin_adventur') {
                    url.pathname = '/admin'
                } else {
                    url.pathname = '/'
                }
            } catch {
                url.pathname = '/'
            }
            
            return NextResponse.redirect(url)
        }

        return supabaseResponse
    } catch (error) {
        console.error('Error en middleware:', error)
        // En caso de error, permitir acceso a rutas públicas
        const isPublicRoute = PUBLIC_ROUTES.some(route => 
            pathname === route || pathname.startsWith(`${route}/`)
        )
        
        if (!isPublicRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('error', 'middleware_error')
            return NextResponse.redirect(url)
        }
        
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
