// ============================================================
// src/proxy.ts  (antiguo middleware.ts — renombrado en Next.js 16)
// Protege las rutas /admin — redirige a /login si no hay sesión
// Compatible con Turbopack
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { actualizarSesionSupabase } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { response, user } = await actualizarSesionSupabase(request);

  const estaEnRutaAdmin = request.nextUrl.pathname.startsWith('/admin');

  if (estaEnRutaAdmin && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
