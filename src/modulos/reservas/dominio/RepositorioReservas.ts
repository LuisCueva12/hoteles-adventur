import { Reserva, EstadoReserva, CrearReservaDTO } from './Reserva';

export interface RepositorioReservas {
  crear(datos: CrearReservaDTO): Promise<Reserva>;
  obtenerTodas(): Promise<Reserva[]>;
  obtenerPorUsuario(usuarioId: string): Promise<Reserva[]>;
  actualizarEstado(id: string, estado: EstadoReserva): Promise<Reserva>;
  contar(): Promise<number>;
}
