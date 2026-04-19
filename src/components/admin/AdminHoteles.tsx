'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import { Hotel } from '@/modulos/hoteles/dominio/Hotel';
import { listarHoteles, crearHotel, actualizarHotel, eliminarHotel } from '@/modulos/hoteles/aplicacion/AccionesHoteles';
import { Input, Select, TextArea } from '@/components/admin/Formularios';
import { Modal } from '@/components/admin/Modal';
import { Tabla } from '@/components/admin/Tabla';
import { BotonBase } from '@/components/reutilizables/BotonBase';

const ESTRELLAS_OPCIONES = [
  { valor: '1', label: '1 Estrella' },
  { valor: '2', label: '2 Estrellas' },
  { valor: '3', label: '3 Estrellas' },
  { valor: '4', label: '4 Estrellas' },
  { valor: '5', label: '5 Estrellas' },
];

interface FormData {
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  telefonoWhatsapp: string;
  estrellas: number;
  imagenesUrls: string[];
}

const estadoInicial: FormData = {
  nombre: '',
  descripcion: '',
  direccion: '',
  ciudad: '',
  telefonoWhatsapp: '',
  estrellas: 3,
  imagenesUrls: [],
};

function SubirImagenes({
  imagenes,
  onChange,
}: {
  imagenes: string[];
  onChange: (imagenes: string[]) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSubiendo(true);
    try {
      for (const file of Array.from(files)) {
        const fileName = `hoteles/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { error } = await supabase.storage
          .from('imagenes')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;

        const { data } = supabase.storage.from('imagenes').getPublicUrl(fileName);
        onChange([...imagenes, data.publicUrl]);
      }
      toast.success('Imagen(es) subida(s)');
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const eliminarImagen = (index: number) => {
    const nuevaLista = [...imagenes];
    nuevaLista.splice(index, 1);
    onChange(nuevaLista);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-zinc-700">
        Imágenes del Hotel
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        className="flex items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {subiendo ? 'Subiendo...' : 'Agregar imágenes'}
      </button>
      {imagenes.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {imagenes.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-zinc-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => eliminarImagen(index)}
                className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminHoteles() {
  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [hotelEditando, setHotelEditando] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<FormData>(estadoInicial);
  const [enviando, setEnviando] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const datos = await listarHoteles();
      setHoteles(datos);
    } catch (error) {
      toast.error('Error al cargar hoteles');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirCrear = () => {
    setHotelEditando(null);
    setFormData(estadoInicial);
    setModalAbierto(true);
  };

  const abrirEditar = (hotel: Hotel) => {
    setHotelEditando(hotel);
    setFormData({
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      direccion: hotel.direccion,
      ciudad: hotel.ciudad,
      telefonoWhatsapp: hotel.telefonoWhatsapp,
      estrellas: hotel.estrellas,
      imagenesUrls: hotel.imagenesUrls || [],
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setHotelEditando(null);
    setFormData(estadoInicial);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.imagenesUrls.length === 0) {
      toast.error('Agrega al menos una imagen');
      return;
    }
    setEnviando(true);
    try {
      if (hotelEditando) {
        await actualizarHotel(hotelEditando.id, formData);
        toast.success('Hotel actualizado');
      } else {
        await crearHotel(formData);
        toast.success('Hotel creado');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar hotel?')) return;
    try {
      await eliminarHotel(id);
      toast.success('Hotel eliminado');
      cargarDatos();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const columnas = [
    { 
      clave: 'nombre', 
      titulo: 'Nombre',
      render: (h: Hotel) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
            {h.imagenesUrls?.[0] ? (
              <img src={h.imagenesUrls[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">Sin foto</div>
            )}
          </div>
          <span className="font-medium">{h.nombre}</span>
        </div>
      ),
    },
    { clave: 'ciudad', titulo: 'Ciudad' },
    { clave: 'estrellas', titulo: 'Estrellas', render: (h: Hotel) => '★'.repeat(h.estrellas) },
    { 
      clave: 'activo', 
      titulo: 'Estado', 
      render: (h: Hotel) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${h.activo ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
          {h.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary">Gestión de Hoteles</h1>
        <BotonBase variante="primario" onClick={abrirCrear}>
          + Nuevo Hotel
        </BotonBase>
      </div>

      <Tabla
        datos={hoteles}
        columnas={columnas}
        cargando={cargando}
        mensajeVacio="No hay hoteles registrados"
        acciones={(hotel) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => abrirEditar(hotel)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-primary transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleEliminar(hotel.id)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      />

      <Modal titulo={hotelEditando ? 'Editar Hotel' : 'Nuevo Hotel'} abierto={modalAbierto} onCerrar={cerrarModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            placeholder="Hotel name"
          />
          <TextArea
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            placeholder="Descripción del hotel"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dirección"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Dirección"
            />
            <Input
              label="Ciudad"
              value={formData.ciudad}
              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
              required
              placeholder="Ciudad"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="WhatsApp"
              value={formData.telefonoWhatsapp}
              onChange={(e) => setFormData({ ...formData, telefonoWhatsapp: e.target.value })}
              required
              placeholder="521234567890"
            />
            <Select
              label="Estrellas"
              value={String(formData.estrellas)}
              onChange={(e) => setFormData({ ...formData, estrellas: Number(e.target.value) })}
              opciones={ESTRELLAS_OPCIONES}
            />
          </div>
          <SubirImagenes
            imagenes={formData.imagenesUrls}
            onChange={(imagenes) => setFormData({ ...formData, imagenesUrls: imagenes })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <BotonBase variante="secundario" type="button" onClick={cerrarModal}>
              Cancelar
            </BotonBase>
            <BotonBase variante="primario" type="submit" cargando={enviando}>
              {hotelEditando ? 'Actualizar' : 'Crear'}
            </BotonBase>
          </div>
        </form>
      </Modal>
    </div>
  );
}