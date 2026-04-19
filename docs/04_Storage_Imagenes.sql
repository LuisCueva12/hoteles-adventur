-- ==============================================================================
-- STORAGE: CREAR BUCKET PARA IMÁGENES
-- Ejecutar en SQL Editor de Supabase
-- ==============================================================================

-- Crear bucket de imágenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imagenes', 
  'imagenes', 
  true, 
  10485760,  -- 10MB máximo por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- POLÍTICAS RLS (solo agregar, no modificar tablas del sistema)
-- ==============================================================================

-- Política: Leer cualquier archivo del bucket imagenes
DROP POLICY IF EXISTS "imagenes_public_read" ON storage.objects;
CREATE POLICY "imagenes_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'imagenes');

-- Política: Insertar archivos en el bucket imagenes
DROP POLICY IF EXISTS "imagenes_insert" ON storage.objects;
CREATE POLICY "imagenes_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'imagenes');

-- Política: Actualizar archivos del bucket imagenes
DROP POLICY IF EXISTS "imagenes_update" ON storage.objects;
CREATE POLICY "imagenes_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'imagenes');

-- Política: Eliminar archivos del bucket imagenes
DROP POLICY IF EXISTS "imagenes_delete" ON storage.objects;
CREATE POLICY "imagenes_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'imagenes');

-- ==============================================================================
-- ESTRUCTURA DE CARPETAS
-- ==============================================================================
-- Las carpetas se crean automáticamente al subir archivos:
-- 
-- imagenes/
-- ├── hoteles/
-- │   ├── 1700000000000-hotel-playa.jpg
-- │   └── ...
-- └── habitaciones/
--     ├── 1700000000001-habitacion-doble.jpg
--     └── ...
--
-- ==============================================================================