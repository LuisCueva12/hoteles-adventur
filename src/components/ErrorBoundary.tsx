'use client'

import React, { Component, ReactNode } from 'react'
import { Logger } from '@/lib/errors'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Logger.error(error, {
      componentStack: errorInfo.componentStack,
      type: 'React Error Boundary',
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                ¡Algo salió mal!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-xs font-mono text-red-800 mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-red-700 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-semibold"
                >
                  <RefreshCw className="w-5 h-5" />
                  Intentar de nuevo
                </button>
                
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl transition-all font-semibold"
                >
                  <Home className="w-5 h-5" />
                  Ir al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook para capturar errores en componentes funcionales
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}
