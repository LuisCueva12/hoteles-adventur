// ============================================================
// lib/supabase/servidor.ts
// Cliente de Supabase para Server Components, Server Actions y
// Route Handlers — usa cookies para mantener la sesión
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function crearClienteSupabaseServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesList) {
          try {
            cookiesList.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignorar en Server Components de solo lectura
          }
        },
      },
    }
  );
}
