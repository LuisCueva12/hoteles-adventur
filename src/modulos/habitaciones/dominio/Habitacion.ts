export interface Habitacion {
  id: string;
  hotelId: string;
  nombre: string;
  descripcion: string;
  capacidadPersonas: number;
  precioNoche: number;
  imagenesUrls: string[];
  estaDisponible: boolean;
}

export interface RepositorioHabitaciones {
  obtenerTodas(hotelId?: string): Promise<Habitacion[]>;
  obtenerPorId(id: string): Promise<Habitacion | null>;
  crear(habitacion: Omit<Habitacion, 'id'>): Promise<Habitacion>;
  actualizar(id: string, datos: Partial<Habitacion>): Promise<Habitacion>;
  eliminar(id: string): Promise<void>;
}
