'use client'

import { useForm } from '@/hooks/useForm'
import type { AlojamientoForm } from '@/hooks/useAlojamientos'

const validateAlojamientoForm = (data: AlojamientoForm) => {
  const errors: Partial<Record<keyof AlojamientoForm, string>> = {}

  if (!data.nombre?.trim()) {
    errors.nombre = 'El nombre es requerido'
  }

  if (!data.descripcion?.trim()) {
    errors.descripcion = 'La descripción es requerida'
  }

  if (!data.direccion?.trim()) {
    errors.direccion = 'La dirección es requerida'
  }

  if (!data.departamento?.trim()) {
    errors.departamento = 'El departamento es requerido'
  }

  if (!data.provincia?.trim()) {
    errors.provincia = 'La provincia es requerida'
  }

  if (!data.distrito?.trim()) {
    errors.distrito = 'El distrito es requerido'
  }

  if (!data.precio_base || data.precio_base <= 0) {
    errors.precio_base = 'El precio base debe ser mayor a 0'
  }

  if (!data.capacidad_maxima || data.capacidad_maxima < 1) {
    errors.capacidad_maxima = 'La capacidad máxima debe ser al menos 1'
  }

  return errors
}

interface AlojamientoFormProps {
  initialValues?: Partial<AlojamientoForm>
  onSubmit: (data: AlojamientoForm) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const initialFormValues: AlojamientoForm = {
  nombre: '',
  descripcion: '',
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  categoria: 'Económico',
  tipo: 'Cabaña',
  precio_base: 0,
  capacidad_maxima: 1,
  servicios_incluidos: [],
  activo: true
}

export function AlojamientoFormComponent({ initialValues = {}, onSubmit, onCancel, loading = false }: AlojamientoFormProps) {
  const form = useForm({
    initialValues: { ...initialFormValues, ...initialValues },
    validation: validateAlojamientoForm,
    onSubmit
  })

  const categorias = ['Económico', 'Familiar', 'Parejas', 'Premium', 'Naturaleza']
  const tipos = ['Cabaña', 'EcoLodge', 'Hotel', 'Hostal', 'Casa']
  const servicios = ['Wi-Fi', 'Desayuno', 'Estacionamiento', 'Piscina', 'Gimnasio', 'Spa', 'Restaurante']

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input
            {...form.getFieldProps('nombre')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nombre del alojamiento"
          />
          {form.getFieldProps('nombre').error && (
            <p className="text-red-500 text-sm mt-1">{form.getFieldProps('nombre').error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <select
            {...form.getFieldProps('categoria')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <select
            {...form.getFieldProps('tipo')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {tipos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Precio Base</label>
          <input
            {...form.getFieldProps('precio_base')}
            type="number"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
          {form.getFieldProps('precio_base').error && (
            <p className="text-red-500 text-sm mt-1">{form.getFieldProps('precio_base').error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad Máxima</label>
          <input
            {...form.getFieldProps('capacidad_maxima')}
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
          />
          {form.getFieldProps('capacidad_maxima').error && (
            <p className="text-red-500 text-sm mt-1">{form.getFieldProps('capacidad_maxima').error}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            {...form.getFieldProps('activo')}
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">Activo</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <textarea
          {...form.getFieldProps('descripcion')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Descripción del alojamiento"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
        <input
          {...form.getFieldProps('direccion')}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Dirección completa"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
          <input
            {...form.getFieldProps('departamento')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Departamento"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
          <input
            {...form.getFieldProps('provincia')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provincia"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
          <input
            {...form.getFieldProps('distrito')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Distrito"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Servicios Incluidos</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {servicios.map(servicio => (
            <label key={servicio} className="flex items-center">
              <input
                type="checkbox"
                checked={form.formState.data.servicios_incluidos?.includes(servicio)}
                onChange={(e) => {
                  const servicios = form.formState.data.servicios_incluidos || []
                  const newServicios = e.target.checked
                    ? [...servicios, servicio]
                    : servicios.filter((s: string) => s !== servicio)
                  form.setFieldValue('servicios_incluidos', newServicios)
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{servicio}</span>
            </label>
          ))}
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
