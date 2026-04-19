import { SupabaseClient } from '@supabase/supabase-js';
import { Usuario, RolUsuario } from '../dominio/Usuario';
import { RepositorioUsuarios } from '../dominio/RepositorioUsuarios';

function mapearADominio(row: any): Usuario {
  return {
    id: row.id,
    nombreCompleto: row.nombre_completo,
    correo: row.correo,
    telefono: row.telefono || '',
    rol: row.rol as RolUsuario,
  };
}

export class RepositorioUsuariosSupabase implements RepositorioUsuarios {
  constructor(private db: SupabaseClient) {}

  async obtenerPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await this.db.from('usuarios').select('*').eq('id', id).single();
    if (error) return null;
    return mapearADominio(data);
  }

  async crearPerfil(usuario: Usuario & { contrasena: string }): Promise<Usuario> {
    const { data, error } = await this.db.from('usuarios').insert({
        id: usuario.id,
        nombre_completo: usuario.nombreCompleto,
        correo: usuario.correo,
        contrasena: usuario.contrasena,
        telefono: usuario.telefono,
        rol: usuario.rol,
      }).select().single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async actualizarPerfil(id: string, datos: Partial<Usuario>): Promise<Usuario> {
    const { data, error } = await this.db.from('usuarios').update({
        ...(datos.nombreCompleto && { nombre_completo: datos.nombreCompleto }),
        ...(datos.correo && { correo: datos.correo }),
        ...(datos.telefono !== undefined && { telefono: datos.telefono }),
        ...(datos.rol && { rol: datos.rol }),
      }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async obtenerTodos(): Promise<Usuario[]> {
    const { data, error } = await this.db
      .from('usuarios')
      .select('*')
      .order('nombre_completo');
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async contar(): Promise<number> {
    const { count, error } = await this.db
      .from('usuarios')
      .select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
