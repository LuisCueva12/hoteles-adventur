import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import { Resena } from '../dominio/Resena';
import { RepositorioResenas } from '../dominio/RepositorioResenas';

function mapearADominio(row: any): Resena {
  return {
    id: row.id,
    hotelId: row.hotel_id,
    usuarioId: row.usuario_id,
    nombreUsuario: row.nombre_usuario,
    avatarUrl: row.avatar_url || '',
    comentario: row.comentario,
    calificacion: row.calificacion,
    fechaCreacion: new Date(row.fecha_creacion),
  };
}

export class RepositorioResenasSupabase implements RepositorioResenas {
  async obtenerPorHotel(hotelId: string): Promise<Resena[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('resenas')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('fecha_creacion', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async crearResena(resena: Omit<Resena, 'id' | 'fechaCreacion'>): Promise<Resena> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('resenas')
      .insert({
        hotel_id: resena.hotelId,
        usuario_id: resena.usuarioId,
        nombre_usuario: resena.nombreUsuario,
        avatar_url: resena.avatarUrl,
        comentario: resena.comentario,
        calificacion: resena.calificacion,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async obtenerUltimasResenas(limite: number): Promise<Resena[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('resenas')
      .select('*')
      .order('fecha_creacion', { ascending: false })
      .limit(limite);
    
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }
}
