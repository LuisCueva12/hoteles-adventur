// ============================================================
// MÓDULO: reservas / capa de APLICACIÓN
// Caso de uso principal: Procesar reserva → WhatsApp
// ============================================================
//
// Dependencias cruzadas: Este módulo llama a la capa de
// APLICACIÓN de hoteles (nunca directamente a su DB).
// ============================================================

import type { EntidadReserva, RepositorioReservas } from '../dominio/RepositorioReservas';
import type { RepositorioHoteles } from '@/modulos/hoteles/dominio/RepositorioHoteles';
import { generarUrlWhatsapp } from '@/lib/whatsapp/generadorUrl';

interface EntradaProcesarReserva {
  habitacionId: string;
  hotelId: string;
  nombreHabitacion: string;
  nombreCliente: string;
  telefonoCliente: string;
  fechaIngreso: Date;
  fechaSalida: Date;
}

export class CasoUsoProcesarReservaWhatsapp {
  constructor(
    private repositorioReservas: RepositorioReservas,
    private repositorioHoteles: RepositorioHoteles
  ) {}

  async ejecutar(entrada: EntradaProcesarReserva): Promise<string> {
    // 1. Obtener el hotel para conseguir el teléfono de WhatsApp
    const hotel = await this.repositorioHoteles.obtenerPorId(entrada.hotelId);
    if (!hotel) throw new Error('Hotel no encontrado.');

    // 2. Guardar la intención de reserva en la base de datos
    const reservaGuardada = await this.repositorioReservas.guardar({
      habitacionId: entrada.habitacionId,
      hotelId: entrada.hotelId,
      nombreCliente: entrada.nombreCliente,
      telefonoCliente: entrada.telefonoCliente,
      fechaIngreso: entrada.fechaIngreso,
      fechaSalida: entrada.fechaSalida,
      estadoReserva: 'pendiente_whatsapp',
    });

    // 3. Generar URL de WhatsApp con mensaje pre-formateado
    const urlWhatsapp = generarUrlWhatsapp({
      telefonoHotel: hotel.telefonoWhatsapp,
      nombreCliente: entrada.nombreCliente,
      nombreHabitacion: entrada.nombreHabitacion,
      fechaIngreso: entrada.fechaIngreso,
      fechaSalida: entrada.fechaSalida,
      idSeguimiento: reservaGuardada.id!,
    });

    return urlWhatsapp;
  }
}

export class CasoUsoActualizarEstadoReserva {
  constructor(private repositorio: RepositorioReservas) {}

  async ejecutar(
    id: string,
    estado: 'confirmada' | 'cancelada'
  ): Promise<EntidadReserva> {
    return this.repositorio.actualizarEstado(id, estado);
  }
}
