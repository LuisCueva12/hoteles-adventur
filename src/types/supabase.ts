// Tipos generados automáticamente desde Supabase
// Regenerar con: npm run db:types
// Este archivo es un placeholder — el tipo real lo genera el CLI de Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      hoteles: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          ciudad: string;
          direccion: string | null;
          telefono_whatsapp: string;
          foto_url: string | null;
          esta_activo: boolean;
          fecha_creacion: string;
        };
        Insert: Omit<Database['public']['Tables']['hoteles']['Row'], 'id' | 'fecha_creacion'>;
        Update: Partial<Database['public']['Tables']['hoteles']['Insert']>;
      };
      habitaciones: {
        Row: {
          id: string;
          hotel_id: string;
          nombre: string;
          descripcion: string | null;
          precio_noche: number;
          capacidad_personas: number;
          esta_disponible: boolean;
          fotos: string[];
          fecha_creacion: string;
        };
        Insert: Omit<Database['public']['Tables']['habitaciones']['Row'], 'id' | 'fecha_creacion'>;
        Update: Partial<Database['public']['Tables']['habitaciones']['Insert']>;
      };
      reservas: {
        Row: {
          id: string;
          habitacion_id: string;
          hotel_id: string;
          nombre_cliente: string;
          telefono_cliente: string;
          fecha_ingreso: string;
          fecha_salida: string;
          estado_reserva: 'pendiente_whatsapp' | 'confirmada' | 'cancelada';
          url_whatsapp_generada: string | null;
          fecha_creacion: string;
        };
        Insert: Omit<Database['public']['Tables']['reservas']['Row'], 'id' | 'fecha_creacion'>;
        Update: Partial<Database['public']['Tables']['reservas']['Insert']>;
      };
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          email: string;
          rol: 'admin' | 'recepcionista';
          fecha_creacion: string;
        };
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'fecha_creacion'>;
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>;
      };
    };
  };
}
