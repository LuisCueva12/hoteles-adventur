// Página: /admin/reservas
// Panel para gestionar solicitudes de reserva por WhatsApp
// El admin puede cambiar el estado: pendiente_whatsapp → confirmada | cancelada
export default function AdminReservasPage() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Solicitudes de Reserva
        </h1>
        {/* TODO: Filtros por estado */}
      </div>
      {/* TODO: Tabla de reservas con botones de confirmación/cancelación */}
    </section>
  );
}
