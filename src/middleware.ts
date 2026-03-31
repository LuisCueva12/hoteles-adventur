import { type NextRequest, NextResponse } from 'next/server'
import { actualizarSesion } from '@/utils/supabase/middleware'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/recuperar-password',
  '/actualizar-password',
  '/hoteles',
  '/nosotros',
  '/servicios',
  '/contacto',
  '/galeria',
  '/privacidad',
  '/terminos',
]

const USER_ROUTES = ['/reservas', '/pagos']
const ADMIN_ROUTES = ['/admin']
const API_PROTECTED_ROUTES = ['/api/nubefact', '/api/admin']

const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

function setSecurityHeaders(response: NextResponse) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    const { supabaseResponse, user, supabase } = await actualizarSesion(request)
    setSecurityHeaders(supabaseResponse)

    const isPublicRoute = isRouteMatch(pathname, PUBLIC_ROUTES)
    const isUserRoute = isRouteMatch(pathname, USER_ROUTES)
    const isAdminRoute = isRouteMatch(pathname, ADMIN_ROUTES)
    const isProtectedAPI = isRouteMatch(pathname, API_PROTECTED_ROUTES)

    if (isPublicRoute && !isAdminRoute && !isUserRoute) {
      return supabaseResponse
    }

    if (!user && (isUserRoute || isAdminRoute || isProtectedAPI)) {
      if (isProtectedAPI) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
      }

      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (user && isAdminRoute) {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle()

      if (error || !userData || userData.rol !== 'admin_adventur') {
        return NextResponse.redirect(new URL('/acceso-denegado', request.url))
      }
    }

    if (user && pathname === '/login') {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle()

      const redirectUrl = userData?.rol === 'admin_adventur' ? '/admin' : '/'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
