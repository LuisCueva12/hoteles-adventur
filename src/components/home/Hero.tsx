import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative grid min-h-[90vh] place-items-center overflow-hidden bg-secondary">
      {/* Fondo con imagen de lujo */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80"
          alt="Lobby de hotel de lujo"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary via-transparent to-secondary" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 text-center text-white">
        <div className="animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="mb-8 inline-block rounded-full border border-primary/30 bg-primary/10 px-6 py-2 text-xs font-bold uppercase tracking-[0.4em] text-primary backdrop-blur-md">
            Hoteles Adventur
          </div>
          
          <h1 className="mb-8 text-5xl font-extrabold tracking-tight md:text-8xl lg:text-9xl">
            Vive la <span className="text-primary italic">Grandeza</span> <br /> 
            del Descanso
          </h1>
          
          <p className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-gray-300 md:text-2xl">
            Descubre una selección exclusiva de hoteles donde cada detalle está diseñado para superar tus expectativas.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="/hoteles"
              className="group flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-sm font-bold uppercase tracking-widest text-secondary shadow-2xl transition-all hover:scale-105 hover:bg-primary-hover"
            >
              Explorar Reservas
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/nosotros"
              className="rounded-2xl border-2 border-white/20 px-10 py-5 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:bg-white hover:text-secondary"
            >
              Nuestra Historia
            </Link>
          </div>
        </div>
      </div>

      {/* Indicador de Scroll */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-10 w-6 rounded-full border-2 border-white/30 p-1">
          <div className="mx-auto h-2 w-1 rounded-full bg-primary" />
        </div>
      </div>
    </section>
  );
}
