import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ToastProvider } from '@/hooks/useNotificacion'
import { Toaster } from '@/components/ui/Notificador'
import { ErrorBoundary } from '@/components/ui/LimiteErrores'
import { QueryProvider } from '@/components/providers/ProveedorConsultas'
import { SiteConfigProvider } from '@/components/providers/ProveedorConfiguracionSitio'
import { TranslationProvider } from '@/hooks/useTraduccion'
import { Analytics } from '@/components/web/Analiticas'
import { generarSEO } from '@/lib/seo'
import { getSiteConfig } from '@/lib/site-config.server'
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
  const siteConfig = await getSiteConfig()

  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
          fetchPriority="high"
        />
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
        <Analytics />
      </body>
    </html>
  )
}
