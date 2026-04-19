'use client';

import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
}

export function Modal({ titulo, abierto, onCerrar, children }: Props) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCerrar}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-secondary">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}