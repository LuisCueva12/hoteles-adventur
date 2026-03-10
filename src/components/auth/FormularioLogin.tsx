'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validaciones'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface LoginFormProps {
  onSubmit: (data: LoginInput) => Promise<void>
  loading: boolean
}

export function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null)
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const email = watch('email')
  const password = watch('password')

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/perfil`,
        },
      })
      if (error) {
        console.error(`Error con ${provider}:`, error)
        alert(`Error al iniciar sesión con ${provider === 'google' ? 'Google' : 'Facebook'}. Por favor, verifica que el proveedor esté configurado en Supabase.`)
        setSocialLoading(null)
      }
    } catch (error) {
      console.error(`Error con ${provider}:`, error)
      alert(`Error al iniciar sesión con ${provider === 'google' ? 'Google' : 'Facebook'}. Por favor, intenta nuevamente.`)
      setSocialLoading(null)
    }
  }

  const isEmailValid = email && !errors.email
  const isPasswordValid = password && !errors.password

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`w-full pl-9 pr-9 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm bg-white text-gray-900 placeholder-slate-400 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : isEmailValid
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-slate-200 hover:border-slate-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="tu@email.com"
              disabled={loading}
            />
            {isEmailValid && (
              <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500" />
            )}
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <Link href="/recuperar-password" className="text-[10px] sm:text-xs text-orange-600 hover:text-orange-700 font-medium">
              ¿Olvidaste?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`w-full pl-9 pr-9 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm bg-white text-gray-900 placeholder-slate-400 ${
                errors.password
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : isPasswordValid
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                  : 'border-slate-200 hover:border-slate-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 text-orange-600 bg-white border-slate-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
          />
          <label htmlFor="remember" className="ml-2 text-[10px] sm:text-xs text-slate-700 cursor-pointer select-none">
            Recordarme en este dispositivo
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-xs sm:text-sm relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          {loading ? (
            <span className="flex items-center justify-center gap-2 relative z-10">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Procesando...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 relative z-10">
              <span>Iniciar sesión</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-[9px] sm:text-[10px]">
          <span className="px-2 sm:px-2.5 bg-white text-slate-500 font-medium">O continuar con</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={loading || socialLoading !== null}
          className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 border-2 border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all text-[10px] sm:text-xs font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {socialLoading === 'google' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin('facebook')}
          disabled={loading || socialLoading !== null}
          className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 border-2 border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all text-[10px] sm:text-xs font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {socialLoading === 'facebook' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
