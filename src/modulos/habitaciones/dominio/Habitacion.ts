export interface Habitacion {
  id: string;
  hotelId: string;
  nombre: string;
  descripcion: string;
  capacidadPersonas: number;
  precioNoche: number;
  imagenesUrls: string[];
  estaDisponible: boolean;
}
