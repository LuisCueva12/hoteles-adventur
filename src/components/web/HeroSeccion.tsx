import Link from 'next/link'

export function HeroSeccion() {
    return (
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
            <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
                alt="Adventur Hotels"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55" />

            <div className="relative z-10 text-center text-white px-6 max-w-3xl">
                <p className="text-red-400 text-sm font-semibold tracking-[0.3em] uppercase mb-4">
                    Bienvenido a
                </p>
                <h1 className="text-5xl md:text-7xl font-bold italic mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                    Adventur Hotels
                </h1>
                <p className="text-lg text-gray-300 mb-10 tracking-widest uppercase">
                    El lugar donde buscas escaparte
                </p>
                <Link href="/hoteles"
                    className="inline-block px-10 py-3.5 border-2 border-white text-white font-semibold text-sm tracking-widest uppercase hover:bg-white hover:text-gray-900 transition-all">
                    Explorar ahora
                </Link>
            </div>

            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 text-white flex items-center justify-center rounded-full transition-colors">
                &lt;
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 text-white flex items-center justify-center rounded-full transition-colors">
                &gt;
            </button>
        </section>
    )
}
