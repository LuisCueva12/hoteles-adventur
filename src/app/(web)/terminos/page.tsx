import { createClient } from '@/utils/supabase/server'
import { SiteConfigRepository } from '@/lib/repositories/site-config.repository'

export default async function TerminosPage() {
  const supabase = await createClient()
  const repository = new SiteConfigRepository(supabase)
  const config = await repository.getConfig()
  
  const whatsappPhone = SiteConfigRepository.getWhatsappPhone(config)
  const address = SiteConfigRepository.getFullAddress(config)

  return (
    <div className="bg-white">
      <section className="relative flex h-[30vh] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80"
          alt="Terminos y Condiciones"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-6 text-center text-white">
          <h1 className="font-serif text-4xl font-bold">Terminos y Condiciones</h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <p className="mb-8 text-gray-600">Ultima actualizacion: Marzo 2026</p>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">1. Aceptacion de los Terminos</h2>
          <p className="mb-6 text-gray-600">
            Al acceder y utilizar el sitio web de {config.identity.nombre}, usted acepta estos terminos y condiciones.
          </p>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">2. Reservas y Pagos</h2>
          <p className="mb-4 text-gray-600">
            Todas las reservas estan sujetas a disponibilidad. Los precios se muestran en {config.policies.moneda} y pueden incluir impuestos segun la operacion.
          </p>
          <ul className="mb-6 list-inside list-disc space-y-2 text-gray-600">
            <li>Se requiere un adelanto del {config.policies.porcentaje_adelanto}% para confirmar la reserva</li>
            <li>El saldo restante se paga al momento del check-in, salvo pacto distinto</li>
            <li>Aceptamos medios de pago habilitados en la plataforma</li>
          </ul>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">3. Politica de Cancelacion</h2>
          <p className="mb-6 text-gray-600">
            {config.policies.cancelacion || 'Las cancelaciones se rigen por la politica vigente del hotel y la tarifa reservada.'}
          </p>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">4. Check-in y Check-out</h2>
          <p className="mb-6 text-gray-600">
            {config.policies.checkinout || `El check-in inicia a las ${config.policies.hora_checkin} y el check-out finaliza a las ${config.policies.hora_checkout}.`}
          </p>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">5. Responsabilidad del Huesped</h2>
          <p className="mb-6 text-gray-600">
            Los huespedes son responsables de cualquier dano causado a las instalaciones durante su estancia.
          </p>

          <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">6. Contacto</h2>
          <p className="mb-2 text-gray-600">Si tiene preguntas sobre estos terminos, puede contactarnos:</p>
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
