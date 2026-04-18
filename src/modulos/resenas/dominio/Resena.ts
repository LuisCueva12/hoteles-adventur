export interface Resena {
  id: string;
  hotelId: string;
  usuarioId: string;
  nombreUsuario: string;
  avatarUrl?: string;
  comentario: string;
  calificacion: number;
  fechaCreacion: Date;
}

export interface RepositorioResenas {
  obtenerPorHotel(hotelId: string): Promise<Resena[]>;
  crearResena(resena: Omit<Resena, 'id' | 'fechaCreacion'>): Promise<Resena>;
  obtenerUltimasResenas(limite: number): Promise<Resena[]>;
}
