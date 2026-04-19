import Image from 'next/image';
import Link from 'next/link';
import { Hotel } from '@/modulos/hoteles/dominio/Hotel';
import { isValidImageSrc } from '@/lib/utils';

interface Props {
  hotel: Hotel;
}

export function TarjetaHotel({ hotel }: Props) {
  const fotoPortada = hotel.imagenesUrls?.[0];
  const fotoValida = isValidImageSrc(fotoPortada);

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {fotoValida ? (
          <Image
            src={fotoPortada!}
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
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">
          {hotel.ciudad}
        </p>
        <h3 className="mb-2 text-lg font-bold text-secondary">{hotel.nombre}</h3>
        {hotel.descripcion && (
          <p className="mb-4 line-clamp-2 text-sm text-text-muted">
            {hotel.descripcion}
          </p>
        )}
        <Link
          href={`/hoteles/${hotel.id}`}
          className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-bold text-secondary hover:bg-primary-hover transition-colors"
        >
          Ver habitaciones
        </Link>
      </div>
    </article>
  );
}
