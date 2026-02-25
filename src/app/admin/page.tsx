// Dev 3

export default function AdminPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Administracion</h1>
            <p className="text-gray-400 mb-8">Gestion del sistema Adventur Hotels</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Hoteles', href: '/admin/hoteles' },
                    { label: 'Usuarios', href: '/admin/usuarios' },
                    { label: 'Reservas', href: '/admin/reservas' },
                    { label: 'Reportes', href: '/admin/reportes' },
                ].map((item) => (
                    <a key={item.label} href={item.href}
                        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-5 transition-all">
                        <p className="text-white font-semibold">{item.label}</p>
                    </a>
                ))}
            </div>
        </div>
    )
}
