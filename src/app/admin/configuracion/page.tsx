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
  MessageSquare
} from 'lucide-react'
import Swal from 'sweetalert2'
import {
  defaultSiteConfig,
  getFullAddress,
  normalizeSiteConfig,
  siteConfigSchema,
  toSiteConfigFieldErrors,
  type SiteConfig,
  type SiteConfigFieldErrors,
} from '@/lib/site-config'
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

function getPersistedConfigPayload(config: SiteConfig) {
  return {
    nombre_hotel: config.nombre_hotel,
    slogan: config.slogan,
    descripcion: config.descripcion,
    direccion: config.direccion,
    ciudad: config.ciudad,
    pais: config.pais,
    telefono: config.telefono,
    telefono_secundario: config.telefono_secundario,
    email: config.email,
    email_reservas: config.email_reservas,
    sitio_web: config.sitio_web,
    facebook: config.facebook,
    instagram: config.instagram,
    twitter: config.twitter,
    politica_cancelacion: config.politica_cancelacion,
    politica_checkin: config.politica_checkin,
    hora_checkin: config.hora_checkin,
    hora_checkout: config.hora_checkout,
    moneda: config.moneda,
    porcentaje_adelanto: Number(config.porcentaje_adelanto) || 0,
    ruc: config.ruc,
    razon_social: config.razon_social,
    modo_mantenimiento: config.modo_mantenimiento || false,
    mensaje_mantenimiento: config.mensaje_mantenimiento || '',
    fecha_reanudacion: config.fecha_reanudacion || '',
    mostrar_contador: config.mostrar_contador || false,
    permitir_admin: config.permitir_admin || true,
    updated_at: new Date().toISOString(),
  }
}

export default function ConfiguracionPage() {
  const supabase = createClient()
  const { overwriteConfig } = useSiteConfig()

  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig)
  const [initialConfig, setInitialConfig] = useState<SiteConfig>(defaultSiteConfig)
  const [errors, setErrors] = useState<SiteConfigFieldErrors>({})
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

      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error cargando configuracion:', error)
        setLoadIssue(
          error.message.includes('relation "configuracion" does not exist')
            ? 'La tabla "configuracion" no existe aun en la base de datos.'
            : 'No se pudo cargar la configuracion desde Supabase.',
        )
        setConfig(defaultSiteConfig)
        setInitialConfig(defaultSiteConfig)
        overwriteConfig(defaultSiteConfig)
        return
      }

      const normalized = normalizeSiteConfig(data)
      setConfig(normalized)
      setInitialConfig(normalized)
      overwriteConfig(normalized)
    } catch (error) {
      console.error('Error inesperado cargando configuracion:', error)
      setLoadIssue('Ocurrio un error inesperado al cargar la configuracion.')
      setConfig(defaultSiteConfig)
      setInitialConfig(defaultSiteConfig)
      overwriteConfig(defaultSiteConfig)
    } finally {
      setLoading(false)
    }
  }

  function updateField<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSave() {
    const payload = getPersistedConfigPayload(config)
    const validation = siteConfigSchema.safeParse(payload)

    if (!validation.success) {
      setErrors(toSiteConfigFieldErrors(validation.error))
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
      setLoadIssue(null)

      let savedConfig: SiteConfig | null = null

      if (config.id) {
        const { data, error } = await supabase
          .from('configuracion')
          .update(validation.data)
          .eq('id', config.id)
          .select('*')
          .single()

        if (error) throw error
        savedConfig = normalizeSiteConfig(data)
      } else {
        const { data, error } = await supabase
          .from('configuracion')
          .insert([validation.data])
          .select('*')
          .single()

        if (error) throw error
        savedConfig = normalizeSiteConfig(data)
      }

      if (!savedConfig) {
        throw new Error('No se recibio la configuracion guardada.')
      }

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
      const message =
        error?.message?.includes('relation "configuracion" does not exist')
          ? 'La tabla "configuracion" no existe en la base de datos. Ejecuta la migracion 008 primero.'
          : error?.message || 'No se pudo guardar la configuracion.'

      setLoadIssue(message)

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: message,
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

  const previewAddress = getFullAddress(config)

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

      {/* Logo de Adventur */}
      <div className="flex justify-center mb-2">
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 rounded-2xl shadow-lg">
          <svg viewBox="0 0 200 200" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 60 150 L 100 50 L 140 150 L 120 150 L 100 100 L 80 150 Z" 
              fill="white"
            />
            <g transform="translate(120, 40)">
              <rect x="0" y="0" width="30" height="50" fill="white" rx="2"/>
              <rect x="3" y="3" width="4" height="4" fill="#FDB913"/>
              <rect x="10" y="3" width="4" height="4" fill="#FDB913"/>
              <rect x="17" y="3" width="4" height="4" fill="#FDB913"/>
              <rect x="24" y="3" width="4" height="4" fill="#FDB913"/>
              <rect x="3" y="10" width="4" height="4" fill="#FDB913"/>
              <rect x="10" y="10" width="4" height="4" fill="#FDB913"/>
              <rect x="17" y="10" width="4" height="4" fill="#FDB913"/>
              <rect x="24" y="10" width="4" height="4" fill="#FDB913"/>
              <rect x="3" y="17" width="4" height="4" fill="#FDB913"/>
              <rect x="10" y="17" width="4" height="4" fill="#FDB913"/>
              <rect x="17" y="17" width="4" height="4" fill="#FDB913"/>
              <rect x="24" y="17" width="4" height="4" fill="#FDB913"/>
            </g>
          </svg>
          <span className="text-white font-bold text-xl">ADVENTUR</span>
        </div>
      </div>

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
                  <InputField label="Nombre del hotel" value={config.nombre_hotel} onChange={(value) => updateField('nombre_hotel', value)} error={errors.nombre_hotel} placeholder="Hotel Adventur" />
                  <InputField label="Slogan" value={config.slogan} onChange={(value) => updateField('slogan', value)} error={errors.slogan} placeholder="Tu viaje, tu hogar" />
                </div>
                <TextareaField label="Descripcion" value={config.descripcion} onChange={(value) => updateField('descripcion', value)} error={errors.descripcion} placeholder="Descripcion general del hotel para el sitio web." rows={4} />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Hora de check-in" type="time" value={config.hora_checkin} onChange={(value) => updateField('hora_checkin', value)} error={errors.hora_checkin} />
                  <InputField label="Hora de check-out" type="time" value={config.hora_checkout} onChange={(value) => updateField('hora_checkout', value)} error={errors.hora_checkout} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Moneda"
                    value={config.moneda}
                    onChange={(value) => updateField('moneda', value)}
                    error={errors.moneda}
                    options={[
                      { value: 'PEN', label: 'PEN - Sol peruano' },
                      { value: 'USD', label: 'USD - Dolar estadounidense' },
                      { value: 'EUR', label: 'EUR - Euro' },
                    ]}
                  />
                  <InputField
                    label="Porcentaje de adelanto"
                    type="number"
                    value={String(config.porcentaje_adelanto)}
                    onChange={(value) => updateField('porcentaje_adelanto', Number(value))}
                    error={errors.porcentaje_adelanto}
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            ) : null}

            {activeTab === 'contacto' ? (
              <div className="space-y-6">
                <SectionHeader
                  title="Contacto y ubicacion"
                  description="Informacion publica que se muestra en footer, contacto y textos legales."
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Telefono principal" type="tel" value={config.telefono} onChange={(value) => updateField('telefono', value)} error={errors.telefono} placeholder="+51 999 999 999" />
                  <InputField label="Telefono secundario" type="tel" value={config.telefono_secundario} onChange={(value) => updateField('telefono_secundario', value)} error={errors.telefono_secundario} placeholder="+51 999 999 999" />
                  <InputField label="Email principal" type="email" value={config.email} onChange={(value) => updateField('email', value)} error={errors.email} placeholder="info@hotel.com" />
                  <InputField label="Email de reservas" type="email" value={config.email_reservas} onChange={(value) => updateField('email_reservas', value)} error={errors.email_reservas} placeholder="reservas@hotel.com" />
                </div>
                <InputField label="Direccion" value={config.direccion} onChange={(value) => updateField('direccion', value)} error={errors.direccion} placeholder="Av. Principal 123" />
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Ciudad" value={config.ciudad} onChange={(value) => updateField('ciudad', value)} error={errors.ciudad} placeholder="Cajamarca" />
                  <InputField label="Pais" value={config.pais} onChange={(value) => updateField('pais', value)} error={errors.pais} placeholder="Peru" />
                </div>
                <InputField label="Sitio web" type="url" value={config.sitio_web} onChange={(value) => updateField('sitio_web', value)} error={errors.sitio_web} placeholder="https://www.hotel.com" />
              </div>
            ) : null}

            {activeTab === 'redes' ? (
              <div className="space-y-6">
                <SectionHeader
                  title="Redes sociales"
                  description="Enlaces usados en el footer y otras zonas de contacto del sitio."
                />
                <InputField label="Facebook" type="url" value={config.facebook} onChange={(value) => updateField('facebook', value)} error={errors.facebook} placeholder="https://facebook.com/tuhotel" />
                <InputField label="Instagram" type="url" value={config.instagram} onChange={(value) => updateField('instagram', value)} error={errors.instagram} placeholder="https://instagram.com/tuhotel" />
                <InputField label="Twitter / X" type="url" value={config.twitter} onChange={(value) => updateField('twitter', value)} error={errors.twitter} placeholder="https://x.com/tuhotel" />
              </div>
            ) : null}

            {activeTab === 'politicas' ? (
              <div className="space-y-6">
                <SectionHeader
                  title="Politicas"
                  description="Textos visibles en terminos, contacto y experiencia de reserva."
                />
                <TextareaField label="Politica de cancelacion" value={config.politica_cancelacion} onChange={(value) => updateField('politica_cancelacion', value)} error={errors.politica_cancelacion} placeholder="Describe condiciones de cancelacion, reembolsos y plazos." rows={6} />
                <TextareaField label="Politica de check-in / check-out" value={config.politica_checkin} onChange={(value) => updateField('politica_checkin', value)} error={errors.politica_checkin} placeholder="Describe horarios, tolerancias, early check-in y late check-out." rows={6} />
              </div>
            ) : null}

            {activeTab === 'facturacion' ? (
              <div className="space-y-6">
                <SectionHeader
                  title="Facturacion"
                  description="Datos comerciales usados para comprobantes y procesos administrativos."
                />
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Estos datos se usan como base para comprobantes y documentacion comercial del hotel.
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="RUC" value={config.ruc} onChange={(value) => updateField('ruc', value)} error={errors.ruc} placeholder="20123456789" />
                  <InputField label="Razon social" value={config.razon_social} onChange={(value) => updateField('razon_social', value)} error={errors.razon_social} placeholder="HOTEL ADVENTUR S.A.C." />
                </div>
              </div>
            ) : null}

            {activeTab === 'mantenimiento' ? (
              <div className="space-y-6">
                <SectionHeader
                  title="Modo Mantenimiento"
                  description="Configura el sitio en modo mantenimiento para actualizaciones o mantenimientos programados."
                />
                
                {/* Toggle principal de mantenimiento */}
                <div className={`rounded-2xl border p-6 transition-all ${config.modo_mantenimiento ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.modo_mantenimiento ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        <Wrench size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Modo Mantenimiento</h3>
                        <p className="text-sm text-gray-600 mt-1">Activa para mostrar página de mantenimiento a los visitantes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateField('modo_mantenimiento', !config.modo_mantenimiento)}
                      className={`relative w-16 h-8 rounded-full transition-all duration-300 ${config.modo_mantenimiento ? 'bg-red-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${config.modo_mantenimiento ? 'left-9' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {config.modo_mantenimiento && (
                  <div className="space-y-5 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                      <ShieldAlert className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-red-800">⚠️ Sitio en mantenimiento</p>
                        <p className="text-sm text-red-700 mt-1">Los visitantes verán la página de mantenimiento. Solo administradores podrán acceder al sitio.</p>
                      </div>
                    </div>

                    <TextareaField 
                      label="Mensaje de mantenimiento" 
                      value={config.mensaje_mantenimiento} 
                      onChange={(value) => updateField('mensaje_mantenimiento', value)} 
                      placeholder="Estamos realizando mejoras para brindarte un mejor servicio. Volveremos pronto." 
                      rows={4} 
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField 
                        label="Fecha y hora de reanudación" 
                        type="datetime-local" 
                        value={config.fecha_reanudacion} 
                        onChange={(value) => updateField('fecha_reanudacion', value)}
                      />
                      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                        <input
                          type="checkbox"
                          checked={config.mostrar_contador}
                          onChange={(e) => updateField('mostrar_contador', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">Mostrar contador regresivo</p>
                          <p className="text-xs text-gray-500">Muestra el tiempo restante para la reanudación</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                      <input
                        type="checkbox"
                        checked={config.permitir_admin}
                        onChange={(e) => updateField('permitir_admin', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Permitir acceso a administradores</p>
                        <p className="text-xs text-gray-500">Los administradores podrán navegar el sitio normalmente</p>
                      </div>
                    </div>
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
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">{config.nombre_hotel}</h2>
                <p className="mt-2 text-sm text-gray-600">{config.slogan}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>

            <div className="mt-6 space-y-4">
              <PreviewItem icon={Phone} label="Telefonos" value={[config.telefono, config.telefono_secundario].filter(Boolean).join(' / ') || 'Sin configurar'} />
              <PreviewItem icon={Mail} label="Correos" value={[config.email, config.email_reservas].filter(Boolean).join(' / ') || 'Sin configurar'} />
              <PreviewItem icon={Globe} label="Sitio web" value={config.sitio_web || 'Sin configurar'} />
              <PreviewItem icon={Settings} label="Direccion" value={previewAddress || 'Sin configurar'} />
            </div>
            
            {/* Estado Mantenimiento */}
            <div className={`mt-4 p-4 rounded-2xl ${config.modo_mantenimiento ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
              <div className="flex items-center gap-3">
                {config.modo_mantenimiento ? (
                  <BellOff className="w-5 h-5 text-red-500" />
                ) : (
                  <Zap className="w-5 h-5 text-emerald-500" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">Estado del sitio</p>
                  <p className={`text-sm ${config.modo_mantenimiento ? 'text-red-700' : 'text-emerald-700'}`}>
                    {config.modo_mantenimiento ? '🔴 En Mantenimiento' : '🟢 Operativo Normal'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Estado del modulo</p>
            <div className="mt-5 space-y-4">
              <StatusRow
                ok={Boolean(config.nombre_hotel && config.telefono && config.email)}
                title="Informacion publica"
                description="Logo, footer y pagina de contacto consumen estos datos."
              />
              <StatusRow
                ok={Boolean(config.politica_cancelacion || config.politica_checkin)}
                title="Textos operativos"
                description="Terminos y condiciones usan las politicas configuradas."
              />
              <StatusRow
                ok={Boolean(config.ruc || config.razon_social)}
                title="Facturacion"
                description="Lista para documentacion administrativa."
              />
              <StatusRow
                ok={!isDirty}
                title="Sincronizacion"
                description={isDirty ? 'Hay cambios sin guardar.' : 'El panel y el sitio estan sincronizados.'}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          {saving ? 'Guardando...' : 'Guardar configuracion'}
        </button>
      </div>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
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
  min,
  max,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
  placeholder?: string
  min?: number
  max?: number
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition ${
          error ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }`}
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
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
  error?: string
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
        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition ${
          error ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }`}
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  error,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition ${
          error ? 'border-red-300 ring-4 ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

function PreviewItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">{label}</p>
        <p className="mt-1 text-sm leading-6 text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function StatusRow({
  ok,
  title,
  description,
}: {
  ok: boolean
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
      )}
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
      </div>
    </div>
  )
}
