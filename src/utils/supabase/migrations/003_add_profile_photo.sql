-- Agregar campo de foto de perfil a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil text;

-- Agregar campo de updated_at para tracking de cambios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at en usuarios
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crear bucket de storage para avatares si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para el bucket public
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public');

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);
