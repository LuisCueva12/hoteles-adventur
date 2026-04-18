export interface Hotel {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  fotoUrl: string; // Usaremos la primera de imagenes_urls
  telefonoWhatsapp: string;
  estrellas: number;
  activo: boolean;
}
