export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="inline-block">
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
                </div>
                <p className="text-gray-600 font-semibold uppercase tracking-wider text-sm">
                    Cargando...
                </p>
            </div>
        </div>
    )
}
