// ============================================================
// MÓDULO: hoteles / capa de INFRAESTRUCTURA
// Implementación de RepositorioHoteles usando Supabase/Postgres
// ============================================================

import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import { Hotel } from '../dominio/Hotel';
import { RepositorioHoteles } from '../dominio/RepositorioHoteles';

// Mapper: Postgres (snake_case) → Dominio (camelCase)
function mapearADominio(row: Record<string, unknown>): Hotel {
  const imagenes = (row.imagenes_urls as string[]) || [];
  
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    descripcion: (row.descripcion as string) || '',
    ciudad: row.ciudad as string,
    direccion: (row.direccion as string) || '',
    fotoUrl: imagenes.length > 0 ? imagenes[0] : '/placeholder-hotel.webp',
    telefonoWhatsapp: (row.telefono_whatsapp as string) || '',
    estrellas: (row.estrellas as number) || 3,
    activo: row.activo as boolean,
  };
}

export class RepositorioHotelesSupabase implements RepositorioHoteles {
  async obtenerTodos(): Promise<Hotel[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .select('*')
      .eq('activo', true)
      .order('nombre');
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async obtenerPorId(id: string): Promise<Hotel | null> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapearADominio(data);
  }

  async obtenerPorCiudad(ciudad: string): Promise<Hotel[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .select('*')
      .ilike('ciudad', `%${ciudad}%`)
      .eq('activo', true);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async crear(hotel: Omit<Hotel, 'id'>): Promise<Hotel> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .insert({
        nombre: hotel.nombre,
        descripcion: hotel.descripcion,
        ciudad: hotel.ciudad,
        direccion: hotel.direccion,
        telefono_whatsapp: hotel.telefonoWhatsapp,
        imagenes_urls: [hotel.fotoUrl],
        estrellas: hotel.estrellas,
        activo: hotel.activo,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async actualizar(id: string, datos: Partial<Hotel>): Promise<Hotel> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('hoteles')
      .update({
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
        ...(datos.ciudad && { ciudad: datos.ciudad }),
        ...(datos.direccion !== undefined && { direccion: datos.direccion }),
        ...(datos.telefonoWhatsapp && { telefono_whatsapp: datos.telefonoWhatsapp }),
        ...(datos.estrellas && { estrellas: datos.estrellas }),
        ...(datos.activo !== undefined && { activo: datos.activo }),
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
