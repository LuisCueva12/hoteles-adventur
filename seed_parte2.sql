-- ============================================================
-- SEED PARTE 2 - fotos, disponibilidad, reservas, pagos,
--                comprobantes, reseñas, opiniones, notificaciones
-- Ejecutar DESPUÉS de seed_datos.sql
-- ============================================================

-- FOTOS
INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
('a0000000-0000-0000-0000-000000000001'::uuid, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800', true),
('a0000000-0000-0000-0000-000000000001'::uuid, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', false),
('a0000000-0000-0000-0000-000000000001'::uuid, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800', false),
('a0000000-0000-0000-0000-000000000002'::uuid, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', true),
('a0000000-0000-0000-0000-000000000002'::uuid, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', false),
('a0000000-0000-0000-0000-000000000002'::uuid, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', false),
('a0000000-0000-0000-0000-000000000003'::uuid, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', true),
('a0000000-0000-0000-0000-000000000003'::uuid, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', false),
('a0000000-0000-0000-0000-000000000003'::uuid, 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', false),
('a0000000-0000-0000-0000-000000000004'::uuid, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', true),
('a0000000-0000-0000-0000-000000000004'::uuid, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', false),
('a0000000-0000-0000-0000-000000000004'::uuid, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', false),
('a0000000-0000-0000-0000-000000000005'::uuid, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', true),
('a0000000-0000-0000-0000-000000000005'::uuid, 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', false),
('a0000000-0000-0000-0000-000000000006'::uuid, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', true),
('a0000000-0000-0000-0000-000000000006'::uuid, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800', false),
('a0000000-0000-0000-0000-000000000007'::uuid, 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800', true),
('a0000000-0000-0000-0000-000000000007'::uuid, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', false),
('a0000000-0000-0000-0000-000000000007'::uuid, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', false),
('a0000000-0000-0000-0000-000000000008'::uuid, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', true),
('a0000000-0000-0000-0000-000000000008'::uuid, 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800', false),
('a0000000-0000-0000-0000-000000000009'::uuid, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', true),
('a0000000-0000-0000-0000-000000000009'::uuid, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', false),
('a0000000-0000-0000-0000-000000000010'::uuid, 'https://images.unsplash.com/photo-1439853949212-36589f9f7458?w=800', true),
('a0000000-0000-0000-0000-000000000010'::uuid, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', false);

-- DISPONIBILIDAD (90 días para todos)
INSERT INTO disponibilidad (alojamiento_id, fecha, disponible, precio)
SELECT a.id, CURRENT_DATE + s.i, true, a.precio_base
FROM alojamientos a
CROSS JOIN generate_series(0, 90) AS s(i)
ON CONFLICT (alojamiento_id, fecha) DO NOTHING;

-- Algunos días bloqueados
UPDATE disponibilidad SET disponible = false WHERE alojamiento_id = 'a0000000-0000-0000-0000-000000000001'::uuid AND fecha BETWEEN CURRENT_DATE+5  AND CURRENT_DATE+8;
UPDATE disponibilidad SET disponible = false WHERE alojamiento_id = 'a0000000-0000-0000-0000-000000000003'::uuid AND fecha BETWEEN CURRENT_DATE+2  AND CURRENT_DATE+4;
UPDATE disponibilidad SET disponible = false WHERE alojamiento_id = 'a0000000-0000-0000-0000-000000000004'::uuid AND fecha BETWEEN CURRENT_DATE+10 AND CURRENT_DATE+15;
UPDATE disponibilidad SET disponible = false WHERE alojamiento_id = 'a0000000-0000-0000-0000-000000000007'::uuid AND fecha BETWEEN CURRENT_DATE+20 AND CURRENT_DATE+23;
