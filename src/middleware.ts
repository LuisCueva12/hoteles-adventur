import { type NextRequest, NextResponse } from 'next/server'
import { actualizarSesion } from '@/utils/supabase/middleware'

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
        const { supabaseResponse, user, supabase } = await actualizarSesion(request)

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

            if (error) {
                console.warn('Database error checking user role:', error)
                console.log('Permitiendo acceso temporal en desarrollo')
                return supabaseResponse
            }

            if (!userData) {
                console.warn('User not found in database:', user.id)
                console.log('Creando usuario en base de datos...')
                
                const { error: insertError } = await supabase
                    .from('usuarios')
                    .insert({
                        id: user.id,
                        email: user.email || '',
                        nombre: user.email?.split('@')[0] || 'Admin',
                        apellido: 'Usuario',
                        rol: 'admin_adventur',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })

                if (insertError) {
                    console.error('Error creating user:', insertError)
                    return NextResponse.redirect(new URL('/acceso-denegado', request.url))
                }

                console.log('Usuario creado con rol admin_adventur')
                return supabaseResponse
            }

            if (userData.rol !== 'admin_adventur') {
                console.warn('User does not have admin role:', user.id, userData.rol)
                console.log('Actualizando rol a admin_adventur en desarrollo...')
                
                const { error: updateError } = await supabase
                    .from('usuarios')
                    .update({ rol: 'admin_adventur' })
                    .eq('id', user.id)

                if (updateError) {
                    console.error('Error updating user role:', updateError)
                    return NextResponse.redirect(new URL('/acceso-denegado', request.url))
                }

                console.log('Rol actualizado a admin_adventur')
                return supabaseResponse
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
