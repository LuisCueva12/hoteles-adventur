// ============================================================
// MÓDULO: usuarios / capa de INFRAESTRUCTURA
// ============================================================

import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import type {
  EntidadUsuario,
  RepositorioUsuarios,
  RolUsuario,
} from '../dominio/RepositorioUsuarios';

function mapearADominio(row: Record<string, unknown>): EntidadUsuario {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    email: row.email as string,
    rol: row.rol as RolUsuario,
    fechaCreacion: row.fecha_creacion ? new Date(row.fecha_creacion as string) : undefined,
  };
}

export class RepositorioUsuariosSupabase implements RepositorioUsuarios {
  async obtenerPorId(id: string): Promise<EntidadUsuario | null> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapearADominio(data);
  }

  async obtenerTodos(): Promise<EntidadUsuario[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('usuarios')
      .select('*')
      .order('fecha_creacion', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async actualizarRol(id: string, rol: RolUsuario): Promise<EntidadUsuario> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('usuarios')
      .update({ rol })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }
}
