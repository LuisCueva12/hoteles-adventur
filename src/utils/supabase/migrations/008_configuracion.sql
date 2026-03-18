-- Tabla de configuración del hotel
CREATE TABLE IF NOT EXISTS configuracion (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas para evitar errores en re-ejecución
DROP POLICY IF EXISTS "Admins pueden gestionar configuracion" ON configuracion;
DROP POLICY IF EXISTS "Lectura publica configuracion" ON configuracion;

-- Solo admins pueden insertar, actualizar y eliminar
CREATE POLICY "Admins pueden gestionar configuracion" ON configuracion
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'admin_adventur'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'admin_adventur'
        )
    );

-- Lectura pública (para mostrar nombre del hotel, etc. en la web)
CREATE POLICY "Lectura publica configuracion" ON configuracion
    FOR SELECT
    USING (true);

-- Insertar configuración inicial desactivando RLS temporalmente
-- (necesario porque el INSERT ocurre sin sesión de usuario)
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;

INSERT INTO configuracion (nombre_hotel, slogan, ciudad, pais, moneda, porcentaje_adelanto)
SELECT 'Hotel Adventur', 'Tu hogar lejos de casa', 'Lima', 'Perú', 'PEN', 30
WHERE NOT EXISTS (SELECT 1 FROM configuracion);

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
