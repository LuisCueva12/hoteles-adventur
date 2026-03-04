'use client'

import { useState } from 'react'
import { Mail, Phone, MessageCircle, Send, CheckCircle, AlertCircle, User, MessageSquare, MapPin, Clock, Facebook, Instagram, Music } from 'lucide-react'

export default function ContactoPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        preferencia: 'email' // email, telefono, whatsapp
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (formData.nombre.trim().length < 3) {
            newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email inválido'
        }

        if (formData.telefono && formData.telefono.length < 9) {
            newErrors.telefono = 'Teléfono inválido'
        }

        if (!formData.asunto) {
            newErrors.asunto = 'Selecciona un asunto'
        }

        if (formData.mensaje.trim().length < 10) {
            newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        
        // Limpiar error del campo
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' })
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            // Aquí se conectaría con un servicio de email o guardar en BD
            console.log('Mensaje de contacto:', formData)
            
            // Simular envío
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            setMessage({
                type: 'success',
                text: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo en las próximas 24 horas.'
            })
            
            // Limpiar formulario
            setFormData({
                nombre: '',
                email: '',
                telefono: '',
                asunto: '',
                mensaje: '',
                preferencia: 'email'
            })
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente o contáctanos por WhatsApp.'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleWhatsAppContact = () => {
        const mensaje = `Hola, me gustaría obtener información sobre ${formData.asunto || 'sus servicios'}`
        const url = `https://wa.me/51976123456?text=${encodeURIComponent(mensaje)}`
        window.open(url, '_blank')
    }

    return (
        <div className="bg-white">
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
                    alt="Contacto"
                    className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
                
                {/* Partículas flotantes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${8 + Math.random() * 12}s`
                            }}
                        />
                    ))}
                </div>
                
                <div className="relative z-10 text-center text-white px-6 max-w-4xl">
                    <div className="mb-6 animate-fadeInDown">
                        <span className="inline-block px-4 py-1.5 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full text-red-400 text-xs font-semibold tracking-[0.3em] uppercase">
                            Estamos aquí para ti
                        </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp animation-delay-100 drop-shadow-2xl" style={{ fontFamily: 'Georgia, serif' }}>
                        <span className="text-red-500">Contáctanos</span>
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3 mb-6 animate-fadeInUp animation-delay-150">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-500" />
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-500" />
                    </div>
                    
                    <p className="text-xl text-gray-200 tracking-wide animate-fadeInUp animation-delay-200 max-w-2xl mx-auto">
                        Estamos disponibles 24/7 para responder todas tus consultas
                    </p>
                    
                    {/* Estadísticas rápidas */}
                    <div className="grid grid-cols-3 gap-6 mt-12 animate-fadeInUp animation-delay-300">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">24/7</div>
                            <div className="text-xs text-gray-300 uppercase tracking-wider">Atención</div>
                        </div>
                        <div className="text-center border-x border-white/20">
                            <div className="text-3xl font-bold text-white mb-1">&lt;1h</div>
                            <div className="text-xs text-gray-300 uppercase tracking-wider">Respuesta</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">100%</div>
                            <div className="text-xs text-gray-300 uppercase tracking-wider">Satisfacción</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid md:grid-cols-2 gap-16">
                    <div className="animate-fadeInLeft">
                        <div className="mb-8">
                            <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold tracking-[0.3em] uppercase rounded-full mb-4">
                                Formulario de contacto
                            </span>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                                Envíanos un <span className="text-red-600">mensaje</span>
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                            </p>
                        </div>

                        {/* Botón de WhatsApp destacado */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8 hover:shadow-2xl transition-all duration-300 hover:border-green-400 animate-fadeInUp relative overflow-hidden group">
                            {/* Efecto de brillo */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
                                        <MessageCircle className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">¿Necesitas ayuda inmediata?</h3>
                                        <p className="text-sm text-gray-600">Respuesta en menos de 5 minutos</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleWhatsAppContact}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    <span>Abrir WhatsApp</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nombre completo *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white placeholder:text-gray-500 ${
                                                errors.nombre 
                                                    ? 'border-red-500 focus:ring-red-200' 
                                                    : 'border-gray-300 focus:ring-red-200 focus:border-red-600'
                                            }`}
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                    {errors.nombre && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.nombre}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Teléfono
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white placeholder:text-gray-500 ${
                                                errors.telefono 
                                                    ? 'border-red-500 focus:ring-red-200' 
                                                    : 'border-gray-300 focus:ring-red-200 focus:border-red-600'
                                            }`}
                                            placeholder="+51 999 999 999"
                                        />
                                    </div>
                                    {errors.telefono && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.telefono}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white placeholder:text-gray-500 ${
                                            errors.email 
                                                ? 'border-red-500 focus:ring-red-200' 
                                                : 'border-gray-300 focus:ring-red-200 focus:border-red-600'
                                        }`}
                                        placeholder="tu@email.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Asunto *
                                </label>
                                <select
                                    name="asunto"
                                    value={formData.asunto}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${
                                        errors.asunto 
                                            ? 'border-red-500 focus:ring-red-200' 
                                            : 'border-gray-300 focus:ring-red-200 focus:border-red-600'
                                    }`}
                                >
                                    <option value="" className="text-gray-500">Selecciona un asunto</option>
                                    <option value="reserva">Consulta de reserva</option>
                                    <option value="cotizacion">Solicitar cotización</option>
                                    <option value="evento">Eventos y conferencias</option>
                                    <option value="servicio">Servicios del hotel</option>
                                    <option value="reclamo">Reclamo o sugerencia</option>
                                    <option value="otro">Otro</option>
                                </select>
                                {errors.asunto && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.asunto}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ¿Cómo prefieres que te contactemos? *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'email', label: 'Email', icon: Mail },
                                        { value: 'telefono', label: 'Teléfono', icon: Phone },
                                        { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }
                                    ].map((option) => {
                                        const Icon = option.icon
                                        return (
                                            <label
                                                key={option.value}
                                                className={`flex flex-col items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                    formData.preferencia === option.value
                                                        ? 'border-red-600 bg-red-50 text-red-600'
                                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="preferencia"
                                                    value={option.value}
                                                    checked={formData.preferencia === option.value}
                                                    onChange={handleChange}
                                                    className="sr-only"
                                                />
                                                <Icon className="w-5 h-5" />
                                                <span className="text-sm font-medium">{option.label}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mensaje *
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <textarea
                                        name="mensaje"
                                        value={formData.mensaje}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        maxLength={500}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none bg-white placeholder:text-gray-500 ${
                                            errors.mensaje 
                                                ? 'border-red-500 focus:ring-red-200' 
                                                : 'border-gray-300 focus:ring-red-200 focus:border-red-600'
                                        }`}
                                        placeholder="Escribe tu mensaje aquí..."
                                    />
                                </div>
                                {errors.mensaje && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.mensaje}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.mensaje.length} / 500 caracteres
                                </p>
                            </div>

                            {message.text && (
                                <div className={`p-4 rounded-lg border-2 ${
                                    message.type === 'success' 
                                        ? 'bg-green-50 text-green-800 border-green-200' 
                                        : 'bg-red-50 text-red-800 border-red-200'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        {message.type === 'success' ? (
                                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        )}
                                        <p className="text-sm">{message.text}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold uppercase tracking-wider transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 transform hover:-translate-y-1 disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Enviar mensaje</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                Al enviar este formulario, aceptas nuestra{' '}
                                <a href="/privacidad" className="text-red-600 hover:underline">
                                    Política de Privacidad
                                </a>
                            </p>
                        </form>
                    </div>

                    <div className="animate-fadeInRight">
                        <div className="mb-8">
                            <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold tracking-[0.3em] uppercase rounded-full mb-4">
                                Datos de contacto
                            </span>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                                Información de <span className="text-red-600">contacto</span>
                            </h2>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 animate-fadeInUp animation-delay-100 hover:border-red-600 hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Dirección</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Jr. Amalia Puga 635<br />
                                        Cajamarca, Perú<br />
                                        Código Postal: 06001
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 animate-fadeInUp animation-delay-200 hover:border-red-600 hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                                    <Phone className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Teléfono</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        +51 976 123 456<br />
                                        +51 976 654 321<br />
                                        WhatsApp: +51 976 123 456
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 animate-fadeInUp animation-delay-300 hover:border-red-600 hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        info@adventurhotels.com<br />
                                        reservas@adventurhotels.com<br />
                                        ventas@adventurhotels.com
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 animate-fadeInUp animation-delay-400 hover:border-red-600 hover:shadow-xl transition-all duration-300 group">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Horario de Atención</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Lunes a Viernes: 8:00 AM - 8:00 PM<br />
                                        Sábados: 9:00 AM - 6:00 PM<br />
                                        Domingos: 10:00 AM - 4:00 PM<br />
                                        <span className="font-semibold text-red-600">Recepción 24/7</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-gray-100 hover:border-red-600 transition-all duration-300 hover:shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Síguenos en redes sociales</h3>
                            <div className="flex gap-4 mb-6">
                                <a
                                    href="https://facebook.com/adventurhotels"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-lg"
                                    title="Facebook"
                                >
                                    <Facebook className="w-6 h-6" />
                                </a>
                                <a
                                    href="https://instagram.com/adventurhotels"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-14 h-14 bg-gradient-to-br from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-lg"
                                    title="Instagram"
                                >
                                    <Instagram className="w-6 h-6" />
                                </a>
                                <a
                                    href="https://tiktok.com/@adventurhotels"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-lg"
                                    title="TikTok"
                                >
                                    <Music className="w-6 h-6" />
                                </a>
                                <a
                                    href="https://wa.me/51976123456"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-lg"
                                    title="WhatsApp"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                </a>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Síguenos para ofertas exclusivas, promociones especiales y las últimas novedades de Adventur Hotels
                            </p>
                        </div>

                        <div className="mt-8 h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-100 hover:border-red-600 transition-all duration-300">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.7234567890123!2d-78.5167!3d-7.1611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMDknNDAuMCJTIDc4wrAzMScwMC4xIlc!5e0!3m2!1ses!2spe!4v1234567890123!5m2!1ses!2spe"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                title="Ubicación de Adventur Hotels en Cajamarca"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
