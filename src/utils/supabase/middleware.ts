import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { AUTH_ROUTES } from '@/lib/auth/constants'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const authService = new AuthService(supabase)

  if (request.nextUrl.pathname.startsWith(AUTH_ROUTES.ADMIN)) {
    const profile = await authService.validateAdminSession()

    if (!profile) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = AUTH_ROUTES.ACCESS_DENIED
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}
