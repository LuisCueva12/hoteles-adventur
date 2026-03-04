-- Crear tabla de notificaciones (versión simplificada sin triggers)
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('success', 'warning', 'info', 'error')),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    url VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created ON notificaciones(created_at DESC);

-- RLS Policies
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias notificaciones
DROP POLICY IF EXISTS "Los usuarios pueden ver sus notificaciones" ON notificaciones;
CREATE POLICY "Los usuarios pueden ver sus notificaciones"
    ON notificaciones FOR SELECT
    USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear notificaciones (para testing)
DROP POLICY IF EXISTS "Los usuarios pueden crear notificaciones" ON notificaciones;
CREATE POLICY "Los usuarios pueden crear notificaciones"
    ON notificaciones FOR INSERT
    WITH CHECK (true);

-- Los usuarios pueden actualizar sus propias notificaciones
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus notificaciones" ON notificaciones;
CREATE POLICY "Los usuarios pueden actualizar sus notificaciones"
    ON notificaciones FOR UPDATE
    USING (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propias notificaciones
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus notificaciones" ON notificaciones;
CREATE POLICY "Los usuarios pueden eliminar sus notificaciones"
    ON notificaciones FOR DELETE
    USING (auth.uid() = usuario_id);
