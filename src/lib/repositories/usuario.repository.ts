import { BaseRepository } from './base.repository'
import type { AdminProfile } from '@/lib/auth/types'
import type { UsuarioCreateInput, UsuarioUpdateInput, UsuarioFormData } from '@/lib/validations/usuario.schema'

export type UserRole = 'admin' | 'propietario' | 'turista'

export interface Usuario extends UsuarioFormData {
  id: string
  foto_perfil: string | null
  fecha_registro: string
}

export class UsuarioRepository extends BaseRepository {

  async getAll(): Promise<Usuario[]> {
    const { data: { session } } = await this.supabase.auth.getSession()
    console.log('[UsuarioRepository.getAll] Session:', session?.user?.id)
    
    if (!session?.user) {
      throw new Error('No hay sesión activa')
    }
    
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .order('fecha_registro', { ascending: false })

    console.log('[UsuarioRepository.getAll] Result:', { count: data?.length, error: error?.message })
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      const isAdmin = await this.isAdminUser()
      console.log('[UsuarioRepository.getAll] Empty result, isAdmin:', isAdmin)
      if (!isAdmin) {
        throw new Error('Acceso denegado: se requieren privilegios de administrador')
      }
    }
    
    return data || []
  }
  
  private async isAdminUser(): Promise<boolean> {
    const { data: { session } } = await this.supabase.auth.getSession()
    if (!session?.user) return false
    
    const { data } = await this.supabase
      .from('usuarios')
      .select('rol')
      .eq('id', session.user.id)
      .single()
    
    return data?.rol === 'admin'
  }

  async getById(id: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async getByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single()

    if (error) return null
    return data
  }

  async create(input: UsuarioCreateInput): Promise<Usuario> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .insert({ ...input, verificado: input.verificado ?? false })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, input: UsuarioUpdateInput): Promise<Usuario> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async toggleVerificado(id: string, currentValue: boolean): Promise<Usuario> {
    return this.update(id, { verificado: !currentValue })
  }

  async getAdminProfile(userId: string): Promise<AdminProfile | null> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('id, email, nombre, apellido, rol, foto_perfil')
      .eq('id', userId)
      .eq('rol', 'admin')
      .single()

    if (error) return null
    return data as AdminProfile
  }

  async getUserRole(userId: string): Promise<UserRole | null> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single()

    if (error) return null
    return data?.rol || null
  }

  async updateProfile(userId: string, updates: Partial<AdminProfile>): Promise<boolean> {
    const { error } = await this.supabase
      .from('usuarios')
      .update(updates)
      .eq('id', userId)

    if (error) return false
    return true
  }

  async countByRol(rol: UserRole): Promise<number> {
    const { count, error } = await this.supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('rol', rol)

    if (error) throw error
    return count || 0
  }

  async exists(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single()

    return !error && !!data
  }
}
