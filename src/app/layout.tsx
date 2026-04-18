import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
