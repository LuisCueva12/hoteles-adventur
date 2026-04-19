import { SupabaseClient } from '@supabase/supabase-js';
import { Hotel } from '../dominio/Hotel';
import { RepositorioHoteles } from '../dominio/RepositorioHoteles';

function mapearADominio(row: any): Hotel {
  const imagenes = (row.imagenes_urls as string[]) || [];
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    ciudad: row.ciudad,
    direccion: row.direccion || '',
    imagenesUrls: imagenes,
    imagenPrincipal: row.imagen_principal || imagenes[0] || '',
    telefonoWhatsapp: row.telefono_whatsapp,
    estrellas: row.estrellas || 3,
    activo: row.activo,
  };
}

export class RepositorioHotelesSupabase implements RepositorioHoteles {
  constructor(private db: SupabaseClient) {}

  async obtenerTodos(): Promise<Hotel[]> {
    const { data, error } = await this.db
      .from('hoteles')
      .select('*')
      .eq('activo', true)
      .order('nombre');
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async obtenerPorId(id: string): Promise<Hotel | null> {
    const { data, error } = await this.db
      .from('hoteles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapearADominio(data);
  }

  async obtenerPorCiudad(ciudad: string): Promise<Hotel[]> {
    const { data, error } = await this.db
      .from('hoteles')
      .select('*')
      .ilike('ciudad', `%${ciudad}%`)
      .eq('activo', true);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async crear(hotel: Omit<Hotel, 'id'>): Promise<Hotel> {
    const { data, error } = await this.db
      .from('hoteles')
      .insert({
        nombre: hotel.nombre,
        descripcion: hotel.descripcion,
        ciudad: hotel.ciudad,
        direccion: hotel.direccion,
        telefono_whatsapp: hotel.telefonoWhatsapp,
        imagenes_urls: hotel.imagenesUrls,
        imagen_principal: hotel.imagenPrincipal || hotel.imagenesUrls[0] || '',
        estrellas: hotel.estrellas,
        activo: hotel.activo,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async actualizar(id: string, datos: Partial<Hotel>): Promise<Hotel> {
    const { data, error } = await this.db
      .from('hoteles')
      .update({
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
        ...(datos.ciudad && { ciudad: datos.ciudad }),
        ...(datos.direccion !== undefined && { direccion: datos.direccion }),
        ...(datos.telefonoWhatsapp && { telefono_whatsapp: datos.telefonoWhatsapp }),
        ...(datos.estrellas && { estrellas: datos.estrellas }),
        ...(datos.activo !== undefined && { activo: datos.activo }),
        ...(datos.imagenesUrls && { imagenes_urls: datos.imagenesUrls }),
        ...(datos.imagenPrincipal !== undefined && { imagen_principal: datos.imagenPrincipal }),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.db.from('hoteles').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async contar(): Promise<number> {
    const { count, error } = await this.db
      .from('hoteles')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
