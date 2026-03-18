export default function TerminosPage() {
    return (
        <div className="bg-white">
            <section className="relative h-[30vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80"
                    alt="Términos y Condiciones"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-4xl font-bold mb-2 font-serif">
                        Términos y Condiciones
                    </h1>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-16">
                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-8">
                        Última actualización: Febrero 2026
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">1. Aceptación de los Términos</h2>
                    <p className="text-gray-600 mb-6">
                        Al acceder y utilizar el sitio web de Adventur Hotels, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">2. Reservas y Pagos</h2>
                    <p className="text-gray-600 mb-4">
                        Todas las reservas están sujetas a disponibilidad. Los precios mostrados en el sitio web están en Soles Peruanos (S/.) e incluyen impuestos aplicables.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                        <li>Se requiere un adelanto del 50% para confirmar la reserva</li>
                        <li>El saldo restante debe pagarse al momento del check-in</li>
                        <li>Aceptamos pagos mediante Yape, Plin, tarjetas de crédito/débito y transferencias bancarias</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">3. Política de Cancelación</h2>
                    <p className="text-gray-600 mb-4">
                        Las cancelaciones deben realizarse con al menos 48 horas de anticipación para obtener un reembolso completo del adelanto.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                        <li>Cancelaciones con más de 48 horas: Reembolso del 100%</li>
                        <li>Cancelaciones entre 24-48 horas: Reembolso del 50%</li>
                        <li>Cancelaciones con menos de 24 horas: Sin reembolso</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">4. Check-in y Check-out</h2>
                    <p className="text-gray-600 mb-6">
                        El horario de check-in es a partir de las 15:00 horas y el check-out debe realizarse antes de las 12:00 horas. Se pueden solicitar horarios especiales sujetos a disponibilidad y cargos adicionales.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">5. Responsabilidad del Huésped</h2>
                    <p className="text-gray-600 mb-6">
                        Los huéspedes son responsables de cualquier daño causado a las instalaciones del hotel durante su estadía. El hotel se reserva el derecho de cobrar por daños o pérdidas de propiedad del hotel.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">6. Privacidad y Datos Personales</h2>
                    <p className="text-gray-600 mb-6">
                        Nos comprometemos a proteger su privacidad. Consulte nuestra Política de Privacidad para obtener información sobre cómo recopilamos, usamos y protegemos sus datos personales.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">7. Modificaciones</h2>
                    <p className="text-gray-600 mb-6">
                        Adventur Hotels se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">8. Contacto</h2>
                    <p className="text-gray-600 mb-2">
                        Si tiene preguntas sobre estos términos y condiciones, puede contactarnos:
                    </p>
                    <ul className="list-none text-gray-600 space-y-1">
                        <li>Email: info@adventurhotels.com</li>
                        <li>Teléfono: +51 976 123 456</li>
                        <li>WhatsApp: +51 976 123 456</li>
                        <li>Dirección: Jr. Amalia Puga 635, Cajamarca, Perú</li>
                    </ul>
                </div>
            </section>
        </div>
    )
}
