// ============================================================
// MÓDULO: habitaciones / capa de APLICACIÓN
// ============================================================

import type { EntidadHabitacion, RepositorioHabitaciones } from '../dominio/RepositorioHabitaciones';

export class CasoUsoObtenerHabitacionesPorHotel {
  constructor(private repositorio: RepositorioHabitaciones) {}

  async ejecutar(hotelId: string): Promise<EntidadHabitacion[]> {
    return this.repositorio.obtenerPorHotel(hotelId);
  }
}

export class CasoUsoObtenerHabitacionPorId {
  constructor(private repositorio: RepositorioHabitaciones) {}

  async ejecutar(id: string): Promise<EntidadHabitacion | null> {
    return this.repositorio.obtenerPorId(id);
  }
}

export class CasoUsoCrearHabitacion {
  constructor(private repositorio: RepositorioHabitaciones) {}

  async ejecutar(
    datos: Omit<EntidadHabitacion, 'id' | 'fechaCreacion'>
  ): Promise<EntidadHabitacion> {
    if (datos.precioNoche <= 0) throw new Error('El precio debe ser mayor a 0.');
    if (datos.capacidadPersonas <= 0)
      throw new Error('La capacidad debe ser mayor a 0.');
    return this.repositorio.crear(datos);
  }
}

export class CasoUsoEliminarHabitacion {
  constructor(private repositorio: RepositorioHabitaciones) {}

  async ejecutar(id: string): Promise<void> {
    return this.repositorio.eliminar(id);
  }
}
