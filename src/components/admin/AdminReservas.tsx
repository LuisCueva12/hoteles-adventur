'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Reserva, EstadoReserva } from '@/modulos/reservas/dominio/Reserva';
import { listarReservas, cambiarEstadoReserva } from '@/modulos/reservas/aplicacion/AccionesReservas';
import { Tabla } from '@/components/admin/Tabla';

export function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const datos = await listarReservas();
      setReservas(datos);
    } catch (error) {
      toast.error('Error al cargar reservas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const reservasFiltradas = filtroEstado === 'todos' 
    ? reservas 
    : reservas.filter((r) => r.datos.estado === filtroEstado);

  const cambiarEstado = async (id: string, nuevoEstado: EstadoReserva) => {
    try {
      await cambiarEstadoReserva(id, nuevoEstado);
      toast.success('Estado actualizado');
      cargarDatos();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEstadoLabel = (estado: EstadoReserva) => {
    const labels: Record<EstadoReserva, string> = {
      contacto_whatsapp: 'Pendiente',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
    };
    return labels[estado];
  };

  const getEstadoStyles = (estado: EstadoReserva) => {
    const styles: Record<EstadoReserva, string> = {
      contacto_whatsapp: 'bg-yellow-100 text-yellow-700',
      confirmada: 'bg-green-100 text-green-700',
      cancelada: 'bg-red-100 text-red-700',
    };
    return styles[estado];
  };

  const columnas = [
    { 
      clave: 'nombreCliente', 
      titulo: 'Cliente',
      render: (r: Reserva) => (
        <div>
          <p className="font-semibold text-zinc-900">{r.datos.nombreCliente}</p>
          <p className="text-xs text-zinc-500">{r.datos.telefonoContacto}</p>
        </div>
      ),
    },
    { 
      clave: 'fechaIngreso', 
      titulo: 'Fechas',
      render: (r: Reserva) => (
        <div className="text-sm">
          <p><span className="text-zinc-500">Ingreso:</span> {formatearFecha(r.datos.fechaIngreso)}</p>
          <p><span className="text-zinc-500">Salida:</span> {formatearFecha(r.datos.fechaSalida)}</p>
        </div>
      ),
    },
    { 
      clave: 'estado', 
      titulo: 'Estado',
      render: (r: Reserva) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${getEstadoStyles(r.datos.estado)}`}>
          {getEstadoLabel(r.datos.estado)}
        </span>
      ),
    },
    { 
      clave: 'fechaCreacion', 
      titulo: 'Creada',
      render: (r: Reserva) => formatearFecha(r.datos.fechaCreacion),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary">Gestión de Reservas</h1>
        <div className="flex items-center gap-2">
          {(['todos', 'contacto_whatsapp', 'confirmada', 'cancelada'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filtroEstado === estado 
                  ? 'bg-primary text-secondary' 
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {estado === 'todos' ? 'Todas' : getEstadoLabel(estado as EstadoReserva)}
            </button>
          ))}
        </div>
      </div>

      <Tabla
        datos={reservasFiltradas}
        columnas={columnas}
        cargando={cargando}
        mensajeVacio="No hay reservas"
        acciones={(reserva) => (
          <div className="flex items-center justify-end gap-2">
            {reserva.datos.estado === 'contacto_whatsapp' && (
              <>
                <button
                  onClick={() => cambiarEstado(reserva.datos.id, 'confirmada')}
                  className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => cambiarEstado(reserva.datos.id, 'cancelada')}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
                >
                  Cancelar
                </button>
              </>
            )}
            {reserva.datos.estado === 'confirmada' && (
              <button
                onClick={() => cambiarEstado(reserva.datos.id, 'cancelada')}
                className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
              >
                Cancelar
              </button>
            )}
            {reserva.datos.estado === 'cancelada' && (
              <button
                onClick={() => cambiarEstado(reserva.datos.id, 'confirmada')}
                className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 transition-colors"
              >
                Reactivar
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}