export interface Hotel {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  fotoUrl: string;
  telefonoWhatsapp: string;
  rating: number;
  facilidades: string[];
  estaActivo: boolean;
}
