'use client'

import { Globe } from 'lucide-react'
import { useTranslation } from '@/hooks/useTraduccion'
import { Locale } from '@/lib/internacionalizacion'

export function LanguageSelector() {
    const { locale, setLocale } = useTranslation()

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="uppercase">{locale}</span>
            </button>
            
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                    onClick={() => setLocale('es')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors rounded-t-lg ${
                        locale === 'es' ? 'text-red-600 font-semibold' : 'text-gray-700'
                    }`}
                >
                    🇵🇪 Español
                </button>
                <button
                    onClick={() => setLocale('en')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors rounded-b-lg ${
                        locale === 'en' ? 'text-red-600 font-semibold' : 'text-gray-700'
                    }`}
                >
                    🇺🇸 English
                </button>
            </div>
        </div>
    )
}
