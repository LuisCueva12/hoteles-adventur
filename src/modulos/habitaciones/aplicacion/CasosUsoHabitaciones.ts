import { Habitacion } from '../dominio/Habitacion';
import { RepositorioHabitaciones } from '../dominio/RepositorioHabitaciones';

export class CasosUsoHabitaciones {
  constructor(private repositorio: RepositorioHabitaciones) {}

  async listarTodas(): Promise<Habitacion[]> {
    return this.repositorio.obtenerTodas();
  }

  async contar(): Promise<number> {
    return this.repositorio.contar();
  }

  async listarPorHotel(hotelId: string): Promise<Habitacion[]> {
    return this.repositorio.obtenerTodas(hotelId);
  }

  async obtenerPorId(id: string): Promise<Habitacion | null> {
    return this.repositorio.obtenerPorId(id);
  }

  async crear(datos: Omit<Habitacion, 'id'>): Promise<Habitacion> {
    return this.repositorio.crear(datos);
  }

  async editar(id: string, datos: Partial<Habitacion>): Promise<Habitacion> {
    return this.repositorio.actualizar(id, datos);
  }

  async eliminar(id: string): Promise<void> {
    return this.repositorio.eliminar(id);
  }
}
