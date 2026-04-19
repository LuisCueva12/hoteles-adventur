'use server';

import { revalidatePath } from 'next/cache';
import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import { FabricaModulos } from '@/lib/factories/FabricaModulos';

export async function listarHabitaciones(hotelId?: string) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHabitaciones(db);
  if (hotelId) {
    return casosUso.listarPorHotel(hotelId);
  }
  return casosUso.listarTodas();
}

export async function obtenerHabitacion(id: string) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHabitaciones(db);
  return casosUso.obtenerPorId(id);
}

export async function crearHabitacion(datos: {
  hotelId: string;
  nombre: string;
  descripcion: string;
  capacidadPersonas: number;
  precioNoche: number;
  imagenesUrls: string[];
  estaDisponible: boolean;
}) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHabitaciones(db);
  const habitacion = await casosUso.crear(datos);
  revalidatePath('/admin/habitaciones');
  return habitacion;
}

export async function actualizarHabitacion(id: string, datos: Partial<{
  hotelId: string;
  nombre: string;
  descripcion: string;
  capacidadPersonas: number;
  precioNoche: number;
  imagenesUrls: string[];
  estaDisponible: boolean;
}>) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHabitaciones(db);
  const habitacion = await casosUso.editar(id, datos);
  revalidatePath('/admin/habitaciones');
  return habitacion;
}

export async function eliminarHabitacion(id: string) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHabitaciones(db);
  await casosUso.eliminar(id);
  revalidatePath('/admin/habitaciones');
}