'use client'

import { useState, useEffect, Suspense, useRef, useSyncExternalStore } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
    'Familiar': 'bg-yellow-100 text-yellow-400',
    'Parejas': 'bg-pink-100 text-pink-700',
    'Premium': 'bg-yellow-100 text-yellow-400',
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
    const [secFechas, setSecFechas] = useState(true)
    const [secHuespedes, setSecHuespedes] = useState(true)
    const [secCategoria, setSecCategoria] = useState(true)
    const [secTipo, setSecTipo] = useState(true)
    const [secPrecio, setSecPrecio] = useState(true)
    const [secOrganizar, setSecOrganizar] = useState(true)

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

    const inputCls = "w-full border-2 border-gray-300 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"

    // ── SIDEBAR ──────────────────────────────────────────────────────────────
    const SidebarSection = ({ title, icon: Icon, open, onToggle, children }: {
        title: string; icon: React.ElementType; open: boolean; onToggle: () => void; children: React.ReactNode
    }) => (
        <div className="px-5 py-4 border-b border-gray-100 last:border-0">
            <button onClick={onToggle} className="flex items-center justify-between w-full mb-3 group">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Icon size={13} className="text-yellow-400" /> {title}
                </span>
                {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {open && children}
        </div>
    )

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="relative h-[42vh] flex items-end justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
                    alt="Alojamientos" className="absolute inset-0 w-full h-full object-cover" />
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
                        <button onClick={limpiarTodo} className="ml-auto text-xs text-yellow-400 hover:text-yellow-400 font-bold transition-colors">
                            Limpiar todo
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 lg:flex-row lg:items-start">
                {/* ── SIDEBAR ──────────────────────────────────────────────── */}
                {sidebarOpen && (
                    <aside className="w-full lg:w-72 lg:flex-shrink-0 lg:self-start lg:sticky lg:top-24">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500">
                                <div className="flex items-center gap-2 text-white">
                                    <SlidersHorizontal size={17} />
                                    <span className="font-bold text-sm uppercase tracking-wide">Filtros</span>
                                    {nFiltros > 0 && <span className="bg-white text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">{nFiltros}</span>}
                                </div>
                                {nFiltros > 0 && (
                                    <button onClick={limpiarTodo} className="text-white/80 hover:text-white text-xs flex items-center gap-1">
                                        <X size={11} /> Limpiar
                                    </button>
                                )}
                            </div>

                            <div className="overflow-visible lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                                <div className="px-5 pt-5">
                                    <div className="rounded-2xl border border-yellow-100 bg-gradient-to-br from-yellow-50 via-white to-white p-3.5">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-500">Exploracion</p>
                                        <div className="mt-2 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {loading ? 'Actualizando resultados...' : `${alojamientos.length} opciones disponibles`}
                                                </p>
                                                <p className="text-xs text-gray-500">Orden actual: {ordenActual.label}</p>
                                            </div>
                                            <span className="rounded-full border border-yellow-100 bg-white px-2.5 py-1 text-[11px] font-bold text-gray-600 shadow-sm">
                                                {vista === 'grid' ? 'Vista grid' : 'Vista lista'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <SidebarSection title="Ordenar resultados" icon={ArrowUpDown} open={secOrganizar} onToggle={() => setSecOrganizar(v => !v)}>
                                    <div className="space-y-2">
                                        {ORDENES.map((item) => (
                                            <button
                                                key={item.value}
                                                onClick={() => setOrden(item.value)}
                                                className={`w-full rounded-2xl border px-3.5 py-3 text-left transition-all ${
                                                    orden === item.value
                                                        ? 'border-yellow-400 bg-yellow-50 shadow-sm'
                                                        : 'border-gray-200 hover:border-yellow-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                                                        <p className="mt-1 text-xs text-gray-500">{item.helper}</p>
                                                    </div>
                                                    <span
                                                        className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${
                                                            orden === item.value ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                    >
                                                        {orden === item.value ? 'Activo' : 'Usar'}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </SidebarSection>

                                {/* Disponibilidad */}
                                <SidebarSection title="Disponibilidad" icon={Calendar} open={secFechas} onToggle={() => setSecFechas(v => !v)}>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Check-in</label>
                                            <input type="date" value={checkIn} min={minDate}
                                                onChange={e => setCheckIn(e.target.value)}
                                                className={inputCls}
                                                suppressHydrationWarning
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Check-out</label>
                                            <input type="date" value={checkOut} min={checkIn || minDate}
                                                onChange={e => setCheckOut(e.target.value)}
                                                className={inputCls}
                                                suppressHydrationWarning
                                            />
                                        </div>
                                        {noches > 0 && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs text-yellow-400 font-semibold text-center">
                                                {noches} noche{noches > 1 ? 's' : ''} seleccionada{noches > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </SidebarSection>

                                {/* Huéspedes */}
                                <SidebarSection title="Huéspedes" icon={Users} open={secHuespedes} onToggle={() => setSecHuespedes(v => !v)}>
                                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                        <button onClick={() => setHuespedes(h => Math.max(1, h - 1))}
                                            className="w-9 h-9 rounded-lg bg-white shadow border border-gray-200 flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 transition-all">
                                            <Minus size={14} />
                                        </button>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">{huespedes}</p>
                                            <p className="text-xs text-gray-500">{huespedes === 1 ? 'persona' : 'personas'}</p>
                                        </div>
                                        <button onClick={() => setHuespedes(h => Math.min(20, h + 1))}
                                            className="w-9 h-9 rounded-lg bg-white shadow border border-gray-200 flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 transition-all">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </SidebarSection>

                                {/* Categoría */}
                                <SidebarSection title="Categoría" icon={Star} open={secCategoria} onToggle={() => setSecCategoria(v => !v)}>
                                    <div className="space-y-1.5">
                                        {CATEGORIAS.map(cat => (
                                            <button key={cat}
                                                onClick={() => setCategoria(c => c === cat ? '' : cat)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                                                    categoria === cat
                                                        ? 'bg-yellow-400 text-gray-900 border-yellow-400 shadow-sm'
                                                        : 'border-gray-200 text-gray-700 hover:border-yellow-300 hover:bg-yellow-50'
                                                }`}>
                                                <span>{cat}</span>
                                                {categoria === cat && <X size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </SidebarSection>

                                {/* Tipo */}
                                <SidebarSection title="Tipo de alojamiento" icon={Building2} open={secTipo} onToggle={() => setSecTipo(v => !v)}>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TIPOS.map(tipo => {
                                            const Icon = TIPO_ICONS[tipo] || Building2
                                            return (
                                                <button key={tipo}
                                                    onClick={() => setTipAloj(t => t === tipo ? '' : tipo)}
                                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all border ${
                                                        tipAloj === tipo
                                                            ? 'bg-yellow-400 text-gray-900 border-yellow-400 shadow-sm'
                                                            : 'border-gray-200 text-gray-600 hover:border-yellow-300 hover:bg-yellow-50'
                                                    }`}>
                                                    <Icon size={18} />
                                                    {tipo}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </SidebarSection>

                                {/* Precio */}
                                <SidebarSection title="Precio por noche" icon={Star} open={secPrecio} onToggle={() => setSecPrecio(v => !v)}>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Mínimo</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold">S/.</span>
                                                    <input type="number" value={precioMin} min={0} placeholder="0"
                                                        onChange={e => setPrecioMin(e.target.value)}
                                                        className="w-full border-2 border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Máximo</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold">S/.</span>
                                                    <input type="number" value={precioMax} min={0} placeholder="∞"
                                                        onChange={e => setPrecioMax(e.target.value)}
                                                        className="w-full border-2 border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[['', '100', 'Hasta S/.100'], ['100', '200', 'S/.100–200'], ['200', '400', 'S/.200–400'], ['400', '', 'S/.400+']].map(([min, max, label]) => (
                                                <button key={label}
                                                    onClick={() => { setPrecioMin(min); setPrecioMax(max) }}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                                        precioMin === min && precioMax === max
                                                            ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                                                            : 'border-gray-300 text-gray-600 hover:border-yellow-400 hover:bg-yellow-50'
                                                    }`}>
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </SidebarSection>
                            </div>
                        </div>
                    </aside>
                )}

                {/* ── CONTENIDO PRINCIPAL ──────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-5 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(v => !v)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                                    sidebarOpen ? 'bg-yellow-50 text-yellow-400 border-yellow-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}>
                                <SlidersHorizontal size={15} />
                                {sidebarOpen ? 'Ocultar' : 'Filtros'}
                                {nFiltros > 0 && <span className="bg-yellow-400 text-gray-900 text-xs px-1.5 py-0.5 rounded-full">{nFiltros}</span>}
                            </button>
                            <p className="text-sm text-gray-500">
                                {loading ? 'Buscando...' : (
                                    <><span className="font-bold text-gray-900">{alojamientos.length}</span> resultado{alojamientos.length !== 1 ? 's' : ''}</>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <ArrowUpDown size={14} className="text-yellow-500" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Orden actual</p>
                                    <p className="text-sm font-semibold text-gray-900">{ordenActual.label}</p>
                                </div>
                            </div>
                            <div className="hidden items-center gap-1.5 border-2 border-gray-300 rounded-xl px-3 py-2 bg-white">
                                <ArrowUpDown size={13} className="text-gray-500" />
                                <select value={orden} onChange={e => setOrden(e.target.value as Orden)}
                                    className="text-xs font-semibold text-gray-800 outline-none bg-transparent cursor-pointer">
                                    <option value="precio_asc">Precio: menor a mayor</option>
                                    <option value="precio_desc">Precio: mayor a menor</option>
                                    <option value="nombre">Nombre A–Z</option>
                                </select>
                            </div>
                            <div className="flex border-2 border-gray-300 rounded-xl overflow-hidden">
                                <button onClick={() => setVista('grid')}
                                    className={`p-2 transition-colors ${vista === 'grid' ? 'bg-yellow-400 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <Grid3X3 size={15} />
                                </button>
                                <button onClick={() => setVista('lista')}
                                    className={`p-2 transition-colors ${vista === 'lista' ? 'bg-yellow-400 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <List size={15} />
                                </button>
                            </div>
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-400 border border-yellow-200 rounded-full text-xs font-semibold">
            {label}
            <button onClick={onRemove} className="hover:text-yellow-400 transition-colors ml-0.5">
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
                <img src={imagen} alt={aloj.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                        <p className="text-lg font-bold text-yellow-400">S/. {aloj.precio_base.toLocaleString('es-PE')}</p>
                        <p className="text-xs text-gray-400">por noche</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users size={11} /> Hasta {aloj.capacidad_maxima}
                        </span>
                        <Link href={`/hoteles/${aloj.id}${linkParams}`}
                            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-400 text-gray-900 text-xs font-bold rounded-xl transition-colors">
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
                <img src={imagen} alt={aloj.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                            <p className="text-xl font-bold text-yellow-400">S/. {aloj.precio_base.toLocaleString('es-PE')}</p>
                            <p className="text-xs text-gray-400">por noche</p>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Users size={13} /> Hasta {aloj.capacidad_maxima} personas
                        </span>
                    </div>
                    <Link href={`/hoteles/${aloj.id}${linkParams}`}
                        className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-400 text-gray-900 text-sm font-bold rounded-xl transition-colors">
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
