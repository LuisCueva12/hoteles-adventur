import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
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
    estado: row.estado as EstadoReserva,
  });
}

export class RepositorioReservasSupabase implements RepositorioReservas {
  async crear(datos: CrearReservaDTO): Promise<Reserva> {
    const db = await crearClienteSupabaseServidor();

    const { data, error } = await db
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

    if (error) throw new Error('Error al procesar la reserva en la base de datos.');
    
    return mapearADominio(data);
  }

  async obtenerTodas(): Promise<Reserva[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('reservas')
      .select('*')
      .order('fecha_creacion', { ascending: false });
    
    if (error) throw new Error('Error al recuperar las reservas.');
    return (data ?? []).map(mapearADominio);
  }

  async obtenerPorUsuario(usuarioId: string): Promise<Reserva[]> {
    const db = await crearClienteSupabaseServidor();
    const { data, error } = await db
      .from('reservas')
      .select('*')
      .eq('usuario_id', usuarioId);
    
    if (error) throw new Error('Error al recuperar las reservas del usuario.');
    return (data ?? []).map(mapearADominio);
  }
}
