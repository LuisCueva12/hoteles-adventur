// ============================================================
// components/reutilizables/TarjetaHabitacion.tsx
// Tarjeta para mostrar una habitación en el catálogo del hotel
// ============================================================

import Image from 'next/image';
import Link from 'next/link';
import type { EntidadHabitacion } from '@/modulos/habitaciones/dominio/RepositorioHabitaciones';

interface Props {
  habitacion: EntidadHabitacion;
}

const formatearPrecio = (precio: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio);

export function TarjetaHabitacion({ habitacion }: Props) {
  const fotoPortada = habitacion.fotos?.[0];

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl">
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        {fotoPortada ? (
          <Image
            src={fotoPortada}
            alt={habitacion.nombre}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Sin foto
          </div>
        )}
        {!habitacion.estaDisponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
              No disponible
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="mb-1 text-base font-bold text-secondary">
          {habitacion.nombre}
        </h3>
        <p className="mb-1 text-xs text-text-muted">
          👥 {habitacion.capacidadPersonas} persona
          {habitacion.capacidadPersonas > 1 ? 's' : ''}
        </p>
        {habitacion.descripcion && (
          <p className="mb-3 line-clamp-2 text-sm text-text-muted">
            {habitacion.descripcion}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-secondary">
            {formatearPrecio(habitacion.precioNoche)}
            <span className="text-xs font-normal text-text-muted"> /noche</span>
          </span>
          {habitacion.estaDisponible && (
            <Link
              href={`/checkout/${habitacion.id}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-secondary hover:bg-primary-hover transition-colors shadow-sm"
            >
              Reservar
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
