import { Hotel } from './Hotel';

export interface RepositorioHoteles {
  obtenerTodos(): Promise<Hotel[]>;
  obtenerPorId(id: string): Promise<Hotel | null>;
  obtenerPorCiudad(ciudad: string): Promise<Hotel[]>;
  crear(hotel: Omit<Hotel, 'id'>): Promise<Hotel>;
  actualizar(id: string, datos: Partial<Hotel>): Promise<Hotel>;
  eliminar(id: string): Promise<void>;
  contar(): Promise<number>;
}
