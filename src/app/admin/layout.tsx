// Dev 3

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

    if (usuario?.rol !== 'admin_adventur') redirect('/')

    return (
        <div className="min-h-screen flex bg-gray-950">
            <aside className="w-60 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-500 uppercase px-3 mb-3">Panel Admin</p>
                {[
                    { href: '/admin', label: 'Dashboard' },
                    { href: '/admin/hoteles', label: 'Hoteles' },
                    { href: '/admin/usuarios', label: 'Usuarios' },
                    { href: '/admin/reservas', label: 'Reservas' },
                    { href: '/admin/reportes', label: 'Reportes' },
                ].map((item) => (
                    <a key={item.href} href={item.href}
                        className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                        {item.label}
                    </a>
                ))}
            </aside>
            <main className="flex-1 p-8 text-white">{children}</main>
        </div>
    )
}
