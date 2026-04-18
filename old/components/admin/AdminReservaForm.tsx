'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AdminField } from './AdminField'

export type ReservaPayload = {
  codigo_reserva: string
  fecha_inicio: string
  fecha_fin: string
  personas: number
  total: number
  estado: string
  usuario_id: string
  alojamiento_id: string
}

export type ReservaOption = {
  id: string
  label: string
}

const defaultValues: ReservaPayload = {
  codigo_reserva: '',
  fecha_inicio: '',
  fecha_fin: '',
  personas: 1,
  total: 0,
  estado: 'pendiente',
  usuario_id: '',
  alojamiento_id: '',
}

export function AdminReservaForm({
  mode,
  initialValue,
  usuarios,
  alojamientos,
  saving,
  onCancel,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  initialValue?: Partial<ReservaPayload> | null
  usuarios: ReservaOption[]
  alojamientos: ReservaOption[]
  saving: boolean
  onCancel: () => void
  onSubmit: (payload: ReservaPayload) => Promise<void> | void
}) {
  const [values, setValues] = useState<ReservaPayload>({ ...defaultValues, ...initialValue })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues({ ...defaultValues, ...initialValue })
    setError(null)
  }, [initialValue])

  const handleChange = <K extends keyof ReservaPayload>(key: K, value: ReservaPayload[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !values.codigo_reserva ||
      !values.fecha_inicio ||
      !values.fecha_fin ||
      !values.usuario_id ||
      !values.alojamiento_id
    ) {
      setError('Completa el código, fechas, huésped y alojamiento.')
      return
    }

    if (values.personas < 1 || values.total < 0) {
      setError('Los valores de personas y total no son válidos.')
      return
    }

    setError(null)
    await onSubmit({
      ...values,
      personas: Number(values.personas),
      total: Number(values.total),
    })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Código">
          <input
            className="admin-input"
            value={values.codigo_reserva}
            onChange={(event) => handleChange('codigo_reserva', event.target.value)}
          />
        </AdminField>
        <AdminField label="Estado">
          <select
            className="admin-input"
            value={values.estado}
            onChange={(event) => handleChange('estado', event.target.value)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="check_in">Check-in</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </AdminField>
        <AdminField label="Fecha de inicio">
          <input
            type="date"
            className="admin-input"
            value={values.fecha_inicio}
            onChange={(event) => handleChange('fecha_inicio', event.target.value)}
          />
        </AdminField>
        <AdminField label="Fecha de fin">
          <input
            type="date"
            className="admin-input"
            value={values.fecha_fin}
            onChange={(event) => handleChange('fecha_fin', event.target.value)}
          />
        </AdminField>
        <AdminField label="Personas">
          <input
            type="number"
            min={1}
            className="admin-input"
            value={values.personas}
            onChange={(event) => handleChange('personas', Number(event.target.value))}
          />
        </AdminField>
        <AdminField label="Total (PEN)">
          <input
            type="number"
            min={0}
            className="admin-input"
            value={values.total}
            onChange={(event) => handleChange('total', Number(event.target.value))}
          />
        </AdminField>
        <AdminField label="Huésped">
          <select
            className="admin-input"
            value={values.usuario_id}
            onChange={(event) => handleChange('usuario_id', event.target.value)}
          >
            <option value="">Seleccionar</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Alojamiento">
          <select
            className="admin-input"
            value={values.alojamiento_id}
            onChange={(event) => handleChange('alojamiento_id', event.target.value)}
          >
            <option value="">Seleccionar</option>
            {alojamientos.map((alojamiento) => (
              <option key={alojamiento.id} value={alojamiento.id}>
                {alojamiento.label}
              </option>
            ))}
          </select>
        </AdminField>
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="admin-button-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="admin-button-primary" disabled={saving}>
          {saving ? 'Guardando...' : mode === 'create' ? 'Crear reserva' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
