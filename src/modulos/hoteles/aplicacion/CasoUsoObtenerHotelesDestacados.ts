import { RepositorioHoteles } from '../dominio/RepositorioHoteles';
import type { Hotel } from '../dominio/Hotel';

export class CasoUsoObtenerHotelesDestacados {
  constructor(private repositorio: RepositorioHoteles) { }

  async ejecutar(): Promise<Hotel[]> {
    const todosLosHoteles = await this.repositorio.obtenerTodos();
    return todosLosHoteles.slice(0, 3);
  }
}
