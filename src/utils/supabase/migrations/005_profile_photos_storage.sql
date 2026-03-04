-- ============================================
-- CONFIGURAR STORAGE PARA FOTOS DE PERFIL
-- ============================================

-- Crear bucket para fotos de perfil si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acceso para el bucket profile-photos
-- Permitir que cualquier usuario autenticado pueda subir su propia foto
CREATE POLICY "Los usuarios pueden subir su propia foto de perfil"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que cualquier usuario autenticado pueda actualizar su propia foto
CREATE POLICY "Los usuarios pueden actualizar su propia foto de perfil"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que cualquier usuario autenticado pueda eliminar su propia foto
CREATE POLICY "Los usuarios pueden eliminar su propia foto de perfil"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que todos puedan ver las fotos de perfil (lectura pública)
CREATE POLICY "Las fotos de perfil son públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Permitir que los admins puedan gestionar todas las fotos
CREATE POLICY "Los admins pueden gestionar todas las fotos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'admin_adventur'
  )
);
