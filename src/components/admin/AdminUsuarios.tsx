'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Usuario } from '@/modulos/usuarios/dominio/Usuario';
import { listarUsuarios } from '@/modulos/usuarios/aplicacion/AccionesUsuarios';
import { Tabla } from '@/components/admin/Tabla';

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const datos = await listarUsuarios();
      setUsuarios(datos);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const columnas = [
    { 
      clave: 'nombreCompleto', 
      titulo: 'Nombre',
      render: (u: Usuario) => (
        <div>
          <p className="font-semibold text-zinc-900">{u.nombreCompleto}</p>
          <p className="text-xs text-zinc-500">{u.correo}</p>
        </div>
      ),
    },
    { 
      clave: 'telefono', 
      titulo: 'Teléfono',
      render: (u: Usuario) => u.telefono || '-',
    },
    { 
      clave: 'rol', 
      titulo: 'Rol',
      render: (u: Usuario) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
          u.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'
        }`}>
          {u.rol === 'admin' ? 'Administrador' : 'Cliente'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary">Gestión de Usuarios</h1>
        <p className="text-sm text-zinc-500 mt-1">Usuarios registrados en la plataforma</p>
      </div>

      <Tabla
        datos={usuarios}
        columnas={columnas}
        cargando={cargando}
        mensajeVacio="No hay usuarios registrados"
      />
    </div>
  );
}