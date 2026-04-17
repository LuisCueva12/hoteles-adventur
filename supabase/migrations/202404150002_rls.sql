-- ROW LEVEL SECURITY Y POLÍTICAS
-- Ejecutar con: supabase db push

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alojamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_alojamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE opiniones ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "usuarios_select_own" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "usuarios_insert_own" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "usuarios_update_own" ON usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "usuarios_admin_all" ON usuarios FOR ALL USING (public.is_admin());

-- Políticas para alojamientos
CREATE POLICY "alojamientos_select_public" ON alojamientos FOR SELECT USING (activo = true);
CREATE POLICY "alojamientos_insert_propietario" ON alojamientos FOR INSERT WITH CHECK (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_update_propietario" ON alojamientos FOR UPDATE USING (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_delete_propietario" ON alojamientos FOR DELETE USING (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_admin_all" ON alojamientos FOR ALL USING (public.is_admin());

-- Políticas para fotos
CREATE POLICY "fotos_select_public" ON fotos_alojamiento FOR SELECT USING (true);
CREATE POLICY "fotos_insert_propietario" ON fotos_alojamiento FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "fotos_delete_propietario" ON fotos_alojamiento FOR DELETE 
  USING (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "fotos_admin_all" ON fotos_alojamiento FOR ALL USING (public.is_admin());

-- Políticas para disponibilidad
CREATE POLICY "disponibilidad_select_public" ON disponibilidad FOR SELECT USING (true);
CREATE POLICY "disponibilidad_manage_propietario" ON disponibilidad FOR ALL 
  USING (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "disponibilidad_admin_all" ON disponibilidad FOR ALL USING (public.is_admin());

-- Políticas para reservas
CREATE POLICY "reservas_select_usuario" ON reservas FOR SELECT 
  USING (auth.uid() = usuario_id OR EXISTS (
    SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()
  ));
CREATE POLICY "reservas_insert_usuario" ON reservas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "reservas_update_usuario" ON reservas FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "reservas_admin_all" ON reservas FOR ALL USING (public.is_admin());

-- Políticas para pagos
CREATE POLICY "pagos_select_own" ON pagos FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM reservas WHERE id = reserva_id AND (
      usuario_id = auth.uid() OR
      EXISTS (SELECT 1 FROM alojamientos WHERE id = reservas.alojamiento_id AND propietario_id = auth.uid())
    )
  ));
CREATE POLICY "pagos_insert_usuario" ON pagos FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM reservas WHERE id = reserva_id AND usuario_id = auth.uid()));
CREATE POLICY "pagos_admin_all" ON pagos FOR ALL USING (public.is_admin());

-- Políticas para opiniones
CREATE POLICY "opiniones_select_public" ON opiniones FOR SELECT USING (true);
CREATE POLICY "opiniones_insert_usuario" ON opiniones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "opiniones_update_usuario" ON opiniones FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "opiniones_admin_all" ON opiniones FOR ALL USING (public.is_admin());

-- Políticas para resenas
CREATE POLICY "resenas_publicas" ON resenas FOR SELECT USING (visible = true);
CREATE POLICY "resenas_crear" ON resenas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "resenas_editar_propias" ON resenas FOR UPDATE 
  USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "resenas_admin_all" ON resenas FOR ALL USING (public.is_admin());

-- Políticas para notificaciones
CREATE POLICY "notificaciones_propias" ON notificaciones FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "notificaciones_admin_all" ON notificaciones FOR ALL USING (public.is_admin());

-- Políticas para configuración
CREATE POLICY "configuracion_public_read" ON configuracion FOR SELECT USING (true);
CREATE POLICY "configuracion_admin_write" ON configuracion FOR ALL USING (public.is_admin());

-- Políticas para comprobantes
CREATE POLICY "comprobantes_propios" ON comprobantes FOR SELECT 
  USING (auth.uid() = usuario_id OR EXISTS (
    SELECT 1 FROM reservas r WHERE r.id = comprobantes.reserva_id AND (
      r.usuario_id = auth.uid() OR
      EXISTS (SELECT 1 FROM alojamientos WHERE id = r.alojamiento_id AND propietario_id = auth.uid())
    )
  ));
CREATE POLICY "comprobantes_admin_all" ON comprobantes FOR ALL USING (public.is_admin());
