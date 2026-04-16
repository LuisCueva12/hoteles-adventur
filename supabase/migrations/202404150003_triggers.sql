-- TRIGGERS Y FUNCIONES
-- Ejecutar con: supabase db push

-- Trigger para validar disponibilidad
CREATE OR REPLACE FUNCTION validar_disponibilidad()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reservas
    WHERE alojamiento_id = NEW.alojamiento_id
      AND estado = 'confirmada'
      AND (NEW.fecha_inicio < fecha_fin AND NEW.fecha_fin > fecha_inicio)
  ) THEN
    RAISE EXCEPTION 'Fechas no disponibles';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_disponibilidad
  BEFORE INSERT ON reservas
  FOR EACH ROW EXECUTE FUNCTION validar_disponibilidad();

-- Trigger para confirmar reserva por pago
CREATE OR REPLACE FUNCTION confirmar_reserva_por_pago()
RETURNS trigger AS $$
DECLARE adelanto_reserva numeric;
BEGIN
  IF NEW.estado = 'aprobado' THEN
    SELECT adelanto INTO adelanto_reserva FROM reservas WHERE id = NEW.reserva_id;
    IF NEW.monto >= adelanto_reserva THEN
      UPDATE reservas SET estado = 'confirmada' WHERE id = NEW.reserva_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_confirmar_reserva
  AFTER INSERT ON pagos
  FOR EACH ROW EXECUTE FUNCTION confirmar_reserva_por_pago();

-- Trigger para crear usuario cuando se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, apellido)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger para actualizar timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resenas_timestamp
  BEFORE UPDATE ON resenas
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_notificaciones_timestamp
  BEFORE UPDATE ON notificaciones
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
