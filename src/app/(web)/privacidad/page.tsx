export default function PrivacidadPage() {
    return (
        <div className="bg-white">
            <section className="relative h-[30vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
                    alt="Política de Privacidad"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-4xl font-bold mb-2 font-serif">
                        Política de Privacidad
                    </h1>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-16">
                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-8">
                        Última actualización: Febrero 2026
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">1. Información que Recopilamos</h2>
                    <p className="text-gray-600 mb-4">
                        En Adventur Hotels, recopilamos la siguiente información personal:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                        <li>Nombre completo y datos de contacto (email, teléfono)</li>
                        <li>Información de reserva (fechas, preferencias de habitación)</li>
                        <li>Información de pago (procesada de forma segura)</li>
                        <li>Historial de estadías y preferencias</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">2. Cómo Usamos su Información</h2>
                    <p className="text-gray-600 mb-4">
                        Utilizamos su información personal para:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                        <li>Procesar y gestionar sus reservas</li>
                        <li>Comunicarnos con usted sobre su estadía</li>
                        <li>Mejorar nuestros servicios y experiencia del cliente</li>
                        <li>Enviar ofertas y promociones (con su consentimiento)</li>
                        <li>Cumplir con obligaciones legales y regulatorias</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">3. Protección de Datos</h2>
                    <p className="text-gray-600 mb-6">
                        Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, pérdida o alteración. Utilizamos encriptación SSL para todas las transacciones en línea.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">4. Compartir Información</h2>
                    <p className="text-gray-600 mb-4">
                        No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información con:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                        <li>Proveedores de servicios que nos ayudan a operar nuestro negocio</li>
                        <li>Autoridades legales cuando sea requerido por ley</li>
                        <li>Socios comerciales con su consentimiento explícito</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">5. Cookies y Tecnologías Similares</h2>
                    <p className="text-gray-600 mb-6">
                        Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web, analizar el tráfico y personalizar el contenido. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">6. Sus Derechos</h2>
                    <p className="text-gray-600 mb-4">
                        Usted tiene derecho a:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                        <li>Acceder a su información personal</li>
                        <li>Corregir datos inexactos</li>
                        <li>Solicitar la eliminación de sus datos</li>
                        <li>Oponerse al procesamiento de sus datos</li>
                        <li>Retirar su consentimiento en cualquier momento</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">7. Retención de Datos</h2>
                    <p className="text-gray-600 mb-6">
                        Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">8. Cambios a esta Política</h2>
                    <p className="text-gray-600 mb-6">
                        Podemos actualizar esta política de privacidad periódicamente. Le notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">9. Contacto</h2>
                    <p className="text-gray-600 mb-2">
                        Para ejercer sus derechos o hacer preguntas sobre esta política:
                    </p>
                    <ul className="list-none text-gray-600 space-y-1">
                        <li>Email: privacidad@adventurhotels.com</li>
                        <li>Teléfono: +51 976 123 456</li>
                        <li>WhatsApp: +51 976 123 456</li>
                        <li>Dirección: Jr. Amalia Puga 635, Cajamarca, Perú</li>
                    </ul>
                </div>
            </section>
        </div>
    )
}
