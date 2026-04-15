import type { AlojamientoForm } from '@/hooks/useAlojamientos'

export const validateAlojamientoForm = (data: AlojamientoForm) => {
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
