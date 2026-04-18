'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronDown, MapPin, Minus, Plus, Search, Users, X } from 'lucide-react'

export function BuscadorHoteles() {
  const router = useRouter()
  const [showHuespedes, setShowHuespedes] = useState(false)
  const [destino, setDestino] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [huespedes, setHuespedes] = useState(1)
  const huespedesRef = useRef<HTMLDivElement>(null)
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  const minDate = mounted ? new Date().toISOString().split('T')[0] : ''
  const noches =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0

  useEffect(() => {
    const fn = (event: MouseEvent) => {
      if (huespedesRef.current && !huespedesRef.current.contains(event.target as Node)) {
        setShowHuespedes(false)
      }
    }

    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleBuscar = () => {
    const params = new URLSearchParams()

    if (destino.trim()) params.set('q', destino.trim())
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (huespedes > 1) params.set('huespedes', String(huespedes))

    router.push(`/hoteles?${params.toString()}`)
  }

  const inputCls =
    'w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-500'
  const labelCls = 'mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-600'

  return (
    <div className="relative z-20 mx-auto -mt-8 max-w-5xl overflow-visible rounded-b-2xl border-t-4 border-yellow-400 bg-white shadow-2xl ring-1 ring-slate-200/70">
      <div className="flex divide-y divide-gray-200 lg:flex-row lg:divide-x lg:divide-y-0">
        <div className="flex flex-1 items-center gap-3 px-5 py-4">
          <MapPin size={18} className="shrink-0 text-yellow-600" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <label htmlFor="buscar-destino" className={labelCls}>
              Destino o nombre
            </label>
            <input
              id="buscar-destino"
              type="text"
              value={destino}
              onChange={(event) => setDestino(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleBuscar()}
              placeholder="A donde vas?"
              className={inputCls}
              aria-label="Destino o nombre del hotel"
            />
          </div>
          {destino ? (
            <button
              type="button"
              onClick={() => setDestino('')}
              className="flex min-h-[48px] min-w-[48px] items-center justify-center text-slate-400 hover:text-slate-700"
              aria-label="Limpiar destino"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 items-center gap-3 px-5 py-4">
          <Calendar size={18} className="shrink-0 text-yellow-600" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <label htmlFor="buscar-checkin" className={labelCls}>
              Check-in
            </label>
            {mounted ? (
              <input
                id="buscar-checkin"
                type="date"
                value={checkIn}
                min={minDate}
                onChange={(event) => {
                  setCheckIn(event.target.value)
                  if (checkOut && event.target.value >= checkOut) setCheckOut('')
                }}
                className={inputCls}
                aria-label="Fecha de check-in"
              />
            ) : (
              <p className="text-sm text-slate-500">Seleccionar fecha</p>
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center gap-3 px-5 py-4">
          <Calendar size={18} className="shrink-0 text-yellow-600" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <label htmlFor="buscar-checkout" className={labelCls}>
              Check-out {noches > 0 ? <span className="font-bold normal-case text-yellow-700">· {noches}n</span> : null}
            </label>
            {mounted ? (
              <input
                id="buscar-checkout"
                type="date"
                value={checkOut}
                min={checkIn || minDate}
                onChange={(event) => setCheckOut(event.target.value)}
                className={inputCls}
                aria-label="Fecha de check-out"
              />
            ) : (
              <p className="text-sm text-slate-500">Seleccionar fecha</p>
            )}
          </div>
        </div>

        <div ref={huespedesRef} className="relative flex flex-1 items-center gap-3 px-5 py-4">
          <Users size={18} className="shrink-0 text-yellow-600" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p id="huespedes-label" className={labelCls}>
              Huespedes
            </p>
            <button
              type="button"
              onClick={() => setShowHuespedes((value) => !value)}
              className="flex min-h-[48px] items-center gap-1 text-sm font-semibold text-slate-900"
              aria-haspopup="true"
              aria-expanded={showHuespedes}
              aria-labelledby="huespedes-label"
            >
              {huespedes} {huespedes === 1 ? 'persona' : 'personas'}
              <ChevronDown
                size={13}
                className={`ml-1 text-slate-500 transition-transform ${showHuespedes ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {showHuespedes ? (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 min-w-[200px] rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-600">Personas</p>
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setHuespedes((value) => Math.max(1, value - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 font-bold text-slate-700 transition-all hover:border-yellow-500 hover:text-yellow-700"
                  aria-label="Reducir huespedes"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-2xl font-bold text-gray-900">{huespedes}</span>
                <button
                  type="button"
                  onClick={() => setHuespedes((value) => Math.min(20, value + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 font-bold text-slate-700 transition-all hover:border-yellow-500 hover:text-yellow-700"
                  aria-label="Aumentar huespedes"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">Maximo 20 personas</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-center px-4 py-3 lg:py-0">
          <button
            type="button"
            onClick={handleBuscar}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-yellow-400 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-gray-900 transition-all hover:bg-yellow-500 hover:shadow-lg lg:w-auto"
            aria-label="Buscar hoteles"
          >
            <Search size={16} />
            Buscar
          </button>
        </div>
      </div>

      {noches > 0 ? (
        <div className="flex items-center gap-2 border-t border-yellow-100 bg-yellow-50 px-5 py-2 text-xs font-semibold text-amber-900">
          <Calendar size={12} />
          {noches} noche{noches > 1 ? 's' : ''} · {huespedes} persona{huespedes > 1 ? 's' : ''}
          {destino ? ` · "${destino}"` : null}
        </div>
      ) : null}
    </div>
  )
}
