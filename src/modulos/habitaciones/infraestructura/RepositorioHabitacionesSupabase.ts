// ============================================================
// MÓDULO: habitaciones / capa de INFRAESTRUCTURA
// ============================================================

import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import type {
  EntidadHabitacion,
  RepositorioHabitaciones,
} from '../dominio/RepositorioHabitaciones';

function mapearADominio(row: Record<string, unknown>): EntidadHabitacion {
  return {
    id: row.id as string,
    hotelId: row.hotel_id as string,
    nombre: row.nombre as string,
    descripcion: row.descripcion as string | undefined,
    precioNoche: row.precio_noche as number,
    capacidadPersonas: row.capacidad_personas as number,
    estaDisponible: row.esta_disponible as boolean,
    fotos: (row.fotos as string[]) ?? [],
    fechaCreacion: row.fecha_creacion ? new Date(row.fecha_creacion as string) : undefined,
  };
}

export class RepositorioHabitacionesSupabase implements RepositorioHabitaciones {
  async obtenerPorHotel(hotelId: string): Promise<EntidadHabitacion[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('habitaciones')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('nombre');
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async obtenerPorId(id: string): Promise<EntidadHabitacion | null> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('habitaciones')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapearADominio(data);
  }

  async crear(
    habitacion: Omit<EntidadHabitacion, 'id' | 'fechaCreacion'>
  ): Promise<EntidadHabitacion> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('habitaciones')
      .insert({
        hotel_id: habitacion.hotelId,
        nombre: habitacion.nombre,
        descripcion: habitacion.descripcion,
        precio_noche: habitacion.precioNoche,
        capacidad_personas: habitacion.capacidadPersonas,
        esta_disponible: habitacion.estaDisponible,
        fotos: habitacion.fotos ?? [],
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async actualizar(
    id: string,
    datos: Partial<EntidadHabitacion>
  ): Promise<EntidadHabitacion> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('habitaciones')
      .update({
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
        ...(datos.precioNoche !== undefined && { precio_noche: datos.precioNoche }),
        ...(datos.capacidadPersonas !== undefined && {
          capacidad_personas: datos.capacidadPersonas,
        }),
        ...(datos.estaDisponible !== undefined && {
          esta_disponible: datos.estaDisponible,
        }),
        ...(datos.fotos !== undefined && { fotos: datos.fotos }),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async eliminar(id: string): Promise<void> {
    const db = await crearClienteSupabaseServidor();
    const { error } = await db.from('habitaciones').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
