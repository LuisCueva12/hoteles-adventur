'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users, ChevronDown, Minus, Plus, X } from 'lucide-react'

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
  const noches = checkIn && checkOut
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

  const inputCls = 'w-full bg-transparent outline-none text-gray-900 text-sm font-semibold placeholder-gray-400'

  return (
    <div className="bg-white shadow-2xl border-t-4 border-yellow-400 -mt-8 relative z-20 max-w-5xl mx-auto rounded-b-2xl overflow-visible">
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        <div className="flex-1 px-5 py-4 flex items-center gap-3">
          <MapPin size={18} className="text-yellow-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Destino o nombre</p>
            <input
              type="text"
              value={destino}
              onChange={(event) => setDestino(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleBuscar()}
              placeholder="A donde vas?"
              className={inputCls}
            />
          </div>
          {destino && (
            <button onClick={() => setDestino('')} className="text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex-1 px-5 py-4 flex items-center gap-3">
          <Calendar size={18} className="text-yellow-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Check-in</p>
            {mounted ? (
              <input
                type="date"
                value={checkIn}
                min={minDate}
                onChange={(event) => {
                  setCheckIn(event.target.value)
                  if (checkOut && event.target.value >= checkOut) setCheckOut('')
                }}
                className={inputCls}
              />
            ) : (
              <p className="text-sm text-gray-400">Seleccionar fecha</p>
            )}
          </div>
        </div>

        <div className="flex-1 px-5 py-4 flex items-center gap-3">
          <Calendar size={18} className="text-yellow-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Check-out {noches > 0 && <span className="text-yellow-400 normal-case font-bold">· {noches}n</span>}
            </p>
            {mounted ? (
              <input
                type="date"
                value={checkOut}
                min={checkIn || minDate}
                onChange={(event) => setCheckOut(event.target.value)}
                className={inputCls}
              />
            ) : (
              <p className="text-sm text-gray-400">Seleccionar fecha</p>
            )}
          </div>
        </div>

        <div className="flex-1 px-5 py-4 flex items-center gap-3 relative" ref={huespedesRef}>
          <Users size={18} className="text-yellow-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Huespedes</p>
            <button
              type="button"
              onClick={() => setShowHuespedes((value) => !value)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-900"
            >
              {huespedes} {huespedes === 1 ? 'persona' : 'personas'}
              <ChevronDown size={13} className={`text-gray-400 transition-transform ml-1 ${showHuespedes ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {showHuespedes && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 z-50 mt-2 min-w-[200px]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Personas</p>
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setHuespedes((value) => Math.max(1, value - 1))}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 transition-all font-bold"
                >
                  <Minus size={14} />
                </button>
                <span className="text-2xl font-bold text-gray-900 w-8 text-center">{huespedes}</span>
                <button
                  type="button"
                  onClick={() => setHuespedes((value) => Math.min(20, value + 1))}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 transition-all font-bold"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Maximo 20 personas</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 flex items-center justify-center lg:py-0">
          <button
            onClick={handleBuscar}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm uppercase tracking-wider rounded-xl transition-all hover:shadow-lg whitespace-nowrap"
          >
            <Search size={16} />
            Buscar
          </button>
        </div>
      </div>

      {noches > 0 && (
        <div className="px-5 py-2 bg-yellow-50 border-t border-yellow-100 text-xs text-yellow-400 font-semibold flex items-center gap-2">
          <Calendar size={12} />
          {noches} noche{noches > 1 ? 's' : ''} · {huespedes} persona{huespedes > 1 ? 's' : ''}
          {destino && ` · "${destino}"`}
        </div>
      )}
    </div>
  )
}
