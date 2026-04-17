import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl.trim() === '') {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL no está definida. Verifica tu archivo .env.local'
    )
  }
  if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida. Verifica tu archivo .env.local'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })
}
