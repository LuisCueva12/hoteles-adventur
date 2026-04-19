import { SupabaseClient } from '@supabase/supabase-js';
import { Habitacion } from '../dominio/Habitacion';
import { RepositorioHabitaciones } from '../dominio/RepositorioHabitaciones';

function mapearADominio(row: any): Habitacion {
  return {
    id: row.id,
    hotelId: row.hotel_id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    capacidadPersonas: row.capacidad_personas,
    precioNoche: Number(row.precio_noche),
    imagenesUrls: row.imagenes_urls || [],
    estaDisponible: row.esta_disponible,
  };
}

export class RepositorioHabitacionesSupabase implements RepositorioHabitaciones {
  constructor(private db: SupabaseClient) {}

  async obtenerTodas(hotelId?: string): Promise<Habitacion[]> {
    let query = this.db.from('habitaciones').select('*');
    if (hotelId) query = query.eq('hotel_id', hotelId);
    const { data, error } = await query.order('precio_noche');
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async obtenerPorId(id: string): Promise<Habitacion | null> {
    const { data, error } = await this.db.from('habitaciones').select('*').eq('id', id).single();
    if (error) return null;
    return mapearADominio(data);
  }

  async crear(habitacion: Omit<Habitacion, 'id'>): Promise<Habitacion> {
    const { data, error } = await this.db.from('habitaciones').insert({
        hotel_id: habitacion.hotelId,
        nombre: habitacion.nombre,
        descripcion: habitacion.descripcion,
        capacidad_personas: habitacion.capacidadPersonas,
        precio_noche: habitacion.precioNoche,
        imagenes_urls: habitacion.imagenesUrls,
        esta_disponible: habitacion.estaDisponible,
      }).select().single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async actualizar(id: string, datos: Partial<Habitacion>): Promise<Habitacion> {
    const { data, error } = await this.db.from('habitaciones').update({
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
        ...(datos.capacidadPersonas && { capacidad_personas: datos.capacidadPersonas }),
        ...(datos.precioNoche && { precio_noche: datos.precioNoche }),
        ...(datos.imagenesUrls && { imagenes_urls: datos.imagenesUrls }),
        ...(datos.estaDisponible !== undefined && { esta_disponible: datos.estaDisponible }),
      }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.db.from('habitaciones').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async contar(): Promise<number> {
    const { count, error } = await this.db
      .from('habitaciones')
      .select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
