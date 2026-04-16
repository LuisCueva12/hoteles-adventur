import { createClient } from '@/utils/supabase/server'
import { SiteConfigRepository } from '@/lib/repositories/site-config.repository'

export default async function PrivacidadPage() {
  const supabase = await createClient()
  const repository = new SiteConfigRepository(supabase)
  const config = await repository.getConfig()
  
  const whatsappPhone = SiteConfigRepository.getWhatsappPhone(config)
  const address = SiteConfigRepository.getFullAddress(config)

  return (
    <div className="bg-white">
      <section className="relative flex h-[30vh] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
          alt="Politica de Privacidad"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-6 text-center text-white">
          <h1 className="font-serif text-4xl font-bold">Politica de Privacidad</h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <p className="mb-8 text-gray-600">Ultima actualizacion: Marzo 2026</p>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">1. Informacion que Recopilamos</h2>
          <p className="mb-4 text-gray-600">
            En {config.identity.nombre}, recopilamos la informacion necesaria para operar reservas, pagos y atencion al cliente.
          </p>
          <ul className="mb-6 list-inside list-disc space-y-2 text-gray-600">
            <li>Nombre completo y datos de contacto</li>
            <li>Informacion de reserva y preferencias de alojamiento</li>
            <li>Informacion de pago procesada de forma segura</li>
            <li>Historial de estadias y comunicaciones</li>
          </ul>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">2. Como Usamos su Informacion</h2>
          <ul className="mb-6 list-inside list-disc space-y-2 text-gray-600">
            <li>Procesar y gestionar sus reservas</li>
            <li>Comunicarnos con usted sobre su estancia</li>
            <li>Mejorar servicios y experiencia del cliente</li>
            <li>Enviar promociones con su consentimiento</li>
            <li>Cumplir obligaciones legales y regulatorias</li>
          </ul>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">3. Proteccion de Datos</h2>
          <p className="mb-6 text-gray-600">
            Aplicamos medidas tecnicas y organizativas razonables para proteger sus datos contra acceso no autorizado, perdida o alteracion.
          </p>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">4. Compartir Informacion</h2>
          <p className="mb-4 text-gray-600">No vendemos ni alquilamos su informacion personal a terceros.</p>
          <ul className="mb-6 list-inside list-disc space-y-2 text-gray-600">
            <li>Proveedores de servicios que apoyan la operacion</li>
            <li>Autoridades cuando la ley lo exija</li>
            <li>Socios autorizados con su consentimiento explicito</li>
          </ul>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">5. Sus Derechos</h2>
          <ul className="mb-6 list-inside list-disc space-y-2 text-gray-600">
            <li>Acceder a su informacion personal</li>
            <li>Corregir datos inexactos</li>
            <li>Solicitar la eliminacion de sus datos</li>
            <li>Retirar su consentimiento</li>
          </ul>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">6. Contacto</h2>
          <p className="mb-2 text-gray-600">Para ejercer sus derechos o hacer consultas sobre privacidad:</p>
          <ul className="list-none space-y-1 text-gray-600">
            <li>Email: {config.contact.email}</li>
            <li>Reservas: {config.contact.email_reservas || config.contact.email}</li>
            <li>Telefono: {config.contact.telefono}</li>
            <li>WhatsApp: +{whatsappPhone}</li>
            <li>Direccion: {address}</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
