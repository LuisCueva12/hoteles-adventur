// ============================================================
// Genera URLs de WhatsApp con mensaje pre-formateado
// ============================================================

interface ParamsGenerarUrl {
  telefonoHotel: string;
  nombreCliente: string;
  nombreHabitacion: string;
  fechaIngreso: Date;
  fechaSalida: Date;
  idSeguimiento: string;
}

export function generarUrlWhatsapp(params: ParamsGenerarUrl): string {
  const {
    telefonoHotel,
    nombreCliente,
    nombreHabitacion,
    fechaIngreso,
    fechaSalida,
    idSeguimiento,
  } = params;

  const formatearFecha = (fecha: Date): string =>
    fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const mensaje = [
    `Hola! Soy *${nombreCliente}*.`,
    `Me interesa reservar la habitación *${nombreHabitacion}*.`,
    `📅 Ingreso: ${formatearFecha(fechaIngreso)}`,
    `📅 Salida: ${formatearFecha(fechaSalida)}`,
    `🔖 ID de seguimiento: #${idSeguimiento}`,
  ].join('\n');

  return `https://wa.me/${telefonoHotel}?text=${encodeURIComponent(mensaje)}`;
}
