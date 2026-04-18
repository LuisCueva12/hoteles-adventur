// ============================================================
// MÓDULO: usuarios / capa de DOMINIO
// ============================================================

export type RolUsuario = 'admin' | 'recepcionista';

export interface EntidadUsuario {
  id: string;       // UUID de auth.users
  nombre: string;
  email: string;
  rol: RolUsuario;
  fechaCreacion?: Date;
}

export interface RepositorioUsuarios {
  obtenerPorId(id: string): Promise<EntidadUsuario | null>;
  obtenerTodos(): Promise<EntidadUsuario[]>;
  actualizarRol(id: string, rol: RolUsuario): Promise<EntidadUsuario>;
}
