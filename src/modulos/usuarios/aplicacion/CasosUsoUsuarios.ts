// ============================================================
// MÓDULO: usuarios / capa de APLICACIÓN
// ============================================================

import type { EntidadUsuario, RepositorioUsuarios, RolUsuario } from '../dominio/RepositorioUsuarios';

export class CasoUsoObtenerUsuarios {
  constructor(private repositorio: RepositorioUsuarios) {}

  async ejecutar(): Promise<EntidadUsuario[]> {
    return this.repositorio.obtenerTodos();
  }
}

export class CasoUsoActualizarRolUsuario {
  constructor(private repositorio: RepositorioUsuarios) {}

  async ejecutar(id: string, rol: RolUsuario): Promise<EntidadUsuario> {
    return this.repositorio.actualizarRol(id, rol);
  }
}
