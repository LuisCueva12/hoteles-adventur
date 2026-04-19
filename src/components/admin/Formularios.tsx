'use client';

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-zinc-700">
          {label}
        </label>
      )}
      <input
        className={[
          'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900',
          'placeholder:text-zinc-400',
          'focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/10',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  opciones: { valor: string; label: string }[];
}

export function Select({ label, error, opciones, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-zinc-700">
          {label}
        </label>
      )}
      <select
        className={[
          'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900',
          'focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/10',
          className,
        ].join(' ')}
        {...props}
      >
        {opciones.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-zinc-700">
          {label}
        </label>
      )}
      <textarea
        className={[
          'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900',
          'placeholder:text-zinc-400',
          'focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/10',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}