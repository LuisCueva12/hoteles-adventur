// ============================================================
// MÓDULO: reservas / capa de DOMINIO
// ============================================================

export type EstadoReserva = 'pendiente_whatsapp' | 'confirmada' | 'cancelada';

export interface EntidadReserva {
  id?: string;
  habitacionId: string;
  hotelId: string;
  nombreCliente: string;
  telefonoCliente: string;
  fechaIngreso: Date;
  fechaSalida: Date;
  estadoReserva: EstadoReserva;
  urlWhatsappGenerada?: string;
  fechaCreacion?: Date;
}

export interface RepositorioReservas {
  guardar(reserva: Omit<EntidadReserva, 'id' | 'fechaCreacion'>): Promise<EntidadReserva>;
  obtenerTodas(): Promise<EntidadReserva[]>;
  obtenerPorId(id: string): Promise<EntidadReserva | null>;
  actualizarEstado(id: string, estado: EstadoReserva): Promise<EntidadReserva>;
}
