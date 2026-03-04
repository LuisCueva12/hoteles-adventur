'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface LoginFormProps {
  onSubmit: (data: LoginInput) => Promise<void>
  loading: boolean
}

export function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
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
              ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:ring-red-500 focus:border-red-500'
          }`}
          placeholder="tu@email.com"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-xs text-red-600 flex items-center gap-1 animate-fadeInUp">
            <span>⚠️</span> {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-600" />
            Contraseña
          </label>
          <Link href="/recuperar-password" className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={`w-full px-3 py-2.5 pr-10 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm bg-white text-gray-900 placeholder-gray-400 ${
              errors.password
                ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 hover:border-gray-400 focus:ring-red-500 focus:border-red-500'
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
          <p className="text-xs text-red-600 flex items-center gap-1 animate-fadeInUp">
            <span>⚠️</span> {errors.password.message}
          </p>
        )}
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
            <span>Iniciar sesión</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </button>
    </form>
  )
}
