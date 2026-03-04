-- ============================================
-- SCHEMA PRINCIPAL - VERSIÓN IDEMPOTENTE
-- Se puede ejecutar múltiples veces sin errores
-- ============================================

-- Crear ENUMs solo si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario') THEN
        CREATE TYPE rol_usuario AS ENUM ('turista','propietario','admin_adventur');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categoria_alojamiento') THEN
        CREATE TYPE categoria_alojamiento AS ENUM ('Económico','Familiar','Parejas','Premium','Naturaleza');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_alojamiento') THEN
        CREATE TYPE tipo_alojamiento AS ENUM ('Cabaña','EcoLodge','Hotel','Hostal','Casa');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_reserva') THEN
        CREATE TYPE estado_reserva AS ENUM ('pendiente','confirmada','cancelada');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_pago') THEN
        CREATE TYPE estado_pago AS ENUM ('pendiente','aprobado','rechazado');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metodo_pago') THEN
        CREATE TYPE metodo_pago AS ENUM ('yape','plin','tarjeta','transferencia','efectivo');
    END IF;
END $$;

-- Crear tablas solo si no existen
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  apellido text NOT NULL,
  email text UNIQUE,
  telefono text,
  documento_identidad text,
  tipo_documento text,
  pais text,
  rol rol_usuario NOT NULL DEFAULT 'turista',
  verificado boolean DEFAULT false,
  fecha_registro timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alojamientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propietario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  direccion text,
  departamento text,
  provincia text,
  distrito text,
  latitud numeric,
  longitud numeric,
  categoria categoria_alojamiento,
  tipo tipo_alojamiento,
  precio_base numeric NOT NULL,
  capacidad_maxima integer NOT NULL,
  servicios_incluidos text[],
  activo boolean DEFAULT true,
  fecha_creacion timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fotos_alojamiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alojamiento_id uuid NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
  url text NOT NULL,
  descripcion text,
  orden integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS disponibilidad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alojamiento_id uuid NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  disponible boolean DEFAULT true,
  precio_especial numeric
);

CREATE TABLE IF NOT EXISTS reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  alojamiento_id uuid NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  numero_personas integer NOT NULL,
  precio_total numeric NOT NULL,
  estado estado_reserva DEFAULT 'pendiente',
  fecha_reserva timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id uuid NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  monto numeric NOT NULL,
  metodo metodo_pago NOT NULL,
  estado estado_pago DEFAULT 'pendiente',
  fecha_pago timestamp DEFAULT now(),
  referencia_transaccion text
);

CREATE TABLE IF NOT EXISTS opiniones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  alojamiento_id uuid NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
  calificacion integer CHECK (calificacion BETWEEN 1 AND 5),
  comentario text,
  fecha_opinion timestamp DEFAULT now()
);

-- Crear función para confirmar reserva automáticamente
CREATE OR REPLACE FUNCTION confirmar_reserva_por_pago()
RETURNS trigger AS $$
BEGIN
  IF NEW.estado = 'aprobado' THEN
    UPDATE reservas SET estado = 'confirmada' WHERE id = NEW.reserva_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_confirmar_reserva'
    ) THEN
        CREATE TRIGGER trigger_confirmar_reserva
        AFTER INSERT OR UPDATE ON pagos
        FOR EACH ROW EXECUTE FUNCTION confirmar_reserva_por_pago();
    END IF;
END $$;

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, apellido)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    END IF;
END $$;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Schema creado/actualizado exitosamente';
END $$;
