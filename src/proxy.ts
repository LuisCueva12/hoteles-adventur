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

// Lee el JWT de Supabase desde las cookies sin importar @supabase/ssr
function getSessionFromCookies(request: NextRequest): { userId: string | null; expired: boolean } {
  const cookies = request.cookies.getAll()
  for (const cookie of cookies) {
    if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
      try {
        let token: string | null = null
        try {
          const parsed = JSON.parse(cookie.value)
          token = parsed.access_token ?? null
        } catch {
          token = cookie.value
        }
        if (!token) continue

        const parts = token.split('.')
        if (parts.length !== 3) continue

        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
        const exp = payload.exp as number | undefined
        if (exp && exp * 1000 <= Date.now()) return { userId: null, expired: true }

        return { userId: (payload.sub as string) ?? null, expired: false }
      } catch {
        continue
      }
    }
  }
  return { userId: null, expired: false }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next({ request })
  setSecurityHeaders(response)

  const { userId } = getSessionFromCookies(request)
  const isAuthenticated = !!userId

  const isPublicRoute = isRouteMatch(pathname, PUBLIC_ROUTES)
  const isUserRoute = isRouteMatch(pathname, USER_ROUTES)
  const isAdminRoute = isRouteMatch(pathname, ADMIN_ROUTES)
  const isProtectedAPI = isRouteMatch(pathname, API_PROTECTED_ROUTES)

  if (isPublicRoute && !isAdminRoute && !isUserRoute) {
    return response
  }

  if (!isAuthenticated && (isUserRoute || isAdminRoute || isProtectedAPI)) {
    if (isProtectedAPI) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const redirect = NextResponse.redirect(loginUrl)
    setSecurityHeaders(redirect)
    return redirect
  }

  // La verificación de rol admin se delega al layout de /admin (ya lo hace con Supabase client)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
