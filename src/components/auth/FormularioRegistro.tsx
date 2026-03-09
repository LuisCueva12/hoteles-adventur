'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validaciones'
import { obtenerFortalezaContrasena } from '@/lib/seguridad'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, User, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RegisterFormProps {
  onSubmit: (data: RegisterInput) => Promise<void>
  loading: boolean
}

export function RegisterForm({ onSubmit, loading }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] })
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  const password = watch('password')

  useEffect(() => {
    if (password) {
      const strength = obtenerFortalezaContrasena(password)
      setPasswordStrength(strength)
    }
  }, [password])

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500'
    if (score === 2) return 'bg-yellow-500'
    if (score === 3) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (score: number) => {
    if (score <= 1) return 'Débil'
    if (score === 2) return 'Media'
    if (score === 3) return 'Buena'
    return 'Fuerte'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="nombre" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-red-600" />
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            {...register('nombre')}
            className={`w-full px-3 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm bg-white text-gray-900 placeholder-gray-400 ${
              errors.nombre
                ? 'border-red-400 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400 focus:ring-red-500'
            }`}
            placeholder="Luis"
            disabled={loading}
          />
          {errors.nombre && (
            <p className="text-xs text-red-600 animate-fadeInUp">⚠️ {errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="apellido" className="block text-xs font-semibold text-gray-700">
            Apellido
          </label>
          <input
            id="apellido"
            type="text"
            {...register('apellido')}
            className={`w-full px-3 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm bg-white text-gray-900 placeholder-gray-400 ${
              errors.apellido
                ? 'border-red-400 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400 focus:ring-red-500'
            }`}
            placeholder="Cueva"
            disabled={loading}
          />
          {errors.apellido && (
            <p className="text-xs text-red-600 animate-fadeInUp">⚠️ {errors.apellido.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-red-600" />
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`w-full px-3 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm bg-white text-gray-900 placeholder-gray-400 ${
            errors.email
              ? 'border-red-400 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:ring-red-500'
          }`}
          placeholder="tu@email.com"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-xs text-red-600 animate-fadeInUp">⚠️ {errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-red-600" />
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={`w-full px-3 py-2.5 pr-10 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm bg-white text-gray-900 placeholder-gray-400 ${
              errors.password
                ? 'border-red-400 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400 focus:ring-red-500'
            }`}
            placeholder="••••••••"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600 animate-fadeInUp">⚠️ {errors.password.message}</p>
        )}
        
        {/* Password Strength */}
        {password && password.length > 0 && (
          <div className="space-y-2 animate-fadeInUp">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${getStrengthColor(passwordStrength.score)}`}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600 min-w-[50px]">
                {getStrengthText(passwordStrength.score)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                {password.length >= 8 ? '✓' : '○'} 8+ caracteres
              </div>
              <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '○'} Mayús y minús
              </div>
              <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                {/[0-9]/.test(password) ? '✓' : '○'} Números
              </div>
              <div className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'} Símbolos
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700">
          Confirmar contraseña
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            className={`w-full px-3 py-2.5 pr-10 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm bg-white text-gray-900 placeholder-gray-400 ${
              errors.confirmPassword
                ? 'border-red-400 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400 focus:ring-red-500'
            }`}
            placeholder="••••••••"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 animate-fadeInUp">⚠️ {errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-800 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Al registrarte, aceptas nuestros{' '}
            <Link href="/terminos" className="underline font-semibold hover:text-blue-900">
              Términos y Condiciones
            </Link>{' '}
            y{' '}
            <Link href="/privacidad" className="underline font-semibold hover:text-blue-900">
              Política de Privacidad
            </Link>
          </span>
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-5 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:via-red-700 hover:to-red-800 text-white font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 hover:shadow-2xl disabled:transform-none text-sm relative overflow-hidden group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        {loading ? (
          <span className="flex items-center justify-center gap-3 relative z-10">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Procesando...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2 relative z-10">
            <span>Crear mi cuenta</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </button>
    </form>
  )
}
