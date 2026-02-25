import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ToastProvider } from '@/hooks/useToast'
import { Toaster } from '@/components/ui/Toaster'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Adventur Hotels',
  description: 'Sistema de reservas de alojamientos Adventur',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="antialiased bg-gray-50">
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  )
}