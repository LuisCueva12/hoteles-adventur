-- ============================================
-- GALERÍA GENERAL: álbumes independientes
-- ============================================

-- Agregar columna album a fotos_alojamiento para fotos sin alojamiento
ALTER TABLE fotos_alojamiento
  ADD COLUMN IF NOT EXISTS album text,
  ADD COLUMN IF NOT EXISTS titulo text,
  ADD COLUMN IF NOT EXISTS orden integer DEFAULT 0;

-- Índice para buscar fotos de galería general (sin alojamiento)
CREATE INDEX IF NOT EXISTS idx_fotos_galeria_general
  ON fotos_alojamiento (album)
  WHERE alojamiento_id IS NULL;

-- Política RLS: admins pueden insertar fotos sin alojamiento
-- (las políticas existentes ya cubren esto si el bucket es público)
