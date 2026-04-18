import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

// Configuración robusta de Montserrat
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Hoteles Adventur - Reservas por WhatsApp',
  description:
    'Encuentra y reserva el hotel perfecto. Cierra tu reserva directo por WhatsApp con el hotel de tu elección.',
  keywords: ['hoteles', 'reservas', 'whatsapp', 'colombia'],
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
