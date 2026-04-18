// ============================================================
// MÓDULO: habitaciones / capa de DOMINIO
// ============================================================

export interface EntidadHabitacion {
  id?: string;
  hotelId: string;
  nombre: string;
  descripcion?: string;
  precioNoche: number;
  capacidadPersonas: number;
  estaDisponible: boolean;
  fotos?: string[];
  fechaCreacion?: Date;
}

export interface RepositorioHabitaciones {
  obtenerPorHotel(hotelId: string): Promise<EntidadHabitacion[]>;
  obtenerPorId(id: string): Promise<EntidadHabitacion | null>;
  crear(habitacion: Omit<EntidadHabitacion, 'id' | 'fechaCreacion'>): Promise<EntidadHabitacion>;
  actualizar(id: string, datos: Partial<EntidadHabitacion>): Promise<EntidadHabitacion>;
  eliminar(id: string): Promise<void>;
}
