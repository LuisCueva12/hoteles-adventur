-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('success', 'warning', 'info', 'error')),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    url VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_created ON notificaciones(created_at DESC);

-- RLS Policies
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Los usuarios pueden ver sus notificaciones"
    ON notificaciones FOR SELECT
    USING (auth.uid() = usuario_id);

-- Los usuarios pueden actualizar sus propias notificaciones (marcar como leída)
CREATE POLICY "Los usuarios pueden actualizar sus notificaciones"
    ON notificaciones FOR UPDATE
    USING (auth.uid() = usuario_id);

-- Los usuarios pueden eliminar sus propias notificaciones
CREATE POLICY "Los usuarios pueden eliminar sus notificaciones"
    ON notificaciones FOR DELETE
    USING (auth.uid() = usuario_id);

-- Solo el sistema puede crear notificaciones (usando service role)
CREATE POLICY "El sistema puede crear notificaciones"
    ON notificaciones FOR INSERT
    WITH CHECK (true);

-- Función para limpiar notificaciones antiguas (más de 30 días)
CREATE OR REPLACE FUNCTION limpiar_notificaciones_antiguas()
RETURNS void AS $$
BEGIN
    DELETE FROM notificaciones
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_notificaciones_updated_at
    BEFORE UPDATE ON notificaciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- Función para crear notificación de nueva reserva
CREATE OR REPLACE FUNCTION notificar_nueva_reserva()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
    alojamiento_nombre VARCHAR;
    usuario_nombre VARCHAR;
BEGIN
    -- Obtener nombre del alojamiento
    SELECT nombre INTO alojamiento_nombre
    FROM alojamientos
    WHERE id = NEW.alojamiento_id;

    -- Obtener nombre del usuario
    SELECT nombre || ' ' || apellido INTO usuario_nombre
    FROM usuarios
    WHERE id = NEW.usuario_id;

    -- Notificar a todos los administradores
    FOR admin_id IN 
        SELECT id FROM usuarios WHERE rol = 'admin_adventur'
    LOOP
        INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, url, metadata)
        VALUES (
            admin_id,
            'success',
            'Nueva reserva confirmada',
            usuario_nombre || ' ha confirmado su reserva para ' || alojamiento_nombre,
            '/admin/reservas',
            jsonb_build_object('reserva_id', NEW.id, 'tipo', 'reserva')
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notificar_nueva_reserva
    AFTER INSERT ON reservas
    FOR EACH ROW
    WHEN (NEW.estado = 'confirmada')
    EXECUTE FUNCTION notificar_nueva_reserva();

-- Función para crear notificación de nuevo usuario
CREATE OR REPLACE FUNCTION notificar_nuevo_usuario()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Notificar a todos los administradores
    FOR admin_id IN 
        SELECT id FROM usuarios WHERE rol = 'admin_adventur'
    LOOP
        INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, url, metadata)
        VALUES (
            admin_id,
            'info',
            'Nuevo usuario registrado',
            NEW.nombre || ' ' || NEW.apellido || ' se ha registrado en la plataforma',
            '/admin/usuarios',
            jsonb_build_object('usuario_id', NEW.id, 'tipo', 'usuario')
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notificar_nuevo_usuario
    AFTER INSERT ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION notificar_nuevo_usuario();

-- Función para crear notificación de pago pendiente
CREATE OR REPLACE FUNCTION notificar_pago_pendiente()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
    reserva_codigo VARCHAR;
BEGIN
    -- Obtener código de reserva
    SELECT 'RES-' || LPAD(id::TEXT, 6, '0') INTO reserva_codigo
    FROM reservas
    WHERE id = NEW.reserva_id;

    -- Notificar a todos los administradores
    FOR admin_id IN 
        SELECT id FROM usuarios WHERE rol = 'admin_adventur'
    LOOP
        INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, url, metadata)
        VALUES (
            admin_id,
            'warning',
            'Pago pendiente',
            'La reserva ' || reserva_codigo || ' tiene un pago pendiente de confirmación',
            '/admin/reservas',
            jsonb_build_object('pago_id', NEW.id, 'reserva_id', NEW.reserva_id, 'tipo', 'pago')
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notificar_pago_pendiente
    AFTER INSERT ON pagos
    FOR EACH ROW
    WHEN (NEW.estado = 'pendiente')
    EXECUTE FUNCTION notificar_pago_pendiente();
