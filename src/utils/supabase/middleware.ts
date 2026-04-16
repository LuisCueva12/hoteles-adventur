import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_ROUTES } from '@/lib/auth/constants'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validador rápido de sesión (ideal para el middleware)
  const { data: { user } } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith(AUTH_ROUTES.ADMIN)) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = AUTH_ROUTES.LOGIN
      // Mantenemos a donde intentaba ir
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    // NOTA: La validación fuerte de roles se delega a `useAdminAuth` en el AdminLayout.
  }

  return supabaseResponse
}
