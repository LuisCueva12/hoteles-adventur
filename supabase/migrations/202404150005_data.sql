INSERT INTO configuracion (
  nombre_hotel, slogan, descripcion, direccion, ciudad, pais,
  telefono, email, email_reservas, hora_checkin, hora_checkout,
  moneda, porcentaje_adelanto
) VALUES (
  'Hotel Adventur',
  'Atrévete y descubre',
  'La mejor experiencia hotelera en Cajamarca',
  'Av. Principal 123',
  'Cajamarca',
  'Perú',
  '+51 123 456 789',
  'info@hoteladventur.com',
  'reservas@hoteladventur.com',
  '14:00',
  '12:00',
  'PEN',
  30
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "Users can upload their own profile photo" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Users can view their own profile photo" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-photos' AND 
  (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Users can update their own profile photo" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND 
  (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Users can delete their own profile photo" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND 
  (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Admins can manage all profile photos" ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'profile-photos' AND 
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
)
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
);
