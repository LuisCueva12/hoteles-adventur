-- ==============================================================================
-- PROYECTO: PLATAFORMA WEB DE HOTELES (RUTEO A WHATSAPP)
-- MOTOR: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. TABLA: USUARIOS 
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    contrasena TEXT NOT NULL,
    telefono TEXT,
    rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA: HOTELES
CREATE TABLE public.hoteles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    direccion TEXT NOT NULL,
    telefono_whatsapp TEXT NOT NULL,
    imagenes_urls TEXT[] DEFAULT '{}',
    estrellas INTEGER DEFAULT 3,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: HABITACIONES
CREATE TABLE public.habitaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES public.hoteles(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    capacidad_personas INTEGER NOT NULL CHECK (capacidad_personas > 0),
    precio_noche DECIMAL(10, 2) NOT NULL CHECK (precio_noche > 0),
    imagenes_urls TEXT[] DEFAULT '{}',
    esta_disponible BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: SOLICITUDES DE RESERVAS (WHATSAPP LEADS)
CREATE TABLE public.reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    habitacion_id UUID NOT NULL REFERENCES public.habitaciones(id) ON DELETE RESTRICT,
    nombre_cliente TEXT NOT NULL,
    telefono_contacto TEXT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'contacto_whatsapp' CHECK (estado IN ('contacto_whatsapp', 'confirmada', 'cancelada')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT fechas_validas CHECK (fecha_ingreso < fecha_salida)
);

-- ==============================================================================
-- ÍNDICES 
-- ==============================================================================
CREATE INDEX idx_hoteles_ciudad ON public.hoteles(ciudad);
CREATE INDEX idx_habitaciones_hotel ON public.habitaciones(hotel_id);
CREATE INDEX idx_reservas_usuario ON public.reservas(usuario_id);
