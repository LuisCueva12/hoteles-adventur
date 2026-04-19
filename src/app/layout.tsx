import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Importamos Sonner

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Adventur | Hoteles y Reservas",
  description: "Plataforma premium de gestión hotelera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        {/* Sistema de notificación global moderno */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
