export type RolUsuario = 'turista' | 'propietario' | 'admin_adventur'
export type CategoriaAlojamiento = 'Económico' | 'Familiar' | 'Parejas' | 'Premium' | 'Naturaleza'
export type TipoAlojamiento = 'Cabaña' | 'EcoLodge' | 'Hotel' | 'Hostal' | 'Casa'
export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada'
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado'
export type MetodoPago = 'yape' | 'plin' | 'tarjeta' | 'transferencia' | 'efectivo'

export interface Usuario {
    id: string
    nombre: string
    apellido: string
    email: string | null
    telefono: string | null
    documento_identidad: string | null
    tipo_documento: string | null
    pais: string | null
    rol: RolUsuario
    verificado: boolean
    fecha_registro: string
}

export interface Alojamiento {
    id: string
    propietario_id: string
    nombre: string
    descripcion: string | null
    direccion: string | null
    departamento: string | null
    provincia: string | null
    distrito: string | null
    latitud: number | null
    longitud: number | null
    categoria: CategoriaAlojamiento
    tipo: TipoAlojamiento
    precio_base: number
    capacidad_maxima: number
    servicios_incluidos: string[]
    reglas_lugar: string[]
    activo: boolean
    fecha_creacion: string
}

export interface Reserva {
    id: string
    usuario_id: string
    alojamiento_id: string
    fecha_inicio: string
    fecha_fin: string
    personas: number
    total: number
    adelanto: number
    codigo_reserva: string
    estado: EstadoReserva
    fecha_creacion: string
}

export interface Pago {
    id: string
    reserva_id: string
    monto: number
    metodo: MetodoPago
    estado: EstadoPago
    transaccion_externa: string | null
    fecha_pago: string
}

export interface Opinion {
    id: string
    usuario_id: string
    alojamiento_id: string
    reserva_id: string
    calificacion: number
    comentario: string | null
    fecha: string
}
