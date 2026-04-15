'use client'

import { useState, useEffect, Suspense, useRef, useSyncExternalStore } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    Users, Star, Building2, SlidersHorizontal, X, Search, MapPin,
    Grid3X3, List, ChevronUp, ChevronDown, Heart, ArrowUpDown,
    Calendar, Minus, Plus, TreePine, Home, Hotel, Leaf
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface Alojamiento {
    id: string
    nombre: string
    descripcion: string
    categoria: string
    tipo: string
    precio_base: number
    capacidad_maxima: number
    distrito: string | null
    provincia: string | null
    departamento: string | null
    activo: boolean
    fotos_alojamiento: { url: string; es_principal: boolean }[]
}

const CATEGORIAS = ['Económico', 'Familiar', 'Parejas', 'Premium', 'Naturaleza']
const TIPOS = ['Cabaña', 'EcoLodge', 'Hotel', 'Hostal', 'Casa']

const CATEGORIA_COLORS: Record<string, string> = {
    'Económico': 'bg-blue-100 text-blue-700',
    'Familiar': 'bg-yellow-100 text-yellow-700',
    'Parejas': 'bg-pink-100 text-pink-700',
    'Premium': 'bg-yellow-100 text-yellow-700',
    'Naturaleza': 'bg-emerald-100 text-emerald-700',
}

const TIPO_ICONS: Record<string, React.ElementType> = {
    'Cabaña': TreePine,
    'EcoLodge': Leaf,
    'Hotel': Hotel,
    'Hostal': Building2,
    'Casa': Home,
}

const ORDENES = [
    { value: 'precio_asc', label: 'Precio mas bajo', helper: 'Las opciones mas accesibles primero' },
    { value: 'precio_desc', label: 'Precio mas alto', helper: 'Destaca estancias premium y completas' },
    { value: 'nombre', label: 'Nombre A-Z', helper: 'Explora el catalogo en orden alfabetico' },
] as const

type Orden = (typeof ORDENES)[number]['value']

function HotelesContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    // ── Estado de filtros ────────────────────────────────────────────────────
    const [busqueda, setBusqueda] = useState(searchParams.get('q') || '')
    const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
    const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
    const [huespedes, setHuespedes] = useState(Number(searchParams.get('huespedes') || 1))
    const [categoria, setCategoria] = useState(() => {
        const t = searchParams.get('tipo') || ''
        return t.startsWith('cat:') ? t.slice(4) : ''
    })
    const [tipAloj, setTipAloj] = useState(() => {
        const t = searchParams.get('tipo') || ''
        return t.startsWith('tip:') ? t.slice(4) : ''
    })
    const [precioMin, setPrecioMin] = useState('')
    const [precioMax, setPrecioMax] = useState('')
    const [orden, setOrden] = useState<Orden>('precio_asc')

    // ── Estado UI ────────────────────────────────────────────────────────────
    const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([])
    const [loading, setLoading] = useState(true)
    const [vista, setVista] = useState<'grid' | 'lista'>('grid')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [favoritos, setFavoritos] = useState<Set<string>>(new Set())

    // Ref para evitar doble fetch en StrictMode
    const fetchRef = useRef(0)

    const isClient = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false,
    )
    const minDate = isClient ? new Date().toISOString().split('T')[0] : ''

    // ── Carga de datos ───────────────────────────────────────────────────────
    useEffect(() => {
        const id = ++fetchRef.current
        cargar(id)
    }, [busqueda, checkIn, checkOut, huespedes, categoria, tipAloj, precioMin, precioMax, orden])

    async function cargar(id: number) {
        setLoading(true)
        try {
            let query = supabase
                .from('alojamientos')
                .select('id, nombre, descripcion, categoria, tipo, precio_base, capacidad_maxima, distrito, provincia, departamento, activo, fotos_alojamiento(url, es_principal)')
                .eq('activo', true)

            // Filtros en BD
            if (categoria) query = query.eq('categoria', categoria)
            if (tipAloj) query = query.eq('tipo', tipAloj)
            if (huespedes > 1) query = query.gte('capacidad_maxima', huespedes)
            if (precioMin) query = query.gte('precio_base', Number(precioMin))
            if (precioMax) query = query.lte('precio_base', Number(precioMax))

            const { data, error } = await query
            if (error) throw error
            if (id !== fetchRef.current) return // respuesta obsoleta

            let resultado = (data || []) as Alojamiento[]

            // Filtro texto (cliente)
            if (busqueda.trim()) {
                const term = busqueda.toLowerCase().trim()
                resultado = resultado.filter(a =>
                    a.nombre.toLowerCase().includes(term) ||
                    (a.descripcion || '').toLowerCase().includes(term) ||
                    (a.distrito || '').toLowerCase().includes(term) ||
                    (a.provincia || '').toLowerCase().includes(term) ||
                    (a.departamento || '').toLowerCase().includes(term)
                )
            }

            // Filtro disponibilidad por fechas (excluir reservas confirmadas que se solapan)
            if (checkIn && checkOut) {
                const { data: ocupados } = await supabase
                    .from('reservas')
                    .select('alojamiento_id')
                    .eq('estado', 'confirmada')
                    .lt('fecha_inicio', checkOut)
                    .gt('fecha_fin', checkIn)

                if (id !== fetchRef.current) return
                const ocupadosSet = new Set((ocupados || []).map((r: any) => r.alojamiento_id))
                resultado = resultado.filter(a => !ocupadosSet.has(a.id))
            }

            // Ordenar
            resultado.sort((a, b) => {
                if (orden === 'precio_asc') return a.precio_base - b.precio_base
                if (orden === 'precio_desc') return b.precio_base - a.precio_base
                return a.nombre.localeCompare(b.nombre, 'es')
            })

            setAlojamientos(resultado)
        } catch (err) {
            console.error('Error cargando alojamientos:', err)
            setAlojamientos([])
        } finally {
            if (id === fetchRef.current) setLoading(false)
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    const getImagen = (aloj: Alojamiento) => {
        const fotos = aloj.fotos_alojamiento || []
        const principal = fotos.find(f => f.es_principal)
        return principal?.url || fotos[0]?.url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'
    }

    const limpiarTodo = () => {
        setBusqueda(''); setCheckIn(''); setCheckOut(''); setHuespedes(1)
        setCategoria(''); setTipAloj(''); setPrecioMin(''); setPrecioMax('')
        router.push('/hoteles')
    }

    const toggleFav = (id: string) => setFavoritos(prev => {
        const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s
    })

    const nFiltros = [busqueda, checkIn, categoria, tipAloj, precioMin, precioMax, huespedes > 1 ? '1' : ''].filter(Boolean).length
    const noches = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0
    const linkParams = checkIn ? `?checkIn=${checkIn}&checkOut=${checkOut}&huespedes=${huespedes}` : ''
    const ordenActual = ORDENES.find((item) => item.value === orden) ?? ORDENES[0]

    const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"

    // ── SIDEBAR ──────────────────────────────────────────────────────────────
    const SidebarSection = ({ title, children }: {
        title: string; children: React.ReactNode
    }) => (
        <div className="py-4 border-b border-gray-100 last:border-0">
            <p className="text-xs font-semibold text-gray-500 mb-3">{title}</p>
            {children}
        </div>
    )

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="relative h-[42vh] flex items-end justify-center overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
                    alt="Alojamientos" fill sizes="100vw" className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/75" />
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-10">
                    <h1 className="text-5xl font-bold text-white mb-2 font-serif">Nuestros Alojamientos</h1>
                    <p className="text-gray-300 text-lg mb-5">Encuentra tu espacio perfecto en la naturaleza</p>
                    {/* Buscador rápido en hero */}
                    <div className="bg-white rounded-2xl shadow-2xl p-2 flex gap-2 max-w-2xl">
                        <div className="flex-1 flex items-center gap-2 px-4">
                            <Search size={16} className="text-gray-400 flex-shrink-0" />
                            <input type="text" placeholder="Buscar por nombre, ubicación..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                className="flex-1 text-sm font-medium outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                            />
                            {busqueda && <button onClick={() => setBusqueda('')}><X size={14} className="text-gray-400 hover:text-gray-600" /></button>}
                        </div>
                        <button onClick={() => cargar(++fetchRef.current)}
                            className="flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-400 text-gray-900 font-bold text-sm rounded-xl transition-all">
                            <Search size={15} /> Buscar
                        </button>
                    </div>
                </div>
            </section>

            {/* ── TAGS FILTROS ACTIVOS ─────────────────────────────────────── */}
            {nFiltros > 0 && (
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-500 mr-1">Filtros:</span>
                        {categoria && <Tag label={categoria} onRemove={() => setCategoria('')} />}
                        {tipAloj && <Tag label={tipAloj} onRemove={() => setTipAloj('')} />}
                        {huespedes > 1 && <Tag label={`${huespedes} huéspedes`} onRemove={() => setHuespedes(1)} />}
                        {checkIn && <Tag label={`${fmtFecha(checkIn)} → ${checkOut ? fmtFecha(checkOut) : '?'}`} onRemove={() => { setCheckIn(''); setCheckOut('') }} />}
                        {(precioMin || precioMax) && <Tag label={`S/. ${precioMin || '0'} – ${precioMax || '∞'}`} onRemove={() => { setPrecioMin(''); setPrecioMax('') }} />}
                        {busqueda && <Tag label={`"${busqueda}"`} onRemove={() => setBusqueda('')} />}
                        <button onClick={limpiarTodo} className="ml-auto text-xs text-yellow-700 hover:text-yellow-800 font-bold transition-colors">
                            Limpiar todo
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 lg:flex-row lg:items-start">
                {/* ── SIDEBAR ──────────────────────────────────────────────── */}
                {sidebarOpen && (
                    <aside className="w-full lg:w-64 lg:flex-shrink-0 lg:self-start lg:sticky lg:top-24">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal size={15} className="text-gray-500" />
                                    Filtros
                                    {nFiltros > 0 && (
                                        <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">{nFiltros}</span>
                                    )}
                                </span>
                                {nFiltros > 0 && (
                                    <button onClick={limpiarTodo} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                        Limpiar
                                    </button>
                                )}
                            </div>

                            <div className="px-5 divide-y divide-gray-100">

                                {/* Categoría */}
                                <SidebarSection title="Categoría">
                                    <div className="grid grid-cols-2 gap-2">
                                        {CATEGORIAS.map(cat => (
                                            <button key={cat}
                                                onClick={() => setCategoria(c => c === cat ? '' : cat)}
                                                className={`px-3 py-2 rounded-lg text-sm text-center transition-all border ${
                                                    categoria === cat
                                                        ? 'bg-yellow-400 text-gray-900 border-yellow-400 font-semibold'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}>
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </SidebarSection>

                                {/* Tipo */}
                                <SidebarSection title="Tipo de alojamiento">
                                    <div className="grid grid-cols-2 gap-2">
                                        {TIPOS.map(tipo => (
                                            <button key={tipo}
                                                onClick={() => setTipAloj(t => t === tipo ? '' : tipo)}
                                                className={`px-3 py-2 rounded-lg text-sm text-center transition-all border ${
                                                    tipAloj === tipo
                                                        ? 'bg-yellow-400 text-gray-900 border-yellow-400 font-semibold'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}>
                                                {tipo}
                                            </button>
                                        ))}
                                    </div>
                                </SidebarSection>

                                {/* Ordenar */}
                                <SidebarSection title="Ordenar">
                                    <div className="space-y-1.5">
                                        {ORDENES.map((item) => (
                                            <button
                                                key={item.value}
                                                onClick={() => setOrden(item.value)}
                                                className={`w-full px-3 py-2.5 rounded-lg text-sm text-left transition-all border ${
                                                    orden === item.value
                                                        ? 'bg-yellow-400 text-gray-900 border-yellow-400 font-semibold'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}>
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </SidebarSection>

                                {/* Huéspedes */}
                                <SidebarSection title="Huéspedes">
                                    <div className="flex items-center justify-between gap-3">
                                        <button onClick={() => setHuespedes(h => Math.max(1, h - 1))}
                                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-yellow-400 hover:text-yellow-600 transition-all text-gray-600">
                                            <Minus size={13} />
                                        </button>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {huespedes} {huespedes === 1 ? 'persona' : 'personas'}
                                        </span>
                                        <button onClick={() => setHuespedes(h => Math.min(20, h + 1))}
                                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-yellow-400 hover:text-yellow-600 transition-all text-gray-600">
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                </SidebarSection>

                                {/* Precio */}
                                <SidebarSection title="Precio por noche (S/.)">
                                    <div className="flex gap-2">
                                        <input type="number" value={precioMin} min={0} placeholder="Mín"
                                            onChange={e => setPrecioMin(e.target.value)}
                                            className={inputCls}
                                        />
                                        <input type="number" value={precioMax} min={0} placeholder="Máx"
                                            onChange={e => setPrecioMax(e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                </SidebarSection>

                                {/* Disponibilidad */}
                                <SidebarSection title="Disponibilidad">
                                    <div className="space-y-2">
                                        <input type="date" value={checkIn} min={minDate}
                                            onChange={e => setCheckIn(e.target.value)}
                                            className={inputCls}
                                            suppressHydrationWarning
                                        />
                                        <input type="date" value={checkOut} min={checkIn || minDate}
                                            onChange={e => setCheckOut(e.target.value)}
                                            className={inputCls}
                                            suppressHydrationWarning
                                        />
                                        {noches > 0 && (
                                            <p className="text-xs text-yellow-700 font-semibold text-center">
                                                {noches} noche{noches > 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                </SidebarSection>

                            </div>
                        </div>
                    </aside>
                )}

                {/* ── CONTENIDO PRINCIPAL ──────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-5 bg-white rounded-2xl border border-gray-200 px-4 py-3 gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(v => !v)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all border ${
                                    sidebarOpen ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}>
                                <SlidersHorizontal size={15} />
                                Filtros
                                {nFiltros > 0 && <span className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded-full">{nFiltros}</span>}
                            </button>
                            <p className="text-sm text-gray-500">
                                {loading ? 'Buscando...' : (
                                    <><span className="font-bold text-gray-900">{alojamientos.length}</span> resultado{alojamientos.length !== 1 ? 's' : ''}</>
                                )}
                            </p>
                        </div>
                        {/* Toggle vista grid/lista */}
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                            <button onClick={() => setVista('grid')}
                                className={`p-2 transition-colors ${vista === 'grid' ? 'bg-yellow-400 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                                aria-label="Vista cuadrícula">
                                <Grid3X3 size={15} />
                            </button>
                            <button onClick={() => setVista('lista')}
                                className={`p-2 transition-colors ${vista === 'lista' ? 'bg-yellow-400 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                                aria-label="Vista lista">
                                <List size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Resultados */}
                    {loading ? (
                        <div className={vista === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse border border-gray-100">
                                    <div className="h-52 bg-gray-200" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : alojamientos.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-10 h-10 text-gray-300" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Sin resultados</h2>
                            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                                {nFiltros > 0 ? 'Ningún alojamiento coincide con los filtros.' : 'No hay alojamientos disponibles.'}
                            </p>
                            {nFiltros > 0 && (
                                <button onClick={limpiarTodo}
                                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm transition-colors">
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    ) : vista === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {alojamientos.map(aloj => (
                                <CardGrid key={aloj.id} aloj={aloj} imagen={getImagen(aloj)}
                                    esFav={favoritos.has(aloj.id)} onFav={() => toggleFav(aloj.id)}
                                    linkParams={linkParams} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alojamientos.map(aloj => (
                                <CardLista key={aloj.id} aloj={aloj} imagen={getImagen(aloj)}
                                    esFav={favoritos.has(aloj.id)} onFav={() => toggleFav(aloj.id)}
                                    linkParams={linkParams} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Helpers externos ─────────────────────────────────────────────────────────

function fmtFecha(fecha: string) {
    if (!fecha) return ''
    const [y, m, d] = fecha.split('-')
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${d} ${meses[Number(m) - 1]}`
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">
            {label}
            <button onClick={onRemove} className="hover:text-yellow-800 transition-colors ml-0.5">
                <X size={11} />
            </button>
        </span>
    )
}

function CardGrid({ aloj, imagen, esFav, onFav, linkParams }: {
    aloj: Alojamiento; imagen: string; esFav: boolean; onFav: () => void; linkParams: string
}) {
    const TipoIcon = TIPO_ICONS[aloj.tipo] || Building2
    const catColor = CATEGORIA_COLORS[aloj.categoria] || 'bg-gray-100 text-gray-700'
    const ubicacion = [aloj.distrito, aloj.provincia].filter(Boolean).join(', ')

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group">
            <div className="relative h-52 overflow-hidden">
                <Image src={imagen} alt={aloj.nombre} fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <button onClick={onFav}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${esFav ? 'bg-yellow-400 text-gray-900' : 'bg-white/90 text-gray-600 hover:bg-yellow-50 hover:text-yellow-400'}`}>
                    <Heart size={15} fill={esFav ? 'currentColor' : 'none'} />
                </button>
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${catColor}`}>{aloj.categoria}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/90 text-gray-700 flex items-center gap-1">
                        <TipoIcon size={10} /> {aloj.tipo}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{aloj.nombre}</h3>
                {ubicacion && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin size={11} className="text-yellow-400 flex-shrink-0" /> {ubicacion}
                    </p>
                )}
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{aloj.descripcion}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400">desde</p>
                        <p className="text-lg font-bold text-yellow-600">S/. {aloj.precio_base.toLocaleString('es-PE')}</p>
                        <p className="text-xs text-gray-400">por noche</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users size={11} /> Hasta {aloj.capacidad_maxima}
                        </span>
                        <Link href={`/hoteles/${aloj.id}${linkParams}`}
                            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-bold rounded-xl transition-colors">
                            Ver detalles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CardLista({ aloj, imagen, esFav, onFav, linkParams }: {
    aloj: Alojamiento; imagen: string; esFav: boolean; onFav: () => void; linkParams: string
}) {
    const TipoIcon = TIPO_ICONS[aloj.tipo] || Building2
    const catColor = CATEGORIA_COLORS[aloj.categoria] || 'bg-gray-100 text-gray-700'
    const ubicacion = [aloj.distrito, aloj.provincia].filter(Boolean).join(', ')

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all flex group">
            <div className="relative w-56 flex-shrink-0 overflow-hidden">
                <Image src={imagen} alt={aloj.nombre} fill
                    sizes="224px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy" />
                <button onClick={onFav}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${esFav ? 'bg-yellow-400 text-gray-900' : 'bg-white/90 text-gray-600 hover:bg-yellow-50 hover:text-yellow-400'}`}>
                    <Heart size={13} fill={esFav ? 'currentColor' : 'none'} />
                </button>
            </div>
            <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{aloj.nombre}</h3>
                        <div className="flex gap-1.5 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${catColor}`}>{aloj.categoria}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 flex items-center gap-1">
                                <TipoIcon size={10} /> {aloj.tipo}
                            </span>
                        </div>
                    </div>
                    {ubicacion && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                            <MapPin size={11} className="text-yellow-400" /> {ubicacion}
                        </p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2">{aloj.descripcion}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-xs text-gray-400">desde</p>
                            <p className="text-xl font-bold text-yellow-600">S/. {aloj.precio_base.toLocaleString('es-PE')}</p>
                            <p className="text-xs text-gray-400">por noche</p>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Users size={13} /> Hasta {aloj.capacidad_maxima} personas
                        </span>
                    </div>
                    <Link href={`/hoteles/${aloj.id}${linkParams}`}
                        className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-bold rounded-xl transition-colors">
                        Ver detalles
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ── Export default ────────────────────────────────────────────────────────────

export default function HotelesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Cargando alojamientos...</p>
                </div>
            </div>
        }>
            <HotelesContent />
        </Suspense>
    )
}
