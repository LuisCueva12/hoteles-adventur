import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(URL, KEY)

console.log('=== TEST LOGIN + ROL ===\n')

// Login
const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
  email: 'admin@gmail.com',
  password: 'admin123'
})

if (loginError) { console.log('❌ Login falló:', loginError.message); process.exit(1) }
console.log('✅ Login OK - User ID:', authData.user.id)

// Leer rol inmediatamente
const { data: usuario, error: rolError } = await supabase
  .from('usuarios')
  .select('nombre, rol')
  .eq('id', authData.user.id)
  .maybeSingle()

if (rolError) {
  console.log('❌ Error leyendo rol:', rolError.message, '| Código:', rolError.code)
} else if (!usuario) {
  console.log('❌ Usuario null - no encontrado en tabla')
} else {
  console.log('✅ Rol leído:', usuario.rol)
  console.log('✅ Nombre:', usuario.nombre)
  const destino = usuario.rol === 'admin_adventur' ? '/admin' : '/'
  console.log('✅ Redirigiría a:', destino)
}

await supabase.auth.signOut()
