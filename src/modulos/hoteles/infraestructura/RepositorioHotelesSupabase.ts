// ============================================================
// MÓDULO: hoteles / capa de INFRAESTRUCTURA
// Implementación de RepositorioHoteles usando Supabase/Postgres
// ============================================================

import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import type {
  EntidadHotel,
  RepositorioHoteles,
} from '../dominio/RepositorioHoteles';

// Mapper: Postgres → Dominio
function mapearADominio(row: Record<string, unknown>): EntidadHotel {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    descripcion: row.descripcion as string | undefined,
    ciudad: row.ciudad as string,
    direccion: row.direccion as string | undefined,
    telefonoWhatsapp: row.telefono_whatsapp as string,
    fotoUrl: row.foto_url as string | undefined,
    estaActivo: row.esta_activo as boolean,
    fechaCreacion: row.fecha_creacion ? new Date(row.fecha_creacion as string) : undefined,
  };
}

export class RepositorioHotelesSupabase implements RepositorioHoteles {
  async obtenerTodos(): Promise<EntidadHotel[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .select('*')
      .eq('esta_activo', true)
      .order('nombre');
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async obtenerPorId(id: string): Promise<EntidadHotel | null> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapearADominio(data);
  }

  async obtenerPorCiudad(ciudad: string): Promise<EntidadHotel[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .select('*')
      .ilike('ciudad', `%${ciudad}%`)
      .eq('esta_activo', true);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async crear(
    hotel: Omit<EntidadHotel, 'id' | 'fechaCreacion'>
  ): Promise<EntidadHotel> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .insert({
        nombre: hotel.nombre,
        descripcion: hotel.descripcion,
        ciudad: hotel.ciudad,
        direccion: hotel.direccion,
        telefono_whatsapp: hotel.telefonoWhatsapp,
        foto_url: hotel.fotoUrl,
        esta_activo: hotel.estaActivo,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async actualizar(id: string, datos: Partial<EntidadHotel>): Promise<EntidadHotel> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .update({
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
        ...(datos.ciudad && { ciudad: datos.ciudad }),
        ...(datos.direccion !== undefined && { direccion: datos.direccion }),
        ...(datos.telefonoWhatsapp && { telefono_whatsapp: datos.telefonoWhatsapp }),
        ...(datos.fotoUrl !== undefined && { foto_url: datos.fotoUrl }),
        ...(datos.estaActivo !== undefined && { esta_activo: datos.estaActivo }),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async eliminar(id: string): Promise<void> {
    const db = await crearClienteSupabaseServidor();
    const { error } = await db.from('hoteles').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
