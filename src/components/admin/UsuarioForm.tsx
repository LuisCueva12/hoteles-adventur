'use client'

import { useState } from 'react'
import { 
  UsuarioValidator, 
  ROLES, 
  TIPOS_DOCUMENTO, 
  PAISES,
  type UsuarioFormData,
  type ValidationErrors,
  type UsuarioCreateInput, 
  type UsuarioUpdateInput
} from '@/lib/validations/usuario.schema'

interface UsuarioFormProps {
  initialValues?: Partial<UsuarioFormData>
  onSubmit: (data: UsuarioCreateInput | UsuarioUpdateInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

const defaultValues: UsuarioFormData = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  documento_identidad: '',
  tipo_documento: 'DNI',
  pais: 'Perú',
  rol: 'turista',
  verificado: false
}

export function UsuarioFormComponent({ 
  initialValues = {}, 
  onSubmit, 
  onCancel, 
  loading = false,
  isEdit = false 
}: UsuarioFormProps) {
  const [formData, setFormData] = useState<UsuarioFormData>({
    ...defaultValues,
    ...initialValues
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (field: keyof UsuarioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleBlur = (field: keyof UsuarioFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationErrors = isEdit 
      ? UsuarioValidator.validateUpdate(formData)
      : UsuarioValidator.validateCreate(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const allTouched = Object.keys(formData).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {})
      setTouched(allTouched)
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error en submit:', error)
    }
  }

  const showError = (field: keyof UsuarioFormData) => {
    return touched[field] && errors[field]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header del formulario */}
      <div className="bg-gradient-to-r from-admin-primary to-admin-primary-dark -m-6 mb-6 p-6 rounded-t-xl">
        <h3 className="text-xl font-bold text-white">
          {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h3>
        <p className="text-white/80 text-sm mt-1">
          {isEdit ? 'Actualiza la información del usuario' : 'Completa los datos del nuevo usuario'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre <span className="text-admin-error">*</span>
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            onBlur={() => handleBlur('nombre')}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all ${
              showError('nombre') ? 'border-admin-error' : 'border-gray-200 hover:border-admin-primary/30'
            }`}
            placeholder="Nombre del usuario"
            disabled={loading}
          />
          {showError('nombre') && (
            <p className="text-admin-error text-sm mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.nombre}
            </p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Apellido <span className="text-admin-error">*</span>
          </label>
          <input
            type="text"
            value={formData.apellido}
            onChange={(e) => handleChange('apellido', e.target.value)}
            onBlur={() => handleBlur('apellido')}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all ${
              showError('apellido') ? 'border-admin-error' : 'border-gray-200 hover:border-admin-primary/30'
            }`}
            placeholder="Apellido del usuario"
            disabled={loading}
          />
          {showError('apellido') && (
            <p className="text-admin-error text-sm mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.apellido}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email <span className="text-admin-error">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all ${
              showError('email') ? 'border-admin-error' : 'border-gray-200 hover:border-admin-primary/30'
            }`}
            placeholder="email@ejemplo.com"
            disabled={loading}
          />
          {showError('email') && (
            <p className="text-admin-error text-sm mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.email}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            onBlur={() => handleBlur('telefono')}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all ${
              showError('telefono') ? 'border-admin-error' : 'border-gray-200 hover:border-admin-primary/30'
            }`}
            placeholder="+51 999 999 999"
            disabled={loading}
          />
          {showError('telefono') && (
            <p className="text-admin-error text-sm mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.telefono}
            </p>
          )}
        </div>

        {/* Documento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Documento de Identidad
          </label>
          <input
            type="text"
            value={formData.documento_identidad}
            onChange={(e) => handleChange('documento_identidad', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 hover:border-admin-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all"
            placeholder="12345678"
            disabled={loading}
          />
        </div>

        {/* Tipo Documento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tipo de Documento
          </label>
          <select
            value={formData.tipo_documento}
            onChange={(e) => handleChange('tipo_documento', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 hover:border-admin-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all bg-white"
            disabled={loading}
          >
            {TIPOS_DOCUMENTO.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        {/* País */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            País
          </label>
          <select
            value={formData.pais}
            onChange={(e) => handleChange('pais', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 hover:border-admin-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all bg-white"
            disabled={loading}
          >
            {PAISES.map(pais => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rol <span className="text-admin-error">*</span>
          </label>
          <select
            value={formData.rol}
            onChange={(e) => handleChange('rol', e.target.value as any)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 hover:border-admin-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all bg-white"
            disabled={loading}
          >
            {ROLES.map(rol => (
              <option key={rol.value} value={rol.value}>{rol.label}</option>
            ))}
          </select>
        </div>

        {/* Password (solo en creación) */}
        {!isEdit && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña <span className="text-admin-error">*</span>
            </label>
            <input
              type="password"
              value={(formData as any).password || ''}
              onChange={(e) => handleChange('password' as any, e.target.value)}
              onBlur={() => handleBlur('password' as any)}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary transition-all ${
                showError('password' as any) ? 'border-admin-error' : 'border-gray-200 hover:border-admin-primary/30'
              }`}
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
              autoComplete="new-password"
            />
            {showError('password' as any) && (
              <p className="text-admin-error text-sm mt-1 flex items-center gap-1">
                <span>⚠</span> {(errors as any).password}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Verificado */}
      <div className="bg-admin-primary-light rounded-lg p-4 border-2 border-admin-primary/20">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.verificado}
            onChange={(e) => handleChange('verificado', e.target.checked)}
            className="w-5 h-5 rounded border-2 border-admin-primary text-admin-primary focus:ring-admin-primary focus:ring-2 cursor-pointer"
            disabled={loading}
          />
          <div>
            <span className="text-sm font-semibold text-admin-primary-dark">Usuario Verificado</span>
            <p className="text-xs text-gray-600 mt-0.5">El usuario tendrá acceso completo al sistema</p>
          </div>
        </label>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg font-semibold"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  )
}
