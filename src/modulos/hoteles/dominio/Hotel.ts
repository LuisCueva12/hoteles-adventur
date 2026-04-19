export interface Hotel {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  imagenesUrls: string[];
  imagenPrincipal?: string;
  telefonoWhatsapp: string;
  estrellas: number;
  activo: boolean;
}
