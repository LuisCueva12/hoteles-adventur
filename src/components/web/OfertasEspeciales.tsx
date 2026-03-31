'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Star, Tag } from 'lucide-react'

const OFERTAS = [
    {
        id: 1,
        titulo: 'Escapada de Fin de Semana',
        descripcion: 'Reserva 2 noches y obten la 3ra noche gratis en nuestra seleccion premium.',
        descuento: '33% OFF',
        imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        validoHasta: '2026-03-31',
        codigo: 'WEEKEND33',
        destacado: true,
        etiqueta: 'Mas popular',
    },
    {
        id: 2,
        titulo: 'Oferta Romantica',
        descripcion: 'Incluye cena para dos, champagne y una ambientacion especial para sorprender.',
        descuento: '25% OFF',
        imagen: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
        validoHasta: '2026-04-15',
        codigo: 'ROMANCE25',
        destacado: false,
        etiqueta: 'Solo online',
    },
    {
        id: 3,
        titulo: 'Reserva Anticipada',
        descripcion: 'Confirma con tiempo y asegura mejor tarifa para tus fechas favoritas.',
        descuento: '20% OFF',
        imagen: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        validoHasta: '2026-12-31',
        codigo: 'EARLY20',
        destacado: false,
        etiqueta: 'Planifica mejor',
    },
]

export function OfertasEspeciales() {
    const [timeLeft, setTimeLeft] = useState<Record<number, string>>({})

    useEffect(() => {
        const calculateTimeLeft = () => {
            const newTimeLeft: Record<number, string> = {}

            OFERTAS.forEach((oferta) => {
                const difference = new Date(oferta.validoHasta).getTime() - new Date().getTime()

                if (difference > 0) {
                    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
                    newTimeLeft[oferta.id] = `${days} dias restantes`
                } else {
                    newTimeLeft[oferta.id] = 'Oferta expirada'
                }
            })

            setTimeLeft(newTimeLeft)
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000 * 60 * 60)

        return () => clearInterval(timer)
    }, [])

    return (
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fffdf6_0%,#fff8df_48%,#ffffff_100%)] py-20 sm:py-24">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.22),_transparent_65%)]" />
            <div className="absolute left-[-6rem] top-24 h-56 w-56 rounded-full bg-yellow-200/40 blur-3xl" />
            <div className="absolute right-[-4rem] bottom-16 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-6">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-yellow-600 shadow-sm backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-yellow-400" />
                            Ofertas limitadas
                        </span>

                        <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                            Promociones que si se ven,
                            <span className="block text-yellow-500">y si provocan reservar.</span>
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                            Mejores beneficios, codigos claros y accesos directos para que la decision sea rapida y la
                            oferta se entienda al primer vistazo.
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ventaja Adventur</p>
                                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Descuentos visibles y accion inmediata</h3>
                            </div>
                            <div className="rounded-2xl bg-yellow-400 px-3 py-2 text-sm font-bold text-slate-900 shadow-sm">
                                3 activas
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            {[
                                { label: 'Cupon listo', value: 'Aplicalo al reservar' },
                                { label: 'Fechas claras', value: 'Sin textos perdidos' },
                                { label: 'CTA directo', value: 'Ir a habitaciones' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                                    <p className="mt-1 text-sm font-medium text-slate-700">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {OFERTAS.map((oferta) => (
                        <article
                            key={oferta.id}
                            className={`group flex h-full flex-col overflow-hidden rounded-[30px] border bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_26px_50px_rgba(15,23,42,0.14)] ${
                                oferta.destacado
                                    ? 'border-yellow-300 ring-4 ring-yellow-300/35'
                                    : 'border-slate-200/80'
                            }`}
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={oferta.imagen}
                                    alt={oferta.titulo}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />

                                <div className="absolute left-5 top-5 flex max-w-[70%] flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900 shadow-sm">
                                        {oferta.destacado && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
                                        {oferta.etiqueta}
                                    </span>
                                </div>

                                <div className="absolute right-5 top-5 rounded-2xl bg-yellow-400 px-4 py-3 text-base font-black text-slate-950 shadow-lg">
                                    {oferta.descuento}
                                </div>

                                <div className="absolute inset-x-5 bottom-5">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-yellow-300/95">
                                        Disponible por tiempo limitado
                                    </p>
                                    <h3 className="mt-2 text-2xl font-bold leading-tight text-white">
                                        {oferta.titulo}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                                <p className="text-base leading-7 text-slate-600">
                                    {oferta.descripcion}
                                </p>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock className="h-4 w-4 text-yellow-500" />
                                            <span className="text-xs font-bold uppercase tracking-[0.16em]">Vigencia</span>
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-slate-900">{timeLeft[oferta.id]}</p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Tag className="h-4 w-4 text-yellow-500" />
                                            <span className="text-xs font-bold uppercase tracking-[0.16em]">Codigo</span>
                                        </div>
                                        <p className="mt-2 font-mono text-sm font-bold tracking-[0.12em] text-slate-900">
                                            {oferta.codigo}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                                    <span>Aplicable al reservar online</span>
                                    <span className="font-semibold text-yellow-600">Condiciones vigentes</span>
                                </div>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={`/hoteles?oferta=${oferta.codigo}`}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3.5 text-center text-sm font-bold text-slate-950 transition-all duration-300 hover:bg-yellow-500"
                                    >
                                        Reservar ahora
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>

                                    <Link
                                        href="/hoteles"
                                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-yellow-300 hover:bg-yellow-50 hover:text-slate-900"
                                    >
                                        Ver opciones
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-12 rounded-[28px] border border-slate-200/80 bg-white/90 px-6 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] backdrop-blur sm:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Las ofertas estan sujetas a disponibilidad y terminos de cada alojamiento.
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Si una promocion vence, te mostramos otras alternativas disponibles.
                            </p>
                        </div>

                        <Link
                            href="/hoteles"
                            className="inline-flex items-center justify-center rounded-2xl border-2 border-yellow-400 px-8 py-3.5 text-sm font-bold text-yellow-600 transition-all duration-300 hover:bg-yellow-400 hover:text-slate-950"
                        >
                            Ver todas las habitaciones
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
