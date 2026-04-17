'use client'

import { useEffect, useState, type FormEvent } from 'react'
import type { AlojamientoForm } from '@/hooks/useAlojamientos'
import { AdminField } from './AdminField'

type AlojamientoDraft = {
  nombre: string
  descripcion: string
  direccion: string
  departamento: string
  provincia: string
  distrito: string
  categoria: string
  tipo: string
  precio_base: number
  capacidad_maxima: number
  servicios_incluidos: string
  activo: boolean
}

type AlojamientoInitialValue = Partial<AlojamientoForm>

const defaultValues: AlojamientoDraft = {
  nombre: '',
  descripcion: '',
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  categoria: '',
  tipo: '',
  precio_base: 0,
  capacidad_maxima: 1,
  servicios_incluidos: '',
  activo: true,
}

function createValues(initialValue?: AlojamientoInitialValue | null): AlojamientoDraft {
  if (!initialValue) {
    return defaultValues
  }

  return {
    nombre: initialValue.nombre ?? '',
    descripcion: initialValue.descripcion ?? '',
    direccion: initialValue.direccion ?? '',
    departamento: initialValue.departamento ?? '',
    provincia: initialValue.provincia ?? '',
    distrito: initialValue.distrito ?? '',
    categoria: initialValue.categoria ?? '',
    tipo: initialValue.tipo ?? '',
    precio_base: initialValue.precio_base ?? 0,
    capacidad_maxima: initialValue.capacidad_maxima ?? 1,
    servicios_incluidos: initialValue.servicios_incluidos?.join(', ') ?? '',
    activo: initialValue.activo ?? true,
  }
}

export function AdminAlojamientoForm({
  mode,
  initialValue,
  saving,
  onCancel,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  initialValue?: AlojamientoInitialValue | null
  saving: boolean
  onCancel: () => void
  onSubmit: (payload: AlojamientoForm) => Promise<void> | void
}) {
  const [values, setValues] = useState<AlojamientoDraft>(() => createValues(initialValue))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues(createValues(initialValue))
    setError(null)
  }, [initialValue])

  const handleChange = <K extends keyof AlojamientoDraft>(key: K, value: AlojamientoDraft[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!values.nombre || !values.categoria || !values.tipo) {
      setError('Nombre, categoría y tipo son obligatorios.')
      return
    }

    if (values.precio_base < 0 || values.capacidad_maxima < 1) {
      setError('Precio y capacidad deben ser valores válidos.')
      return
    }

    setError(null)

    await onSubmit({
      nombre: values.nombre,
      descripcion: values.descripcion,
      direccion: values.direccion,
      departamento: values.departamento,
      provincia: values.provincia,
      distrito: values.distrito,
      categoria: values.categoria,
      tipo: values.tipo,
      precio_base: Number(values.precio_base),
      capacidad_maxima: Number(values.capacidad_maxima),
      servicios_incluidos: values.servicios_incluidos
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      activo: values.activo,
    })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Nombre">
          <input
            className="admin-input"
            value={values.nombre}
            onChange={(event) => handleChange('nombre', event.target.value)}
          />
        </AdminField>
        <AdminField label="Categoría">
          <input
            className="admin-input"
            value={values.categoria}
            onChange={(event) => handleChange('categoria', event.target.value)}
            placeholder="Hotel boutique"
          />
        </AdminField>
        <AdminField label="Tipo">
          <input
            className="admin-input"
            value={values.tipo}
            onChange={(event) => handleChange('tipo', event.target.value)}
            placeholder="Suite, estándar, cabaña"
          />
        </AdminField>
        <AdminField label="Dirección">
          <input
            className="admin-input"
            value={values.direccion}
            onChange={(event) => handleChange('direccion', event.target.value)}
          />
        </AdminField>
        <AdminField label="Departamento">
          <input
            className="admin-input"
            value={values.departamento}
            onChange={(event) => handleChange('departamento', event.target.value)}
          />
        </AdminField>
        <AdminField label="Provincia">
          <input
            className="admin-input"
            value={values.provincia}
            onChange={(event) => handleChange('provincia', event.target.value)}
          />
        </AdminField>
        <AdminField label="Distrito">
          <input
            className="admin-input"
            value={values.distrito}
            onChange={(event) => handleChange('distrito', event.target.value)}
          />
        </AdminField>
        <AdminField label="Precio base (PEN)">
          <input
            type="number"
            min={0}
            className="admin-input"
            value={values.precio_base}
            onChange={(event) => handleChange('precio_base', Number(event.target.value))}
          />
        </AdminField>
        <AdminField label="Capacidad máxima">
          <input
            type="number"
            min={1}
            className="admin-input"
            value={values.capacidad_maxima}
            onChange={(event) => handleChange('capacidad_maxima', Number(event.target.value))}
          />
        </AdminField>
        <AdminField label="Servicios incluidos">
          <input
            className="admin-input"
            value={values.servicios_incluidos}
            onChange={(event) => handleChange('servicios_incluidos', event.target.value)}
            placeholder="WiFi, desayuno, traslado"
          />
        </AdminField>
      </div>

      <AdminField label="Descripción">
        <textarea
          className="admin-input min-h-32"
          value={values.descripcion}
          onChange={(event) => handleChange('descripcion', event.target.value)}
        />
      </AdminField>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="admin-checkbox"
          checked={values.activo}
          onChange={(event) => handleChange('activo', event.target.checked)}
        />
        Alojamiento activo
      </label>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="admin-button-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="admin-button-primary" disabled={saving}>
          {saving ? 'Guardando...' : mode === 'create' ? 'Crear alojamiento' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
