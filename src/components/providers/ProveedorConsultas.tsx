'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/cliente-consultas'
import { ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools deshabilitado - descomentar si necesitas debugging */}
            {/* {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools 
                    initialIsOpen={false}
                    position="bottom-right"
                    buttonPosition="bottom-right"
                />
            )} */}
        </QueryClientProvider>
    )
}
