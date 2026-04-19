import { SupabaseClient } from '@supabase/supabase-js';

// Repositorios e Infraestructura
import { RepositorioHotelesSupabase } from '@/modulos/hoteles/infraestructura/RepositorioHotelesSupabase';
import { RepositorioHabitacionesSupabase } from '@/modulos/habitaciones/infraestructura/RepositorioHabitacionesSupabase';
import { RepositorioReservasSupabase } from '@/modulos/reservas/infraestructura/RepositorioReservasSupabase';
import { RepositorioUsuariosSupabase } from '@/modulos/usuarios/infraestructura/RepositorioUsuariosSupabase';
import { RepositorioConfiguracionSupabase } from '@/modulos/configuracion/infraestructura/RepositorioConfiguracionSupabase';
import { RepositorioResenasSupabase } from '@/modulos/resenas/infraestructura/RepositorioResenasSupabase';
import { RepositorioAuthSupabase } from '@/modulos/auth/infraestructura/RepositorioAuthSupabase';

// Casos de Uso
import { CasosUsoHoteles } from '@/modulos/hoteles/aplicacion/CasosUsoHoteles';
import { CasoUsoObtenerHotelesDestacados } from '@/modulos/hoteles/aplicacion/CasoUsoObtenerHotelesDestacados';
import { CasosUsoHabitaciones } from '@/modulos/habitaciones/aplicacion/CasosUsoHabitaciones';
import { CasosUsoReservas } from '@/modulos/reservas/aplicacion/CasosUsoReservas';
import { CasosUsoUsuarios } from '@/modulos/usuarios/aplicacion/CasosUsoUsuarios';
import { CasosUsoConfiguracion } from '@/modulos/configuracion/aplicacion/CasosUsoConfiguracion';
import { CasosUsoResenas } from '@/modulos/resenas/aplicacion/CasosUsoResenas';
import { CasosUsoAuth } from '@/modulos/auth/aplicacion/CasosUsoAuth';

export class FabricaModulos {
  static obtenerCasosUsoHoteles(db: SupabaseClient) {
    return new CasosUsoHoteles(new RepositorioHotelesSupabase(db));
  }

  static obtenerCasoUsoHotelesDestacados(db: SupabaseClient) {
    return new CasoUsoObtenerHotelesDestacados(new RepositorioHotelesSupabase(db));
  }

  static obtenerCasosUsoHabitaciones(db: SupabaseClient) {
    return new CasosUsoHabitaciones(new RepositorioHabitacionesSupabase(db));
  }

  static obtenerCasosUsoReservas(db: SupabaseClient) {
    return new CasosUsoReservas(
      new RepositorioReservasSupabase(db),
      new RepositorioHotelesSupabase(db)
    );
  }

  static obtenerCasosUsoUsuarios(db: SupabaseClient) {
    return new CasosUsoUsuarios(new RepositorioUsuariosSupabase(db));
  }

  static obtenerCasosUsoConfiguracion(db: SupabaseClient) {
    return new CasosUsoConfiguracion(new RepositorioConfiguracionSupabase(db));
  }

  static obtenerCasosUsoResenas(db: SupabaseClient) {
    return new CasosUsoResenas(new RepositorioResenasSupabase(db));
  }

  static obtenerCasosUsoAuth(db: SupabaseClient) {
    return new CasosUsoAuth(new RepositorioAuthSupabase(db));
  }
}
