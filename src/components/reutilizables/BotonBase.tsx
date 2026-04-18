// ============================================================
// components/reutilizables/BotonBase.tsx
// Botón base reutilizable con variantes
// ============================================================

import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario' | 'peligro' | 'whatsapp';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
}

const estilos: Record<Variante, string> = {
  primario:
    'bg-primary text-secondary hover:bg-primary-hover focus:ring-primary',
  secundario:
    'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary',
  peligro:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  whatsapp:
    'bg-[#25d366] text-white hover:bg-[#1ebe57] focus:ring-[#25d366]',
};

export function BotonBase({
  variante = 'primario',
  cargando = false,
  children,
  className = '',
  disabled,
  ...resto
}: Props) {
  return (
    <button
      disabled={disabled || cargando}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5',
        'text-sm font-semibold transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        estilos[variante],
        className,
      ].join(' ')}
      {...resto}
    >
      {cargando ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
