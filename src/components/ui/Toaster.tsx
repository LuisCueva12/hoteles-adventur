'use client'

import { useToast, type ToastType } from '@/hooks/useToast'

const STYLES: Record<ToastType, string> = {
    success: 'bg-emerald-600 border-emerald-500',
    error: 'bg-red-600 border-red-500',
    warning: 'bg-amber-500 border-amber-400',
    info: 'bg-blue-600 border-blue-500',
}

const ICON_BG: Record<ToastType, string> = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-400',
    info: 'bg-blue-500',
}

const ICONS: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'i',
}

export function Toaster() {
    const { toasts, dismiss } = useToast()

    if (toasts.length === 0) return null

    return (
        <div
            aria-live="polite"
            className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
        >
            {toasts.map((t) => (
                <div
                    key={t.id}
                    role="alert"
                    className={`
            pointer-events-auto flex items-start gap-3
            min-w-[280px] max-w-sm px-4 py-3
            rounded-xl border shadow-2xl text-white text-sm font-medium
            ${STYLES[t.type]}
          `}
                >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ICON_BG[t.type]}`}>
                        {ICONS[t.type]}
                    </span>
                    <p className="flex-1 leading-snug pt-0.5">{t.message}</p>
                    <button
                        onClick={() => dismiss(t.id)}
                        aria-label="Cerrar"
                        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1 pt-0.5"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    )
}
