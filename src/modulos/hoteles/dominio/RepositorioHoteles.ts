// ============================================================
// MÓDULO: hoteles / capa de DOMINIO
// Entidades e interfaces puras — sin dependencias de framework
// ============================================================

export interface EntidadHotel {
  id?: string;
  nombre: string;
  descripcion?: string;
  ciudad: string;
  direccion?: string;
  telefonoWhatsapp: string; // número sin formato: "573001234567"
  fotoUrl?: string;
  estaActivo: boolean;
  fechaCreacion?: Date;
}

export interface RepositorioHoteles {
  obtenerTodos(): Promise<EntidadHotel[]>;
  obtenerPorId(id: string): Promise<EntidadHotel | null>;
  obtenerPorCiudad(ciudad: string): Promise<EntidadHotel[]>;
  crear(hotel: Omit<EntidadHotel, 'id' | 'fechaCreacion'>): Promise<EntidadHotel>;
  actualizar(id: string, datos: Partial<EntidadHotel>): Promise<EntidadHotel>;
  eliminar(id: string): Promise<void>;
}
