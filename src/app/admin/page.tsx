import { 
  Hotel, 
  BedDouble, 
  CalendarCheck, 
  Clock
} from 'lucide-react';
import { FabricaModulos } from '@/lib/factories/FabricaModulos';
import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';

export default async function AdminDashboard() {
  const db = await crearClienteSupabaseServidor();
  
  const hotelesSrv = FabricaModulos.obtenerCasosUsoHoteles(db);
  const habitacionesSrv = FabricaModulos.obtenerCasosUsoHabitaciones(db);
  const reservasSrv = FabricaModulos.obtenerCasosUsoReservas(db);

  const [hoteles, habitaciones, reservas] = await Promise.all([
    hotelesSrv.listarTodos(),
    habitacionesSrv.listarTodas(),
    reservasSrv.listarTodas()
  ]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-secondary/10 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-secondary uppercase">
            Sistema <span className="text-primary italic">Adventur</span>
          </h1>
          <p className="mt-1 text-sm text-secondary/60 font-medium">Información operativa real recuperada de la base de datos.</p>
        </div>
        
        <div className="flex items-center gap-2 rounded-lg bg-secondary/5 px-4 py-2 text-[10px] font-black text-secondary tracking-widest border border-secondary/10 uppercase">
          <Clock className="h-4 w-4 text-primary" />
          Sincronizado
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="rounded-2xl border border-secondary/10 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between opacity-40 uppercase tracking-tighter font-black text-[10px] text-secondary">
            <span>Hoteles Activos</span>
            <Hotel className="h-5 w-5" />
          </div>
          <div className="mt-6">
            <span className="text-4xl font-black text-secondary">{hoteles.length}</span>
            <p className="text-[10px] font-bold text-primary uppercase mt-1">Registros</p>
          </div>
        </div>

        <div className="rounded-2xl border border-secondary/10 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between opacity-40 uppercase tracking-tighter font-black text-[10px] text-secondary">
            <span>Habitaciones</span>
            <BedDouble className="h-5 w-5" />
          </div>
          <div className="mt-6">
            <span className="text-4xl font-black text-secondary">{habitaciones.length}</span>
            <p className="text-[10px] font-bold text-primary uppercase mt-1">Unidades</p>
          </div>
        </div>

        <div className="rounded-2xl border border-secondary/10 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between opacity-40 uppercase tracking-tighter font-black text-[10px] text-secondary">
            <span>Reservas Totales</span>
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div className="mt-6">
            <span className="text-4xl font-black text-secondary">{reservas.length}</span>
            <p className="text-[10px] font-bold text-primary uppercase mt-1">Pendientes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
