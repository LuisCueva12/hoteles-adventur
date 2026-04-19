export interface Sesion {
  id: string;
  email: string;
  token?: string;
}

export interface RepositorioAuth {
  iniciarSesion(email: string, contrasena: string): Promise<Sesion>;
  cerrarSesion(): Promise<void>;
  obtenerSesionActual(): Promise<Sesion | null>;
}
