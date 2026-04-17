'use client'

import { useEffect, useState } from 'react'
import { Settings, ShieldCheck, Store, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/useNotificacion'
import { useSiteConfig } from '@/components/providers/ProveedorConfiguracionSitio'
import { createClient } from '@/utils/supabase/client'
import { SiteConfigRepository } from '@/lib/repositories/site-config.repository'
import { siteConfigSchema, type SiteConfig } from '@/lib/validations/site-config.schema'
import { AdminField, AdminPageShell, AdminPanel, AdminStatCard } from '@/components/admin'

export default function AdminConfiguracionPage() {
  const { config, refreshConfig } = useSiteConfig()
  const [form, setForm] = useState<SiteConfig>(config)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setForm(config)
  }, [config])

  function updateIdentity<K extends keyof SiteConfig['identity']>(
    key: K,
    value: SiteConfig['identity'][K],
  ) {
    setForm((current) => ({
      ...current,
      identity: {
        ...current.identity,
        [key]: value,
      },
    }))
  }

  function updateContact<K extends keyof SiteConfig['contact']>(
    key: K,
    value: SiteConfig['contact'][K],
  ) {
    setForm((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [key]: value,
      },
    }))
  }

  function updateSocial<K extends keyof SiteConfig['contact']['redes_sociales']>(
    key: K,
    value: SiteConfig['contact']['redes_sociales'][K],
  ) {
    setForm((current) => ({
      ...current,
      contact: {
        ...current.contact,
        redes_sociales: {
          ...current.contact.redes_sociales,
          [key]: value,
        },
      },
    }))
  }

  function updatePolicies<K extends keyof SiteConfig['policies']>(
    key: K,
    value: SiteConfig['policies'][K],
  ) {
    setForm((current) => ({
      ...current,
      policies: {
        ...current.policies,
        [key]: value,
      },
    }))
  }

  function updateLegal<K extends keyof SiteConfig['legal']>(key: K, value: SiteConfig['legal'][K]) {
    setForm((current) => ({
      ...current,
      legal: {
        ...current.legal,
        [key]: value,
      },
    }))
  }

  function updateSystem<K extends keyof SiteConfig['system']>(
    key: K,
    value: SiteConfig['system'][K],
  ) {
    setForm((current) => ({
      ...current,
      system: {
        ...current.system,
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    const parsed = siteConfigSchema.safeParse(form)

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'La configuración contiene datos no válidos.')
      return
    }

    try {
      setSaving(true)
      const repository = new SiteConfigRepository(createClient())
      await repository.updateConfig(parsed.data)
      await refreshConfig()
      toast.success('Configuración guardada correctamente.')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo guardar la configuración.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell
      title="Configuración"
      description="Parámetros globales del hotel, contacto, políticas de negocio y control del sistema."
      actions={
        <>
          <button type="button" className="admin-button-secondary" onClick={() => setForm(config)}>
            <RefreshCw className="h-4 w-4" />
            Restablecer
          </button>
          <button type="button" className="admin-button-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </>
      }
    >
      <section className="admin-grid">
        <AdminStatCard
          title="Marca"
          value={form.identity.nombre}
          helper="Nombre comercial"
          icon={Store}
          tone="blue"
        />
        <AdminStatCard
          title="Moneda"
          value={form.policies.moneda}
          helper="Operación comercial"
          icon={Settings}
          tone="amber"
        />
        <AdminStatCard
          title="Acceso admin"
          value={form.system.permitir_admin ? 'Activo' : 'Bloqueado'}
          helper="Ingreso al panel"
          icon={ShieldCheck}
          tone="green"
        />
        <AdminStatCard
          title="Mantenimiento"
          value={form.system.modo_mantenimiento ? 'Sí' : 'No'}
          helper="Estado público"
          icon={RefreshCw}
          tone="purple"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel className="p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Identidad</h2>
              <p className="mt-1 text-sm text-slate-500">Información principal de marca y propuesta comercial.</p>
            </div>
            <div className="grid gap-4">
              <AdminField label="Nombre del hotel">
                <input
                  className="admin-input"
                  value={form.identity.nombre}
                  onChange={(event) => updateIdentity('nombre', event.target.value)}
                />
              </AdminField>
              <AdminField label="Slogan">
                <input
                  className="admin-input"
                  value={form.identity.slogan}
                  onChange={(event) => updateIdentity('slogan', event.target.value)}
                />
              </AdminField>
              <AdminField label="Descripción">
                <textarea
                  className="admin-input min-h-32"
                  value={form.identity.descripcion}
                  onChange={(event) => updateIdentity('descripcion', event.target.value)}
                />
              </AdminField>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel className="p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Contacto</h2>
              <p className="mt-1 text-sm text-slate-500">Canales públicos y datos de ubicación del hotel.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Dirección">
                <input
                  className="admin-input"
                  value={form.contact.direccion}
                  onChange={(event) => updateContact('direccion', event.target.value)}
                />
              </AdminField>
              <AdminField label="Ciudad">
                <input
                  className="admin-input"
                  value={form.contact.ciudad}
                  onChange={(event) => updateContact('ciudad', event.target.value)}
                />
              </AdminField>
              <AdminField label="País">
                <input
                  className="admin-input"
                  value={form.contact.pais}
                  onChange={(event) => updateContact('pais', event.target.value)}
                />
              </AdminField>
              <AdminField label="Teléfono">
                <input
                  className="admin-input"
                  value={form.contact.telefono}
                  onChange={(event) => updateContact('telefono', event.target.value)}
                />
              </AdminField>
              <AdminField label="Teléfono secundario">
                <input
                  className="admin-input"
                  value={form.contact.telefono_secundario || ''}
                  onChange={(event) => updateContact('telefono_secundario', event.target.value)}
                />
              </AdminField>
              <AdminField label="Correo principal">
                <input
                  type="email"
                  className="admin-input"
                  value={form.contact.email}
                  onChange={(event) => updateContact('email', event.target.value)}
                />
              </AdminField>
              <AdminField label="Correo de reservas">
                <input
                  type="email"
                  className="admin-input"
                  value={form.contact.email_reservas}
                  onChange={(event) => updateContact('email_reservas', event.target.value)}
                />
              </AdminField>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel className="p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Redes y presencia digital</h2>
              <p className="mt-1 text-sm text-slate-500">Enlaces públicos visibles en el sitio y contacto rápido.</p>
            </div>
            <div className="grid gap-4">
              <AdminField label="Facebook">
                <input
                  className="admin-input"
                  value={form.contact.redes_sociales.facebook || ''}
                  onChange={(event) => updateSocial('facebook', event.target.value)}
                />
              </AdminField>
              <AdminField label="Instagram">
                <input
                  className="admin-input"
                  value={form.contact.redes_sociales.instagram || ''}
                  onChange={(event) => updateSocial('instagram', event.target.value)}
                />
              </AdminField>
              <AdminField label="Twitter">
                <input
                  className="admin-input"
                  value={form.contact.redes_sociales.twitter || ''}
                  onChange={(event) => updateSocial('twitter', event.target.value)}
                />
              </AdminField>
              <AdminField label="Sitio web">
                <input
                  className="admin-input"
                  value={form.contact.redes_sociales.sitio_web || ''}
                  onChange={(event) => updateSocial('sitio_web', event.target.value)}
                />
              </AdminField>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel className="p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Políticas</h2>
              <p className="mt-1 text-sm text-slate-500">Reglas comerciales y operativas del hospedaje.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Hora check-in">
                <input
                  type="time"
                  className="admin-input"
                  value={form.policies.hora_checkin}
                  onChange={(event) => updatePolicies('hora_checkin', event.target.value)}
                />
              </AdminField>
              <AdminField label="Hora check-out">
                <input
                  type="time"
                  className="admin-input"
                  value={form.policies.hora_checkout}
                  onChange={(event) => updatePolicies('hora_checkout', event.target.value)}
                />
              </AdminField>
              <AdminField label="Moneda">
                <select
                  className="admin-input"
                  value={form.policies.moneda}
                  onChange={(event) => updatePolicies('moneda', event.target.value as SiteConfig['policies']['moneda'])}
                >
                  <option value="PEN">PEN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </AdminField>
              <AdminField label="Porcentaje de adelanto">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="admin-input"
                  value={form.policies.porcentaje_adelanto}
                  onChange={(event) => updatePolicies('porcentaje_adelanto', Number(event.target.value))}
                />
              </AdminField>
              <AdminField label="Política de cancelación">
                <textarea
                  className="admin-input min-h-32"
                  value={form.policies.cancelacion}
                  onChange={(event) => updatePolicies('cancelacion', event.target.value)}
                />
              </AdminField>
              <AdminField label="Política de check-in/check-out">
                <textarea
                  className="admin-input min-h-32"
                  value={form.policies.checkinout}
                  onChange={(event) => updatePolicies('checkinout', event.target.value)}
                />
              </AdminField>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel className="p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Datos legales y sistema</h2>
              <p className="mt-1 text-sm text-slate-500">Control interno para operación, mantenimiento y facturación.</p>
            </div>
            <div className="grid gap-4">
              <AdminField label="RUC">
                <input
                  className="admin-input"
                  value={form.legal.ruc || ''}
                  onChange={(event) => updateLegal('ruc', event.target.value)}
                />
              </AdminField>
              <AdminField label="Razón social">
                <input
                  className="admin-input"
                  value={form.legal.razon_social || ''}
                  onChange={(event) => updateLegal('razon_social', event.target.value)}
                />
              </AdminField>
              <AdminField label="Mensaje de mantenimiento">
                <textarea
                  className="admin-input min-h-28"
                  value={form.system.mensaje_mantenimiento}
                  onChange={(event) => updateSystem('mensaje_mantenimiento', event.target.value)}
                />
              </AdminField>
              <AdminField label="Fecha de reanudación">
                <input
                  className="admin-input"
                  value={form.system.fecha_reanudacion || ''}
                  onChange={(event) => updateSystem('fecha_reanudacion', event.target.value)}
                  placeholder="2026-04-30 12:00"
                />
              </AdminField>
              <div className="grid gap-3">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    checked={form.system.modo_mantenimiento}
                    onChange={(event) => updateSystem('modo_mantenimiento', event.target.checked)}
                  />
                  Modo mantenimiento
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    checked={form.system.mostrar_contador}
                    onChange={(event) => updateSystem('mostrar_contador', event.target.checked)}
                  />
                  Mostrar contador de reanudación
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    checked={form.system.permitir_admin}
                    onChange={(event) => updateSystem('permitir_admin', event.target.checked)}
                  />
                  Permitir acceso administrativo
                </label>
              </div>
            </div>
          </div>
        </AdminPanel>
      </div>
    </AdminPageShell>
  )
}
