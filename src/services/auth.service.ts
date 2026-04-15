import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  rol: string
  foto: string | null
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  accessDenied: boolean
}

class AuthService {
  private supabase = createClient()

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    return error ? null : user
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('rol, nombre, apellido, email, telefono, foto_perfil')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) return null

    return {
      id: userId,
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      email: data.email || '',
      telefono: data.telefono || '',
      rol: data.rol || '',
      foto: data.foto_perfil
    }
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
    const { error } = await this.supabase
      .from('usuarios')
      .update({
        nombre: profile.nombre,
        apellido: profile.apellido,
        telefono: profile.telefono,
        foto_perfil: profile.foto,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    return !error
  }

  async createUserProfile(userId: string, email: string): Promise<void> {
    await this.supabase.from('usuarios').upsert({
      id: userId,
      email,
      nombre: email.split('@')[0] || 'Usuario',
      apellido: '',
      rol: 'turista'
    })
  }

  isAdmin(profile: UserProfile | null): boolean {
    return profile?.rol === 'Admin'
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut()
  }
}

export const authService = new AuthService()
