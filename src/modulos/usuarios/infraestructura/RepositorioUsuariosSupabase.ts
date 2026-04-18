import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
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
  async obtenerPorId(id: string): Promise<Usuario | null> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return mapearADominio(data);
  }

  async crearPerfil(usuario: Usuario & { contrasena: string }): Promise<Usuario> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('usuarios')
      .insert({
        id: usuario.id,
        nombre_completo: usuario.nombreCompleto,
        correo: usuario.correo,
        contrasena: usuario.contrasena,
        telefono: usuario.telefono,
        rol: usuario.rol,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async actualizarPerfil(id: string, datos: Partial<Usuario>): Promise<Usuario> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('usuarios')
      .update({
        ...(datos.nombreCompleto && { nombre_completo: datos.nombreCompleto }),
        ...(datos.correo && { correo: datos.correo }),
        ...(datos.telefono !== undefined && { telefono: datos.telefono }),
        ...(datos.rol && { rol: datos.rol }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }
}
