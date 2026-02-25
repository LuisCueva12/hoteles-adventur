// Dev 2

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    return (
        <div className="min-h-screen flex bg-gray-50">
            <aside className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-3">Mi cuenta</p>
                {[
                    { href: '/reservas', label: 'Mis reservas' },
                    { href: '/pagos', label: 'Mis pagos' },
                    { href: '/perfil', label: 'Perfil' },
                ].map((item) => (
                    <a key={item.href} href={item.href}
                        className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        {item.label}
                    </a>
                ))}
                <div className="mt-auto pt-4 border-t border-gray-200">
                    <a href="/" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                        Volver al sitio
                    </a>
                </div>
            </aside>
            <main className="flex-1 p-8">{children}</main>
        </div>
    )
}
