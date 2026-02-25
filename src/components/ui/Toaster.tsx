'use client'

import { useToast, type ToastType } from '@/hooks/useToast'

const ICON_COLORS: Record<ToastType, string> = {
    success: 'text-emerald-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
}

const ICONS: Record<ToastType, React.ReactNode> = {
    success: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
}

export function Toaster() {
    const { toasts, dismiss } = useToast()

    if (toasts.length === 0) return null

    return (
        <div
            aria-live="polite"
            className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
        >
            {toasts.map((t) => (
                <div
                    key={t.id}
                    role="alert"
                    className="pointer-events-auto flex items-center w-full max-w-sm p-4 text-gray-700 bg-white rounded shadow-lg border border-gray-200 animate-in slide-in-from-top-2"
                >
                    <div className={`flex-shrink-0 ${ICON_COLORS[t.type]}`}>
                        {ICONS[t.type]}
                    </div>
                    <div className="ms-2.5 text-sm border-s border-gray-200 ps-3.5 flex-1">
                        {t.message}
                    </div>
                    <button
                        type="button"
                        onClick={() => dismiss(t.id)}
                        aria-label="Cerrar"
                        className="ms-auto flex items-center justify-center text-gray-500 hover:text-gray-900 bg-transparent hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded text-sm h-8 w-8 focus:outline-none transition-colors"
                    >
                        <span className="sr-only">Cerrar</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    )
}
