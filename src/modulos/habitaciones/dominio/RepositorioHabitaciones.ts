import { Habitacion } from './Habitacion';

export interface RepositorioHabitaciones {
  obtenerTodas(hotelId?: string): Promise<Habitacion[]>;
  obtenerPorId(id: string): Promise<Habitacion | null>;
  crear(habitacion: Omit<Habitacion, 'id'>): Promise<Habitacion>;
  actualizar(id: string, datos: Partial<Habitacion>): Promise<Habitacion>;
  eliminar(id: string): Promise<void>;
  contar(): Promise<number>;
}
