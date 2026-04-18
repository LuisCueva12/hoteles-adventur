import { ConfiguracionSitio } from './ConfiguracionSitio';

export interface RepositorioConfiguracion {
  obtenerConfiguracion(): Promise<ConfiguracionSitio | null>;
  actualizarConfiguracion(datos: Partial<ConfiguracionSitio>): Promise<ConfiguracionSitio>;
}
