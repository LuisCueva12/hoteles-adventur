import { RepositorioAuth } from '../dominio/RepositorioAuth';
import { Sesion } from '../dominio/Auth';

export class CasosUsoAuth {
  constructor(private repositorio: RepositorioAuth) {}

  async login(email: string, contrasena: string): Promise<Sesion> {
    if (!email.includes('@')) throw new Error('Email no válido');
    return this.repositorio.iniciarSesion(email, contrasena);
  }

  async logout(): Promise<void> {
    return this.repositorio.cerrarSesion();
  }

  async verificarSesion(): Promise<Sesion | null> {
    return this.repositorio.obtenerSesionActual();
  }
}
