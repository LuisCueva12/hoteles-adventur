-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS public.resenas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alojamiento_id UUID NOT NULL REFERENCES public.alojamientos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reserva_id UUID REFERENCES public.reservas(id) ON DELETE SET NULL,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    titulo VARCHAR(200),
    comentario TEXT NOT NULL,
    respuesta_admin TEXT,
    fecha_respuesta TIMESTAMP WITH TIME ZONE,
    verificado BOOLEAN DEFAULT FALSE,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, alojamiento_id, reserva_id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_resenas_alojamiento ON public.resenas(alojamiento_id);
CREATE INDEX IF NOT EXISTS idx_resenas_usuario ON public.resenas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_resenas_visible ON public.resenas(visible);
CREATE INDEX IF NOT EXISTS idx_resenas_calificacion ON public.resenas(calificacion);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_resenas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resenas_updated_at
    BEFORE UPDATE ON public.resenas
    FOR EACH ROW
    EXECUTE FUNCTION update_resenas_updated_at();

-- RLS Policies
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver reseñas visibles
CREATE POLICY "Reseñas visibles son públicas"
    ON public.resenas FOR SELECT
    USING (visible = true);

-- Usuarios autenticados pueden crear reseñas
CREATE POLICY "Usuarios pueden crear reseñas"
    ON public.resenas FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

-- Usuarios pueden editar sus propias reseñas
CREATE POLICY "Usuarios pueden editar sus reseñas"
    ON public.resenas FOR UPDATE
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

-- Usuarios pueden eliminar sus propias reseñas
CREATE POLICY "Usuarios pueden eliminar sus reseñas"
    ON public.resenas FOR DELETE
    USING (auth.uid() = usuario_id);

-- Admins pueden ver todas las reseñas
CREATE POLICY "Admins pueden ver todas las reseñas"
    ON public.resenas FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'admin'
        )
    );

-- Admins pueden actualizar cualquier reseña
CREATE POLICY "Admins pueden actualizar reseñas"
    ON public.resenas FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'admin'
        )
    );

-- Vista para estadísticas de reseñas por alojamiento
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

-- Función para verificar si un usuario puede dejar reseña
CREATE OR REPLACE FUNCTION puede_dejar_resena(
    p_usuario_id UUID,
    p_alojamiento_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar si tiene una reserva completada
    RETURN EXISTS (
        SELECT 1 FROM public.reservas
        WHERE usuario_id = p_usuario_id
        AND alojamiento_id = p_alojamiento_id
        AND estado = 'completada'
        AND fecha_fin < NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.resenas IS 'Reseñas y calificaciones de alojamientos';
COMMENT ON VIEW public.estadisticas_resenas IS 'Estadísticas agregadas de reseñas por alojamiento';
