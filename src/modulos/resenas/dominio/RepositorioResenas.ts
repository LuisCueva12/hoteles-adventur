import { Resena } from './Resena';

export interface RepositorioResenas {
  obtenerPorHotel(hotelId: string): Promise<Resena[]>;
  crearResena(resena: Omit<Resena, 'id' | 'fechaCreacion'>): Promise<Resena>;
  obtenerUltimasResenas(limite: number): Promise<Resena[]>;
}
