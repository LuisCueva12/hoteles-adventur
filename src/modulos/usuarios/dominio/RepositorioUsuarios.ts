import { Usuario } from './Usuario';

export interface RepositorioUsuarios {
  obtenerPorId(id: string): Promise<Usuario | null>;
  actualizarPerfil(id: string, datos: Partial<Usuario>): Promise<Usuario>;
  crearPerfil(usuario: Usuario): Promise<Usuario>;
}
