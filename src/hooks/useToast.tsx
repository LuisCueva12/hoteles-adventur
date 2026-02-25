'use client'

import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react'


export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
    id: string
    message: string
    type: ToastType
}

interface ToastContextValue {
    toasts: ToastItem[]
    dismiss: (id: string) => void
    toast: (message: string, type?: ToastType, duration?: number) => void
    success: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = () => {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
    return ctx
}


export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

    const dismiss = useCallback((id: string) => {
        clearTimeout(timers.current.get(id))
        timers.current.delete(id)
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const toast = useCallback(
        (message: string, type: ToastType = 'info', duration = 4000) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
            setToasts((prev) => [...prev.slice(-4), { id, message, type }])
            timers.current.set(id, setTimeout(() => dismiss(id), duration))
        },
        [dismiss],
    )

    const success = useCallback((msg: string) => toast(msg, 'success'), [toast])
    const error = useCallback((msg: string) => toast(msg, 'error', 5500), [toast])
    const warning = useCallback((msg: string) => toast(msg, 'warning'), [toast])
    const info = useCallback((msg: string) => toast(msg, 'info'), [toast])

    return (
        <ToastContext.Provider value={{ toasts, dismiss, toast, success, error, warning, info }}>
            {children}
        </ToastContext.Provider>
    )
}
