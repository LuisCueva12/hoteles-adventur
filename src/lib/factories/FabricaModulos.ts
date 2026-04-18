import { RepositorioHotelesSupabase } from '@/modulos/hoteles/infraestructura/RepositorioHotelesSupabase';
import { CasoUsoObtenerHotelesDestacados } from '@/modulos/hoteles/aplicacion/CasoUsoObtenerHotelesDestacados';
import { CasosUsoHoteles } from '@/modulos/hoteles/aplicacion/CasosUsoHoteles';

import { RepositorioHabitacionesSupabase } from '@/modulos/habitaciones/infraestructura/RepositorioHabitacionesSupabase';
import { CasosUsoHabitaciones } from '@/modulos/habitaciones/aplicacion/CasosUsoHabitaciones';

import { RepositorioReservasSupabase } from '@/modulos/reservas/infraestructura/RepositorioReservasSupabase';
import { CasosUsoReservas } from '@/modulos/reservas/aplicacion/CasosUsoReservas';

import { RepositorioUsuariosSupabase } from '@/modulos/usuarios/infraestructura/RepositorioUsuariosSupabase';
import { CasosUsoUsuarios } from '@/modulos/usuarios/aplicacion/CasosUsoUsuarios';

import { RepositorioConfiguracionSupabase } from '@/modulos/configuracion/infraestructura/RepositorioConfiguracionSupabase';
import { CasosUsoConfiguracion } from '@/modulos/configuracion/aplicacion/CasosUsoConfiguracion';

import { RepositorioResenasSupabase } from '@/modulos/resenas/infraestructura/RepositorioResenasSupabase';
import { CasosUsoResenas } from '@/modulos/resenas/aplicacion/CasosUsoResenas';

export class FabricaModulos {
  static obtenerCasosUsoHoteles() {
    return new CasosUsoHoteles(new RepositorioHotelesSupabase());
  }

  static obtenerCasoUsoHotelesDestacados() {
    return new CasoUsoObtenerHotelesDestacados(new RepositorioHotelesSupabase());
  }

  static obtenerCasosUsoHabitaciones() {
    return new CasosUsoHabitaciones(new RepositorioHabitacionesSupabase());
  }

  static obtenerCasosUsoReservas() {
    return new CasosUsoReservas(
      new RepositorioReservasSupabase(),
      new RepositorioHotelesSupabase()
    );
  }

  static obtenerCasosUsoUsuarios() {
    return new CasosUsoUsuarios(new RepositorioUsuariosSupabase());
  }

  static obtenerCasosUsoConfiguracion() {
    return new CasosUsoConfiguracion(new RepositorioConfiguracionSupabase());
  }

  static obtenerCasosUsoResenas() {
    return new CasosUsoResenas(new RepositorioResenasSupabase());
  }
}
