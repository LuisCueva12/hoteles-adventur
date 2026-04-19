import { SupabaseClient } from '@supabase/supabase-js';
import { RepositorioAuth } from '../dominio/RepositorioAuth';
import { Sesion } from '../dominio/Auth';

export class RepositorioAuthSupabase implements RepositorioAuth {
  constructor(private supabase: SupabaseClient) {}

  async iniciarSesion(email: string, contrasena: string): Promise<Sesion> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password: contrasena
    });

    if (error) throw new Error('Credenciales inválidas');
    if (!data.user) throw new Error('Usuario no encontrado');

    return {
      id: data.user.id,
      email: data.user.email || ''
    };
  }

  async cerrarSesion(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async obtenerSesionActual(): Promise<Sesion | null> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error || !session) return null;

    return {
      id: session.user.id,
      email: session.user.email || ''
    };
  }
}
