'use server';

import { revalidatePath } from 'next/cache';
import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import { FabricaModulos } from '@/lib/factories/FabricaModulos';
import { EstadoReserva } from '@/modulos/reservas/dominio/Reserva';

export async function listarReservas() {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoReservas(db);
  return casosUso.listarTodas();
}

export async function cambiarEstadoReserva(id: string, estado: EstadoReserva) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoReservas(db);
  const reserva = await casosUso.cambiarEstado(id, estado);
  revalidatePath('/admin/reservas');
  return reserva;
}