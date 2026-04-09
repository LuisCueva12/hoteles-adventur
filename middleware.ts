import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/hoteles',
  '/nosotros',
  '/servicios',
  '/contacto',
  '/galeria',
  '/privacidad',
  '/terminos',
  '/acceso-denegado',
]

const AUTH_ROUTES = ['/login', '/recuperar-password', '/actualizar-password']
const USER_ROUTES = ['/reservas', '/pagos']
const ADMIN_ROUTES = ['/admin']
const PROTECTED_API_ROUTES = ['/api/nubefact', '/api/admin', '/api/notifications/admins']

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function setSecurityHeaders(response: NextResponse) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)$/)
  ) {
    return NextResponse.next()
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

  const isPublicRoute = isRouteMatch(pathname, PUBLIC_ROUTES)
  const isAuthRoute = isRouteMatch(pathname, AUTH_ROUTES)
  const isUserRoute = isRouteMatch(pathname, USER_ROUTES)
  const isAdminRoute = isRouteMatch(pathname, ADMIN_ROUTES)
  const isProtectedApi = isRouteMatch(pathname, PROTECTED_API_ROUTES)

  if (isAuthRoute) {
    if (user) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle()

      const destination = usuario?.rol === 'admin_adventur' ? '/admin' : '/'
      return NextResponse.redirect(new URL(destination, request.url))
    }

    const response = NextResponse.next()
    setSecurityHeaders(response)
    response.headers.set('Cache-Control', 'no-store')
    return response
  }

  if (isPublicRoute) {
    const response = NextResponse.next()
    setSecurityHeaders(response)
    return response
  }

  if (isUserRoute || isAdminRoute || isProtectedApi) {
    if (!user) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
      }

      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const redirectResponse = NextResponse.redirect(loginUrl)
      setSecurityHeaders(redirectResponse)
      redirectResponse.headers.set('Cache-Control', 'no-store')
      return redirectResponse
    }

    if (isAdminRoute) {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle()

      if (error || !userData || userData.rol !== 'admin_adventur') {
        const deniedResponse = NextResponse.redirect(new URL('/acceso-denegado', request.url))
        setSecurityHeaders(deniedResponse)
        deniedResponse.headers.set('Cache-Control', 'no-store')
        return deniedResponse
      }
    }

    const response = NextResponse.next()
    setSecurityHeaders(response)
    response.headers.set('Cache-Control', 'no-store')
    return response
  }

  const response = NextResponse.next()
  setSecurityHeaders(response)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
