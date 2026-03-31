-- ============================================================
-- SEED DE DATOS - ADVENTUR
-- Requiere al menos un usuario registrado en la app.
-- ============================================================

-- Actualizar el usuario existente como admin/propietario
UPDATE usuarios SET
  nombre = 'Carlos', apellido = 'Mendoza',
  telefono = '+51987654321', documento_identidad = '12345678',
  tipo_documento = 'DNI', pais = 'Perú',
  rol = 'admin_adventur', verificado = true
WHERE id = (SELECT id FROM usuarios LIMIT 1);

-- ============================================================
-- ALOJAMIENTOS
-- ============================================================

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'Cabaña El Bosque Encantado',
  'Hermosa cabaña rodeada de naturaleza con vista al río. Perfecta para desconectarse. Cuenta con chimenea, cocina equipada y terraza privada con hamacas.',
  'Km 12 Carretera a Oxapampa', 'Pasco', 'Oxapampa', 'Oxapampa', -10.5833, -75.3833,
  'Naturaleza', 'Cabaña', 180.00, 6,
  '["WiFi","Cocina equipada","Chimenea","Estacionamiento","Agua caliente","Parrilla","Hamacas","Jardín privado"]',
  '["No fumar dentro","No mascotas","Silencio después de las 10pm","No fiestas"]', true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000002'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'EcoLodge Amazonas Verde',
  'Lodge ecológico en plena selva amazónica. Experiencia única con tours guiados, avistamiento de aves y kayak en el río.',
  'Comunidad Nativa Yanesha, Sector 3', 'Loreto', 'Maynas', 'Iquitos', -3.7437, -73.2516,
  'Naturaleza', 'EcoLodge', 250.00, 4,
  '["Desayuno incluido","Tours guiados","Kayak","Observación de aves","Mosquiteros","Guía local","Transporte al lodge"]',
  '["Respeto a la naturaleza","No plásticos de un solo uso","Check-in 14:00","No ruidos nocturnos"]', true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000003'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'Hotel Boutique Cusco Imperial',
  'Hotel boutique en el corazón del Cusco histórico, a 2 cuadras de la Plaza de Armas. Habitaciones con vista al Qorikancha.',
  'Calle Hatunrumiyoc 342', 'Cusco', 'Cusco', 'Cusco', -13.5170, -71.9785,
  'Premium', 'Hotel', 320.00, 2,
  '["WiFi","Desayuno buffet","Calefacción","TV cable","Caja fuerte","Room service","Concierge","Bar"]',
  '["No fumar","Check-out 12:00","Depósito de seguridad requerido","Mascotas no permitidas"]', true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000004'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'Casa Familiar Playa Máncora',
  'Amplia casa frente al mar en Máncora, ideal para familias. Acceso directo a la playa, piscina privada y BBQ.',
  'Av. Piura 890, frente al mar', 'Piura', 'Talara', 'Máncora', -4.1036, -81.0453,
  'Familiar', 'Casa', 420.00, 10,
  '["WiFi","Piscina privada","Acceso playa","Cocina equipada","BBQ","Estacionamiento","Aire acondicionado","Tabla de surf"]',
  '["No fiestas","Máximo 10 personas","No mascotas","Depósito requerido","Check-in 15:00"]', true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000005'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'Hostal Romántico Arequipa',
  'Hostal acogedor en el centro histórico de Arequipa, construido en sillar blanco. Jacuzzi privado con vista al volcán Misti.',
  'Calle Santa Catalina 215', 'Arequipa', 'Arequipa', 'Arequipa', -16.3989, -71.5369,
  'Parejas', 'Hostal', 140.00, 2,
  '["WiFi","Desayuno","Terraza con vista al Misti","Jacuzzi privado","Estacionamiento","Vino de bienvenida"]',
  '["Solo parejas","No menores de edad","Check-in 15:00","No fumar"]', true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000006'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'Cabaña Económica Valle Sagrado',
  'Cabaña sencilla y cómoda en el Valle Sagrado de los Incas, cerca a Pisac. Excelente punto de partida para visitar Machu Picchu.',
  'Comunidad de Pisac, Sector Alto', 'Cusco', 'Calca', 'Pisac', -13.4167, -71.8500,
  'Económico', 'Cabaña', 75.00, 3,
  '["WiFi básico","Cocina compartida","Jardín","Vista a montañas","Estacionamiento"]',
  '["Respeto al entorno","No ruidos fuertes","Basura clasificada","Check-out 11:00"]', true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000007'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'Lodge Colca Canyon View',
  'Espectacular lodge con vista directa al Cañón del Colca. Observa el vuelo del cóndor desde tu terraza. Incluye tours y aguas termales.',
  'Sector Yanque, Cañón del Colca', 'Arequipa', 'Caylloma', 'Yanque', -15.6667, -71.7167,
  'Premium', 'EcoLodge', 380.00, 4,
  '["Desayuno y cena","Tour al cañón","Aguas termales","WiFi","Calefacción","Guía especializado","Transporte"]',
  '["No fumar","Respeto al ecosistema","Check-in 14:00","Reserva anticipada requerida"]', true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000008'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'Hostal Miraflores Surf',
  'Hostal moderno en Miraflores, Lima. A 5 minutos de la Costa Verde y los mejores restaurantes de la ciudad.',
  'Av. Larco 456, Miraflores', 'Lima', 'Lima', 'Miraflores', -12.1219, -77.0282,
  'Económico', 'Hostal', 95.00, 2,
  '["WiFi alta velocidad","Desayuno","Cocina compartida","Terraza","Bicicletas","Locker","Tours city"]',
  '["Check-in 14:00","Check-out 12:00","No fumar","Silencio 11pm"]', true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000009'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'Casa Colonial Trujillo',
  'Hermosa casa colonial restaurada en el centro histórico de Trujillo. A pasos de la Plaza de Armas y Chan Chan.',
  'Jr. Independencia 789', 'La Libertad', 'Trujillo', 'Trujillo', -8.1116, -79.0288,
  'Familiar', 'Casa', 200.00, 8,
  '["WiFi","Cocina equipada","Patio colonial","Estacionamiento","TV","Lavandería","Tours Chan Chan"]',
  '["No fiestas","Máximo 8 personas","Check-in 15:00","Depósito requerido"]', true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO alojamientos (id, propietario_id, nombre, descripcion, direccion, departamento, provincia, distrito, latitud, longitud, categoria, tipo, precio_base, capacidad_maxima, servicios_incluidos, reglas_lugar, activo)
VALUES (
  'a0000000-0000-0000-0000-000000000010'::uuid,
  (SELECT id FROM usuarios LIMIT 1),
  'Cabaña Lago Titicaca',
  'Cabaña flotante en el Lago Titicaca con experiencia de vida en isla. Convive con familias aymaras, aprende a tejer y navega en totora.',
  'Isla Uros, Lago Titicaca', 'Puno', 'Puno', 'Puno', -15.8422, -70.0199,
  'Naturaleza', 'Cabaña', 160.00, 4,
  '["Desayuno típico","Paseo en barca de totora","Taller de tejido","Guía aymara","Cena tradicional"]',
  '["Respeto a la cultura local","No alcohol","Check-in con luz del día","Equipaje ligero"]', true
) ON CONFLICT (id) DO NOTHING;
