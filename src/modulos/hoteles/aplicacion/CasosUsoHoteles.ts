// ============================================================
// MÓDULO: hoteles / capa de APLICACIÓN
// Casos de uso — orquesta el dominio sin saber de Supabase
// ============================================================

import type { EntidadHotel, RepositorioHoteles } from '../dominio/RepositorioHoteles';

export class CasoUsoObtenerHoteles {
  constructor(private repositorio: RepositorioHoteles) {}

  async ejecutar(): Promise<EntidadHotel[]> {
    return this.repositorio.obtenerTodos();
  }
}

export class CasoUsoObtenerHotelPorId {
  constructor(private repositorio: RepositorioHoteles) {}

  async ejecutar(id: string): Promise<EntidadHotel | null> {
    return this.repositorio.obtenerPorId(id);
  }
}

export class CasoUsoBuscarHotelesPorCiudad {
  constructor(private repositorio: RepositorioHoteles) {}

  async ejecutar(ciudad: string): Promise<EntidadHotel[]> {
    return this.repositorio.obtenerPorCiudad(ciudad);
  }
}

export class CasoUsoCrearHotel {
  constructor(private repositorio: RepositorioHoteles) {}

  async ejecutar(
    datos: Omit<EntidadHotel, 'id' | 'fechaCreacion'>
  ): Promise<EntidadHotel> {
    if (!datos.nombre.trim()) throw new Error('El nombre del hotel es obligatorio.');
    if (!datos.telefonoWhatsapp.trim())
      throw new Error('El teléfono de WhatsApp es obligatorio.');
    return this.repositorio.crear(datos);
  }
}

export class CasoUsoEliminarHotel {
  constructor(private repositorio: RepositorioHoteles) {}

  async ejecutar(id: string): Promise<void> {
    return this.repositorio.eliminar(id);
  }
}
