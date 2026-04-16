import type { User } from '@supabase/supabase-js'

export interface AdminProfile {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: 'admin'
  foto_perfil?: string | null
}

export interface AuthState {
  user: User | null
  profile: AdminProfile | null
  loading: boolean
  accessDenied: boolean
}

export interface AuthResult {
  success: boolean
  error?: string
}
