'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  Mail,
  Phone,
  ReceiptText,
  RefreshCcw,
  Save,
  Settings,
  Wrench,
  BellOff,
  Clock,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import Swal from 'sweetalert2'
import {
  siteConfigSchema,
  defaultSiteConfig,
  type SiteConfig,
} from '@/lib/validations/site-config.schema'
import { SiteConfigRepository } from '@/lib/repositories/site-config.repository'
import { useSiteConfig } from '@/components/providers/ProveedorConfiguracionSitio'

type ConfigTab = 'general' | 'contacto' | 'redes' | 'politicas' | 'facturacion' | 'mantenimiento'

const CONFIG_TABS: Array<{ id: ConfigTab; label: string; icon: typeof Settings }> = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'contacto', label: 'Contacto', icon: Phone },
  { id: 'redes', label: 'Redes', icon: Globe },
  { id: 'politicas', label: 'Politicas', icon: FileText },
  { id: 'facturacion', label: 'Facturacion', icon: ReceiptText },
  { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
]

export default function ConfiguracionPage() {
  const supabase = createClient()
  const repository = useMemo(() => new SiteConfigRepository(supabase), [supabase])
  const { overwriteConfig } = useSiteConfig()

  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig)
  const [initialConfig, setInitialConfig] = useState<SiteConfig>(defaultSiteConfig)
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<ConfigTab>('general')
  const [loadIssue, setLoadIssue] = useState<string | null>(null)

  useEffect(() => {
    void loadConfig()
  }, [])

  const isDirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(initialConfig),
    [config, initialConfig],
  )

  async function loadConfig() {
    try {
      setLoading(true)
      setLoadIssue(null)
      const data = await repository.getConfig()
      setConfig(data)
      setInitialConfig(data)
      overwriteConfig(data)
    } catch (error) {
      console.error('Error cargando configuracion:', error)
      setLoadIssue('No se pudo cargar la configuracion.')
    } finally {
      setLoading(false)
    }
  }

  function updateNested<T extends keyof SiteConfig, K extends keyof SiteConfig[T]>(
    section: T,
    key: K,
    value: any
  ) {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  function updateSocial<K extends keyof SiteConfig['contact']['redes_sociales']>(
    key: K,
    value: string
  ) {
    setConfig((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        redes_sociales: {
          ...prev.contact.redes_sociales,
          [key]: value,
        },
      },
    }))
  }

  async function handleSave() {
    const validation = siteConfigSchema.safeParse(config)

    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors)
      await Swal.fire({
        icon: 'warning',
        title: 'Revisa la configuracion',
        text: 'Hay campos con formato invalido o informacion incompleta.',
        confirmButtonColor: '#2563EB',
      })
      return
    }

    try {
      setSaving(true)
      const savedConfig = await repository.updateConfig(config)
      setConfig(savedConfig)
      setInitialConfig(savedConfig)
      setErrors({})
      overwriteConfig(savedConfig)

      await Swal.fire({
        icon: 'success',
        title: 'Configuracion guardada',
        text: 'Los cambios ya quedaron disponibles en el panel y en el sitio.',
        confirmButtonColor: '#2563EB',
        timer: 2200,
        showConfirmButton: false,
      })
    } catch (error: any) {
      console.error('Error guardando configuracion:', error)
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: error.message || 'No se pudo guardar la configuracion.',
        confirmButtonColor: '#2563EB',
      })
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setConfig(initialConfig)
    setErrors({})
  }

  const previewAddress = SiteConfigRepository.getFullAddress(config)

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="font-medium text-gray-700">Cargando configuracion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuracion</h1>
          <p className="mt-1 text-gray-600">
            Centraliza los datos del hotel, contacto, politicas y facturacion desde un solo lugar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => void loadConfig()}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Recargar
          </button>
          <button
            onClick={handleReset}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:text-gray-900 disabled:opacity-50"
          >
            Restaurar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {loadIssue ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Hay un problema con la configuracion</p>
            <p className="mt-1 text-sm leading-6">{loadIssue}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {CONFIG_TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                    active
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'general' ? (
              <div className="space-y-6">
                <SectionHeader
                  title="Informacion general"
                  description="Datos base del hotel que alimentan marca, identidad y reglas operativas."
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Nombre del hotel" value={config.identity.nombre} onChange={(v) => updateNested('identity', 'nombre', v)} placeholder="Hotel Adventur" />
                  <InputField label="Slogan" value={config.identity.slogan} onChange={(v) => updateNested('identity', 'slogan', v)} placeholder="Tu viaje, tu hogar" />
                </div>
                <TextareaField label="Descripcion" value={config.identity.descripcion} onChange={(v) => updateNested('identity', 'descripcion', v)} placeholder="Descripcion general del hotel." rows={4} />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Hora de check-in" type="time" value={config.policies.hora_checkin} onChange={(v) => updateNested('policies', 'hora_checkin', v)} />
                  <InputField label="Hora de check-out" type="time" value={config.policies.hora_checkout} onChange={(v) => updateNested('policies', 'hora_checkout', v)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Moneda"
                    value={config.policies.moneda}
                    onChange={(v) => updateNested('policies', 'moneda', v)}
                    options={[
                      { value: 'PEN', label: 'PEN - Sol peruano' },
                      { value: 'USD', label: 'USD - Dolar estadounidense' },
                    ]}
                  />
                  <InputField
                    label="% Adelanto"
                    type="number"
                    value={String(config.policies.porcentaje_adelanto)}
                    onChange={(v) => updateNested('policies', 'porcentaje_adelanto', Number(v))}
                  />
                </div>
              </div>
            ) : null}

            {activeTab === 'contacto' ? (
              <div className="space-y-6">
                <SectionHeader title="Contacto" description="Informacion publica en footer y contacto." />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Telefono" type="tel" value={config.contact.telefono} onChange={(v) => updateNested('contact', 'telefono', v)} />
                  <InputField label="Telefono sec." type="tel" value={config.contact.telefono_secundario || ''} onChange={(v) => updateNested('contact', 'telefono_secundario', v)} />
                  <InputField label="Email" type="email" value={config.contact.email} onChange={(v) => updateNested('contact', 'email', v)} />
                  <InputField label="Email reservas" type="email" value={config.contact.email_reservas || ''} onChange={(v) => updateNested('contact', 'email_reservas', v)} />
                </div>
                <InputField label="Direccion" value={config.contact.direccion} onChange={(v) => updateNested('contact', 'direccion', v)} />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Ciudad" value={config.contact.ciudad} onChange={(v) => updateNested('contact', 'ciudad', v)} />
                  <InputField label="Pais" value={config.contact.pais} onChange={(v) => updateNested('contact', 'pais', v)} />
                </div>
              </div>
            ) : null}

            {activeTab === 'redes' ? (
              <div className="space-y-6">
                <SectionHeader title="Redes sociales" description="Enlaces para el sitio." />
                <InputField label="Sitio Web" type="url" value={config.contact.redes_sociales.sitio_web || ''} onChange={(v) => updateSocial('sitio_web', v)} />
                <InputField label="Facebook" type="url" value={config.contact.redes_sociales.facebook || ''} onChange={(v) => updateSocial('facebook', v)} />
                <InputField label="Instagram" type="url" value={config.contact.redes_sociales.instagram || ''} onChange={(v) => updateSocial('instagram', v)} />
                <InputField label="Twitter" type="url" value={config.contact.redes_sociales.twitter || ''} onChange={(v) => updateSocial('twitter', v)} />
              </div>
            ) : null}

            {activeTab === 'politicas' ? (
              <div className="space-y-6">
                <SectionHeader title="Politicas" description="Textos operativos." />
                <TextareaField label="Cancelacion" value={config.policies.cancelacion} onChange={(v) => updateNested('policies', 'cancelacion', v)} rows={6} />
                <TextareaField label="Check-in/out" value={config.policies.checkinout} onChange={(v) => updateNested('policies', 'checkinout', v)} rows={6} />
              </div>
            ) : null}

            {activeTab === 'facturacion' ? (
              <div className="space-y-6">
                <SectionHeader title="Facturacion" description="Datos administrativos." />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="RUC" value={config.legal.ruc || ''} onChange={(v) => updateNested('legal', 'ruc', v)} />
                  <InputField label="Razon Social" value={config.legal.razon_social || ''} onChange={(v) => updateNested('legal', 'razon_social', v)} />
                </div>
              </div>
            ) : null}

            {activeTab === 'mantenimiento' ? (
              <div className="space-y-6">
                <SectionHeader title="Mantenimiento" description="Configura el estado del sitio." />
                <div className={`rounded-2xl border p-6 ${config.system.modo_mantenimiento ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.system.modo_mantenimiento ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        <Wrench size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Modo Mantenimiento</h3>
                        <p className="text-sm">Activa la pagina de "Volvemos pronto"</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateNested('system', 'modo_mantenimiento', !config.system.modo_mantenimiento)}
                      className={`relative w-16 h-8 rounded-full transition-all ${config.system.modo_mantenimiento ? 'bg-red-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${config.system.modo_mantenimiento ? 'left-9' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {config.system.modo_mantenimiento && (
                  <div className="space-y-4 pt-4">
                    <TextareaField label="Mensaje" value={config.system.mensaje_mantenimiento} onChange={(v) => updateNested('system', 'mensaje_mantenimiento', v)} rows={4} />
                    <InputField label="Reanudacion" type="datetime-local" value={config.system.fecha_reanudacion || ''} onChange={(v) => updateNested('system', 'fecha_reanudacion', v)} />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Vista previa</p>
                <h2 className="mt-2 text-2xl font-semibold">{config.identity.nombre}</h2>
                <p className="mt-2 text-sm text-gray-600">{config.identity.slogan}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>

            <div className="mt-6 space-y-4">
              <PreviewItem icon={Phone} label="Contacto" value={config.contact.telefono} />
              <PreviewItem icon={Mail} label="Email" value={config.contact.email} />
              <PreviewItem icon={Globe} label="Ubicacion" value={previewAddress} />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Sincronizacion</p>
            <div className="mt-5 space-y-4">
              <StatusRow
                ok={!isDirty}
                title="Estado"
                description={isDirty ? 'Hay cambios sin guardar' : 'Todo sincronizado'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string[]
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
          error ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error[0]}</p>}
    </div>
  )
}

function TextareaField({
  label,
  value,
  onChange,
  error,
  placeholder,
  rows,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string[]
  placeholder?: string
  rows?: number
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
          error ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error[0]}</p>}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function PreviewItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function StatusRow({ ok, title, description }: { ok: boolean; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      {ok ? (
        <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600" />
      ) : (
        <AlertCircle className="mt-1 h-5 w-5 text-amber-500" />
      )}
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-xs text-gray-600">{description}</p>
      </div>
    </div>
  )
}
