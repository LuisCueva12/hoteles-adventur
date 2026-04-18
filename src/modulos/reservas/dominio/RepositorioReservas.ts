import { Reserva, CrearReservaDTO } from './Reserva';

export interface RepositorioReservas {
  crear(datos: CrearReservaDTO): Promise<Reserva>;
  obtenerTodas(): Promise<Reserva[]>;
  obtenerPorUsuario(usuarioId: string): Promise<Reserva[]>;
}
