import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-red-600" style={{ fontFamily: 'Georgia, serif' }}>
                        404
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="h-px w-16 bg-red-600" />
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <div className="h-px w-16 bg-red-600" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Página no encontrada
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Lo sentimos, la página que buscas no existe o ha sido movida. 
                    Por favor, verifica la URL o regresa a la página principal.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold uppercase tracking-wider transition-colors"
                    >
                        Ir al inicio
                    </Link>
                    <Link
                        href="/hoteles"
                        className="px-8 py-3 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold uppercase tracking-wider transition-colors"
                    >
                        Ver habitaciones
                    </Link>
                </div>

                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {[
                        { href: '/nosotros', label: 'Sobre nosotros' },
                        { href: '/servicios', label: 'Servicios' },
                        { href: '/galeria', label: 'Galería' },
                        { href: '/contacto', label: 'Contacto' },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
