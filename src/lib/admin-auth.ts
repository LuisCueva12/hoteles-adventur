import { createClient } from '@/utils/supabase/server'

export async function requireAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado', status: 401 as const, user: null, supabase }
  }

  const { data: profile, error } = await supabase
    .from('usuarios')
    .select('id, rol')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile || profile.rol !== 'admin_adventur') {
    return { error: 'Acceso denegado', status: 403 as const, user: null, supabase }
  }

  return { error: null, status: 200 as const, user, supabase }
}
