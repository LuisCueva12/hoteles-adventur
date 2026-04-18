import { RepositorioHotelesSupabase } from '@/modulos/hoteles/infraestructura/RepositorioHotelesSupabase';
import { CasoUsoObtenerHotelesDestacados } from '@/modulos/hoteles/aplicacion/CasoUsoObtenerHotelesDestacados';
import { TarjetaHotel } from '../reutilizables/TarjetaHotel';

export async function HotelesDestacados() {
  // Inyección de dependencias (Manualmente por ahora, para mostrar el flujo)
  const repositorio = new RepositorioHotelesSupabase();
  const casoUso = new CasoUsoObtenerHotelesDestacados(repositorio);

  const hoteles = await casoUso.ejecutar();

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex flex-col items-center text-center">
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          Selección Premium
        </span>
        <h2 className="text-4xl font-bold text-secondary md:text-5xl">
          Hoteles <span className="text-primary italic">Destacados</span>
        </h2>
        <div className="mt-4 h-1.5 w-24 rounded-full bg-primary" />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {hoteles.map((hotel) => (
          <TarjetaHotel
            key={hotel.id}
            hotel={{
              id: hotel.id!,
              nombre: hotel.nombre,
              ciudad: hotel.ciudad,
              fotoUrl: hotel.fotoUrl || '/placeholder-hotel.webp',
              telefonoWhatsapp: hotel.telefonoWhatsapp,
            }}
          />
        ))}

        {hoteles.length === 0 && (
          <div className="col-span-full py-20 text-center text-text-muted">
            Estamos preparando los mejores destinos para ti.
          </div>
        )}
      </div>
    </section>
  );
}
