'use client'

import { useForm } from '@/hooks/useForm'
import type { UsuarioForm } from '@/hooks/useUsuarios'

interface UsuarioFormProps {
  initialValues?: Partial<UsuarioForm>
  onSubmit: (data: UsuarioForm) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const validateUsuarioForm = (data: UsuarioForm) => {
  const errors: Partial<Record<keyof UsuarioForm, string>> = {}

  if (!data.nombre?.trim()) {
    errors.nombre = 'El nombre es requerido'
  }

  if (!data.apellido?.trim()) {
    errors.apellido = 'El apellido es requerido'
  }

  if (!data.email?.trim()) {
    errors.email = 'El email es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'El email no es válido'
  }

  if (!data.telefono?.trim()) {
    errors.telefono = 'El teléfono es requerido'
  }

  if (!data.documento_identidad?.trim()) {
    errors.documento_identidad = 'El documento de identidad es requerido'
  }

  if (!data.tipo_documento?.trim()) {
    errors.tipo_documento = 'El tipo de documento es requerido'
  }

  if (!data.pais?.trim()) {
    errors.pais = 'El país es requerido'
  }

  if (!data.rol?.trim()) {
    errors.rol = 'El rol es requerido'
  }

  return errors
}

const initialFormValues: UsuarioForm = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  documento_identidad: '',
  tipo_documento: 'DNI',
  pais: '',
  rol: 'turista',
  verificado: false
}

export function UsuarioFormComponent({ initialValues = {}, onSubmit, onCancel, loading = false }: UsuarioFormProps) {
  const form = useForm({
    initialValues: { ...initialFormValues, ...initialValues },
    validation: validateUsuarioForm,
    onSubmit
  })

  const roles = ['turista', 'propietario', 'Admin']
  const tiposDocumento = ['DNI', 'Pasaporte', 'Carnet de Extranjería']
  const paises = ['Perú', 'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Ecuador', 'México', 'Venezuela']

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input
            {...form.getFieldProps('nombre')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nombre del usuario"
          />
          {form.getFieldProps('nombre').error && (
            <p className="text-red-500 text-sm mt-1">{form.getFieldProps('nombre').error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
          <input
            {...form.getFieldProps('apellido')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Apellido del usuario"
          />
          {form.getFieldProps('apellido').error && (
            <p className="text-red-500 text-sm mt-1">{form.getFieldProps('apellido').error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            {...form.getFieldProps('email')}
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@ejemplo.com"
          />
          {form.getFieldProps('email').error && (
            <p className="text-red-500 text-sm mt-1">{form.getFieldProps('email').error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            {...form.getFieldProps('telefono')}
            type="tel"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+51 999 999 999"
          />
          {form.getFieldProps('telefono').error && (
            <p className="text-red-500 text-sm mt-1">{form.getFieldProps('telefono').error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Documento de Identidad</label>
          <input
            {...form.getFieldProps('documento_identidad')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="12345678"
          />
          {form.getFieldProps('documento_identidad').error && (
            <p className="text-red-500 text-sm mt-1">{form.getFieldProps('documento_identidad').error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
          <select
            {...form.getFieldProps('tipo_documento')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {tiposDocumento.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
          <select
            {...form.getFieldProps('pais')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar país</option>
            {paises.map(pais => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
          <select
            {...form.getFieldProps('rol')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {roles.map(rol => (
              <option key={rol} value={rol}>{rol === 'Admin' ? 'Administrador' : rol.charAt(0).toUpperCase() + rol.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            {...form.getFieldProps('verificado')}
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">Usuario Verificado</label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {initialValues.nombre ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}
