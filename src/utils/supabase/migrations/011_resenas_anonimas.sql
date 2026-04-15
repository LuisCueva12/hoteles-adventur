-- Permitir reseñas anónimas (sin usuario_id)
ALTER TABLE public.resenas
    ALTER COLUMN usuario_id DROP NOT NULL;

-- Agregar campos para autor anónimo
ALTER TABLE public.resenas
    ADD COLUMN IF NOT EXISTS nombre_autor VARCHAR(120),
    ADD COLUMN IF NOT EXISTS email_autor VARCHAR(200);

-- Política para que la API (service role) pueda insertar sin usuario
-- El service role bypasea RLS por defecto, no se necesita política adicional

-- Actualizar vista de estadísticas (sin cambios, solo recrear por si acaso)
CREATE OR REPLACE VIEW public.estadisticas_resenas AS
SELECT
    alojamiento_id,
    COUNT(*) as total_resenas,
    AVG(calificacion)::NUMERIC(3,2) as calificacion_promedio,
    COUNT(CASE WHEN calificacion = 5 THEN 1 END) as cinco_estrellas,
    COUNT(CASE WHEN calificacion = 4 THEN 1 END) as cuatro_estrellas,
    COUNT(CASE WHEN calificacion = 3 THEN 1 END) as tres_estrellas,
    COUNT(CASE WHEN calificacion = 2 THEN 1 END) as dos_estrellas,
    COUNT(CASE WHEN calificacion = 1 THEN 1 END) as una_estrella
FROM public.resenas
WHERE visible = true
GROUP BY alojamiento_id;
