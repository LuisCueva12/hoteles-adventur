// Página dinámica: /checkout/[habId]
// Formulario personalizado de reserva → genera URL de WhatsApp

interface Props {
  params: Promise<{ habId: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { habId } = await params;

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Solicitar Reserva
      </h1>
      <p className="mb-4 text-sm text-gray-400">Habitación: {habId}</p>
      {/* TODO: FormularioReserva — Nombre, Teléfono, Fechas */}
      {/* TODO: Server Action: guardar reserva + generar URL WhatsApp */}
    </section>
  );
}
