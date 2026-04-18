import { Reserva, CrearReservaDTO } from '../dominio/Reserva';
import { RepositorioReservas } from '../dominio/RepositorioReservas';
import { RepositorioHoteles } from '@/modulos/hoteles/dominio/RepositorioHoteles';

export class CasosUsoReservas {
  constructor(
    private repositorioReservas: RepositorioReservas,
    private repositorioHoteles: RepositorioHoteles
  ) { }

  async procesarReservaYGenerarLink(
    datos: CrearReservaDTO,
    hotelId: string
  ): Promise<{ link: string; reserva: Reserva }> {

    const reserva = await this.repositorioReservas.crear(datos);

    const hotel = await this.repositorioHoteles.obtenerPorId(hotelId);
    if (!hotel) throw new Error('Hotel no disponible.');

    const mensaje = `Hola! Quiero reservar en ${hotel.nombre}. Cliente: ${reserva.datos.nombreCliente}`;
    const link = `https://wa.me/${hotel.telefonoWhatsapp}?text=${encodeURIComponent(mensaje)}`;

    return { link, reserva };
  }
}
