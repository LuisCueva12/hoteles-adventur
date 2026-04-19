import { SupabaseClient } from '@supabase/supabase-js';
import { Reserva, EstadoReserva, CrearReservaDTO } from '../dominio/Reserva';
import { RepositorioReservas } from '../dominio/RepositorioReservas';

function mapearADominio(row: any): Reserva {
  return new Reserva({
    id: row.id,
    usuarioId: row.usuario_id || undefined,
    habitacionId: row.habitacion_id,
    nombreCliente: row.nombre_cliente,
    telefonoContacto: row.telefono_contacto,
    fechaIngreso: new Date(row.fecha_ingreso),
    fechaSalida: new Date(row.fecha_salida),
    fechaCreacion: new Date(row.fecha_creacion),
    estado: row.estado as EstadoReserva,
  });
}

export class RepositorioReservasSupabase implements RepositorioReservas {
  constructor(private db: SupabaseClient) {}

  async crear(datos: CrearReservaDTO): Promise<Reserva> {
    const { data, error } = await this.db
      .from('reservas')
      .insert({
        usuario_id: datos.usuarioId,
        habitacion_id: datos.habitacionId,
        nombre_cliente: datos.nombreCliente,
        telefono_contacto: datos.telefonoContacto,
        fecha_ingreso: datos.fechaIngreso.toISOString().split('T')[0],
        fecha_salida: datos.fechaSalida.toISOString().split('T')[0],
        estado: 'contacto_whatsapp'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async obtenerTodas(): Promise<Reserva[]> {
    const { data, error } = await this.db.from('reservas').select('*').order('fecha_creacion', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async obtenerPorUsuario(usuarioId: string): Promise<Reserva[]> {
    const { data, error } = await this.db.from('reservas').select('*').eq('usuario_id', usuarioId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapearADominio);
  }

  async actualizarEstado(id: string, estado: EstadoReserva): Promise<Reserva> {
    const { data, error } = await this.db
      .from('reservas')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapearADominio(data);
  }

  async contar(): Promise<number> {
    const { count, error } = await this.db
      .from('reservas')
      .select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
