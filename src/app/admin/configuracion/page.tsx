'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Save, Loader2, Settings, Phone, Mail, MapPin, Globe, Instagram, Facebook, Twitter, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Swal from 'sweetalert2'

interface Configuracion {
    id?: string
    nombre_hotel: string
    slogan: string
    descripcion: string
    direccion: string
    ciudad: string
    pais: string
    telefono: string
    telefono_secundario: string
    email: string
    email_reservas: string
    sitio_web: string
    facebook: string
    instagram: string
    twitter: string
    politica_cancelacion: string
    politica_checkin: string
    hora_checkin: string
    hora_checkout: string
    moneda: string
    porcentaje_adelanto: number
    ruc: string
    razon_social: string
}

const defaultConfig: Configuracion = {
    nombre_hotel: '',
    slogan: '',
    descripcion: '',
    direccion: '',
    ciudad: '',
    pais: 'Perú',
    telefono: '',
    telefono_secundario: '',
    email: '',
    email_reservas: '',
    sitio_web: '',
    facebook: '',
    instagram: '',
    twitter: '',
    politica_cancelacion: '',
    politica_checkin: '',
    hora_checkin: '14:00',
    hora_checkout: '12:00',
    moneda: 'PEN',
    porcentaje_adelanto: 30,
    ruc: '',
    razon_social: '',
}

export default function ConfiguracionPage() {
    const [config, setConfig] = useState<Configuracion>(defaultConfig)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'general' | 'contacto' | 'redes' | 'politicas' | 'facturacion'>('general')
    const supabase = createClient()

    useEffect(() => {
        loadConfig()
    }, [])

    async function loadConfig() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('configuracion')
                .select('*')
                .limit(1)
                .maybeSingle()

            if (error && error.code !== 'PGRST116') {
                console.error('Error cargando configuración:', error)
            }
            if (data) {
                setConfig({ ...defaultConfig, ...data })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        try {
            setSaving(true)
            let error

            if (config.id) {
                const { error: updateError } = await supabase
                    .from('configuracion')
                    .update(config)
                    .eq('id', config.id)
                error = updateError
            } else {
                const { data, error: insertError } = await supabase
                    .from('configuracion')
                    .insert([config])
                    .select()
                    .single()
                error = insertError
                if (data) setConfig(data)
            }

            if (error) throw error

            await Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Configuración actualizada correctamente',
                confirmButtonColor: '#3B82F6',
                timer: 2000,
                showConfirmButton: false
            })
        } catch (error: any) {
            console.error('Error guardando:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.message?.includes('relation "configuracion" does not exist')
                    ? 'La tabla "configuracion" no existe en la base de datos. Créala primero.'
                    : 'No se pudo guardar la configuración',
                confirmButtonColor: '#3B82F6'
            })
        } finally {
            setSaving(false)
        }
    }

    const field = (key: keyof Configuracion, label: string, type = 'text', placeholder = '') => (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={config[key] as string}
                onChange={e => setConfig(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
        </div>
    )

    const textarea = (key: keyof Configuracion, label: string, placeholder = '', rows = 4) => (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <textarea
                value={config[key] as string}
                onChange={e => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
        </div>
    )

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'contacto', label: 'Contacto', icon: Phone },
        { id: 'redes', label: 'Redes Sociales', icon: Globe },
        { id: 'politicas', label: 'Políticas', icon: FileText },
        { id: 'facturacion', label: 'Facturación', icon: AlertCircle },
    ] as const

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Cargando configuración...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                    <p className="text-gray-600 mt-1">Administra los datos del hotel y preferencias del sistema</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                <div className="p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Información General del Hotel</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {field('nombre_hotel', 'Nombre del Hotel', 'text', 'Ej: Hotel Adventur')}
                                {field('slogan', 'Slogan', 'text', 'Ej: Tu hogar lejos de casa')}
                            </div>
                            {textarea('descripcion', 'Descripción', 'Descripción del hotel para el sitio web...', 3)}
                            <div className="grid md:grid-cols-2 gap-4">
                                {field('hora_checkin', 'Hora de Check-in', 'time')}
                                {field('hora_checkout', 'Hora de Check-out', 'time')}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Moneda</label>
                                    <select
                                        value={config.moneda}
                                        onChange={e => setConfig(prev => ({ ...prev, moneda: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="PEN">PEN - Sol Peruano</option>
                                        <option value="USD">USD - Dólar Americano</option>
                                        <option value="EUR">EUR - Euro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Porcentaje de Adelanto (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={config.porcentaje_adelanto}
                                        onChange={e => setConfig(prev => ({ ...prev, porcentaje_adelanto: Number(e.target.value) }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contacto' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Información de Contacto</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {field('telefono', 'Teléfono Principal', 'tel', '+51 999 999 999')}
                                {field('telefono_secundario', 'Teléfono Secundario', 'tel', '+51 999 999 999')}
                                {field('email', 'Email Principal', 'email', 'info@hotel.com')}
                                {field('email_reservas', 'Email de Reservas', 'email', 'reservas@hotel.com')}
                            </div>
                            {field('direccion', 'Dirección', 'text', 'Av. Principal 123')}
                            <div className="grid md:grid-cols-2 gap-4">
                                {field('ciudad', 'Ciudad', 'text', 'Lima')}
                                {field('pais', 'País', 'text', 'Perú')}
                            </div>
                            {field('sitio_web', 'Sitio Web', 'url', 'https://www.hotel.com')}
                        </div>
                    )}

                    {activeTab === 'redes' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Redes Sociales</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Facebook size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        {field('facebook', 'Facebook', 'url', 'https://facebook.com/tuhotel')}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Instagram size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        {field('instagram', 'Instagram', 'url', 'https://instagram.com/tuhotel')}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Twitter size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        {field('twitter', 'Twitter / X', 'url', 'https://twitter.com/tuhotel')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'politicas' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Políticas del Hotel</h2>
                            {textarea('politica_cancelacion', 'Política de Cancelación', 'Describe las condiciones de cancelación...', 5)}
                            {textarea('politica_checkin', 'Política de Check-in / Check-out', 'Describe las condiciones de check-in y check-out...', 5)}
                        </div>
                    )}

                    {activeTab === 'facturacion' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Datos de Facturación</h2>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                                <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-800">Estos datos se usan para generar comprobantes electrónicos (boletas/facturas) a través de Nubefact.</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {field('ruc', 'RUC', 'text', '20123456789')}
                                {field('razon_social', 'Razón Social', 'text', 'HOTEL ADVENTUR S.A.C.')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save button bottom */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>
        </div>
    )
}
