'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations'

interface LoginFormProps {
  onSubmit: (data: LoginInput) => Promise<void>
  loading: boolean
  error?: string | null
  onClearError?: () => void
}

const REMEMBER_EMAIL_KEY = 'adventur.login.email'
const REMEMBER_ENABLED_KEY = 'adventur.login.remember'

export function LoginForm({ onSubmit, loading, error, onClearError }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const rememberEnabled = window.localStorage.getItem(REMEMBER_ENABLED_KEY) === 'true'
    const rememberedEmail = window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? ''

    if (rememberEnabled) {
      setRememberMe(true)
      if (rememberedEmail) {
        setValue('email', rememberedEmail, { shouldValidate: true })
      }
    }
  }, [setValue])

  const email = watch('email')
  const password = watch('password')

  useEffect(() => {
    if (error && onClearError) {
      onClearError()
    }
  }, [email, password, error, onClearError])

  const isEmailValid = !!email && !errors.email
  const isPasswordValid = !!password && !errors.password

  const resetHref = useMemo(() => {
    const normalizedEmail = email?.trim()
    if (!normalizedEmail) return '/recuperar-password'
    return `/recuperar-password?email=${encodeURIComponent(normalizedEmail)}`
  }, [email])

  const submitForm = handleSubmit(async (data) => {
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_ENABLED_KEY, 'true')
        window.localStorage.setItem(REMEMBER_EMAIL_KEY, data.email)
      } else {
        window.localStorage.removeItem(REMEMBER_ENABLED_KEY)
        window.localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }
    }

    await onSubmit(data)
  })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5 text-xs text-slate-700">
        Acceso restringido al sistema. Solo personal autorizado puede ingresar.
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={submitForm} className="space-y-3.5 sm:space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`w-full rounded-lg border-2 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-yellow-300 focus:border-yellow-400 focus:ring-yellow-400'
                  : isEmailValid
                    ? 'border-yellow-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-orange-500'
              }`}
              placeholder="tu@email.com"
              disabled={loading}
            />
            {isEmailValid && (
              <CheckCircle2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-green-500" />
            )}
          </div>
          {errors.email && (
            <p className="flex items-center gap-1 text-[10px] text-red-600" role="alert">
              <span aria-hidden="true">!</span>
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700">
              Contrasena
            </label>
            <Link href={resetHref} className="text-[10px] font-medium text-orange-600 transition-colors hover:text-orange-700 sm:text-xs">
              Olvide mi contrasena
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className={`w-full rounded-lg border-2 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-yellow-300 focus:border-yellow-400 focus:ring-yellow-400'
                  : isPasswordValid
                    ? 'border-yellow-300 focus:border-green-500 focus:ring-green-500'
                    : 'border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-orange-500'
              }`}
              placeholder="........"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1 text-[10px] text-red-600" role="alert">
              <span aria-hidden="true">!</span>
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 bg-white text-orange-600 focus:ring-2 focus:ring-orange-500"
            />
            <label htmlFor="remember" className="ml-2 cursor-pointer select-none text-[10px] text-slate-700 sm:text-xs">
              Recordar mi correo en este dispositivo
            </label>
          </div>
          <p className="text-[10px] text-slate-500 sm:text-xs">
            Usa esta opcion solo en equipos privados.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-orange-600 to-yellow-400 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:from-orange-700 hover:to-yellow-500 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-sm"
        >
          <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]" />
          {loading ? (
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Procesando...</span>
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>Iniciar sesion</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </button>
      </form>
    </div>
  )
}
