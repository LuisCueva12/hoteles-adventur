-- ============================================================
-- BASE DE DATOS COMPLETA - ADVENTUR
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Limpiar todo lo existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS validar_disponibilidad() CASCADE;
DROP FUNCTION IF EXISTS confirmar_reserva_por_pago() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP VIEW IF EXISTS public.estadisticas_resenas CASCADE;
DROP FUNCTION IF EXISTS update_resenas_updated_at() CASCADE;
DROP FUNCTION IF EXISTS puede_dejar_resena(UUID, UUID) CASCADE;

DROP TABLE IF EXISTS comprobantes CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS resenas CASCADE;
DROP TABLE IF EXISTS opiniones CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS disponibilidad CASCADE;
DROP TABLE IF EXISTS fotos_alojamiento CASCADE;
DROP TABLE IF EXISTS alojamientos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS rol_usuario CASCADE;
DROP TYPE IF EXISTS categoria_alojamiento CASCADE;
DROP TYPE IF EXISTS tipo_alojamiento CASCADE;
DROP TYPE IF EXISTS estado_reserva CASCADE;
DROP TYPE IF EXISTS estado_pago CASCADE;
DROP TYPE IF EXISTS metodo_pago CASCADE;

-- ============================================================
-- TIPOS
-- ============================================================

CREATE TYPE rol_usuario AS ENUM ('turista','propietario','admin_adventur');
CREATE TYPE categoria_alojamiento AS ENUM ('Económico','Familiar','Parejas','Premium','Naturaleza');
CREATE TYPE tipo_alojamiento AS ENUM ('Cabaña','EcoLodge','Hotel','Hostal','Casa');
CREATE TYPE estado_reserva AS ENUM ('pendiente','confirmada','cancelada');
CREATE TYPE estado_pago AS ENUM ('pendiente','aprobado','rechazado');
CREATE TYPE metodo_pago AS ENUM ('yape','plin','tarjeta','transferencia','efectivo');

-- ============================================================
-- TABLAS
-- ============================================================

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
  foto_perfil text,
  updated_at timestamp DEFAULT now(),
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

CREATE TABLE comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('factura','boleta','nota_credito','nota_debito')),
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
  fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  anulado BOOLEAN DEFAULT false,
  fecha_anulacion TIMESTAMP WITH TIME ZONE,
  UNIQUE(tipo, serie, numero)
);

CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('success','warning','info','error')),
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  url VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE resenas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alojamiento_id UUID NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reserva_id UUID REFERENCES reservas(id) ON DELETE SET NULL,
  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  titulo VARCHAR(200),
  comentario TEXT NOT NULL,
  respuesta_admin TEXT,
  fecha_respuesta TIMESTAMP WITH TIME ZONE,
  verificado BOOLEAN DEFAULT FALSE,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, alojamiento_id, reserva_id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_alojamientos_busqueda ON alojamientos (departamento, provincia, distrito, categoria, tipo);
CREATE INDEX idx_reservas_usuario ON reservas (usuario_id);
CREATE INDEX idx_reservas_alojamiento ON reservas (alojamiento_id);
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
-- FUNCIONES Y TRIGGERS
-- ============================================================

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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_resenas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resenas_updated_at
  BEFORE UPDATE ON resenas
  FOR EACH ROW EXECUTE FUNCTION update_resenas_updated_at();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin_adventur'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE VIEW public.estadisticas_resenas AS
SELECT
  alojamiento_id,
  COUNT(*) as total_resenas,
  AVG(calificacion)::NUMERIC(3,2) as calificacion_promedio,
  COUNT(CASE WHEN calificacion = 5 THEN 1 END) as cinco_estrellas,
  COUNT(CASE WHEN calificacion = 4 THEN 1 END) as cuatro_estrellas,
  COUNT(CASE WHEN calificacion = 3 THEN 1 END) as tres_estrellas,
  COUNT(CASE WHEN calificacion = 2 THEN 1 END) as dos_estrellas,
  COUNT(CASE WHEN calificacion = 1 THEN 1 END) as una_estrella
FROM public.resenas
WHERE visible = true
GROUP BY alojamiento_id;

CREATE OR REPLACE FUNCTION puede_dejar_resena(p_usuario_id UUID, p_alojamiento_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.reservas
    WHERE usuario_id = p_usuario_id
      AND alojamiento_id = p_alojamiento_id
      AND estado = 'confirmada'
      AND fecha_fin < NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS POLICIES
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

CREATE POLICY "usuarios_select_own" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "usuarios_insert_own" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "usuarios_update_own" ON usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "usuarios_admin_all" ON usuarios FOR ALL USING (public.is_admin());

CREATE POLICY "alojamientos_select_public" ON alojamientos FOR SELECT USING (activo = true);
CREATE POLICY "alojamientos_insert_propietario" ON alojamientos FOR INSERT WITH CHECK (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_update_propietario" ON alojamientos FOR UPDATE USING (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_delete_propietario" ON alojamientos FOR DELETE USING (auth.uid() = propietario_id);

CREATE POLICY "fotos_select_public" ON fotos_alojamiento FOR SELECT USING (true);
CREATE POLICY "fotos_insert_propietario" ON fotos_alojamiento FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "fotos_delete_propietario" ON fotos_alojamiento FOR DELETE
  USING (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));

CREATE POLICY "disponibilidad_select_public" ON disponibilidad FOR SELECT USING (true);
CREATE POLICY "disponibilidad_manage_propietario" ON disponibilidad FOR ALL
  USING (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));

CREATE POLICY "reservas_select_usuario" ON reservas FOR SELECT
  USING (auth.uid() = usuario_id OR EXISTS (
    SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()
  ));
CREATE POLICY "reservas_insert_usuario" ON reservas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "reservas_update_usuario" ON reservas FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "pagos_select_own" ON pagos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM reservas WHERE id = reserva_id AND (
      usuario_id = auth.uid() OR
      EXISTS (SELECT 1 FROM alojamientos WHERE id = reservas.alojamiento_id AND propietario_id = auth.uid())
    )
  ));
CREATE POLICY "pagos_insert_usuario" ON pagos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reservas WHERE id = reserva_id AND usuario_id = auth.uid()));

CREATE POLICY "opiniones_select_public" ON opiniones FOR SELECT USING (true);
CREATE POLICY "opiniones_insert_usuario" ON opiniones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "opiniones_update_usuario" ON opiniones FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "notificaciones_select" ON notificaciones FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "notificaciones_insert" ON notificaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "notificaciones_update" ON notificaciones FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "notificaciones_delete" ON notificaciones FOR DELETE USING (auth.uid() = usuario_id);

CREATE POLICY "resenas_select_public" ON resenas FOR SELECT USING (visible = true);
CREATE POLICY "resenas_insert_usuario" ON resenas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "resenas_update_usuario" ON resenas FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "resenas_delete_usuario" ON resenas FOR DELETE USING (auth.uid() = usuario_id);
CREATE POLICY "resenas_admin_select" ON resenas FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin_adventur'));
CREATE POLICY "resenas_admin_update" ON resenas FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin_adventur'));

-- ============================================================
-- STORAGE
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('public', 'public', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true) ON CONFLICT (id) DO NOTHING;

-- Limpiar políticas de storage existentes
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Las fotos de perfil son públicas" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden subir su propia foto de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propia foto de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar su propia foto de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden gestionar todas las fotos" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'public');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Las fotos de perfil son públicas" ON storage.objects FOR SELECT TO public USING (bucket_id = 'profile-photos');
CREATE POLICY "Los usuarios pueden subir su propia foto de perfil" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Los usuarios pueden actualizar su propia foto de perfil" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Los usuarios pueden eliminar su propia foto de perfil" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Los admins pueden gestionar todas las fotos" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'profile-photos' AND EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin_adventur'));


-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
SELECT
  'a1000000-0000-0000-0000-000000000001',
  (SELECT id FROM usuarios LIMIT 1),
  'Cabaña El Bosque Encantado',
  'Hermosa cabaña rodeada de naturaleza con vista al río, perfecta para desconectarse del estrés de la ciudad.',
  'Km 12 Carretera a Oxapampa', 'Pasco', 'Oxapampa', 'Oxapampa',
  -10.5833, -75.3833, 'Naturaleza', 'Cabaña', 180.00, 6,
  '["WiFi","Cocina equipada","Chimenea","Estacionamiento","Agua caliente","Parrilla"]',
  '["No fumar dentro","No mascotas","Silencio después de las 10pm"]', true
WHERE EXISTS (SELECT 1 FROM usuarios LIMIT 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
SELECT
  'a1000000-0000-0000-0000-000000000002',
  (SELECT id FROM usuarios LIMIT 1),
  'EcoLodge Amazonas Verde',
  'Lodge ecológico en plena selva amazónica. Experiencia única con tours guiados incluidos.',
  'Comunidad Nativa Yanesha, Sector 3', 'Loreto', 'Maynas', 'Iquitos',
  -3.7437, -73.2516, 'Naturaleza', 'EcoLodge', 250.00, 4,
  '["Desayuno incluido","Tours guiados","Kayak","Observación de aves","Mosquiteros"]',
  '["Respeto a la naturaleza","No plásticos de un solo uso","Check-in 14:00"]', true
WHERE EXISTS (SELECT 1 FROM usuarios LIMIT 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
SELECT
  'a1000000-0000-0000-0000-000000000003',
  (SELECT id FROM usuarios LIMIT 1),
  'Hotel Boutique Cusco Imperial',
  'Hotel boutique en el corazón del Cusco histórico, a 2 cuadras de la Plaza de Armas.',
  'Calle Hatunrumiyoc 342', 'Cusco', 'Cusco', 'Cusco',
  -13.5170, -71.9785, 'Premium', 'Hotel', 320.00, 2,
  '["WiFi","Desayuno buffet","Calefacción","TV cable","Caja fuerte","Room service"]',
  '["No fumar","Check-out 12:00","Depósito de seguridad requerido"]', true
WHERE EXISTS (SELECT 1 FROM usuarios LIMIT 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
SELECT
  'a1000000-0000-0000-0000-000000000004',
  (SELECT id FROM usuarios LIMIT 1),
  'Casa Familiar Playa Máncora',
  'Amplia casa frente al mar en Máncora, ideal para familias. Acceso directo a la playa.',
  'Av. Piura 890, frente al mar', 'Piura', 'Talara', 'Máncora',
  -4.1036, -81.0453, 'Familiar', 'Casa', 420.00, 10,
  '["WiFi","Piscina","Acceso playa","Cocina equipada","BBQ","Estacionamiento","Aire acondicionado"]',
  '["No fiestas","Máximo 10 personas","No mascotas","Depósito requerido"]', true
WHERE EXISTS (SELECT 1 FROM usuarios LIMIT 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
SELECT
  'a1000000-0000-0000-0000-000000000005',
  (SELECT id FROM usuarios LIMIT 1),
  'Hostal Romántico Arequipa',
  'Hostal acogedor en el centro histórico de Arequipa, construido en sillar blanco.',
  'Calle Santa Catalina 215', 'Arequipa', 'Arequipa', 'Arequipa',
  -16.3989, -71.5369, 'Parejas', 'Hostal', 140.00, 2,
  '["WiFi","Desayuno","Terraza con vista al Misti","Jacuzzi","Estacionamiento"]',
  '["Solo parejas","No menores de edad","Check-in 15:00"]', true
WHERE EXISTS (SELECT 1 FROM usuarios LIMIT 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
SELECT
  'a1000000-0000-0000-0000-000000000006',
  (SELECT id FROM usuarios LIMIT 1),
  'Cabaña Económica Valle Sagrado',
  'Cabaña sencilla y cómoda en el Valle Sagrado de los Incas, cerca a Pisac.',
  'Comunidad de Pisac, Sector Alto', 'Cusco', 'Calca', 'Pisac',
  -13.4167, -71.8500, 'Económico', 'Cabaña', 75.00, 3,
  '["WiFi básico","Cocina compartida","Jardín","Vista a montañas"]',
  '["Respeto al entorno","No ruidos fuertes","Basura clasificada"]', true
WHERE EXISTS (SELECT 1 FROM usuarios LIMIT 1)
ON CONFLICT (id) DO NOTHING;

-- Fotos
INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
('a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800', true),
('a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', false),
('a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800', false),
('a1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', true),
('a1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', false),
('a1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', false),
('a1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', true),
('a1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', false),
('a1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', false),
('a1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', true),
('a1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', false),
('a1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', false),
('a1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', true),
('a1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', false),
('a1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', true),
('a1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800', false);

-- Disponibilidad para los próximos 60 días
INSERT INTO disponibilidad (alojamiento_id, fecha, disponible, precio)
SELECT a.id, CURRENT_DATE + s.i, true, a.precio_base
FROM alojamientos a
CROSS JOIN generate_series(0, 60) AS s(i)
ON CONFLICT (alojamiento_id, fecha) DO NOTHING;
