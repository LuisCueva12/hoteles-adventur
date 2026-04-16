import type { SupabaseClient } from '@supabase/supabase-js'
import { UsuarioRepository, type Usuario } from '@/lib/repositories/usuario.repository'
import { usuarioCreateSchema, usuarioUpdateSchema, type UsuarioCreateInput, type UsuarioUpdateInput } from '@/lib/validations/usuario.schema'

export class UsuarioAdminService {
  private repository: UsuarioRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new UsuarioRepository(supabase)
  }

  async getAllUsuarios(): Promise<Usuario[]> {
    return this.repository.getAll()
  }

  async getUsuarioById(id: string): Promise<Usuario | null> {
    return this.repository.getById(id)
  }

  async createUsuario(input: UsuarioCreateInput): Promise<Usuario> {
    const result = usuarioCreateSchema.safeParse(input)
    
    if (!result.success) {
      throw new Error(result.error.errors[0].message)
    }

    const emailExists = await this.repository.exists(input.email)
    if (emailExists) {
      throw new Error('Ya existe un usuario con este email')
    }

    return this.repository.create(input)
  }

  async updateUsuario(id: string, input: UsuarioUpdateInput): Promise<Usuario> {
    const result = usuarioUpdateSchema.safeParse(input)
    
    if (!result.success) {
      throw new Error(result.error.errors[0].message)
    }

    return this.repository.update(id, input)
  }

  async deleteUsuario(id: string): Promise<void> {
    return this.repository.delete(id)
  }

  async toggleVerificado(id: string, currentValue: boolean): Promise<Usuario> {
    return this.repository.toggleVerificado(id, currentValue)
  }
}
