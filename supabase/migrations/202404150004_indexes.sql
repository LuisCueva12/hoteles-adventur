-- ÍNDICES PARA OPTIMIZACIÓN
-- Ejecutar con: supabase db push

-- Índices para alojamientos
CREATE INDEX idx_alojamientos_propietario ON alojamientos(propietario_id);
CREATE INDEX idx_alojamientos_busqueda ON alojamientos(departamento, provincia, distrito, categoria, tipo);
CREATE INDEX idx_alojamientos_activos ON alojamientos(activo) WHERE activo = true;
CREATE INDEX idx_alojamientos_categoria ON alojamientos(categoria);
CREATE INDEX idx_alojamientos_tipo ON alojamientos(tipo);

-- Índices para fotos
CREATE INDEX idx_fotos_alojamiento ON fotos_alojamiento(alojamiento_id);
CREATE INDEX idx_fotos_principal ON fotos_alojamiento(es_principal) WHERE es_principal = true;

-- Índices para disponibilidad
CREATE INDEX idx_disponibilidad_alojamiento_fecha ON disponibilidad(alojamiento_id, fecha);
CREATE INDEX idx_disponibilidad_disponible ON disponibilidad(disponible, fecha) WHERE disponible = true;

-- Índices para reservas
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_alojamiento ON reservas(alojamiento_id);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX idx_reservas_fechas ON reservas(fecha_inicio, fecha_fin);

-- Índices para pagos
CREATE INDEX idx_pagos_reserva ON pagos(reserva_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);

-- Índices para opiniones
CREATE INDEX idx_opiniones_usuario ON opiniones(usuario_id);
CREATE INDEX idx_opiniones_alojamiento ON opiniones(alojamiento_id);
CREATE INDEX idx_opiniones_fecha ON opiniones(fecha);

-- Índices para resenas
CREATE INDEX idx_resenas_alojamiento ON resenas(alojamiento_id);
CREATE INDEX idx_resenas_usuario ON resenas(usuario_id);
CREATE INDEX idx_resenas_visible ON resenas(visible) WHERE visible = true;
CREATE INDEX idx_resenas_fecha ON resenas(created_at);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida) WHERE leida = false;
CREATE INDEX idx_notificaciones_fecha ON notificaciones(created_at);

-- Índices para comprobantes
CREATE INDEX idx_comprobantes_reserva ON comprobantes(reserva_id);
CREATE INDEX idx_comprobantes_usuario ON comprobantes(usuario_id);
CREATE INDEX idx_comprobantes_tipo ON comprobantes(tipo);
CREATE INDEX idx_comprobantes_fecha ON comprobantes(fecha_emision);
