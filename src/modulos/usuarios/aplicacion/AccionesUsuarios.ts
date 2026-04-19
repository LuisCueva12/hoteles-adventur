'use server';

import { revalidatePath } from 'next/cache';
import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import { FabricaModulos } from '@/lib/factories/FabricaModulos';

export async function listarUsuarios() {
  const db = await crearClienteSupabaseServidor();
  const casosUso = FabricaModulos.obtenerCasosUsoUsuarios(db);
  return casosUso.listarTodos();
}