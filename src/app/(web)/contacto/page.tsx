'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { z } from 'zod'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  RotateCcw,
  Send,
  User,
} from 'lucide-react'
import { useToast } from '@/hooks/useNotificacion'

const SUBJECTS = ['reserva', 'cotizacion', 'evento', 'servicio', 'reclamo', 'otro'] as const
const PREFERENCES = ['email', 'telefono', 'whatsapp'] as const

type SubjectKey = (typeof SUBJECTS)[number]
type ContactPreference = (typeof PREFERENCES)[number]

type FormState = {
  nombre: string
  email: string
  telefono: string
  asunto: SubjectKey | ''
  preferencia: ContactPreference
  mensaje: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>
type Feedback = { type: 'success' | 'info' | 'error'; title: string; text: string } | null

const EMAILS = {
  general: 'info@adventurhotels.com',
  reservas: 'reservas@adventurhotels.com',
  ventas: 'ventas@adventurhotels.com',
} as const

const PHONE = '+51 976 123 456'
const ALT_PHONE = '+51 976 654 321'
const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? '51976123456').replace(/\D/g, '')

const SUBJECT_META: Record<SubjectKey, { label: string; description: string; email: string; eta: string }> = {
  reserva: { label: 'Consulta de reserva', description: 'Disponibilidad, fechas y tarifas.', email: EMAILS.reservas, eta: '10 a 20 min' },
  cotizacion: { label: 'Solicitar cotizacion', description: 'Grupos, empresas y estancias largas.', email: EMAILS.ventas, eta: 'Menos de 1 hora' },
  evento: { label: 'Eventos y conferencias', description: 'Salones, coordinacion y bloques.', email: EMAILS.ventas, eta: 'Hasta 2 horas' },
  servicio: { label: 'Servicios del hotel', description: 'Check-in, amenities y traslados.', email: EMAILS.general, eta: '15 a 30 min' },
  reclamo: { label: 'Reclamo o sugerencia', description: 'Seguimiento prioritario.', email: EMAILS.general, eta: 'Mismo dia' },
  otro: { label: 'Otro motivo', description: 'Consultas generales.', email: EMAILS.general, eta: 'Hasta 1 hora' },
}

const PREFERENCE_META: Record<ContactPreference, { label: string; helper: string; submit: string }> = {
  email: { label: 'Email', helper: 'Preparamos un correo al area correcta.', submit: 'Abrir correo' },
  telefono: { label: 'Telefono', helper: 'Dejamos lista una solicitud de llamada.', submit: 'Solicitar llamada' },
  whatsapp: { label: 'WhatsApp', helper: 'Abrimos una conversacion directa.', submit: 'Abrir WhatsApp' },
}

const INITIAL_STATE: FormState = {
  nombre: '',
  email: '',
  telefono: '',
  asunto: '',
  preferencia: 'email',
  mensaje: '',
}

const formSchema = z.object({
  nombre: z.string().trim().min(3, 'Escribe un nombre valido').max(100, 'Nombre demasiado largo'),
  email: z.string().trim().email('Ingresa un email valido'),
  telefono: z.string().trim(),
  asunto: z.enum(SUBJECTS, { message: 'Selecciona un motivo' }),
  preferencia: z.enum(PREFERENCES),
  mensaje: z.string().trim().min(20, 'Explica un poco mas tu consulta').max(800, 'Maximo 800 caracteres'),
}).superRefine((data, ctx) => {
  const digits = onlyDigits(data.telefono)
  if (data.telefono && digits.length < 9) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['telefono'], message: 'Ingresa un telefono valido' })
  }
  if ((data.preferencia === 'telefono' || data.preferencia === 'whatsapp') && digits.length < 9) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['telefono'], message: 'Este canal necesita un telefono valido' })
  }
})

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function getErrors(error: z.ZodError): FieldErrors {
  const fields = error.flatten().fieldErrors
  return {
    nombre: fields.nombre?.[0],
    email: fields.email?.[0],
    telefono: fields.telefono?.[0],
    asunto: fields.asunto?.[0],
    mensaje: fields.mensaje?.[0],
  }
}

export default function ContactoPage() {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const { success, error, info } = useToast()

  const selectedSubject = formData.asunto ? SUBJECT_META[formData.asunto] : null
  const selectedPreference = PREFERENCE_META[formData.preferencia]
  const requiresPhone = formData.preferencia === 'telefono' || formData.preferencia === 'whatsapp'
  const destination = formData.preferencia === 'whatsapp' ? `WhatsApp ${PHONE}` : (selectedSubject?.email ?? EMAILS.general)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    const key = name as keyof FormState

    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      if (key === 'preferencia') delete next.telefono
      return next
    })
    if (feedback) setFeedback(null)
  }

  const handleReset = () => {
    setFormData(INITIAL_STATE)
    setErrors({})
    setFeedback(null)
    info('Formulario reiniciado')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validation = formSchema.safeParse(formData)

    if (!validation.success) {
      setErrors(getErrors(validation.error))
      setFeedback({ type: 'error', title: 'Revisa el formulario', text: 'Hay campos pendientes o inconsistentes.' })
      error('Corrige los campos marcados antes de continuar')
      return
    }

    const data = validation.data
    const subject = SUBJECT_META[data.asunto]
    const preference = PREFERENCE_META[data.preferencia]
    setLoading(true)
    setFeedback(null)

    try {
      if (data.preferencia === 'whatsapp') {
        const text = [
          'Hola, quiero ayuda de Adventur Hotels.',
          `Motivo: ${subject.label}`,
          `Nombre: ${data.nombre}`,
          `Email: ${data.email}`,
          `Telefono: ${data.telefono || 'No consignado'}`,
          'Mensaje:',
          data.mensaje,
        ].join('\n')
        const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
        const popup = window.open(url, '_blank', 'noopener,noreferrer')
        if (!popup) window.location.href = url
        setFeedback({ type: 'success', title: 'WhatsApp listo', text: 'Abrimos la conversacion con tu mensaje prellenado.' })
        success('Se abrio WhatsApp con tu mensaje listo')
      } else {
        const body = [
          'Nuevo mensaje desde el formulario web de Adventur Hotels',
          '',
          `Motivo: ${subject.label}`,
          `Respuesta estimada: ${subject.eta}`,
          `Canal preferido: ${preference.label}`,
          '',
          `Nombre: ${data.nombre}`,
          `Email: ${data.email}`,
          `Telefono: ${data.telefono || 'No consignado'}`,
          '',
          'Mensaje:',
          data.mensaje,
          '',
          data.preferencia === 'telefono' ? 'Nota: el cliente pide devolucion de llamada.' : 'Nota: responder por email.',
        ].join('\n')
        const url = `mailto:${subject.email}?subject=${encodeURIComponent(`[Web] ${subject.label} - ${data.nombre}`)}&body=${encodeURIComponent(body)}`
        window.location.href = url
        setFeedback({ type: 'info', title: 'Correo preparado', text: 'Abrimos tu cliente de correo con el mensaje listo.' })
        success(`Correo preparado para ${subject.email}`)
      }
    } catch {
      setFeedback({ type: 'error', title: 'No pudimos abrir el canal', text: 'Usa los datos directos del hotel e intenta nuevamente.' })
      error('No fue posible abrir el canal de contacto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_35%,#f8fafc_100%)]">
      <section className="relative isolate overflow-hidden">
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80" alt="Contacto Adventur Hotels" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.72)_42%,rgba(15,23,42,0.46)_100%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <span className="inline-flex rounded-full border border-yellow-300/40 bg-yellow-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-yellow-200">Contacto directo</span>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">Tu consulta ahora si sigue una ruta clara.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">Elegimos el area correcta, te mostramos el canal final y dejamos listo el mensaje para que no parezca un formulario vacio.</p>
          <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur sm:col-span-2 xl:col-span-1"><div className="text-3xl font-semibold">&lt; 20 min</div><p className="mt-2 text-sm text-slate-200">Consultas de reserva.</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur"><div className="text-3xl font-semibold">3 canales</div><p className="mt-2 text-sm text-slate-200">Email, llamada y WhatsApp.</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur"><div className="text-3xl font-semibold">24/7</div><p className="mt-2 text-sm text-slate-200">Recepcion y soporte.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] sm:p-9">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-yellow-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Formulario con logica</span>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Prepara el contacto antes de enviarlo</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Segun el canal elegido, abrimos WhatsApp o tu correo con el mensaje dirigido al equipo correcto.</p>
              </div>
              <button type="button" onClick={handleReset} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
                <RotateCcw className="h-4 w-4" />
                Limpiar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <Field label="Nombre completo *" icon={User} error={errors.nombre}>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={inputClass(errors.nombre)} placeholder="Juan Perez" />
                </Field>
                <Field label={`Telefono ${requiresPhone ? '*' : '(opcional)'}`} icon={Phone} error={errors.telefono} help={requiresPhone ? 'Necesario para llamada o WhatsApp.' : 'Ayuda a responder mas rapido.'}>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className={inputClass(errors.telefono)} placeholder="+51 999 999 999" />
                </Field>
              </div>

              <Field label="Email *" icon={Mail} error={errors.email}>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass(errors.email)} placeholder="tu@email.com" />
              </Field>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Motivo de contacto *</label>
                <select name="asunto" value={formData.asunto} onChange={handleChange} className={selectClass(errors.asunto)}>
                  <option value="">Selecciona un motivo</option>
                  {SUBJECTS.map((key) => <option key={key} value={key}>{SUBJECT_META[key].label}</option>)}
                </select>
                <p className="mt-2 text-sm text-slate-500">{selectedSubject?.description ?? 'Asignamos tu consulta al equipo correcto segun el motivo.'}</p>
                {errors.asunto ? <ErrorText text={errors.asunto} /> : null}
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">Como prefieres la respuesta *</label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {PREFERENCES.map((key) => {
                    const active = formData.preferencia === key
                    const Icon = key === 'email' ? Mail : key === 'telefono' ? Phone : MessageCircle
                    return (
                      <label key={key} className={`cursor-pointer rounded-3xl border p-4 transition ${key === 'whatsapp' ? 'sm:col-span-2 lg:col-span-1' : ''} ${active ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}>
                        <input type="radio" name="preferencia" value={key} checked={active} onChange={handleChange} className="sr-only" />
                        <div className="flex items-start gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active ? 'bg-amber-400 text-slate-900' : 'bg-white text-slate-600'}`}><Icon className="h-5 w-5" /></div>
                          <div><div className="font-semibold text-slate-900">{PREFERENCE_META[key].label}</div><p className="mt-1 text-sm leading-6 text-slate-500">{PREFERENCE_META[key].helper}</p></div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 text-amber-500" />
                  <div className="grid flex-1 gap-4 lg:grid-cols-2">
                    <SummaryCard label="Area" value={selectedSubject?.label ?? 'Pendiente'} helper={selectedSubject?.description ?? 'Selecciona un motivo.'} />
                    <SummaryCard label="Canal" value={selectedPreference.label} helper={selectedPreference.helper} />
                    <SummaryCard label="Destino" value={destination} helper="Aqui se dirigira la consulta." />
                    <SummaryCard label="Tiempo estimado" value={selectedSubject?.eta ?? 'Pendiente'} helper="Se actualiza segun el motivo." />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Mensaje *</label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <textarea name="mensaje" value={formData.mensaje} onChange={handleChange} rows={6} maxLength={800} className={`w-full rounded-[28px] border bg-white pb-4 pl-12 pr-4 pt-4 text-slate-900 outline-none transition placeholder:text-slate-400 ${errors.mensaje ? 'border-red-300 ring-4 ring-red-100' : 'border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100'}`} placeholder="Cuentanos fechas, cantidad de personas, evento o el detalle que necesitas resolver." />
                </div>
                <div className="mt-2 flex items-center justify-between gap-4"><p className="text-sm text-slate-500">Mientras mas claro seas, mas rapido podremos responder.</p><p className="text-sm font-medium text-slate-500">{formData.mensaje.length} / 800</p></div>
                {errors.mensaje ? <ErrorText text={errors.mensaje} /> : null}
              </div>

              {feedback ? (
                <div className={`rounded-[24px] border p-5 ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50' : feedback.type === 'info' ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start gap-3">
                    {feedback.type === 'error' ? <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" /> : <CheckCircle2 className={`mt-0.5 h-5 w-5 ${feedback.type === 'success' ? 'text-emerald-600' : 'text-blue-600'}`} />}
                    <div><p className="font-semibold text-slate-900">{feedback.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{feedback.text}</p></div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-4 sm:flex-row">
                <button type="submit" disabled={loading} className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400">
                  {loading ? <><div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />Preparando canal...</> : <><Send className="h-5 w-5" />{selectedPreference.submit}<ArrowRight className="h-4 w-4" /></>}
                </button>
                <a href={`tel:${onlyDigits(PHONE)}`} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"><Phone className="h-4 w-4" />Llamar ahora</a>
              </div>

              <p className="text-sm leading-6 text-slate-500">Email y telefono abren tu cliente de correo con el mensaje listo. WhatsApp abre la conversacion con el texto prellenado.</p>
            </form>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.28)]">
              <span className="inline-flex rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">Canales directos</span>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">Datos del hotel</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
                <InfoCard icon={MapPin} title="Direccion">Jr. Amalia Puga 635<br />Cajamarca, Peru<br />Codigo postal 06001</InfoCard>
                <InfoCard icon={Phone} title="Telefonos">{PHONE}<br />{ALT_PHONE}<br />WhatsApp: {PHONE}</InfoCard>
                <InfoCard icon={Mail} title="Correos">{EMAILS.general}<br />{EMAILS.reservas}<br />{EMAILS.ventas}</InfoCard>
                <InfoCard icon={Clock3} title="Horario">Lunes a viernes: 8:00 AM - 8:00 PM<br />Sabados: 9:00 AM - 6:00 PM<br />Domingos: 10:00 AM - 4:00 PM<br /><span className="font-semibold text-amber-600">Recepcion 24/7</span></InfoCard>
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_22px_60px_-34px_rgba(15,23,42,0.28)] md:min-h-full">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.7234567890123!2d-78.5167!3d-7.1611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMDknNDAuMCJTIDc4wrAzMScwMC4xIlc!5e0!3m2!1ses!2spe!4v1234567890123!5m2!1ses!2spe" width="100%" height="380" style={{ border: 0 }} allowFullScreen loading="lazy" title="Ubicacion de Adventur Hotels en Cajamarca" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  icon: Icon,
  error,
  help,
  children,
}: {
  label: string
  icon: typeof User
  error?: string
  help?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
      {help ? <p className="mt-2 text-xs text-slate-500">{help}</p> : null}
      {error ? <ErrorText text={error} /> : null}
    </div>
  )
}

function ErrorText({ text }: { text: string }) {
  return <p className="mt-2 flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{text}</p>
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-white bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Icon className="h-6 w-6" /></div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 leading-7 text-slate-600">{children}</p>
        </div>
      </div>
    </div>
  )
}

function inputClass(hasError?: string) {
  return `h-14 w-full rounded-2xl border bg-white pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 ${hasError ? 'border-red-300 ring-4 ring-red-100' : 'border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100'}`
}

function selectClass(hasError?: string) {
  return `h-14 w-full rounded-2xl border bg-white px-4 text-slate-900 outline-none transition ${hasError ? 'border-red-300 ring-4 ring-red-100' : 'border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100'}`
}
