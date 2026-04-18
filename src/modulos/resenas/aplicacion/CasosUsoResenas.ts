import { Resena } from '../dominio/Resena';
import { RepositorioResenas } from '../dominio/RepositorioResenas';

export class CasosUsoResenas {
  constructor(private repositorio: RepositorioResenas) { }

  async obtenerTestimoniosDeHotel(hotelId: string): Promise<Resena[]> {
    return this.repositorio.obtenerPorHotel(hotelId);
  }

  async publicarNuevaResena(datos: Omit<Resena, 'id' | 'fechaCreacion'>): Promise<Resena> {
    return this.repositorio.crearResena(datos);
  }

  async obtenerResenasDestacadas(): Promise<Resena[]> {
    return this.repositorio.obtenerUltimasResenas(6);
  }
}
