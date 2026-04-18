export type EstadoReserva = 'contacto_whatsapp' | 'confirmada' | 'cancelada';

export interface ReservaProps {
  id: string;
  usuarioId?: string;
  habitacionId: string;
  nombreCliente: string;
  telefonoContacto: string;
  fechaIngreso: Date;
  fechaSalida: Date;
  estado: EstadoReserva;
}

export type CrearReservaDTO = Omit<ReservaProps, 'id' | 'estado'>;

export class Reserva {
  constructor(private props: ReservaProps) {
    this.validarFechas();
    this.validarDatosContacto();
  }

  get datos() { return this.props; }

  private validarFechas() {
    if (this.props.fechaIngreso >= this.props.fechaSalida) {
      throw new Error('La fecha de ingreso debe ser anterior a la de salida.');
    }
  }

  private validarDatosContacto() {
    if (this.props.nombreCliente.length < 3) {
      throw new Error('El nombre del cliente debe ser válido.');
    }
  }

  obtenerCantidadNoches(): number {
    const diff = this.props.fechaSalida.getTime() - this.props.fechaIngreso.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
}
