-- ============================================================
-- SEED: Alojamientos con fotos
-- IMPORTANTE: Reemplaza el propietario_id con un UUID real
--             de un usuario con rol 'propietario' o 'admin_adventur'
--             Puedes obtenerlo con: SELECT id FROM usuarios LIMIT 1;
-- ============================================================

DO $$
DECLARE
  pid uuid;
  a1 uuid; a2 uuid; a3 uuid; a4 uuid;
  a5 uuid; a6 uuid; a7 uuid; a8 uuid;
BEGIN

  -- Obtener el primer admin/propietario disponible
  SELECT id INTO pid FROM usuarios
  WHERE rol IN ('admin_adventur','propietario')
  ORDER BY fecha_registro ASC
  LIMIT 1;

  IF pid IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún usuario propietario o admin. Crea uno primero.';
  END IF;

  -- ── 1. Cabaña Económica ─────────────────────────────────
  INSERT INTO alojamientos (
    propietario_id, nombre, descripcion, direccion,
    departamento, provincia, distrito,
    categoria, tipo, precio_base, capacidad_maxima,
    servicios_incluidos, reglas_lugar, activo
  ) VALUES (
    pid,
    'Cabaña Los Pinos',
    'Acogedora cabaña rodeada de pinos con vista al valle. Ideal para escapadas de fin de semana con familia o amigos. Cuenta con chimenea, cocina equipada y terraza privada.',
    'Km 12 Carretera a Baños del Inca',
    'Cajamarca', 'Cajamarca', 'Baños del Inca',
    'Económico', 'Cabaña', 120, 4,
    '["WiFi","Cocina equipada","Chimenea","Estacionamiento","Agua caliente"]',
    '["No fumar dentro","No mascotas","Silencio después de las 10pm"]',
    true
  ) RETURNING id INTO a1;

  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a1, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80', true),
    (a1, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&q=80', false);

  -- ── 2. EcoLodge Naturaleza ──────────────────────────────
  INSERT INTO alojamientos (
    propietario_id, nombre, descripcion, direccion,
    departamento, provincia, distrito,
    categoria, tipo, precio_base, capacidad_maxima,
    servicios_incluidos, reglas_lugar, activo
  ) VALUES (
    pid,
    'EcoLodge Amazonas Verde',
    'Sumérgete en la naturaleza en nuestro ecolodge sostenible. Construido con materiales locales, ofrece una experiencia auténtica en contacto con la flora y fauna de la región. Incluye tours guiados.',
    'Sector Llaucán s/n',
    'Cajamarca', 'Hualgayoc', 'Bambamarca',
    'Naturaleza', 'EcoLodge', 180, 2,
    '["WiFi","Desayuno incluido","Tours guiados","Observación de aves","Paneles solares"]',
    '["Respeto al medio ambiente","No plásticos de un solo uso","Silencio nocturno"]',
    true
  ) RETURNING id INTO a2;

  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a2, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', true),
    (a2, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1540541338537-1220059af4dc?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=1200&q=80', false);

  -- ── 3. Hotel Premium ────────────────────────────────────
  INSERT INTO alojamientos (
    propietario_id, nombre, descripcion, direccion,
    departamento, provincia, distrito,
    categoria, tipo, precio_base, capacidad_maxima,
    servicios_incluidos, reglas_lugar, activo
  ) VALUES (
    pid,
    'Hotel Adventur Plaza',
    'Hotel boutique en el corazón de Cajamarca, a media cuadra de la Plaza de Armas. Habitaciones elegantes con acabados premium, restaurante gourmet y spa. La mejor opción para viajeros exigentes.',
    'Jr. Del Comercio 456',
    'Cajamarca', 'Cajamarca', 'Cajamarca',
    'Premium', 'Hotel', 350, 2,
    '["WiFi premium","Desayuno buffet","Spa","Restaurante","Room service 24h","Caja fuerte","TV Smart","Aire acondicionado"]',
    '["No fumar","Check-in 3pm","Check-out 12pm"]',
    true
  ) RETURNING id INTO a3;

  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a3, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', true),
    (a3, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80', false);

  -- ── 4. Hostal Familiar ──────────────────────────────────
  INSERT INTO alojamientos (
    propietario_id, nombre, descripcion, direccion,
    departamento, provincia, distrito,
    categoria, tipo, precio_base, capacidad_maxima,
    servicios_incluidos, reglas_lugar, activo
  ) VALUES (
    pid,
    'Hostal El Mirador',
    'Hostal familiar con vista panorámica a los cerros de Cajamarca. Ambiente cálido y acogedor, perfecto para familias y grupos. Cocina compartida disponible y jardín con hamacas.',
    'Av. Los Héroes 234',
    'Cajamarca', 'Cajamarca', 'Cajamarca',
    'Familiar', 'Hostal', 85, 6,
    '["WiFi","Cocina compartida","Jardín","Estacionamiento","Agua caliente","TV cable"]',
    '["No fiestas","Silencio 11pm","Niños bienvenidos"]',
    true
  ) RETURNING id INTO a4;

  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a4, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80', true),
    (a4, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80', false);

  -- ── 5. Casa para Parejas ────────────────────────────────
  INSERT INTO alojamientos (
    propietario_id, nombre, descripcion, direccion,
    departamento, provincia, distrito,
    categoria, tipo, precio_base, capacidad_maxima,
    servicios_incluidos, reglas_lugar, activo
  ) VALUES (
    pid,
    'Casa Romántica Las Orquídeas',
    'Casa privada diseñada para parejas que buscan intimidad y romanticismo. Jacuzzi exterior, jardín privado con flores, decoración elegante y desayuno romántico incluido. Una experiencia única.',
    'Urb. El Ingenio Mz. C Lt. 5',
    'Cajamarca', 'Cajamarca', 'Los Baños del Inca',
    'Parejas', 'Casa', 280, 2,
    '["Jacuzzi","Desayuno romántico","WiFi","TV Smart","Jardín privado","Chimenea","Vino de bienvenida"]',
    '["Solo adultos","No fumar","Reserva mínima 2 noches"]',
    true
  ) RETURNING id INTO a5;

  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a5, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80', true),
    (a5, 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=1200&q=80', false);

  -- ── 6. Cabaña Premium ───────────────────────────────────
  INSERT INTO alojamientos (
    propietario_id, nombre, descripcion, direccion,
    departamento, provincia, distrito,
    categoria, tipo, precio_base, capacidad_maxima,
    servicios_incluidos, reglas_lugar, activo
  ) VALUES (
    pid,
    'Cabaña Premium Cumbre Andina',
    'Exclusiva cabaña de lujo a 3,200 msnm con vistas impresionantes a la cordillera. Construida en madera noble con interiores modernos, piscina temperada y servicio personalizado.',
    'Sector Cumbe Mayo Alto',
    'Cajamarca', 'Cajamarca', 'Cajamarca',
    'Premium', 'Cabaña', 450, 4,
    '["Piscina temperada","WiFi","Desayuno gourmet","Chimenea","Bañera de hidromasaje","Chef privado disponible","Transporte incluido"]',
    '["No fumar","No mascotas","Reserva mínima 2 noches","Solo adultos"]',
    true
  ) RETURNING id INTO a6;

  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a6, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80', true),
    (a6, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80', false);

  -- ── 7. EcoLodge Familiar ────────────────────────────────
  INSERT INTO alojamientos (
    propietario_id, nombre, descripcion, direccion,
    departamento, provincia, distrito,
    categoria, tipo, precio_base, capacidad_maxima,
    servicios_incluidos, reglas_lugar, activo
  ) VALUES (
    pid,
    'EcoLodge Familia Feliz',
    'Perfecto para familias con niños. Amplio espacio verde con juegos infantiles, animales de granja, huerto orgánico y actividades educativas. Los niños aprenden mientras se divierten en contacto con la naturaleza.',
    'Carretera Cajamarca-Celendín Km 8',
    'Cajamarca', 'Cajamarca', 'Llacanora',
    'Familiar', 'EcoLodge', 160, 8,
    '["WiFi","Desayuno incluido","Juegos infantiles","Animales de granja","Huerto orgánico","Piscina","BBQ"]',
    '["Niños bienvenidos","No fumar","Cuidado con los animales"]',
    true
  ) RETURNING id INTO a7;

  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a7, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', true),
    (a7, 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80', false);

  -- ── 8. Hostal Económico Centro ──────────────────────────
  INSERT INTO alojamientos (
    propietario_id, nombre, descripcion, direccion,
    departamento, provincia, distrito,
    categoria, tipo, precio_base, capacidad_maxima,
    servicios_incluidos, reglas_lugar, activo
  ) VALUES (
    pid,
    'Hostal Centro Histórico',
    'Ubicado en el centro histórico de Cajamarca, a pasos de los principales atractivos turísticos. Habitaciones limpias y cómodas a precio accesible. Ideal para mochileros y viajeros con presupuesto ajustado.',
    'Jr. Apurímac 123',
    'Cajamarca', 'Cajamarca', 'Cajamarca',
    'Económico', 'Hostal', 60, 3,
    '["WiFi","Agua caliente","TV cable","Lockers","Cocina compartida"]',
    '["Check-in 2pm","Check-out 11am","No ruido nocturno"]',
    true
  ) RETURNING id INTO a8;

  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a8, 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200&q=80', true),
    (a8, 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80', false);

  RAISE NOTICE 'Alojamientos insertados correctamente con propietario_id: %', pid;

END $$;
