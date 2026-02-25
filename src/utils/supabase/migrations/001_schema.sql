CREATE TYPE rol_usuario AS ENUM ('turista','propietario','admin_adventur');
CREATE TYPE categoria_alojamiento AS ENUM ('Económico','Familiar','Parejas','Premium','Naturaleza');
CREATE TYPE tipo_alojamiento AS ENUM ('Cabaña','EcoLodge','Hotel','Hostal','Casa');
CREATE TYPE estado_reserva AS ENUM ('pendiente','confirmada','cancelada');
CREATE TYPE estado_pago AS ENUM ('pendiente','aprobado','rechazado');
CREATE TYPE metodo_pago AS ENUM ('yape','plin','tarjeta','transferencia','efectivo');

CREATE TABLE usuarios (
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

CREATE TABLE alojamientos (
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
  categoria categoria_alojamiento NOT NULL,
  tipo tipo_alojamiento NOT NULL,
  precio_base numeric NOT NULL CHECK (precio_base >= 0),
  capacidad_maxima integer NOT NULL CHECK (capacidad_maxima > 0),
  servicios_incluidos jsonb DEFAULT '[]',
  reglas_lugar jsonb DEFAULT '[]',
  activo boolean DEFAULT true,
  fecha_creacion timestamp DEFAULT now()
);

CREATE TABLE fotos_alojamiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alojamiento_id uuid REFERENCES alojamientos(id) ON DELETE CASCADE,
  url text NOT NULL,
  es_principal boolean DEFAULT false
);

CREATE TABLE disponibilidad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alojamiento_id uuid REFERENCES alojamientos(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  disponible boolean DEFAULT true,
  precio numeric CHECK (precio >= 0),
  UNIQUE (alojamiento_id, fecha)
);

CREATE TABLE reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  alojamiento_id uuid REFERENCES alojamientos(id) ON DELETE CASCADE,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  personas integer NOT NULL CHECK (personas > 0),
  total numeric NOT NULL CHECK (total >= 0),
  adelanto numeric NOT NULL CHECK (adelanto >= 0),
  codigo_reserva text UNIQUE NOT NULL,
  estado estado_reserva DEFAULT 'pendiente',
  fecha_creacion timestamp DEFAULT now(),
  CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id uuid REFERENCES reservas(id) ON DELETE CASCADE,
  monto numeric NOT NULL CHECK (monto > 0),
  metodo metodo_pago NOT NULL,
  estado estado_pago DEFAULT 'pendiente',
  transaccion_externa text,
  fecha_pago timestamp DEFAULT now()
);

CREATE TABLE opiniones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  alojamiento_id uuid REFERENCES alojamientos(id) ON DELETE CASCADE,
  reserva_id uuid UNIQUE REFERENCES reservas(id) ON DELETE CASCADE,
  calificacion integer CHECK (calificacion BETWEEN 1 AND 5),
  comentario text,
  fecha timestamp DEFAULT now()
);

CREATE INDEX idx_alojamientos_busqueda ON alojamientos (departamento, provincia, distrito, categoria, tipo);
CREATE INDEX idx_reservas_usuario ON reservas (usuario_id);
CREATE INDEX idx_reservas_alojamiento ON reservas (alojamiento_id);
CREATE INDEX idx_disponibilidad_fecha ON disponibilidad (fecha);
CREATE INDEX idx_pagos_reserva ON pagos (reserva_id);

CREATE OR REPLACE FUNCTION validar_disponibilidad()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reservas
    WHERE alojamiento_id = NEW.alojamiento_id
      AND estado = 'confirmada'
      AND (NEW.fecha_inicio < fecha_fin AND NEW.fecha_fin > fecha_inicio)
  ) THEN
    RAISE EXCEPTION 'Fechas no disponibles';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_disponibilidad
  BEFORE INSERT ON reservas
  FOR EACH ROW EXECUTE FUNCTION validar_disponibilidad();

CREATE OR REPLACE FUNCTION confirmar_reserva_por_pago()
RETURNS trigger AS $$
DECLARE adelanto_reserva numeric;
BEGIN
  IF NEW.estado = 'aprobado' THEN
    SELECT adelanto INTO adelanto_reserva FROM reservas WHERE id = NEW.reserva_id;
    IF NEW.monto >= adelanto_reserva THEN
      UPDATE reservas SET estado = 'confirmada' WHERE id = NEW.reserva_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_confirmar_reserva
  AFTER INSERT ON pagos
  FOR EACH ROW EXECUTE FUNCTION confirmar_reserva_por_pago();

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
