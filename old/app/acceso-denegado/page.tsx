import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AccesoDenegado() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-yellow-400 font-serif">
                        403
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="h-px w-16 bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="h-px w-16 bg-yellow-400" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
                    Acceso Denegado
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Lo sentimos, no tienes permisos para acceder a esta página. 
                    Si crees que esto es un error, por favor contacta al administrador.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-yellow-400 hover:bg-yellow-400 text-gray-900 font-semibold uppercase tracking-wider transition-colors"
                    >
                        Ir al inicio
                    </Link>
                    <Link
                        href="/login"
                        className="px-8 py-3 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 font-semibold uppercase tracking-wider transition-colors"
                    >
                        Iniciar sesión
                    </Link>
                </div>

                <div className="mt-12">
                    <p className="text-sm text-gray-500">
                        ¿Necesitas ayuda? <Link href="/contacto" className="text-yellow-400 hover:underline">Contáctanos</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
