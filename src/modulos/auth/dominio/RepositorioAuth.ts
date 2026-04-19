import { Sesion } from './Auth';

export interface RepositorioAuth {
  iniciarSesion(email: string, contrasena: string): Promise<Sesion>;
  cerrarSesion(): Promise<void>;
  obtenerSesionActual(): Promise<Sesion | null>;
}
