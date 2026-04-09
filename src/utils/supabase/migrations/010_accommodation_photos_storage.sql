-- ============================================
-- STORAGE BUCKET: fotos de alojamientos
-- ============================================

-- Crear bucket público para fotos de alojamientos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'accommodation-photos',
  'accommodation-photos',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública
CREATE POLICY "Fotos alojamiento publicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'accommodation-photos');

-- Admins pueden subir
CREATE POLICY "Admins pueden subir fotos alojamiento"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'accommodation-photos' AND
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin_adventur'
  )
);

-- Admins pueden actualizar
CREATE POLICY "Admins pueden actualizar fotos alojamiento"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'accommodation-photos' AND
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin_adventur'
  )
);

-- Admins pueden eliminar
CREATE POLICY "Admins pueden eliminar fotos alojamiento"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'accommodation-photos' AND
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin_adventur'
  )
);
