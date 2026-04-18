import { Usuario, RolUsuario } from '../dominio/Usuario';
import { RepositorioUsuarios } from '../dominio/RepositorioUsuarios';

export class CasosUsoUsuarios {
  constructor(private repositorio: RepositorioUsuarios) {}

  async obtenerPerfil(id: string): Promise<Usuario | null> {
    return this.repositorio.obtenerPorId(id);
  }

  async registrarPerfil(datos: Usuario & { contrasena: string }): Promise<Usuario> {
    return this.repositorio.crearPerfil(datos);
  }

  async editarPerfil(id: string, datos: Partial<Usuario>): Promise<Usuario> {
    return this.repositorio.actualizarPerfil(id, datos);
  }

  async esAdministrador(id: string): Promise<boolean> {
    const usuario = await this.repositorio.obtenerPorId(id);
    return usuario?.rol === 'admin';
  }
}
