export type RolUsuario = 'admin' | 'cliente';

export interface Usuario {
  id: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  rol: RolUsuario;
}
