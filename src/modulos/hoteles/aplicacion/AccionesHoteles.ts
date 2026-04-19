'use server';

import { revalidatePath } from 'next/cache';
import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import { FabricaModulos } from '@/lib/factories/FabricaModulos';

export async function listarHoteles() {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHoteles(db);
  return casosUso.listarTodos();
}

export async function obtenerHotel(id: string) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHoteles(db);
  return casosUso.obtenerPorId(id);
}

export async function crearHotel(datos: {
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  telefonoWhatsapp: string;
  estrellas: number;
  imagenesUrls: string[];
  imagenPrincipal?: string;
}) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHoteles(db);
  const hotel = await casosUso.crear({
    ...datos,
    activo: true,
  });
  revalidatePath('/admin/hoteles');
  return hotel;
}

export async function actualizarHotel(id: string, datos: Partial<{
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  telefonoWhatsapp: string;
  estrellas: number;
  imagenesUrls: string[];
  imagenPrincipal?: string;
  activo: boolean;
}>) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHoteles(db);
  const hotel = await casosUso.editar(id, datos);
  revalidatePath('/admin/hoteles');
  return hotel;
}

export async function eliminarHotel(id: string) {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoHoteles(db);
  await casosUso.eliminar(id);
  revalidatePath('/admin/hoteles');
}