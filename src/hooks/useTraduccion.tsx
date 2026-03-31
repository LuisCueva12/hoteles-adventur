'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Locale, defaultLocale, getTranslation, formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil } from '@/lib/internacionalizacion'

interface TranslationContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: ReturnType<typeof getTranslation>
    formatCurrency: (amount: number) => string
    formatDate: (date: Date | string) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>(defaultLocale)
    const t = getTranslation(locale)

    const formatCurrency = (amount: number) => formatCurrencyUtil(amount, locale)
    const formatDate = (date: Date | string) => formatDateUtil(date, locale)

    return (
        <TranslationContext.Provider value={{ locale, setLocale, t, formatCurrency, formatDate }}>
            {children}
        </TranslationContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(TranslationContext)
    if (!context) {
        throw new Error('useTranslation must be used within TranslationProvider')
    }
    return context
}
