import { createBrowserClient } from '@supabase/ssr'

let clienteInstancia: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (clienteInstancia) {
    return clienteInstancia
  }
  
  clienteInstancia = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
  
  return clienteInstancia
}
