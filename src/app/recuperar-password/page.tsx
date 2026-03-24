'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/hooks/useNotificacion'
import Link from 'next/link'
import { Logo } from '@/components/web/Logo'
import { ArrowLeft, Mail, Loader2, CheckCircle2, Shield } from 'lucide-react'

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()
  const { success, error } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return

    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/actualizar-password`,
      })

      if (resetError) throw resetError

      setSent(true)
      success('Revisa tu email para restablecer tu contraseña')
    } catch (err: any) {
      error(err.message || 'Error al enviar el email de recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Logo className="h-12" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-400 transition-all mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Volver al login</span>
          </Link>

          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-yellow-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-sm text-gray-600">
                  No te preocupes, te enviaremos instrucciones para restablecerla
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-yellow-400" />
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-sm bg-white text-gray-900 placeholder-gray-400"
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-400 hover:to-red-800 text-white font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 hover:shadow-xl disabled:transform-none text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Enviando...</span>
                    </span>
                  ) : (
                    'Enviar instrucciones'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Email enviado!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Revisa tu bandeja de entrada en <span className="font-semibold">{email}</span> y sigue las instrucciones para restablecer tu contraseña.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> Si no ves el email, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block mt-6 text-sm text-yellow-400 hover:text-yellow-400 font-medium hover:underline"
              >
                Volver al login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ¿Necesitas ayuda? <a href="/contacto" className="text-yellow-400 hover:text-yellow-400 font-medium hover:underline">Contáctanos</a>
          </p>
        </div>
      </div>
    </div>
  )
}
