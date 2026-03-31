-- Tabla de favoritos de usuarios
CREATE TABLE IF NOT EXISTS favoritos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    alojamiento_id UUID NOT NULL REFERENCES alojamientos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, alojamiento_id)
);

-- RLS
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propios favoritos"
    ON favoritos FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios insertan sus propios favoritos"
    ON favoritos FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios eliminan sus propios favoritos"
    ON favoritos FOR DELETE
    USING (auth.uid() = usuario_id);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
