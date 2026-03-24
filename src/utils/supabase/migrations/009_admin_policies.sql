-- Permisos ampliados para administradores en el panel

DROP POLICY IF EXISTS "alojamientos_admin_all" ON alojamientos;
CREATE POLICY "alojamientos_admin_all" ON alojamientos
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "fotos_admin_all" ON fotos_alojamiento;
CREATE POLICY "fotos_admin_all" ON fotos_alojamiento
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "disponibilidad_admin_all" ON disponibilidad;
CREATE POLICY "disponibilidad_admin_all" ON disponibilidad
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reservas_admin_all" ON reservas;
CREATE POLICY "reservas_admin_all" ON reservas
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "pagos_admin_all" ON pagos;
CREATE POLICY "pagos_admin_all" ON pagos
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "opiniones_admin_all" ON opiniones;
CREATE POLICY "opiniones_admin_all" ON opiniones
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notificaciones_admin_all" ON notificaciones;
CREATE POLICY "notificaciones_admin_all" ON notificaciones
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
