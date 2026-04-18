// Página dinámica: /hoteles/[id]
// Catálogo del hotel: información, comodidades, fotos y habitaciones disponibles

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HotelDetallePage({ params }: Props) {
  const { id } = await params;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">
        Detalle del hotel
      </h1>
      <p className="text-sm text-gray-400 mb-8">ID: {id}</p>
      {/* TODO: Info del hotel */}
      {/* TODO: Grid de TarjetaHabitacion */}
    </section>
  );
}
