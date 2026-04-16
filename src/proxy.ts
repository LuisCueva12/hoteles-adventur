import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

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
const API_PROTECTED_ROUTES = ['/api/admin']

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

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
    const redirect = NextResponse.redirect(loginUrl)
    setSecurityHeaders(redirect)
    return redirect
  }

  if (user && isAdminRoute) {
    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !userData || userData.rol !== 'admin') {
      const denied = NextResponse.redirect(new URL('/acceso-denegado', request.url))
      setSecurityHeaders(denied)
      return denied
    }
  }

  // Eliminar el bloque de redirección desde /login — ya está manejado en la página client-side
  // para evitar loops de redirección

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
