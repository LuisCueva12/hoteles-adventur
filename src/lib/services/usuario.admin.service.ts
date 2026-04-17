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
      throw new Error(result.error.issues[0].message)
    }

    const response = await fetch('/api/admin/usuarios/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear el usuario')
    }

    return data.user
  }

  async updateUsuario(id: string, input: UsuarioUpdateInput): Promise<Usuario> {
    const result = usuarioUpdateSchema.safeParse(input)
    
    if (!result.success) {
      throw new Error(result.error.issues[0].message)
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
