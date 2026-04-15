'use client'

import { useState } from 'react'

interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
}

interface UseFormOptions<T> {
  initialValues: T
  validation?: (data: T) => Partial<Record<keyof T, string>>
  onSubmit: (data: T) => Promise<void>
}

export function useForm<T>({ initialValues, validation, onSubmit }: UseFormOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false
  })

  const validateField = (field: keyof T, value: any): string => {
    if (!validation) return ''
    
    const tempData = { ...formState.data, [field]: value }
    const errors = validation(tempData)
    return errors[field] || ''
  }

  const setFieldValue = (field: keyof T, value: any) => {
    const error = validateField(field, value)
    
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: error },
      touched: { ...prev.touched, [field]: true }
    }))
  }

  const setFieldError = (field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }))
  }

  const validateForm = (): boolean => {
    if (!validation) return true
    
    const errors = validation(formState.data)
    const hasErrors = Object.keys(errors).some(key => errors[key as keyof T])
    
    setFormState(prev => ({
      ...prev,
      errors,
      touched: Object.keys(prev.data as any).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {} as Partial<Record<keyof T, boolean>>)
    }))
    
    return !hasErrors
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!validateForm()) return
    
    setFormState(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      await onSubmit(formState.data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const resetForm = () => {
    setFormState({
      data: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false
    })
  }

  const getFieldProps = (field: keyof T) => ({
    value: formState.data[field] as any,
    onChange: (value: any) => setFieldValue(field, value),
    error: formState.touched[field] ? formState.errors[field] : undefined,
    touched: formState.touched[field]
  })

  return {
    formState,
    setFieldValue,
    setFieldError,
    validateForm,
    handleSubmit,
    resetForm,
    getFieldProps,
    isValid: Object.keys(formState.errors).every(key => !formState.errors[key as keyof T])
  }
}
