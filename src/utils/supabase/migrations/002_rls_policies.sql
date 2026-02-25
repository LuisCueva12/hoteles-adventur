ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alojamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_alojamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE opiniones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select_own" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "usuarios_insert_own" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "usuarios_update_own" ON usuarios FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin_adventur'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "usuarios_admin_all" ON usuarios FOR ALL
  USING (public.is_admin());

-- alojamientos: todos pueden ver los activos
CREATE POLICY "alojamientos_select_public" ON alojamientos FOR SELECT USING (activo = true);
CREATE POLICY "alojamientos_insert_propietario" ON alojamientos FOR INSERT
  WITH CHECK (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_update_propietario" ON alojamientos FOR UPDATE
  USING (auth.uid() = propietario_id);
CREATE POLICY "alojamientos_delete_propietario" ON alojamientos FOR DELETE
  USING (auth.uid() = propietario_id);

-- fotos: asociadas al alojamiento del propietario
CREATE POLICY "fotos_select_public" ON fotos_alojamiento FOR SELECT USING (true);
CREATE POLICY "fotos_insert_propietario" ON fotos_alojamiento FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));
CREATE POLICY "fotos_delete_propietario" ON fotos_alojamiento FOR DELETE
  USING (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));

-- disponibilidad: pública para ver, propietario para editar
CREATE POLICY "disponibilidad_select_public" ON disponibilidad FOR SELECT USING (true);
CREATE POLICY "disponibilidad_manage_propietario" ON disponibilidad FOR ALL
  USING (EXISTS (SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()));

-- reservas: usuario ve las suyas, propietario ve las de sus alojamientos
CREATE POLICY "reservas_select_usuario" ON reservas FOR SELECT
  USING (auth.uid() = usuario_id OR EXISTS (
    SELECT 1 FROM alojamientos WHERE id = alojamiento_id AND propietario_id = auth.uid()
  ));
CREATE POLICY "reservas_insert_usuario" ON reservas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "reservas_update_usuario" ON reservas FOR UPDATE USING (auth.uid() = usuario_id);

-- pagos: usuario ve los suyos, propietario ve los de sus reservas
CREATE POLICY "pagos_select_own" ON pagos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM reservas WHERE id = reserva_id AND (
      usuario_id = auth.uid() OR
      EXISTS (SELECT 1 FROM alojamientos WHERE id = reservas.alojamiento_id AND propietario_id = auth.uid())
    )
  ));
CREATE POLICY "pagos_insert_usuario" ON pagos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reservas WHERE id = reserva_id AND usuario_id = auth.uid()));

-- opiniones: públicas para leer, usuario crea la suya
CREATE POLICY "opiniones_select_public" ON opiniones FOR SELECT USING (true);
CREATE POLICY "opiniones_insert_usuario" ON opiniones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "opiniones_update_usuario" ON opiniones FOR UPDATE USING (auth.uid() = usuario_id);
