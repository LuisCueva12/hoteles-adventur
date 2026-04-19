import { Hotel } from '../dominio/Hotel';
import { RepositorioHoteles } from '../dominio/RepositorioHoteles';

export class CasosUsoHoteles {
  constructor(private repositorio: RepositorioHoteles) {}

async listarTodos(): Promise<Hotel[]> {
    return this.repositorio.obtenerTodos();
  }

  async obtenerPorId(id: string): Promise<Hotel | null> {
    return this.repositorio.obtenerPorId(id);
  }

  async contar(): Promise<number> {
    return this.repositorio.contar();
  }

  async buscarPorCiudad(ciudad: string): Promise<Hotel[]> {
    return this.repositorio.obtenerPorCiudad(ciudad);
  }

  async crear(datos: Omit<Hotel, 'id'>): Promise<Hotel> {
    return this.repositorio.crear(datos);
  }

  async editar(id: string, datos: Partial<Hotel>): Promise<Hotel> {
    return this.repositorio.actualizar(id, datos);
  }

  async eliminar(id: string): Promise<void> {
    return this.repositorio.eliminar(id);
  }
}
