import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nrecurlshzklgawmpobl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZWN1cmxzaHprbGdhd21wb2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTE3MTEsImV4cCI6MjA4ODA2NzcxMX0.0haX6NI_5k710WdFPMJCy5Jv4mDwoYcmbr5DEuT-FX8'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Cambia estos datos por un usuario real que exista en tu Supabase Auth
const TEST_EMAIL = 'test@adventur.com'
const TEST_PASSWORD = 'Test1234!'

async function testLogin() {
  console.log('🔐 Probando login con:', TEST_EMAIL)

  // 1. Intentar login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })

  if (error) {
    console.error('❌ Login fallido:', error.message)
    console.log('\n💡 Si el usuario no existe, creándolo...')
    await testSignUp()
    return
  }

  console.log('✅ Login exitoso!')
  console.log('   Usuario ID:', data.user.id)
  console.log('   Email:', data.user.email)
  console.log('   Token (primeros 30 chars):', data.session.access_token.slice(0, 30) + '...')

  // 2. Verificar que el perfil existe en la tabla usuarios
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .select('id, nombre, apellido, email, rol')
    .eq('id', data.user.id)
    .single()

  if (perfilError) {
    console.error('❌ Perfil no encontrado en tabla usuarios:', perfilError.message)
  } else {
    console.log('\n👤 Perfil en DB:')
    console.log('   Nombre:', perfil.nombre, perfil.apellido)
    console.log('   Email:', perfil.email)
    console.log('   Rol:', perfil.rol)
  }

  // 3. Verificar alojamientos públicos
  const { data: alojamientos, error: alojError } = await supabase
    .from('alojamientos')
    .select('id, nombre, categoria, precio_base')
    .limit(5)

  if (alojError) {
    console.error('❌ Error al leer alojamientos:', alojError.message)
  } else {
    console.log(`\n🏨 Alojamientos en DB: ${alojamientos.length}`)
    alojamientos.forEach(a => console.log(`   - ${a.nombre} (${a.categoria}) S/. ${a.precio_base}`))
  }

  // 4. Cerrar sesión
  await supabase.auth.signOut()
  console.log('\n🚪 Sesión cerrada correctamente')
}

async function testSignUp() {
  const { data, error } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    options: {
      data: { nombre: 'Test', apellido: 'Usuario' }
    }
  })

  if (error) {
    console.error('❌ Registro fallido:', error.message)
    return
  }

  console.log('✅ Usuario creado:', data.user?.email)
  console.log('   Revisa tu email para confirmar la cuenta (si email confirmation está activo)')
}

testLogin()
