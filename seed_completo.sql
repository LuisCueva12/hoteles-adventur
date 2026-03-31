-- ============================================================
-- SEED COMPLETO ADVENTUR v3.2 - Ejecutar en Supabase SQL Editor
-- ============================================================

-- MEJORAS AL ESQUEMA
ALTER TABLE alojamientos ADD COLUMN IF NOT EXISTS foto_principal text;
ALTER TABLE alojamientos ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE alojamientos ADD COLUMN IF NOT EXISTS destacado boolean DEFAULT false;
ALTER TABLE alojamientos ADD COLUMN IF NOT EXISTS calificacion_promedio numeric(3,2) DEFAULT 0;
ALTER TABLE alojamientos ADD COLUMN IF NOT EXISTS total_resenas integer DEFAULT 0;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS whatsapp text DEFAULT '';
ALTER TABLE fotos_alojamiento ADD COLUMN IF NOT EXISTS orden integer DEFAULT 0;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS notas text;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS comprobante_url text;

DO $$ BEGIN
  ALTER TABLE alojamientos ADD CONSTRAINT alojamientos_slug_key UNIQUE (slug);
EXCEPTION WHEN others THEN NULL;
END $$;

-- LIMPIAR
TRUNCATE TABLE resenas,opiniones,comprobantes,notificaciones,pagos,reservas,disponibilidad,fotos_alojamiento,alojamientos CASCADE;

-- CONFIGURACIÓN
UPDATE configuracion SET
  nombre_hotel='Hotel Adventur', slogan='Tu hogar lejos de casa',
  descripcion='Plataforma de alojamientos turísticos en el Perú.',
  direccion='Jr. Amalia Puga 635', ciudad='Cajamarca', pais='Perú',
  telefono='+51 76 123456', telefono_secundario='+51 987 654 321',
  whatsapp='+51918146783', email='info@hoteladventur.com',
  email_reservas='reservas@hoteladventur.com',
  sitio_web='https://www.hoteladventur.com',
  facebook='https://facebook.com/hoteladventur',
  instagram='https://instagram.com/hoteladventur',
  hora_checkin='14:00', hora_checkout='12:00',
  moneda='PEN', porcentaje_adelanto=30,
  ruc='20608201747', razon_social='ADVENTUR PERU S.A.C.',
  politica_cancelacion='Cancelación gratuita hasta 48 horas antes del check-in. Cancelaciones tardías tienen cargo del 30% del total.',
  politica_checkin='Check-in a partir de las 14:00. Presentar documento de identidad. Check-out hasta las 12:00.'
WHERE id IS NOT NULL;

-- ============================================================
-- ALOJAMIENTOS Y FOTOS
-- ============================================================
DO $$
DECLARE
  pid uuid;
  a1 uuid; a2 uuid; a3 uuid; a4 uuid; a5 uuid;
  a6 uuid; a7 uuid; a8 uuid; a9 uuid; a10 uuid;
BEGIN
  SELECT id INTO pid FROM usuarios WHERE rol='admin_adventur' LIMIT 1;
  IF pid IS NULL THEN RAISE EXCEPTION 'No hay admin. Inicia sesión primero.'; END IF;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'Cabaña Los Pinos','cabana-los-pinos','Acogedora cabaña rodeada de pinos con vista al valle. Chimenea, cocina equipada y terraza privada.','Km 12 Carretera a Baños del Inca','Cajamarca','Cajamarca','Baños del Inca',-7.1833,-78.4500,'Económico','Cabaña',120,4,'["WiFi","Cocina equipada","Chimenea","Estacionamiento","Agua caliente"]','["No fumar dentro","No mascotas","Silencio después de las 10pm"]',true,false,'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',4.20,5)
  RETURNING id INTO a1;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'EcoLodge Amazonas Verde','ecolodge-amazonas-verde','Lodge ecológico sostenible con tours guiados, avistamiento de aves y paneles solares.','Sector Llaucán s/n','Cajamarca','Hualgayoc','Bambamarca',-6.6833,-78.5167,'Naturaleza','EcoLodge',180,2,'["WiFi","Desayuno incluido","Tours guiados","Observación de aves","Paneles solares"]','["Respeto al medio ambiente","No plásticos","Silencio nocturno"]',true,true,'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',4.80,8)
  RETURNING id INTO a2;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'Hotel Adventur Plaza','hotel-adventur-plaza','Hotel boutique a media cuadra de la Plaza de Armas. Restaurante gourmet, spa y habitaciones premium.','Jr. Del Comercio 456','Cajamarca','Cajamarca','Cajamarca',-7.1638,-78.5003,'Premium','Hotel',350,2,'["WiFi premium","Desayuno buffet","Spa","Restaurante","Room service 24h","Caja fuerte","TV Smart"]','["No fumar","Check-in 3pm","Check-out 12pm"]',true,true,'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',4.90,12)
  RETURNING id INTO a3;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'Hostal El Mirador','hostal-el-mirador','Vista panorámica a los cerros de Cajamarca. Ambiente familiar, cocina compartida y jardín con hamacas.','Av. Los Héroes 234','Cajamarca','Cajamarca','Cajamarca',-7.1700,-78.4900,'Familiar','Hostal',85,6,'["WiFi","Cocina compartida","Jardín","Estacionamiento","Agua caliente","TV cable"]','["No fiestas","Silencio 11pm","Niños bienvenidos"]',true,false,'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',4.10,6)
  RETURNING id INTO a4;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'Casa Romántica Las Orquídeas','casa-romantica-las-orquideas','Casa privada para parejas con jacuzzi exterior, jardín privado y desayuno romántico incluido.','Urb. El Ingenio Mz. C Lt. 5','Cajamarca','Cajamarca','Los Baños del Inca',-7.1500,-78.4200,'Parejas','Casa',280,2,'["Jacuzzi","Desayuno romántico","WiFi","TV Smart","Jardín privado","Chimenea","Vino de bienvenida"]','["Solo adultos","No fumar","Reserva mínima 2 noches"]',true,true,'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',4.70,9)
  RETURNING id INTO a5;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'Cabaña Premium Cumbre Andina','cabana-premium-cumbre-andina','Cabaña de lujo a 3200 msnm con vistas a la cordillera, piscina temperada y chef privado disponible.','Sector Cumbe Mayo Alto','Cajamarca','Cajamarca','Cajamarca',-7.2000,-78.5500,'Premium','Cabaña',450,4,'["Piscina temperada","WiFi","Desayuno gourmet","Chimenea","Bañera de hidromasaje","Chef privado","Transporte incluido"]','["No fumar","No mascotas","Reserva mínima 2 noches"]',true,true,'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',4.95,15)
  RETURNING id INTO a6;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'EcoLodge Familia Feliz','ecolodge-familia-feliz','Para familias con niños. Juegos infantiles, animales de granja, huerto orgánico y piscina.','Carretera Cajamarca-Celendín Km 8','Cajamarca','Cajamarca','Llacanora',-7.1900,-78.4600,'Familiar','EcoLodge',160,8,'["WiFi","Desayuno incluido","Juegos infantiles","Animales de granja","Huerto orgánico","Piscina","BBQ"]','["Niños bienvenidos","No fumar"]',true,false,'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',4.30,7)
  RETURNING id INTO a7;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'Hostal Centro Histórico','hostal-centro-historico','En el centro histórico de Cajamarca, a pasos de los principales atractivos. Ideal para mochileros.','Jr. Apurímac 123','Cajamarca','Cajamarca','Cajamarca',-7.1620,-78.5010,'Económico','Hostal',60,3,'["WiFi","Agua caliente","TV cable","Lockers","Cocina compartida"]','["Check-in 2pm","Check-out 11am","No ruido nocturno"]',true,false,'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&q=80',3.90,4)
  RETURNING id INTO a8;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'Casa Colonial Trujillo','casa-colonial-trujillo','Casa colonial restaurada en el centro histórico de Trujillo. A pasos de Chan Chan.','Jr. Independencia 789','La Libertad','Trujillo','Trujillo',-8.1116,-79.0288,'Familiar','Casa',200,8,'["WiFi","Cocina equipada","Patio colonial","Estacionamiento","TV","Tours Chan Chan"]','["No fiestas","Máximo 8 personas","Check-in 15:00"]',true,false,'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',4.40,6)
  RETURNING id INTO a9;

  INSERT INTO alojamientos(propietario_id,nombre,slug,descripcion,direccion,departamento,provincia,distrito,latitud,longitud,categoria,tipo,precio_base,capacidad_maxima,servicios_incluidos,reglas_lugar,activo,destacado,foto_principal,calificacion_promedio,total_resenas)
  VALUES(pid,'Cabaña Lago Titicaca','cabana-lago-titicaca','Cabaña flotante en el Lago Titicaca. Convive con familias aymaras, aprende a tejer y navega en totora.','Isla Uros, Lago Titicaca','Puno','Puno','Puno',-15.8422,-70.0199,'Naturaleza','Cabaña',160,4,'["Desayuno típico","Paseo en barca de totora","Taller de tejido","Guía aymara","Cena tradicional"]','["Respeto a la cultura local","No alcohol"]',true,true,'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=800&q=80',4.60,10)
  RETURNING id INTO a10;

  -- FOTOS
  INSERT INTO fotos_alojamiento(alojamiento_id,url,es_principal,orden) VALUES
  (a1,'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80',true,1),
  (a1,'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80',false,2),
  (a1,'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',false,3),
  (a2,'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',true,1),
  (a2,'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80',false,2),
  (a2,'https://images.unsplash.com/photo-1540541338537-1220059af4dc?w=1200&q=80',false,3),
  (a3,'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',true,1),
  (a3,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',false,2),
  (a3,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',false,3),
  (a3,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',false,4),
  (a4,'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',true,1),
  (a4,'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80',false,2),
  (a5,'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',true,1),
  (a5,'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80',false,2),
  (a5,'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&q=80',false,3),
  (a6,'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',true,1),
  (a6,'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',false,2),
  (a6,'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',false,3),
  (a6,'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80',false,4),
  (a7,'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',true,1),
  (a7,'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80',false,2),
  (a8,'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200&q=80',true,1),
  (a8,'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1200&q=80',false,2),
  (a9,'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80',true,1),
  (a9,'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',false,2),
  (a10,'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=1200&q=80',true,1),
  (a10,'https://images.unsplash.com/photo-1540541338537-1220059af4dc?w=1200&q=80',false,2);

  -- DISPONIBILIDAD 90 días
  INSERT INTO disponibilidad(alojamiento_id,fecha,disponible,precio)
  SELECT a.id, CURRENT_DATE+s.i, true, a.precio_base
  FROM alojamientos a CROSS JOIN generate_series(0,90) s(i)
  ON CONFLICT(alojamiento_id,fecha) DO NOTHING;

  RAISE NOTICE 'Alojamientos y fotos insertados. Admin: %', pid;
END $$;

-- ============================================================
-- RESERVAS, PAGOS, RESEÑAS, NOTIFICACIONES, COMPROBANTES
-- ============================================================
DO $$
DECLARE
  pid  uuid;
  a1   uuid; a2  uuid; a3  uuid; a5  uuid; a6  uuid; a7  uuid; a10 uuid;
  r1   uuid := gen_random_uuid();
  r2   uuid := gen_random_uuid();
  r3   uuid := gen_random_uuid();
  r4   uuid := gen_random_uuid();
  r5   uuid := gen_random_uuid();
  r6   uuid := gen_random_uuid();
  r7   uuid := gen_random_uuid();
  r8   uuid := gen_random_uuid();
BEGIN
  SELECT id INTO pid FROM usuarios WHERE rol='admin_adventur' LIMIT 1;

  SELECT id INTO a1  FROM alojamientos WHERE slug='cabana-los-pinos';
  SELECT id INTO a2  FROM alojamientos WHERE slug='ecolodge-amazonas-verde';
  SELECT id INTO a3  FROM alojamientos WHERE slug='hotel-adventur-plaza';
  SELECT id INTO a5  FROM alojamientos WHERE slug='casa-romantica-las-orquideas';
  SELECT id INTO a6  FROM alojamientos WHERE slug='cabana-premium-cumbre-andina';
  SELECT id INTO a7  FROM alojamientos WHERE slug='ecolodge-familia-feliz';
  SELECT id INTO a10 FROM alojamientos WHERE slug='cabana-lago-titicaca';

  -- RESERVAS (deshabilitar trigger para datos históricos)
  ALTER TABLE reservas DISABLE TRIGGER trigger_validar_disponibilidad;

  INSERT INTO reservas(id,usuario_id,alojamiento_id,fecha_inicio,fecha_fin,personas,total,adelanto,codigo_reserva,estado,notas,fecha_creacion) VALUES
  (r1,pid,a1,CURRENT_DATE-45,CURRENT_DATE-42,4, 360.00,108.00,'ADV-2026-001','completada','Llegada tarde, avisar',            NOW()-INTERVAL '46 days'),
  (r2,pid,a2,CURRENT_DATE-30,CURRENT_DATE-27,2, 540.00,162.00,'ADV-2026-002','completada',NULL,                               NOW()-INTERVAL '31 days'),
  (r3,pid,a3,CURRENT_DATE-15,CURRENT_DATE-13,2, 700.00,210.00,'ADV-2026-003','completada','Habitación con vista a la plaza',  NOW()-INTERVAL '16 days'),
  (r4,pid,a5,CURRENT_DATE-10,CURRENT_DATE-8, 2, 560.00,168.00,'ADV-2026-004','completada','Aniversario de bodas',             NOW()-INTERVAL '11 days'),
  (r5,pid,a6,CURRENT_DATE-5, CURRENT_DATE-3, 3, 900.00,270.00,'ADV-2026-005','confirmada',NULL,                               NOW()-INTERVAL '6 days'),
  (r6,pid,a3,CURRENT_DATE+5, CURRENT_DATE+8, 2,1050.00,315.00,'ADV-2026-006','confirmada','Solicitan cama extra',             NOW()-INTERVAL '2 days'),
  (r7,pid,a7,CURRENT_DATE+10,CURRENT_DATE+14,5, 640.00,192.00,'ADV-2026-007','pendiente', NULL,                               NOW()-INTERVAL '1 day'),
  (r8,pid,a10,CURRENT_DATE+20,CURRENT_DATE+23,2,480.00,144.00,'ADV-2026-008','pendiente', 'Primera vez en el lago',           NOW());

  ALTER TABLE reservas ENABLE TRIGGER trigger_validar_disponibilidad;

  -- PAGOS
  INSERT INTO pagos(reserva_id,monto,metodo,estado,transaccion_externa,fecha_pago) VALUES
  (r1,108.00,'yape',         'aprobado','YAP-20260215-001',NOW()-INTERVAL '46 days'),
  (r1,252.00,'transferencia','aprobado','TRF-20260218-001',NOW()-INTERVAL '43 days'),
  (r2,162.00,'plin',         'aprobado','PLN-20260301-001',NOW()-INTERVAL '31 days'),
  (r2,378.00,'tarjeta',      'aprobado','TAR-20260304-001',NOW()-INTERVAL '28 days'),
  (r3,210.00,'yape',         'aprobado','YAP-20260316-001',NOW()-INTERVAL '16 days'),
  (r3,490.00,'transferencia','aprobado','TRF-20260318-001',NOW()-INTERVAL '14 days'),
  (r4,168.00,'yape',         'aprobado','YAP-20260321-001',NOW()-INTERVAL '11 days'),
  (r4,392.00,'efectivo',     'aprobado',NULL,              NOW()-INTERVAL '9 days'),
  (r5,270.00,'transferencia','aprobado','TRF-20260326-001',NOW()-INTERVAL '6 days'),
  (r6,315.00,'yape',         'aprobado','YAP-20260329-001',NOW()-INTERVAL '2 days'),
  (r7,192.00,'plin',         'pendiente',NULL,             NOW()-INTERVAL '1 day'),
  (r8,144.00,'yape',         'pendiente',NULL,             NOW());

  -- RESEÑAS
  INSERT INTO resenas(alojamiento_id,usuario_id,reserva_id,calificacion,titulo,comentario,verificado,visible,created_at) VALUES
  (a1,pid,r1,4,'Muy buena experiencia','La cabaña es exactamente como en las fotos. El entorno natural es espectacular. La chimenea funcionó perfecto en las noches frías.',true,true,NOW()-INTERVAL '41 days'),
  (a2,pid,r2,5,'Increíble, lo mejor del viaje','El ecolodge superó todas nuestras expectativas. Los tours guiados son excelentes y el desayuno delicioso.',true,true,NOW()-INTERVAL '26 days'),
  (a3,pid,r3,5,'Hotel de lujo en el corazón de Cajamarca','Ubicación perfecta, a 2 cuadras de la Plaza de Armas. El desayuno buffet es abundante. El personal es muy atento.',true,true,NOW()-INTERVAL '12 days'),
  (a5,pid,r4,5,'Romántico y perfecto para nuestra ocasión','Celebramos nuestro aniversario aquí y fue mágico. El jacuzzi exterior con vista a las montañas es espectacular.',true,true,NOW()-INTERVAL '7 days');

  UPDATE resenas SET
    respuesta_admin='¡Muchas gracias! Fue un placer recibirlos en su aniversario. Los esperamos pronto.',
    fecha_respuesta=NOW()-INTERVAL '6 days'
  WHERE reserva_id=r4;

  -- OPINIONES (legacy)
  INSERT INTO opiniones(usuario_id,alojamiento_id,reserva_id,calificacion,comentario) VALUES
  (pid,a1,r1,4,'Lugar tranquilo y acogedor. Recomendado para descansar.'),
  (pid,a2,r2,5,'La mejor experiencia en la naturaleza que he tenido.'),
  (pid,a3,r3,5,'Hotel impecable. Volveré sin duda.'),
  (pid,a5,r4,5,'Perfecto para parejas. Muy romántico.');

  -- NOTIFICACIONES
  INSERT INTO notificaciones(usuario_id,tipo,titulo,mensaje,leida,url,created_at) VALUES
  (pid,'success','Reserva confirmada','Tu reserva ADV-2026-006 en Hotel Adventur Plaza ha sido confirmada.',false,'/reservas',NOW()-INTERVAL '2 days'),
  (pid,'success','Pago recibido','Hemos recibido tu pago de S/ 315.00 para la reserva ADV-2026-006.',true,'/pagos',NOW()-INTERVAL '2 days'),
  (pid,'info','Check-in mañana','Recuerda que tu check-in en Hotel Adventur Plaza es mañana a las 14:00.',false,'/reservas',NOW()-INTERVAL '1 day'),
  (pid,'warning','Reserva pendiente de pago','Tu reserva ADV-2026-007 está pendiente de pago del adelanto (S/ 192.00).',false,'/pagos',NOW()-INTERVAL '1 day'),
  (pid,'info','Reseña aprobada','Tu reseña sobre Casa Romántica Las Orquídeas ha sido aprobada y publicada.',true,'/reservas',NOW()-INTERVAL '6 days'),
  (pid,'success','Bienvenido a Adventur','Gracias por registrarte. Explora nuestros alojamientos.',true,'/',NOW()-INTERVAL '30 days');

  -- COMPROBANTES
  INSERT INTO comprobantes(tipo,serie,numero,reserva_id,usuario_id,cliente_tipo_documento,cliente_numero_documento,cliente_denominacion,cliente_email,subtotal,igv,total,aceptada_sunat,fecha_emision) VALUES
  ('boleta','B001',1,r1,pid,'1','12345678','Luis Carranza García','admin@gmail.com', 305.08, 54.92,360.00,true,NOW()-INTERVAL '42 days'),
  ('boleta','B001',2,r2,pid,'1','12345678','Luis Carranza García','admin@gmail.com', 457.63, 82.37,540.00,true,NOW()-INTERVAL '27 days'),
  ('factura','F001',1,r3,pid,'6','20608201747','EMPRESA TURISMO SAC','conta@empresa.com',593.22,106.78,700.00,true,NOW()-INTERVAL '13 days'),
  ('boleta','B001',3,r4,pid,'1','12345678','Luis Carranza García','admin@gmail.com', 474.58, 85.42,560.00,true,NOW()-INTERVAL '8 days');

  RAISE NOTICE '✅ Seed completo. Reservas:8 Pagos:12 Reseñas:4 Notificaciones:6 Comprobantes:4';
END $$;
