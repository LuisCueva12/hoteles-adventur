import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ToastProvider } from '@/hooks/useToast'
import { Toaster } from '@/components/ui/Toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './globals.css'
import '@/styles/animations.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Hotel Adventur - Tu viaje, tu hogar',
  description: 'Sistema de reservas de alojamientos Hotel Adventur en Cajamarca, Perú',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${geist.variable} antialiased bg-gray-50`}>
        <ErrorBoundary>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}