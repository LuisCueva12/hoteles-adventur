-- ============================================================
-- SEED: ~100 fotos distribuidas en los 8 alojamientos
-- Ejecutar DESPUÉS de seed_alojamientos.sql
-- ============================================================

DO $$
DECLARE
  a1 uuid; a2 uuid; a3 uuid; a4 uuid;
  a5 uuid; a6 uuid; a7 uuid; a8 uuid;
BEGIN

  -- Obtener IDs de los alojamientos por nombre
  SELECT id INTO a1 FROM alojamientos WHERE nombre = 'Cabaña Los Pinos'           LIMIT 1;
  SELECT id INTO a2 FROM alojamientos WHERE nombre = 'EcoLodge Amazonas Verde'    LIMIT 1;
  SELECT id INTO a3 FROM alojamientos WHERE nombre = 'Hotel Adventur Plaza'       LIMIT 1;
  SELECT id INTO a4 FROM alojamientos WHERE nombre = 'Hostal El Mirador'          LIMIT 1;
  SELECT id INTO a5 FROM alojamientos WHERE nombre = 'Casa Romántica Las Orquídeas' LIMIT 1;
  SELECT id INTO a6 FROM alojamientos WHERE nombre = 'Cabaña Premium Cumbre Andina' LIMIT 1;
  SELECT id INTO a7 FROM alojamientos WHERE nombre = 'EcoLodge Familia Feliz'     LIMIT 1;
  SELECT id INTO a8 FROM alojamientos WHERE nombre = 'Hostal Centro Histórico'    LIMIT 1;

  IF a1 IS NULL OR a2 IS NULL OR a3 IS NULL OR a4 IS NULL THEN
    RAISE EXCEPTION 'No se encontraron los alojamientos. Ejecuta seed_alojamientos.sql primero.';
  END IF;

  -- ── 1. Cabaña Los Pinos (~13 fotos) ─────────────────────────────────
  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a1, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80', true),
    (a1, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80', false),
    (a1, 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80', false);

  -- ── 2. EcoLodge Amazonas Verde (~13 fotos) ──────────────────────────
  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a2, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', true),
    (a2, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1540541338537-1220059af4dc?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1439853949212-36589f9f4505?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1200&q=80', false),
    (a2, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1200&q=80', false);

  -- ── 3. Hotel Adventur Plaza (~14 fotos) ─────────────────────────────
  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a3, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', true),
    (a3, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80', false),
    (a3, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80', false);

  -- ── 4. Hostal El Mirador (~12 fotos) ────────────────────────────────
  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a4, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80', true),
    (a4, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80', false),
    (a4, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', false);

  -- ── 5. Casa Romántica Las Orquídeas (~12 fotos) ──────────────────────
  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a5, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80', true),
    (a5, 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80', false),
    (a5, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', false);

  -- ── 6. Cabaña Premium Cumbre Andina (~13 fotos) ──────────────────────
  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a6, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80', true),
    (a6, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', false),
    (a6, 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80', false);

  -- ── 7. EcoLodge Familia Feliz (~12 fotos) ───────────────────────────
  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a7, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', true),
    (a7, 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1439853949212-36589f9f4505?w=1200&q=80', false),
    (a7, 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1200&q=80', false);

  -- ── 8. Hostal Centro Histórico (~12 fotos) ──────────────────────────
  INSERT INTO fotos_alojamiento (alojamiento_id, url, es_principal) VALUES
    (a8, 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200&q=80', true),
    (a8, 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', false),
    (a8, 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&q=80', false);

  RAISE NOTICE 'Fotos insertadas: ~101 fotos distribuidas en 8 alojamientos.';

END $$;
