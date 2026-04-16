import type { SupabaseClient } from '@supabase/supabase-js'
import { UsuarioRepository } from '@/lib/repositories/usuario.repository'
import { validateAdminAccess } from '@/lib/auth/validators'
import { AUTH_ERRORS } from '@/lib/auth/constants'
import type { AdminProfile } from '@/lib/auth/types'

export class AuthService {
  private usuarioRepo: UsuarioRepository

  constructor(private supabase: SupabaseClient) {
    this.usuarioRepo = new UsuarioRepository(supabase)
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error(AUTH_ERRORS.AUTH_FAILED)

    return data
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    if (error) throw error
    return session
  }

  async validateAdminSession(): Promise<AdminProfile | null> {
    const session = await this.getSession()
    if (!session?.user) return null

    const profile = await this.usuarioRepo.getAdminProfile(session.user.id)
    if (!profile || !validateAdminAccess(profile)) return null

    return profile
  }

  async getUserRole(userId: string): Promise<string | null> {
    return this.usuarioRepo.getUserRole(userId)
  }

  async updateProfile(userId: string, updates: Partial<AdminProfile>): Promise<boolean> {
    return this.usuarioRepo.updateProfile(userId, updates)
  }
}
