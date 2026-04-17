'use client'

import { useOptionalSiteConfig } from '@/components/providers/ProveedorConfiguracionSitio'

export function Logo({
  className = 'h-10',
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'footer'
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/logo.webp"
        alt="Adventur Hotels Logo"
        className="h-full w-auto object-contain"
      />
    </div>
  )
}

