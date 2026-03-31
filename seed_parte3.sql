-- ============================================================
-- SEED PARTE 3 - reservas, pagos, comprobantes,
--                resenas, opiniones, notificaciones
-- Ejecutar DESPUÉS de seed_parte2.sql
-- ============================================================

-- RESERVAS
INSERT INTO reservas (id, alojamiento_id, huesped_id, fecha_inicio, fecha_fin, num_huespedes, precio_total, estado, notas_huesped)
VALUES
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM usuarios LIMIT 1), CURRENT_DATE - 30, CURRENT_DATE - 27, 4, 540.00, 'completada', 'Llegamos tarde, gracias por esperarnos'),
  ('b0000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid, (SELECT id FROM usuarios LIMIT 1), CURRENT_DATE - 20, CURRENT_DATE - 18, 2, 640.00, 'completada', 'Habitación con vista al Qorikancha por favor'),
  ('b0000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid, (SELECT id FROM usuarios LIMIT 1), CURRENT_DATE - 10, CURRENT_DATE - 7,  8, 1260.00, 'completada', 'Reunión familiar, necesitamos BBQ'),
  ('b0000000-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM usuarios LIMIT 1), CURRENT_DATE + 5,  CURRENT_DATE + 8,  2, 750.00, 'confirmada', 'Primera vez en la selva, muy emocionados'),
  ('b0000000-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000007'::uuid, (SELECT id FROM usuarios LIMIT 1), CURRENT_DATE + 15, CURRENT_DATE + 18, 3, 1140.00, 'confirmada', 'Queremos ver el vuelo del cóndor al amanecer'),
  ('b0000000-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000005'::uuid, (SELECT id FROM usuarios LIMIT 1), CURRENT_DATE + 25, CURRENT_DATE + 27, 2, 280.00, 'pendiente', 'Aniversario de bodas'),
  ('b0000000-0000-0000-0000-000000000007'::uuid, 'a0000000-0000-0000-0000-000000000008'::uuid, (SELECT id FROM usuarios LIMIT 1), CURRENT_DATE - 5,  CURRENT_DATE - 3,  1, 190.00, 'completada', NULL),
  ('b0000000-0000-0000-0000-000000000008'::uuid, 'a0000000-0000-0000-0000-000000000010'::uuid, (SELECT id FROM usuarios LIMIT 1), CURRENT_DATE + 30, CURRENT_DATE + 33, 4, 480.00, 'pendiente', 'Queremos aprender a tejer con totora')
ON CONFLICT (id) DO NOTHING;

-- PAGOS
INSERT INTO pagos (id, reserva_id, monto, metodo_pago, estado, referencia_externa)
VALUES
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000001'::uuid, 540.00, 'tarjeta', 'completado', 'PAY-TJ-001-2024'),
  ('c0000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, 640.00, 'tarjeta', 'completado', 'PAY-TJ-002-2024'),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 'b0000000-0000-0000-0000-000000000003'::uuid, 1260.00, 'transferencia', 'completado', 'PAY-TR-003-2024'),
  ('c0000000-0000-0000-0000-000000000004'::uuid, 'b0000000-0000-0000-0000-000000000004'::uuid, 750.00, 'tarjeta', 'completado', 'PAY-TJ-004-2024'),
  ('c0000000-0000-0000-0000-000000000005'::uuid, 'b0000000-0000-0000-0000-000000000005'::uuid, 1140.00, 'yape', 'completado', 'PAY-YP-005-2024'),
  ('c0000000-0000-0000-0000-000000000006'::uuid, 'b0000000-0000-0000-0000-000000000006'::uuid, 280.00, 'tarjeta', 'pendiente', NULL),
  ('c0000000-0000-0000-0000-000000000007'::uuid, 'b0000000-0000-0000-0000-000000000007'::uuid, 190.00, 'efectivo', 'completado', 'PAY-EF-007-2024'),
  ('c0000000-0000-0000-0000-000000000008'::uuid, 'b0000000-0000-0000-0000-000000000008'::uuid, 480.00, 'plin', 'pendiente', NULL)
ON CONFLICT (id) DO NOTHING;

-- COMPROBANTES
INSERT INTO comprobantes (id, pago_id, tipo, serie, numero, ruc_emisor, razon_social_emisor, ruc_receptor, razon_social_receptor, monto_base, igv, monto_total, estado, pdf_url)
VALUES
  ('d0000000-0000-0000-0000-000000000001'::uuid, 'c0000000-0000-0000-0000-000000000001'::uuid, 'boleta', 'B001', 1, '20601234567', 'ADVENTUR HOTELS SAC', NULL, 'Carlos Mendoza', 457.63, 82.37, 540.00, 'emitido', 'https://storage.example.com/comprobantes/B001-1.pdf'),
  ('d0000000-0000-0000-0000-000000000002'::uuid, 'c0000000-0000-0000-0000-000000000002'::uuid, 'boleta', 'B001', 2, '20601234567', 'ADVENTUR HOTELS SAC', NULL, 'Carlos Mendoza', 542.37, 97.63, 640.00, 'emitido', 'https://storage.example.com/comprobantes/B001-2.pdf'),
  ('d0000000-0000-0000-0000-000000000003'::uuid, 'c0000000-0000-0000-0000-000000000003'::uuid, 'factura', 'F001', 1, '20601234567', 'ADVENTUR HOTELS SAC', '20512345678', 'EMPRESA FAMILIAR SAC', 1067.80, 192.20, 1260.00, 'emitido', 'https://storage.example.com/comprobantes/F001-1.pdf'),
  ('d0000000-0000-0000-0000-000000000004'::uuid, 'c0000000-0000-0000-0000-000000000007'::uuid, 'boleta', 'B001', 3, '20601234567', 'ADVENTUR HOTELS SAC', NULL, 'Carlos Mendoza', 161.02, 28.98, 190.00, 'emitido', 'https://storage.example.com/comprobantes/B001-3.pdf')
ON CONFLICT (id) DO NOTHING;

-- RESEÑAS
INSERT INTO resenas (id, alojamiento_id, usuario_id, reserva_id, calificacion, comentario, aprobada)
VALUES
  ('e0000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM usuarios LIMIT 1), 'b0000000-0000-0000-0000-000000000001'::uuid, 5, 'Lugar mágico. La cabaña es exactamente como en las fotos, muy limpia y acogedora. La chimenea fue perfecta para las noches frías. Definitivamente volvemos.', true),
  ('e0000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid, (SELECT id FROM usuarios LIMIT 1), 'b0000000-0000-0000-0000-000000000002'::uuid, 5, 'Hotel boutique increíble. La ubicación es inmejorable, a pasos de la Plaza de Armas. El desayuno buffet con productos locales fue espectacular. El personal muy atento.', true),
  ('e0000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid, (SELECT id FROM usuarios LIMIT 1), 'b0000000-0000-0000-0000-000000000003'::uuid, 4, 'Casa perfecta para la familia. La piscina y el acceso directo a la playa son lo mejor. Solo le faltaría un poco más de utensilios en la cocina, pero en general excelente.', true),
  ('e0000000-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000008'::uuid, (SELECT id FROM usuarios LIMIT 1), 'b0000000-0000-0000-0000-000000000007'::uuid, 4, 'Hostal muy bien ubicado en Miraflores. Limpio, cómodo y con buen WiFi. El desayuno es sencillo pero suficiente. Ideal para viajeros que quieren explorar Lima.', true)
ON CONFLICT (id) DO NOTHING;

-- OPINIONES (blog/foro)
INSERT INTO opiniones (id, usuario_id, titulo, contenido, categoria, publicado)
VALUES
  ('f0000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM usuarios LIMIT 1), 'Los mejores destinos de naturaleza en Perú 2024', 'Después de recorrer varios lodges y cabañas por todo el país, puedo decir que Oxapampa y el Cañón del Colca son mis favoritos. La biodiversidad es impresionante y los alojamientos han mejorado mucho en calidad.', 'viajes', true),
  ('f0000000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM usuarios LIMIT 1), 'Consejos para viajar al Lago Titicaca', 'El Lago Titicaca es una experiencia única. Recomiendo quedarse al menos 2 noches en las islas flotantes para vivir la cultura aymara de verdad. Llevar ropa abrigada incluso en verano.', 'consejos', true),
  ('f0000000-0000-0000-0000-000000000003'::uuid, (SELECT id FROM usuarios LIMIT 1), 'Guía completa para visitar Cusco', 'Cusco merece al menos 4 días. El primer día es para aclimatarse, el segundo para la ciudad, el tercero para el Valle Sagrado y el cuarto para Machu Picchu. No olviden el mate de coca.', 'guias', true)
ON CONFLICT (id) DO NOTHING;

-- NOTIFICACIONES
INSERT INTO notificaciones (id, usuario_id, tipo, titulo, mensaje, leida, datos_extra)
VALUES
  ('g0000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM usuarios LIMIT 1), 'reserva_confirmada', 'Reserva confirmada', 'Tu reserva en EcoLodge Amazonas Verde del 22 al 25 de este mes ha sido confirmada. ¡Prepárate para la aventura!', false, '{"reserva_id":"b0000000-0000-0000-0000-000000000004","alojamiento":"EcoLodge Amazonas Verde"}'),
  ('g0000000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM usuarios LIMIT 1), 'reserva_confirmada', 'Reserva confirmada', 'Tu reserva en Lodge Colca Canyon View ha sido confirmada. Recuerda llevar ropa abrigada.', false, '{"reserva_id":"b0000000-0000-0000-0000-000000000005","alojamiento":"Lodge Colca Canyon View"}'),
  ('g0000000-0000-0000-0000-000000000003'::uuid, (SELECT id FROM usuarios LIMIT 1), 'pago_recibido', 'Pago procesado', 'Hemos recibido tu pago de S/ 750.00 para la reserva en EcoLodge Amazonas Verde. Tu comprobante estará disponible pronto.', true, '{"pago_id":"c0000000-0000-0000-0000-000000000004","monto":750.00}'),
  ('g0000000-0000-0000-0000-000000000004'::uuid, (SELECT id FROM usuarios LIMIT 1), 'resena_aprobada', 'Tu reseña fue publicada', 'Tu reseña sobre Cabaña El Bosque Encantado ha sido aprobada y ya es visible para otros viajeros. ¡Gracias por compartir tu experiencia!', true, '{"resena_id":"e0000000-0000-0000-0000-000000000001"}'),
  ('g0000000-0000-0000-0000-000000000005'::uuid, (SELECT id FROM usuarios LIMIT 1), 'oferta_especial', 'Oferta especial para ti', '¡20% de descuento en tu próxima reserva en Hostal Romántico Arequipa! Válido hasta fin de mes. Usa el código ADVENTUR20.', false, '{"descuento":20,"codigo":"ADVENTUR20","alojamiento_id":"a0000000-0000-0000-0000-000000000005"}'),
  ('g0000000-0000-0000-0000-000000000006'::uuid, (SELECT id FROM usuarios LIMIT 1), 'recordatorio', 'Tu viaje es pronto', 'Recuerda que tu reserva en Hostal Romántico Arequipa comienza en 25 días. ¿Necesitas ayuda con el traslado o actividades?', false, '{"reserva_id":"b0000000-0000-0000-0000-000000000006","dias_restantes":25}')
ON CONFLICT (id) DO NOTHING;
