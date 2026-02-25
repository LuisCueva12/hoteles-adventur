import Link from 'next/link'

const FOOTER_LINKS = {
    Informacion: ['Sobre nosotros', 'Politica de privacidad', 'Terminos y condiciones', 'Mapa del sitio'],
    'Mi cuenta': ['Mi cuenta', 'Historial de reservas', 'Lista de deseos', 'Newsletter', 'Devoluciones'],
}

export function Footer() {
    return (
        <footer className="bg-gray-950 text-gray-400">
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div>
                    <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-widest">Direccion</h4>
                    <p className="text-sm leading-relaxed">Hotel en Lima, Peru</p>
                    <p className="text-sm mt-1">+51 (01) 234-5678</p>
                    <p className="text-sm mt-1">info@adventurhotels.com</p>
                </div>

                {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                    <div key={title}>
                        <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-widest">{title}</h4>
                        <ul className="space-y-2">
                            {links.map((link) => (
                                <li key={link}>
                                    <span className="text-sm hover:text-white transition-colors cursor-pointer">{link}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-widest">Newsletter</h4>
                    <p className="text-sm mb-4">Suscribete para recibir las ultimas noticias y ofertas.</p>
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="Tu email"
                            className="flex-1 px-3 py-2 text-sm bg-gray-800 text-white border border-gray-700 rounded-l outline-none focus:border-red-500"
                        />
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-r transition-colors">
                            OK
                        </button>
                    </div>
                    <div className="flex gap-3 mt-6">
                        {['f', 't', 'in', 'g+'].map((s) => (
                            <span key={s} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center text-xs cursor-pointer transition-colors text-white">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
                &copy; 2026 Adventur Hotels. Todos los derechos reservados.
            </div>
        </footer>
    )
}
