'use client'

import { useState } from 'react'

export default function ContactoPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        alert('Gracias por contactarnos. Te responderemos pronto.')
        setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className="bg-white">
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
                    alt="Contacto"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        Contáctanos
                    </h1>
                    <p className="text-gray-300 tracking-widest uppercase text-sm">Estamos aquí para ayudarte</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                            Envíanos un mensaje
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre completo *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-red-600 transition-colors"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-red-600 transition-colors"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-red-600 transition-colors"
                                    placeholder="+51 999 999 999"
                                />
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-red-600 transition-colors"
                                >
                                    <option value="">Selecciona un asunto</option>
                                    <option value="reserva">Consulta de reserva</option>
                                    <option value="evento">Eventos y conferencias</option>
                                    <option value="servicio">Servicios del hotel</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mensaje *
                                </label>
                                <textarea
                                    name="mensaje"
                                    value={formData.mensaje}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-red-600 transition-colors resize-none"
                                    placeholder="Escribe tu mensaje aquí..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold uppercase tracking-wider transition-colors"
                            >
                                Enviar mensaje
                            </button>
                        </form>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                            Información de contacto
                        </h2>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                    📍
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Dirección</h3>
                                    <p className="text-gray-600">
                                        Av. Principal 123<br />
                                        Miraflores, Lima 15074<br />
                                        Perú
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                    📞
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Teléfono</h3>
                                    <p className="text-gray-600">
                                        +51 (01) 234-5678<br />
                                        +51 999 888 777
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                    ✉️
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                    <p className="text-gray-600">
                                        info@adventurhotels.com<br />
                                        reservas@adventurhotels.com
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                    🕐
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Horario</h3>
                                    <p className="text-gray-600">
                                        Recepción: 24/7<br />
                                        Atención telefónica: 24/7
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-6 rounded-sm">
                            <h3 className="font-semibold text-gray-900 mb-4">Síguenos en redes sociales</h3>
                            <div className="flex gap-3">
                                {[
                                    { name: 'Facebook', icon: 'f' },
                                    { name: 'Instagram', icon: 'ig' },
                                    { name: 'Twitter', icon: 't' },
                                    { name: 'LinkedIn', icon: 'in' },
                                ].map((social) => (
                                    <button
                                        key={social.name}
                                        className="w-10 h-10 bg-gray-900 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                                        title={social.name}
                                    >
                                        {social.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 h-64 bg-gray-200 rounded-sm overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.3076890834844!2d-77.03196668518445!3d-12.119294991441995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c81b0c3f3f3f%3A0x3f3f3f3f3f3f3f3f!2sMiraflores%2C%20Lima!5e0!3m2!1ses!2spe!4v1234567890123!5m2!1ses!2spe"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
