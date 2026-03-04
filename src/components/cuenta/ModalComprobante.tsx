'use client'

import { useState } from 'react'
import { X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Swal from 'sweetalert2'

interface ModalComprobanteProps {
  isOpen: boolean
  onClose: () => void
  reserva: any
  onSuccess?: () => void
}

export default function ModalComprobante({ isOpen, onClose, reserva, onSuccess }: ModalComprobanteProps) {
  const [loading, setLoading] = useState(false)
  const [tipoComprobante, setTipoComprobante] = useState<'factura' | 'boleta'>('boleta')
  const [formData, setFormData] = useState({
    tipo_documento: '1', // 1: DNI, 6: RUC
    numero_documento: '',
    denominacion: '',
    direccion: '',
    email: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/nubefact/generar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipo_comprobante: tipoComprobante,
          reserva_id: reserva.id,
          cliente_tipo_documento: formData.tipo_documento,
          cliente_numero_documento: formData.numero_documento,
          cliente_denominacion: formData.denominacion,
          cliente_direccion: formData.direccion,
          cliente_email: formData.email
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error generando comprobante')
      }

      await Swal.fire({
        icon: 'success',
        title: '¡Comprobante Generado!',
        html: `
          <p class="mb-4">El ${tipoComprobante} ha sido generado exitosamente.</p>
          ${data.nubefact.enlace_del_pdf ? `
            <a href="${data.nubefact.enlace_del_pdf}" target="_blank" 
               class="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar PDF
            </a>
          ` : ''}
        `,
        confirmButtonColor: '#dc2626',
        timer: 5000
      })

      onSuccess?.()
      onClose()
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo generar el comprobante',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeInUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Generar Comprobante</h2>
                <p className="text-sm text-red-100">Factura o Boleta Electrónica</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información de la reserva */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">Información de la Reserva</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Código:</p>
                <p className="font-bold text-gray-900">{reserva.codigo_reserva}</p>
              </div>
              <div>
                <p className="text-gray-600">Total:</p>
                <p className="font-bold text-gray-900">S/. {reserva.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Tipo de comprobante */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Tipo de Comprobante
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoComprobante('boleta')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tipoComprobante === 'boleta'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <FileText className={`w-8 h-8 mx-auto mb-2 ${
                    tipoComprobante === 'boleta' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className="font-bold text-gray-900">Boleta</p>
                  <p className="text-xs text-gray-600">Para personas naturales</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoComprobante('factura')
                  setFormData({ ...formData, tipo_documento: '6' })
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tipoComprobante === 'factura'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <FileText className={`w-8 h-8 mx-auto mb-2 ${
                    tipoComprobante === 'factura' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className="font-bold text-gray-900">Factura</p>
                  <p className="text-xs text-gray-600">Para empresas</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tipo de documento */}
          {tipoComprobante === 'boleta' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tipo de Documento
              </label>
              <select
                value={formData.tipo_documento}
                onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all text-gray-900"
                required
              >
                <option value="1">DNI</option>
                <option value="6">RUC</option>
              </select>
            </div>
          )}

          {/* Número de documento */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {tipoComprobante === 'factura' ? 'RUC' : formData.tipo_documento === '6' ? 'RUC' : 'DNI'}
            </label>
            <input
              type="text"
              value={formData.numero_documento}
              onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
              placeholder={tipoComprobante === 'factura' ? '20123456789' : formData.tipo_documento === '6' ? '20123456789' : '12345678'}
              maxLength={tipoComprobante === 'factura' || formData.tipo_documento === '6' ? 11 : 8}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          {/* Razón social / Nombre */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {tipoComprobante === 'factura' ? 'Razón Social' : 'Nombre Completo'}
            </label>
            <input
              type="text"
              value={formData.denominacion}
              onChange={(e) => setFormData({ ...formData, denominacion: e.target.value })}
              placeholder={tipoComprobante === 'factura' ? 'EMPRESA SAC' : 'Juan Pérez García'}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Av. Principal 123, Lima"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email (opcional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-600 mt-1">
              El comprobante se enviará automáticamente a este correo
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generar {tipoComprobante === 'factura' ? 'Factura' : 'Boleta'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
