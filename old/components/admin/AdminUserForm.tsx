'use client'

import { useEffect, useState, type FormEvent } from 'react'
import type { Usuario } from '@/lib/repositories/usuario.repository'
import {
  PAISES,
  ROLES,
  TIPOS_DOCUMENTO,
  UsuarioValidator,
  type UsuarioCreateInput,
  type UsuarioUpdateInput,
  type ValidationErrors,
} from '@/lib/validations/usuario.schema'
import { AdminField } from './AdminField'

type UserFormValues = {
  nombre: string
  apellido: string
  email: string
  telefono: string
  documento_identidad: string
  tipo_documento: string
  pais: string
  rol: 'admin' | 'propietario' | 'turista'
  verificado: boolean
  password: string
}

const initialValues: UserFormValues = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  documento_identidad: '',
  tipo_documento: '',
  pais: PAISES[0] ?? '',
  rol: 'turista',
  verificado: false,
  password: '',
}

function createValues(usuario?: Partial<Usuario> | null): UserFormValues {
  if (!usuario) {
    return initialValues
  }

  return {
    nombre: usuario.nombre ?? '',
    apellido: usuario.apellido ?? '',
    email: usuario.email ?? '',
    telefono: usuario.telefono ?? '',
    documento_identidad: usuario.documento_identidad ?? '',
    tipo_documento: usuario.tipo_documento ?? '',
    pais: usuario.pais ?? PAISES[0] ?? '',
    rol: usuario.rol ?? 'turista',
    verificado: usuario.verificado ?? false,
    password: '',
  }
}

export function AdminUserForm({
  mode,
  initialValue,
  saving,
  onCancel,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  initialValue?: Partial<Usuario> | null
  saving: boolean
  onCancel: () => void
  onSubmit: (payload: UsuarioCreateInput | UsuarioUpdateInput) => Promise<void> | void
}) {
  const [values, setValues] = useState<UserFormValues>(() => createValues(initialValue))
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    setValues(createValues(initialValue))
    setErrors({})
  }, [initialValue])

  const handleChange = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      telefono: values.telefono,
      documento_identidad: values.documento_identidad || undefined,
      tipo_documento: values.tipo_documento
        ? (values.tipo_documento as UsuarioCreateInput['tipo_documento'])
        : undefined,
      pais: values.pais || undefined,
      rol: values.rol,
      verificado: values.verificado,
    }

    if (mode === 'create') {
      const createPayload: UsuarioCreateInput = {
        ...payload,
        password: values.password,
      }
      const validationErrors = UsuarioValidator.validateCreate(createPayload)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length > 0) {
        return
      }

      await onSubmit(createPayload)
      return
    }

    const updatePayload: UsuarioUpdateInput = payload
    const validationErrors = UsuarioValidator.validateUpdate(updatePayload)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    await onSubmit(updatePayload)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Nombre" error={errors.nombre}>
          <input
            className="admin-input"
            value={values.nombre}
            onChange={(event) => handleChange('nombre', event.target.value)}
          />
        </AdminField>
        <AdminField label="Apellido" error={errors.apellido}>
          <input
            className="admin-input"
            value={values.apellido}
            onChange={(event) => handleChange('apellido', event.target.value)}
          />
        </AdminField>
        <AdminField label="Correo" error={errors.email}>
          <input
            type="email"
            className="admin-input"
            value={values.email}
            onChange={(event) => handleChange('email', event.target.value)}
          />
        </AdminField>
        <AdminField label="Teléfono" error={errors.telefono}>
          <input
            className="admin-input"
            value={values.telefono}
            onChange={(event) => handleChange('telefono', event.target.value)}
            placeholder="+51999999999"
          />
        </AdminField>
        <AdminField label="Tipo de documento" error={errors.tipo_documento}>
          <select
            className="admin-input"
            value={values.tipo_documento}
            onChange={(event) => handleChange('tipo_documento', event.target.value)}
          >
            <option value="">Seleccionar</option>
            {TIPOS_DOCUMENTO.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Documento" error={errors.documento_identidad}>
          <input
            className="admin-input"
            value={values.documento_identidad}
            onChange={(event) => handleChange('documento_identidad', event.target.value)}
          />
        </AdminField>
        <AdminField label="País" error={errors.pais}>
          <select
            className="admin-input"
            value={values.pais}
            onChange={(event) => handleChange('pais', event.target.value)}
          >
            {PAISES.map((pais) => (
              <option key={pais} value={pais}>
                {pais}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Rol" error={errors.rol}>
          <select
            className="admin-input"
            value={values.rol}
            onChange={(event) => handleChange('rol', event.target.value as UserFormValues['rol'])}
          >
            {ROLES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </AdminField>
        {mode === 'create' ? (
          <AdminField label="Contraseña" error={errors.password} >
            <input
              type="password"
              className="admin-input"
              value={values.password}
              onChange={(event) => handleChange('password', event.target.value)}
            />
          </AdminField>
        ) : null}
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="admin-checkbox"
          checked={values.verificado}
          onChange={(event) => handleChange('verificado', event.target.checked)}
        />
        Usuario verificado
      </label>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="admin-button-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="admin-button-primary" disabled={saving}>
          {saving ? 'Guardando...' : mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
