// ============================================================
// components/reutilizables/TarjetaHotel.tsx
// Tarjeta para mostrar un hotel en el listado público
// ============================================================

import Image from 'next/image';
import Link from 'next/link';
import type { EntidadHotel } from '@/modulos/hoteles/dominio/RepositorioHoteles';

interface Props {
  hotel: EntidadHotel;
}

export function TarjetaHotel({ hotel }: Props) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {hotel.fotoUrl ? (
          <Image
            src={hotel.fotoUrl}
            alt={hotel.nombre}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Sin foto
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green-600">
          {hotel.ciudad}
        </p>
        <h3 className="mb-2 text-lg font-bold text-gray-900">{hotel.nombre}</h3>
        {hotel.descripcion && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-500">
            {hotel.descripcion}
          </p>
        )}
        <Link
          href={`/hoteles/${hotel.id}`}
          className="inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
        >
          Ver habitaciones
        </Link>
      </div>
    </article>
  );
}
