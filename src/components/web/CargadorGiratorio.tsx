export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-3',
        lg: 'w-16 h-16 border-4'
    }

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizeClasses[size]} border-red-600 border-t-transparent rounded-full animate-spin`} />
        </div>
    )
}

export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
        </div>
    )
}

export function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-sm mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
    )
}
