import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'imagenes';

export class ServicioStorage {
  constructor(private db: SupabaseClient) {}

  async subirImagen(file: File, carpeta: string): Promise<string> {
    const fileName = `${carpeta}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const { error } = await this.db.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw new Error(`Error al subir imagen: ${error.message}`);

    const { data } = this.db.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
  }

  async eliminarImagen(url: string): Promise<void> {
    const path = this.extraerPath(url);
    if (!path) return;

    const { error } = await this.db.storage.from(BUCKET_NAME).remove([path]);
    if (error) throw new Error(`Error al eliminar imagen: ${error.message}`);
  }

  private extraerPath(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/imagenes\/(.+)/);
      return pathMatch ? pathMatch[1] : null;
    } catch {
      return null;
    }
  }
}

export function crearServicioStorage(db: SupabaseClient): ServicioStorage {
  return new ServicioStorage(db);
}