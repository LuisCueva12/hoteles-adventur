CREATE TYPE rol_usuario AS ENUM ('turista','propietario','admin');
CREATE TYPE categoria_alojamiento AS ENUM ('Económico','Familiar','Parejas','Premium','Naturaleza');
CREATE TYPE tipo_alojamiento AS ENUM ('Cabaña','EcoLodge','Hotel','Hostal','Casa');
CREATE TYPE estado_reserva AS ENUM ('pendiente','confirmada','cancelada');
CREATE TYPE estado_pago AS ENUM ('pendiente','aprobado','rechazado');
CREATE TYPE metodo_pago AS ENUM ('yape','plin','tarjeta','transferencia','efectivo');

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE TABLE usuarios (
  id uuid NOT NULL,
  nombre text NOT NULL,
  apellido text NOT NULL,
  email text UNIQUE,
  telefono text,
  documento_identidad text,
  tipo_documento text DEFAULT 'DNI',
  pais text DEFAULT 'Perú',
  rol rol_usuario NOT NULL DEFAULT 'turista',
  verificado boolean DEFAULT false,
  foto_perfil text,
  updated_at timestamp without time zone DEFAULT now(),
  fecha_registro timestamp without time zone DEFAULT now(),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE alojamientos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  propietario_id uuid NOT NULL,
  nombre text NOT NULL,
  slug text UNIQUE,
  descripcion text,
  direccion text,
  departamento text,
  provincia text,
  distrito text,
  latitud numeric,
  longitud numeric,
  categoria categoria_alojamiento NOT NULL,
  tipo tipo_alojamiento NOT NULL,
  precio_base numeric NOT NULL CHECK (precio_base >= 0::numeric),
  capacidad_maxima integer NOT NULL CHECK (capacidad_maxima > 0),
  servicios_incluidos jsonb DEFAULT '[]'::jsonb,
  reglas_lugar jsonb DEFAULT '[]'::jsonb,
  activo boolean DEFAULT true,
  destacado boolean DEFAULT false,
  fecha_creacion timestamp without time zone DEFAULT now(),
  foto_principal text,
  calificacion_promedio numeric DEFAULT 0,
  total_resenas integer DEFAULT 0,
  CONSTRAINT alojamientos_pkey PRIMARY KEY (id),
  CONSTRAINT alojamientos_propietario_id_fkey FOREIGN KEY (propietario_id) REFERENCES public.usuarios(id)
);

CREATE TABLE disponibilidad (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alojamiento_id uuid,
  fecha date NOT NULL,
  disponible boolean DEFAULT true,
  precio numeric CHECK (precio >= 0::numeric),
  CONSTRAINT disponibilidad_pkey PRIMARY KEY (id),
  CONSTRAINT disponibilidad_alojamiento_id_fkey FOREIGN KEY (alojamiento_id) REFERENCES public.alojamientos(id)
);

CREATE TABLE fotos_alojamiento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alojamiento_id uuid,
  url text NOT NULL,
  es_principal boolean DEFAULT false,
  orden integer DEFAULT 0,
  album text,
  titulo text,
  CONSTRAINT fotos_alojamiento_pkey PRIMARY KEY (id),
  CONSTRAINT fotos_alojamiento_alojamiento_id_fkey FOREIGN KEY (alojamiento_id) REFERENCES public.alojamientos(id)
);

CREATE TABLE reservas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  alojamiento_id uuid,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  personas integer NOT NULL CHECK (personas > 0),
  total numeric NOT NULL CHECK (total >= 0::numeric),
  adelanto numeric NOT NULL CHECK (adelanto >= 0::numeric),
  codigo_reserva text NOT NULL UNIQUE,
  estado estado_reserva DEFAULT 'pendiente'::estado_reserva,
  notas text,
  fecha_creacion timestamp without time zone DEFAULT now(),
  CONSTRAINT reservas_pkey PRIMARY KEY (id),
  CONSTRAINT reservas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT reservas_alojamiento_id_fkey FOREIGN KEY (alojamiento_id) REFERENCES public.alojamientos(id)
);

CREATE TABLE pagos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reserva_id uuid,
  monto numeric NOT NULL CHECK (monto > 0::numeric),
  metodo metodo_pago NOT NULL,
  estado estado_pago DEFAULT 'pendiente'::estado_pago,
  transaccion_externa text,
  comprobante_url text,
  fecha_pago timestamp without time zone DEFAULT now(),
  CONSTRAINT pagos_pkey PRIMARY KEY (id),
  CONSTRAINT pagos_reserva_id_fkey FOREIGN KEY (reserva_id) REFERENCES public.reservas(id)
);

CREATE TABLE opiniones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  alojamiento_id uuid,
  reserva_id uuid UNIQUE,
  calificacion integer CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario text,
  fecha timestamp without time zone DEFAULT now(),
  CONSTRAINT opiniones_pkey PRIMARY KEY (id),
  CONSTRAINT opiniones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT opiniones_alojamiento_id_fkey FOREIGN KEY (alojamiento_id) REFERENCES public.alojamientos(id),
  CONSTRAINT opiniones_reserva_id_fkey FOREIGN KEY (reserva_id) REFERENCES public.reservas(id)
);

CREATE TABLE resenas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alojamiento_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  reserva_id uuid,
  calificacion integer NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  titulo character varying,
  comentario text NOT NULL,
  respuesta_admin text,
  fecha_respuesta timestamp with time zone,
  verificado boolean DEFAULT false,
  visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT resenas_pkey PRIMARY KEY (id),
  CONSTRAINT resenas_alojamiento_id_fkey FOREIGN KEY (alojamiento_id) REFERENCES public.alojamientos(id),
  CONSTRAINT resenas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id),
  CONSTRAINT resenas_reserva_id_fkey FOREIGN KEY (reserva_id) REFERENCES public.reservas(id)
);

CREATE TABLE notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['success'::character varying, 'warning'::character varying, 'info'::character varying, 'error'::character varying]::text[])),
  titulo character varying NOT NULL,
  mensaje text NOT NULL,
  leida boolean DEFAULT false,
  url character varying,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id)
);

CREATE TABLE configuracion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_hotel text NOT NULL DEFAULT 'Hotel Adventur'::text,
  slogan text DEFAULT ''::text,
  descripcion text DEFAULT ''::text,
  direccion text DEFAULT ''::text,
  ciudad text DEFAULT ''::text,
  pais text DEFAULT 'Perú'::text,
  telefono text DEFAULT ''::text,
  telefono_secundario text DEFAULT ''::text,
  email text DEFAULT ''::text,
  email_reservas text DEFAULT ''::text,
  sitio_web text DEFAULT ''::text,
  facebook text DEFAULT ''::text,
  instagram text DEFAULT ''::text,
  twitter text DEFAULT ''::text,
  politica_cancelacion text DEFAULT ''::text,
  politica_checkin text DEFAULT ''::text,
  hora_checkin text DEFAULT '14:00'::text,
  hora_checkout text DEFAULT '12:00'::text,
  moneda text DEFAULT 'PEN'::text,
  porcentaje_adelanto integer DEFAULT 30,
  ruc text DEFAULT ''::text,
  razon_social text DEFAULT ''::text,
  logo_url text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  whatsapp text DEFAULT ''::text,
  CONSTRAINT configuracion_pkey PRIMARY KEY (id)
);

CREATE TABLE comprobantes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['factura'::character varying, 'boleta'::character varying, 'nota_credito'::character varying, 'nota_debito'::character varying]::text[])),
  serie character varying NOT NULL,
  numero integer NOT NULL,
  reserva_id uuid,
  usuario_id uuid,
  cliente_tipo_documento character varying NOT NULL,
  cliente_numero_documento character varying NOT NULL,
  cliente_denominacion character varying NOT NULL,
  cliente_direccion text,
  cliente_email character varying,
  subtotal numeric NOT NULL,
  igv numeric NOT NULL,
  total numeric NOT NULL,
  aceptada_sunat boolean DEFAULT false,
  enlace_pdf text,
  enlace_xml text,
  enlace_cdr text,
  hash_cpe character varying,
  sunat_transaction_id character varying,
  sunat_description text,
  sunat_note text,
  sunat_responsecode character varying,
  documento_modificado_tipo character varying,
  documento_modificado_serie character varying,
  documento_modificado_numero integer,
  motivo_nota text,
  fecha_emision timestamp with time zone DEFAULT now(),
  fecha_creacion timestamp with time zone DEFAULT now(),
  anulado boolean DEFAULT false,
  fecha_anulacion timestamp with time zone,
  CONSTRAINT comprobantes_pkey PRIMARY KEY (id),
  CONSTRAINT comprobantes_reserva_id_fkey FOREIGN KEY (reserva_id) REFERENCES public.reservas(id),
  CONSTRAINT comprobantes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
