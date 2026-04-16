import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ToastProvider } from '@/hooks/useNotificacion'
import { Toaster } from '@/components/ui/Notificador'
import { ErrorBoundary } from '@/components/ui/LimiteErrores'
import { QueryProvider } from '@/components/providers/ProveedorConsultas'
import { SiteConfigProvider } from '@/components/providers/ProveedorConfiguracionSitio'
import { TranslationProvider } from '@/hooks/useTraduccion'
import { generarSEO } from '@/lib/seo'
import { createClient } from '@/utils/supabase/server'
import { SiteConfigRepository } from '@/lib/repositories/site-config.repository'
import './_styles/globals.css'
import './_styles/animations.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = generarSEO({
  title: 'Adventur Hotels - Tu viaje, tu hogar',
  description: 'Descubre el mejor alojamiento en Cajamarca, Perú. Habitaciones cómodas, servicios premium y experiencias inolvidables. Reserva ahora con las mejores tarifas.',
  keywords: ['hotel cajamarca', 'alojamiento peru', 'reservas hotel', 'turismo cajamarca', 'hospedaje', 'habitaciones'],
  url: '/'
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const repository = new SiteConfigRepository(supabase)
  const siteConfig = await repository.getConfig()

  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Preconnect a dominios externos para reducir latencia */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geist.variable} font-sans antialiased bg-gray-50`}>
        <SiteConfigProvider initialConfig={siteConfig}>
          <ErrorBoundary>
            <QueryProvider>
              <TranslationProvider>
                <ToastProvider>
                  {children}
                  <Toaster />
                </ToastProvider>
              </TranslationProvider>
            </QueryProvider>
          </ErrorBoundary>
        </SiteConfigProvider>
      </body>
    </html>
  )
}
