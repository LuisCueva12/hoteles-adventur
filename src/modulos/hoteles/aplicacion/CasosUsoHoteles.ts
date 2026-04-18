import { RepositorioHoteles } from '../dominio/RepositorioHoteles';
import { Hotel } from '../dominio/Hotel';

export class CasosUsoHoteles {
  constructor(private repositorio: RepositorioHoteles) {}

  async listarHoteles(): Promise<Hotel[]> {
    return this.repositorio.obtenerTodos();
  }

  async obtenerHotel(id: string): Promise<Hotel | null> {
    return this.repositorio.obtenerPorId(id);
  }

  async buscarPorCiudad(ciudad: string): Promise<Hotel[]> {
    return this.repositorio.obtenerPorCiudad(ciudad);
  }
}
