import { ConfiguracionSitio } from '../dominio/ConfiguracionSitio';
import { RepositorioConfiguracion } from '../dominio/RepositorioConfiguracion';

export class CasosUsoConfiguracion {
  constructor(private repositorio: RepositorioConfiguracion) {}

  async obtenerConfiguracionGlobal(): Promise<ConfiguracionSitio | null> {
    return this.repositorio.obtenerConfiguracion();
  }

  async actualizarConfiguracionDelSitio(datos: Partial<ConfiguracionSitio>): Promise<ConfiguracionSitio> {
    return this.repositorio.actualizarConfiguracion(datos);
  }
}
