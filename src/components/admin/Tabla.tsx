'use client';

import type { ReactNode } from 'react';

interface Columna<T> {
  clave: keyof T | string;
  titulo: string;
  render?: (fila: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  datos: T[];
  columnas: Columna<T>[];
  cargando?: boolean;
  mensajeVacio?: string;
  acciones?: (fila: T) => ReactNode;
}

export function Tabla<T extends { id: string }>({ datos, columnas, cargando, mensajeVacio = 'Sin datos', acciones }: Props<T>) {
  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-primary" />
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
        <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="font-medium">{mensajeVacio}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50/50 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
              {columnas.map((col) => (
                <th key={String(col.clave)} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.titulo}
                </th>
              ))}
              {acciones && <th className="px-6 py-4 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {datos.map((fila) => (
              <tr key={fila.id} className="hover:bg-zinc-50/50 transition-colors">
                {columnas.map((col) => (
                  <td key={`${fila.id}-${String(col.clave)}`} className={`px-6 py-4 text-sm text-zinc-700 ${col.className || ''}`}>
                    {col.render 
                      ? col.render(fila) 
                      : String(fila[col.clave as keyof T] ?? '')}
                  </td>
                ))}
                {acciones && (
                  <td className="px-6 py-4 text-right">
                    {acciones(fila)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}