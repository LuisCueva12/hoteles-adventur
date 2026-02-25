'use client'

export function SearchBar() {
    return (
        <div className="bg-white shadow-xl border-t-4 border-red-600 -mt-8 relative z-20 max-w-5xl mx-auto rounded-sm">
            <form className="grid grid-cols-2 md:grid-cols-5 gap-0 divide-x divide-gray-200">
                {[
                    { label: 'Email', placeholder: 'Tu email', type: 'email' },
                    { label: 'Tipo de habitacion', placeholder: 'Seleccionar', type: 'text' },
                    { label: 'Check-in', placeholder: '', type: 'date' },
                    { label: 'Check-out', placeholder: '', type: 'date' },
                    { label: 'Huespedes', placeholder: '1 huesped', type: 'number' },
                ].map((field) => (
                    <div key={field.label} className="px-4 py-3 flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            {field.label}
                        </label>
                        <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className="text-sm text-gray-700 outline-none w-full"
                            min={field.type === 'number' ? 1 : undefined}
                        />
                    </div>
                ))}
            </form>
            <div className="px-4 pb-4 flex justify-end">
                <button className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm uppercase tracking-wider transition-colors">
                    Reservar ahora
                </button>
            </div>
        </div>
    )
}
