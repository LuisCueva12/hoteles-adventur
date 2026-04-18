// ============================================================
// MÓDULO: reservas / capa de INFRAESTRUCTURA
// ============================================================

import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import type {
  EntidadReserva,
  EstadoReserva,
  RepositorioReservas,
} from '../dominio/RepositorioReservas';

function mapearADominio(row: Record<string, unknown>): EntidadReserva {
  return {
    id: row.id as string,
    habitacionId: row.habitacion_id as string,
    hotelId: row.hotel_id as string,
    nombreCliente: row.nombre_cliente as string,
    telefonoCliente: row.telefono_cliente as string,
    fechaIngreso: new Date(row.fecha_ingreso as string),
    fechaSalida: new Date(row.fecha_salida as string),
    estadoReserva: row.estado_reserva as EstadoReserva,
    urlWhatsappGenerada: row.url_whatsapp_generada as string | undefined,
    fechaCreacion: row.fecha_creacion ? new Date(row.fecha_creacion as string) : undefined,
  };
}

export class RepositorioReservasSupabase implements RepositorioReservas {
  async guardar(
    reserva: Omit<EntidadReserva, 'id' | 'fechaCreacion'>
  ): Promise<EntidadReserva> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('reservas')
      .insert({
        habitacion_id: reserva.habitacionId,
        hotel_id: reserva.hotelId,
        nombre_cliente: reserva.nombreCliente,
        telefono_cliente: reserva.telefonoCliente,
        fecha_ingreso: reserva.fechaIngreso.toISOString().split('T')[0],
        fecha_salida: reserva.fechaSalida.toISOString().split('T')[0],
        estado_reserva: reserva.estadoReserva,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async obtenerTodas(): Promise<EntidadReserva[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('reservas')
      .select('*')
      .order('fecha_creacion', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async obtenerPorId(id: string): Promise<EntidadReserva | null> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapearADominio(data);
  }

  async actualizarEstado(id: string, estado: EstadoReserva): Promise<EntidadReserva> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('reservas')
      .update({ estado_reserva: estado })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }
}
