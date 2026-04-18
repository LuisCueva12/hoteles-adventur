'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Mail, Loader2, CheckCircle2, Shield } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/hooks/useNotificacion'
import { Logo } from '@/components/web/Logo'

const REMEMBER_EMAIL_KEY = 'adventur.login.email'

function normalizeEmail(value: string | null) {
  return value?.trim().toLowerCase() ?? ''
}

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const { success, error } = useToast()

  useEffect(() => {
    const emailFromQuery = normalizeEmail(searchParams.get('email'))
    const emailFromStorage =
      typeof window !== 'undefined' ? normalizeEmail(window.localStorage.getItem(REMEMBER_EMAIL_KEY)) : ''

    setEmail(emailFromQuery || emailFromStorage)
  }, [searchParams])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || loading) return

    setLoading(true)

    try {
      const redirectTo = new URL('/actualizar-password', window.location.origin)
      redirectTo.searchParams.set('flow', 'recovery')

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo.toString(),
      })

      if (resetError) throw resetError

      setSent(true)
      success('Revisa tu email para restablecer tu contrasena.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar el email de recuperacion.'
      error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo className="h-12" />
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          <Link
            href="/login"
            className="group mb-6 inline-flex items-center gap-2 text-gray-600 transition-all hover:text-yellow-500"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Volver al login</span>
          </Link>

          {!sent ? (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                  <Shield className="h-8 w-8 text-yellow-500" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Recuperar contrasena</h1>
                <p className="text-sm text-gray-600">
                  Te enviaremos un enlace seguro para crear una nueva contrasena.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Mail className="h-3.5 w-3.5 text-yellow-500" />
                    Correo electronico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-yellow-500 hover:to-orange-600 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Enviando...</span>
                    </span>
                  ) : (
                    'Enviar instrucciones'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <CheckCircle2 className="h-8 w-8 text-yellow-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Email enviado</h2>
              <p className="mb-6 text-sm text-gray-600">
                Revisa tu bandeja de entrada en <span className="font-semibold">{email}</span> y sigue las instrucciones
                para restablecer tu contrasena.
              </p>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-left">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> Si no ves el email, revisa spam o correo no deseado.
                </p>
              </div>
              <Link href="/login" className="mt-6 inline-block text-sm font-medium text-yellow-500 hover:underline">
                Volver al login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Si necesitas ayuda adicional, <Link href="/contacto" className="font-medium text-yellow-500 hover:underline">contactanos</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
