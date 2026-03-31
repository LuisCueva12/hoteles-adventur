-- ============================================================
-- BASE DE DATOS COMPLETA - ADVENTUR v2.1
-- Ejecutar completo en Supabase SQL Editor
-- ============================================================

-- ============================================================
-- LIMPIEZA COMPLETA (CASCADE maneja dependencias)
-- ============================================================

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS validar_disponibilidad() CASCADE;
DROP FUNCTION IF EXISTS confirmar_reserva_por_pago() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_resenas_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS puede_dejar_resena(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS generar_slug(text) CASCADE;

DROP VIEW IF EXISTS public.estadisticas_resenas CASCADE;

DROP TABLE IF EXISTS comprobantes CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS resenas CASCADE;
DROP TABLE IF EXISTS opiniones CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS disponibilidad CASCADE;
DROP TABLE IF EXISTS fotos_alojamiento CASCADE;
DROP TABLE IF EXISTS alojamientos CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS rol_usuario CASCADE;
DROP TYPE IF EXISTS categoria_alojamiento CASCADE;
DROP TYPE IF EXISTS tipo_alojamiento CASCADE;
DROP TYPE IF EXISTS estado_reserva CASCADE;
DROP TYPE IF EXISTS estado_pago CASCADE;
DROP TYPE IF EXISTS metodo_pago CASCADE;


-- ============================================================
-- TIPOS ENUM
-- ============================================================

CREATE TYPE rol_usuario AS ENUM ('turista', 'propietario', 'admin_adventur');
CREATE TYPE categoria_alojamiento AS ENUM ('Económico', 'Familiar', 'Parejas', 'Premium', 'Naturaleza');
CREATE TYPE tipo_alojamiento AS ENUM ('Cabaña', 'EcoLodge', 'Hotel', 'Hostal', 'Casa');
CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'cancelada', 'completada');
CREATE TYPE estado_pago AS ENUM ('pendiente', 'aprobado', 'rechazado');
CREATE TYPE metodo_pago AS ENUM ('yape', 'plin', 'tarjeta', 'transferencia', 'efectivo');

-- ============================================================
-- TABLAS (en orden de dependencias)
-- ============================================================

CREATE TABLE usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  updated_at timestamp DEFAULT now(),
  fecha_registro timestamp DEFAULT now()
);

CREATE TABLE alojamientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propietario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
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
  precio_base numeric NOT NULL CHECK (precio_base >= 0),
  capacidad_maxima integer NOT NULL CHECK (capacidad_maxima > 0),
  servicios_incluidos jsonb DEFAULT '[]',
  reglas_lugar jsonb DEFAULT '[]',
  activo boolean DEFAULT true,
  destacado boolean DEFAULT false,
  fecha_creacion timestamp DEFAULT now()
);

CREATE TABLE fotos_alojamiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alojamiento_id uuid REFERENCES alojamientos(id) ON DELETE CASCADE,
  url text NOT NULL,
  es_principal boolean DEFAULT false,
  orden integer DEFAULT 0
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
  notas text,
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
  comprobante_url text,
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

CREATE TABLE comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('factura', 'boleta', 'nota_credito', 'nota_debito')),
  serie VARCHAR(10) NOT NULL,
  numero INTEGER NOT NULL,
  reserva_id UUID REFERENCES reservas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  cliente_tipo_documento VARCHAR(1) NOT NULL,
  cliente_numero_documento VARCHAR(20) NOT NULL,
  cliente_denominacion VARCHAR(255) NOT NULL,
  cliente_direccion TEXT,
  cliente_email VARCHAR(255),
  subtotal DECIMAL(10,2) NOT NULL,
  igv DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  aceptada_sunat BOOLEAN DEFAULT false,
  enlace_pdf TEXT,
  enlace_xml TEXT,
  enlace_cdr TEXT,
  hash_cpe VARCHAR(255),
  sunat_transaction_id VARCHAR(255),
  sunat_description TEXT,
  sunat_note TEXT,
  sunat_responsecode VARCHAR(10),
  documento_modificado_tipo VARCHAR(2),
  documento_modificado_serie VARCHAR(10),
  documento_modificado_numero INTEGER,
  motivo_nota TEXT,
  fecha_emision TIMESTAMPTZ DEFAULT NOW(),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  anulado BOOLEAN DEFAULT false,
  fecha_anulacion TIMESTAMPTZ,
  UNIQUE(tipo, serie, numero)
);

CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('success', 'warning', 'info', 'error')),
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  url VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- resenas va DESPUÉS de reservas (depende de ella)
CREATE TABLE resenas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alojamiento_id UUID NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reserva_id UUID REFERENCES reservas(id) ON DELETE SET NULL,
  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  titulo VARCHAR(200),
  comentario TEXT NOT NULL,
  respuesta_admin TEXT,
  fecha_respuesta TIMESTAMPTZ,
  verificado BOOLEAN DEFAULT FALSE,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, alojamiento_id, reserva_id)
);

CREATE TABLE configuracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_hotel TEXT NOT NULL DEFAULT 'Hotel Adventur',
  slogan TEXT DEFAULT '',
  descripcion TEXT DEFAULT '',
  direccion TEXT DEFAULT '',
  ciudad TEXT DEFAULT '',
  pais TEXT DEFAULT 'Perú',
  telefono TEXT DEFAULT '',
  telefono_secundario TEXT DEFAULT '',
  email TEXT DEFAULT '',
  email_reservas TEXT DEFAULT '',
  sitio_web TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  twitter TEXT DEFAULT '',
  politica_cancelacion TEXT DEFAULT '',
  politica_checkin TEXT DEFAULT '',
  hora_checkin TEXT DEFAULT '14:00',
  hora_checkout TEXT DEFAULT '12:00',
  moneda TEXT DEFAULT 'PEN',
  porcentaje_adelanto INTEGER DEFAULT 30,
  ruc TEXT DEFAULT '',
  razon_social TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_alojamientos_busqueda ON alojamientos (departamento, provincia, distrito, categoria, tipo);
CREATE INDEX idx_alojamientos_slug ON alojamientos (slug);
CREATE INDEX idx_alojamientos_activo ON alojamientos (activo);
CREATE INDEX idx_reservas_usuario ON reservas (usuario_id);
CREATE INDEX idx_reservas_alojamiento ON reservas (alojamiento_id);
CREATE INDEX idx_reservas_estado ON reservas (estado);
CREATE INDEX idx_disponibilidad_fecha ON disponibilidad (fecha);
CREATE INDEX idx_pagos_reserva ON pagos (reserva_id);
CREATE INDEX idx_comprobantes_reserva ON comprobantes(reserva_id);
CREATE INDEX idx_comprobantes_usuario ON comprobantes(usuario_id);
CREATE INDEX idx_comprobantes_tipo ON comprobantes(tipo);
CREATE INDEX idx_comprobantes_fecha ON comprobantes(fecha_emision);
CREATE INDEX idx_comprobantes_cliente ON comprobantes(cliente_numero_documento);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_created ON notificaciones(created_at DESC);
CREATE INDEX idx_resenas_alojamiento ON resenas(alojamiento_id);
CREATE INDEX idx_resenas_usuario ON resenas(usuario_id);
CREATE INDEX idx_resenas_visible ON resenas(visible);
CREATE INDEX idx_resenas_calificacion ON resenas(calificacion);

-- ============================================================
-- FUNCIONES (usando $$ como delimitador)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin_adventur'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION validar_disponibilidad()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reservas
    WHERE alojamiento_id = NEW.alojamiento_id
      AND estado IN ('confirmada', 'pendiente')
      AND (NEW.fecha_inicio < fecha_fin AND NEW.fecha_fin > fecha_inicio)
  ) THEN
    RAISE EXCEPTION 'Fechas no disponibles para este alojamiento';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION confirmar_reserva_por_pago()
RETURNS trigger AS $$
DECLARE
  adelanto_reserva numeric;
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

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, apellido, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    'turista'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_resenas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION puede_dejar_resena(p_usuario_id UUID, p_alojamiento_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.reservas
    WHERE usuario_id = p_usuario_id
      AND alojamiento_id = p_alojamiento_id
      AND estado IN ('confirmada', 'completada')
      AND fecha_fin < NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generar_slug(nombre text)
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        translate(nombre, 'áéíóúÁÉÍÓÚñÑüÜ', 'aeiouAEIOUnNuU'),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER trigger_validar_disponibilidad
  BEFORE INSERT ON reservas
  FOR EACH ROW EXECUTE FUNCTION validar_disponibilidad();

CREATE TRIGGER trigger_confirmar_reserva
  AFTER INSERT ON pagos
  FOR EACH ROW EXECUTE FUNCTION confirmar_reserva_por_pago();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_resenas_updated_at
  BEFORE UPDATE ON resenas
  FOR EACH ROW EXECUTE FUNCTION update_resenas_updated_at();

-- ============================================================
-- VISTA
-- ============================================================

CREATE OR REPLACE VIEW public.estadisticas_resenas AS
SELECT
  alojamiento_id,
  COUNT(*) AS total_resenas,
  AVG(calificacion)::NUMERIC(3,2) AS calificacion_promedio,
  COUNT(CASE WHEN calificacion = 5 THEN 1 END) AS cinco_estrellas,
  COUNT(CASE WHEN calificacion = 4 THEN 1 END) AS cuatro_estrellas,
  COUNT(CASE WHEN calificacion = 3 THEN 1 END) AS tres_estrellas,
  COUNT(CASE WHEN calificacion = 2 THEN 1 END) AS dos_estrellas,
  COUNT(CASE WHEN calificacion = 1 THEN 1 END) AS una_estrella
FROM public.resenas
WHERE visible = true
GROUP BY alojamiento_id;


-- ============================================================
-- RLS - ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alojamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_alojamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE opiniones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- USUARIOS
CREATE POLICY "usuarios_select_public_basic" ON usuarios FOR SELECT USING (true);
CREATE POLICY "usuarios_insert_own"          ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "usuarios_update_own"          ON usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "usuarios_admin_all"           ON usuarios FOR ALL    USING (public.is_admin());

-- ALOJAMIENTOS
CREATE POLICY "alojamientos_select_public"      ON alojamientos FOR SELECT USING (activo = true);
CREATE POLICY "alojamientos_insert_propietario" ON alojamientos FOR INSERT WITH CHECK (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_update_propietario" ON alojamientos FOR UPDATE USING (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_delete_propietario" ON alojamientos FOR DELETE USING (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_admin_all"          ON alojamientos FOR ALL    USING (public.is_admin());

-- FOTOS
CREATE POLICY "fotos_select_public"      ON fotos_alojamiento FOR SELECT USING (true);
CREATE POLICY "fotos_insert_propietario" ON fotos_alojamiento FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "fotos_update_propietario" ON fotos_alojamiento FOR UPDATE
  USING (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "fotos_delete_propietario" ON fotos_alojamiento FOR DELETE
  USING (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "fotos_admin_all"          ON fotos_alojamiento FOR ALL USING (public.is_admin());

-- DISPONIBILIDAD
CREATE POLICY "disponibilidad_select_public"       ON disponibilidad FOR SELECT USING (true);
CREATE POLICY "disponibilidad_manage_propietario"  ON disponibilidad FOR ALL
  USING (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "disponibilidad_admin_all"           ON disponibilidad FOR ALL USING (public.is_admin());

-- RESERVAS
CREATE POLICY "reservas_select_usuario" ON reservas FOR SELECT
  USING (auth.uid() = usuario_id OR
    EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "reservas_insert_usuario" ON reservas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "reservas_update_usuario" ON reservas FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "reservas_admin_all"      ON reservas FOR ALL    USING (public.is_admin());

-- PAGOS
CREATE POLICY "pagos_select_own" ON pagos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM reservas WHERE id = reserva_id AND (
      usuario_id = auth.uid() OR
      EXISTS (SELECT 1 FROM alojamientos WHERE id = reservas.alojamiento_id AND propietario_id = auth.uid())
    )
  ));
CREATE POLICY "pagos_insert_usuario" ON pagos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reservas WHERE id = reserva_id AND usuario_id = auth.uid()));
CREATE POLICY "pagos_admin_all" ON pagos FOR ALL USING (public.is_admin());

-- OPINIONES
CREATE POLICY "opiniones_select_public"  ON opiniones FOR SELECT USING (true);
CREATE POLICY "opiniones_insert_usuario" ON opiniones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "opiniones_update_usuario" ON opiniones FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "opiniones_admin_all"      ON opiniones FOR ALL    USING (public.is_admin());

-- NOTIFICACIONES
CREATE POLICY "notificaciones_select"    ON notificaciones FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "notificaciones_insert"    ON notificaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "notificaciones_update"    ON notificaciones FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "notificaciones_delete"    ON notificaciones FOR DELETE USING (auth.uid() = usuario_id);
CREATE POLICY "notificaciones_admin_all" ON notificaciones FOR ALL    USING (public.is_admin());

-- RESEÑAS
CREATE POLICY "resenas_select_public"  ON resenas FOR SELECT USING (visible = true);
CREATE POLICY "resenas_insert_usuario" ON resenas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "resenas_update_usuario" ON resenas FOR UPDATE
  USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "resenas_delete_usuario" ON resenas FOR DELETE USING (auth.uid() = usuario_id);
CREATE POLICY "resenas_admin_all"      ON resenas FOR ALL    USING (public.is_admin());

-- COMPROBANTES
CREATE POLICY "comprobantes_select_usuario" ON comprobantes FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "comprobantes_insert_sistema" ON comprobantes FOR INSERT
  WITH CHECK (auth.uid() = usuario_id OR public.is_admin());
CREATE POLICY "comprobantes_admin_all"      ON comprobantes FOR ALL USING (public.is_admin());

-- CONFIGURACIÓN
CREATE POLICY "configuracion_select_public" ON configuracion FOR SELECT USING (true);
CREATE POLICY "configuracion_admin_all"     ON configuracion FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ============================================================
-- STORAGE BUCKETS Y POLÍTICAS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('public',         'public',         true)  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true)  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('comprobantes',   'comprobantes',   false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access"                                    ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload"                   ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files"                       ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files"                       ON storage.objects;
DROP POLICY IF EXISTS "Las fotos de perfil son públicas"                 ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden subir su propia foto de perfil"    ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propia foto de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar su propia foto de perfil"  ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden gestionar todas las fotos"      ON storage.objects;
DROP POLICY IF EXISTS "Comprobantes solo propietario"                    ON storage.objects;

CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'public');

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Las fotos de perfil son públicas"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Los usuarios pueden subir su propia foto de perfil"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Los usuarios pueden actualizar su propia foto de perfil"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Los usuarios pueden eliminar su propia foto de perfil"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Los admins pueden gestionar todas las fotos"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin_adventur')
  );

CREATE POLICY "Comprobantes solo propietario"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'comprobantes' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin_adventur')
    )
  );


-- ============================================================
-- CONFIGURACIÓN INICIAL DEL HOTEL
-- ============================================================

ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;

INSERT INTO configuracion (
  nombre_hotel, slogan, descripcion, direccion, ciudad, pais,
  telefono, telefono_secundario, email, email_reservas, sitio_web,
  facebook, instagram, twitter,
  politica_cancelacion, politica_checkin,
  hora_checkin, hora_checkout, moneda, porcentaje_adelanto,
  ruc, razon_social
)
SELECT
  'Hotel Adventur',
  'Tu hogar lejos de casa',
  'Somos una plataforma de alojamientos turísticos en el Perú, conectando viajeros con los mejores destinos naturales, culturales y de aventura.',
  'Av. El Sol 123, Centro Histórico',
  'Cajamarca', 'Perú',
  '+51 76 123456', '+51 987 654 321',
  'info@hoteladventur.com', 'reservas@hoteladventur.com',
  'https://www.hoteladventur.com',
  'https://facebook.com/hoteladventur',
  'https://instagram.com/hoteladventur',
  'https://twitter.com/hoteladventur',
  'Cancelación gratuita hasta 48 horas antes del check-in. Cancelaciones tardías tienen cargo del 30% del total.',
  'Check-in a partir de las 14:00. Se requiere presentar documento de identidad válido.',
  '14:00', '12:00', 'PEN', 30,
  '20123456789', 'ADVENTUR PERU S.A.C.'
WHERE NOT EXISTS (SELECT 1 FROM configuracion);

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DATOS DE EJEMPLO
-- Nota: Los alojamientos se insertan con propietario_id dinámico.
-- Requiere al menos un usuario en la tabla usuarios.
-- Si no hay usuarios aún, ejecuta primero el seed de usuarios.
-- ============================================================

DO $$
DECLARE
  pid uuid;
  a1 uuid; a2 uuid; a3 uuid; a4 uuid; a5 uuid;
  a6 uuid; a7 uuid; a8 uuid; a9 uuid; a10 uuid;
  r1 uuid; r2 uuid; r3 uuid; r4 uuid; r5 uuid;
BEGIN

  -- Buscar admin o propietario existente
  SELECT id INTO pid FROM usuarios
  WHERE rol IN ('admin_adventur', 'propietario')
  ORDER BY fecha_registro ASC LIMIT 1;

  IF pid IS NULL THEN
    RAISE NOTICE 'No hay usuarios aún. Los alojamientos de ejemplo no se insertarán. Regístra un usuario primero y vuelve a ejecutar el bloque DO.';
    RETURN;
  END IF;

  -- ── ALOJAMIENTOS ──────────────────────────────────────────

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'Cabaña El Bosque Encantado', 'cabana-el-bosque-encantado',
    'Hermosa cabaña rodeada de naturaleza con vista al río. Chimenea, cocina equipada y terraza privada con hamacas.',
    'Km 12 Carretera a Oxapampa', 'Pasco', 'Oxapampa', 'Oxapampa', -10.5833, -75.3833,
    'Naturaleza', 'Cabaña', 180.00, 6,
    '["WiFi","Cocina equipada","Chimenea","Estacionamiento","Agua caliente","Parrilla","Hamacas"]',
    '["No fumar dentro","No mascotas","Silencio después de las 10pm"]', true, true)
  RETURNING id INTO a1;

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'EcoLodge Amazonas Verde', 'ecolodge-amazonas-verde',
    'Lodge ecológico en plena selva amazónica. Tours guiados, kayak y avistamiento de aves incluidos.',
    'Comunidad Nativa Yanesha, Sector 3', 'Loreto', 'Maynas', 'Iquitos', -3.7437, -73.2516,
    'Naturaleza', 'EcoLodge', 250.00, 4,
    '["Desayuno incluido","Tours guiados","Kayak","Observación de aves","Mosquiteros","Guía local"]',
    '["Respeto a la naturaleza","No plásticos de un solo uso","Check-in 14:00"]', true, true)
  RETURNING id INTO a2;

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'Hotel Boutique Cusco Imperial', 'hotel-boutique-cusco-imperial',
    'Hotel boutique en el corazón del Cusco histórico, a 2 cuadras de la Plaza de Armas.',
    'Calle Hatunrumiyoc 342', 'Cusco', 'Cusco', 'Cusco', -13.5170, -71.9785,
    'Premium', 'Hotel', 320.00, 2,
    '["WiFi","Desayuno buffet","Calefacción","TV cable","Caja fuerte","Room service","Bar"]',
    '["No fumar","Check-out 12:00","Depósito de seguridad requerido"]', true, true)
  RETURNING id INTO a3;

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'Casa Familiar Playa Máncora', 'casa-familiar-playa-mancora',
    'Amplia casa frente al mar en Máncora. Piscina privada, acceso directo a la playa y BBQ.',
    'Av. Piura 890, frente al mar', 'Piura', 'Talara', 'Máncora', -4.1036, -81.0453,
    'Familiar', 'Casa', 420.00, 10,
    '["WiFi","Piscina privada","Acceso playa","Cocina equipada","BBQ","Estacionamiento","Aire acondicionado"]',
    '["No fiestas","Máximo 10 personas","No mascotas","Depósito requerido"]', true, false)
  RETURNING id INTO a4;

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'Hostal Romántico Arequipa', 'hostal-romantico-arequipa',
    'Hostal en sillar blanco con jacuzzi privado y vista al volcán Misti. Vino de bienvenida incluido.',
    'Calle Santa Catalina 215', 'Arequipa', 'Arequipa', 'Arequipa', -16.3989, -71.5369,
    'Parejas', 'Hostal', 140.00, 2,
    '["WiFi","Desayuno","Terraza con vista al Misti","Jacuzzi privado","Vino de bienvenida"]',
    '["Solo parejas","No menores de edad","Check-in 15:00"]', true, false)
  RETURNING id INTO a5;

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'Cabaña Económica Valle Sagrado', 'cabana-economica-valle-sagrado',
    'Cabaña sencilla en el Valle Sagrado de los Incas, cerca a Pisac. Punto de partida para Machu Picchu.',
    'Comunidad de Pisac, Sector Alto', 'Cusco', 'Calca', 'Pisac', -13.4167, -71.8500,
    'Económico', 'Cabaña', 75.00, 3,
    '["WiFi básico","Cocina compartida","Jardín","Vista a montañas","Estacionamiento"]',
    '["Respeto al entorno","No ruidos fuertes","Basura clasificada"]', true, false)
  RETURNING id INTO a6;

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'Lodge Colca Canyon View', 'lodge-colca-canyon-view',
    'Lodge con vista directa al Cañón del Colca. Observa el vuelo del cóndor desde tu terraza. Aguas termales incluidas.',
    'Sector Yanque, Cañón del Colca', 'Arequipa', 'Caylloma', 'Yanque', -15.6667, -71.7167,
    'Premium', 'EcoLodge', 380.00, 4,
    '["Desayuno y cena","Tour al cañón","Aguas termales","WiFi","Calefacción","Guía especializado"]',
    '["No fumar","Respeto al ecosistema","Check-in 14:00"]', true, true)
  RETURNING id INTO a7;

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'Hostal Miraflores Surf', 'hostal-miraflores-surf',
    'Hostal moderno en Miraflores, Lima. A 5 minutos de la Costa Verde y los mejores restaurantes.',
    'Av. Larco 456, Miraflores', 'Lima', 'Lima', 'Miraflores', -12.1219, -77.0282,
    'Económico', 'Hostal', 95.00, 2,
    '["WiFi alta velocidad","Desayuno","Cocina compartida","Terraza","Bicicletas","Tours city"]',
    '["Check-in 14:00","Check-out 12:00","No fumar","Silencio 11pm"]', true, false)
  RETURNING id INTO a8;

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'Casa Colonial Trujillo', 'casa-colonial-trujillo',
    'Casa colonial restaurada en el centro histórico de Trujillo. A pasos de Chan Chan.',
    'Jr. Independencia 789', 'La Libertad', 'Trujillo', 'Trujillo', -8.1116, -79.0288,
    'Familiar', 'Casa', 200.00, 8,
    '["WiFi","Cocina equipada","Patio colonial","Estacionamiento","TV","Tours Chan Chan"]',
    '["No fiestas","Máximo 8 personas","Check-in 15:00"]', true, false)
  RETURNING id INTO a9;

  INSERT INTO alojamientos (propietario_id, nombre, slug, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo, destacado)
  VALUES (pid, 'Cabaña Lago Titicaca', 'cabana-lago-titicaca',
    'Cabaña flotante en el Lago Titicaca. Convive con familias aymaras, aprende a tejer y navega en totora.',
    'Isla Uros, Lago Titicaca', 'Puno', 'Puno', 'Puno', -15.8422, -70.0199,
    'Naturaleza', 'Cabaña', 160.00, 4,
    '["Desayuno típico","Paseo en barca de totora","Taller de tejido","Guía aymara","Cena tradicional"]',
    '["Respeto a la cultura local","No alcohol","Check-in con luz del día"]', true, true)
  RETURNING id INTO a10;

  -- ── FOTOS ─────────────────────────────────────────────────

  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal, orden) VALUES
    (a1, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80', true,  1),
    (a1, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', false, 2),
    (a1, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80', false, 3),
    (a2, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', true,  1),
    (a2, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', false, 2),
    (a2, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80', false, 3),
    (a3, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', true,  1),
    (a3, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80', false, 2),
    (a3, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80', false, 3),
    (a4, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', true,  1),
    (a4, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', false, 2),
    (a4, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', false, 3),
    (a5, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80', true,  1),
    (a5, 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80', false, 2),
    (a6, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', true,  1),
    (a6, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80', false, 2),
    (a7, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80', true,  1),
    (a7, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', false, 2),
    (a7, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80', false, 3),
    (a8, 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200&q=80', true,  1),
    (a8, 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1200&q=80', false, 2),
    (a9, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80', true,  1),
    (a9, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80', false, 2),
    (a10,'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=1200&q=80', true,  1),
    (a10,'https://images.unsplash.com/photo-1540541338537-1220059af4dc?w=1200&q=80', false, 2);

  -- ── DISPONIBILIDAD (próximos 90 días) ─────────────────────

  INSERT INTO disponibilidad (alojamiento_id, fecha, disponible, precio)
  SELECT a.id, CURRENT_DATE + s.i, true, a.precio_base
  FROM alojamientos a
  CROSS JOIN generate_series(0, 90) AS s(i)
  ON CONFLICT (alojamiento_id, fecha) DO NOTHING;

  -- ── RESERVAS DE EJEMPLO ───────────────────────────────────

  INSERT INTO reservas (id, usuario_id, alojamiento_id, fecha_inicio, fecha_fin, personas, total, adelanto, codigo_reserva, estado, notas)
  VALUES
    (gen_random_uuid(), pid, a1, CURRENT_DATE - 30, CURRENT_DATE - 27, 4, 540.00,  162.00, 'ADV-2026-001', 'completada', 'Llegada tarde, avisar'),
    (gen_random_uuid(), pid, a2, CURRENT_DATE - 20, CURRENT_DATE - 17, 2, 750.00,  225.00, 'ADV-2026-002', 'completada', NULL),
    (gen_random_uuid(), pid, a3, CURRENT_DATE - 10, CURRENT_DATE - 8,  2, 640.00,  192.00, 'ADV-2026-003', 'confirmada', 'Habitación con vista'),
    (gen_random_uuid(), pid, a4, CURRENT_DATE + 5,  CURRENT_DATE + 10, 6, 2100.00, 630.00, 'ADV-2026-004', 'confirmada', NULL),
    (gen_random_uuid(), pid, a5, CURRENT_DATE + 15, CURRENT_DATE + 17, 2, 280.00,  84.00,  'ADV-2026-005', 'pendiente',  'Aniversario')
  RETURNING id INTO r1;

  -- Guardar IDs de reservas para pagos y reseñas
  SELECT id INTO r1 FROM reservas WHERE codigo_reserva = 'ADV-2026-001';
  SELECT id INTO r2 FROM reservas WHERE codigo_reserva = 'ADV-2026-002';
  SELECT id INTO r3 FROM reservas WHERE codigo_reserva = 'ADV-2026-003';
  SELECT id INTO r4 FROM reservas WHERE codigo_reserva = 'ADV-2026-004';
  SELECT id INTO r5 FROM reservas WHERE codigo_reserva = 'ADV-2026-005';

  -- ── PAGOS ─────────────────────────────────────────────────

  INSERT INTO pagos (reserva_id, monto, metodo, estado, transaccion_externa) VALUES
    (r1, 162.00, 'yape',          'aprobado',  'YAP-20260301-001'),
    (r1, 378.00, 'transferencia', 'aprobado',  'TRF-20260304-001'),
    (r2, 225.00, 'plin',          'aprobado',  'PLN-20260311-001'),
    (r2, 525.00, 'tarjeta',       'aprobado',  'TAR-20260314-001'),
    (r3, 192.00, 'yape',          'aprobado',  'YAP-20260321-001'),
    (r4, 630.00, 'transferencia', 'aprobado',  'TRF-20260405-001'),
    (r5, 84.00,  'yape',          'pendiente', NULL);

  -- ── RESEÑAS ───────────────────────────────────────────────

  INSERT INTO resenas (alojamiento_id, usuario_id, reserva_id, calificacion, titulo, comentario, verificado, visible) VALUES
    (a1, pid, r1, 5, 'Experiencia increíble',
     'La cabaña superó todas nuestras expectativas. El entorno natural es espectacular y las instalaciones están en perfecto estado. Definitivamente volveremos.',
     true, true),
    (a2, pid, r2, 4, 'Muy buena experiencia en la selva',
     'El lodge es hermoso y los tours guiados son excelentes. El único detalle es que el WiFi es muy lento, pero entendemos que estamos en la selva.',
     true, true),
    (a3, pid, r3, 5, 'El mejor hotel en Cusco',
     'Ubicación perfecta, desayuno delicioso y el personal es muy atento. La habitación con vista al Qorikancha es simplemente mágica.',
     true, true);

  -- ── OPINIONES ─────────────────────────────────────────────

  INSERT INTO opiniones (usuario_id, alojamiento_id, reserva_id, calificacion, comentario) VALUES
    (pid, a1, r1, 5, 'Lugar mágico, totalmente recomendado para desconectarse.'),
    (pid, a2, r2, 4, 'Experiencia única en la Amazonía. Los guías son excelentes.'),
    (pid, a3, r3, 5, 'Hotel de lujo a precio justo. Volveré sin duda.');

  -- ── NOTIFICACIONES DE EJEMPLO ─────────────────────────────

  INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, leida, url) VALUES
    (pid, 'success', 'Reserva confirmada', 'Tu reserva ADV-2026-003 ha sido confirmada exitosamente.', false, '/reservas'),
    (pid, 'info',    'Nuevo mensaje',      'Tienes un nuevo mensaje del propietario de Cabaña El Bosque Encantado.', false, '/mensajes'),
    (pid, 'warning', 'Check-in mañana',    'Recuerda que tu check-in en Casa Familiar Playa Máncora es mañana a las 15:00.', false, '/reservas'),
    (pid, 'success', 'Pago recibido',      'Hemos recibido tu pago de S/ 630.00 para la reserva ADV-2026-004.', true, '/pagos');

  -- ── COMPROBANTES DE EJEMPLO ───────────────────────────────

  INSERT INTO comprobantes (tipo, serie, numero, reserva_id, usuario_id, cliente_tipo_documento, cliente_numero_documento, cliente_denominacion, cliente_email, subtotal, igv, total, aceptada_sunat, fecha_emision) VALUES
    ('boleta', 'B001', 1, r1, pid, '1', '12345678', 'Carlos Mendoza García', 'carlos@email.com', 457.63, 82.37, 540.00, true, NOW() - INTERVAL '30 days'),
    ('boleta', 'B001', 2, r2, pid, '1', '12345678', 'Carlos Mendoza García', 'carlos@email.com', 635.59, 114.41, 750.00, true, NOW() - INTERVAL '20 days'),
    ('factura','F001', 1, r3, pid, '6', '20123456789', 'EMPRESA TURISMO SAC', 'contabilidad@empresa.com', 542.37, 97.63, 640.00, true, NOW() - INTERVAL '10 days');

  RAISE NOTICE 'Datos de ejemplo insertados correctamente. Propietario: %', pid;

END $$;

