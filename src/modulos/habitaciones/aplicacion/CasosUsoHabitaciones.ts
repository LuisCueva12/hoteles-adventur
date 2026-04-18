import { Habitacion } from '../dominio/Habitacion';
import { RepositorioHabitaciones } from '../dominio/RepositorioHabitaciones';

export class CasosUsoHabitaciones {
  constructor(private repositorio: RepositorioHabitaciones) {}

  async listarHabitacionesPorHotel(hotelId: string): Promise<Habitacion[]> {
    return this.repositorio.obtenerTodas(hotelId);
  }

  async obtenerDetalleHabitacion(id: string): Promise<Habitacion | null> {
    return this.repositorio.obtenerPorId(id);
  }

  async gestionarHabitacion(datos: Omit<Habitacion, 'id'>): Promise<Habitacion> {
    return this.repositorio.crear(datos);
  }

  async cambiarDisponibilidad(id: string, estaDisponible: boolean): Promise<Habitacion> {
    return this.repositorio.actualizar(id, { estaDisponible });
  }
}
