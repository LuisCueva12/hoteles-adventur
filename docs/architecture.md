# Arquitectura: Sistema de Gestión de Reservas por WhatsApp

Este documento define la arquitectura técnica para el sistema de reservas hoteleras basado en la atención vía WhatsApp, sin procesamiento de pagos en línea. El proyecto utiliza Next.js (App Router), Supabase y una arquitectura de Monolito Modular orientada al Dominio (Hexagonal).

---

## 1. Estructura de Carpetas Completa

La aplicación sigue una separación estricta entre el framework web y las reglas de negocio.

```text
/src
  /app                       # Vistas y Rutas (Next.js)
    /(public)                # Web pública
      /habitaciones          # Listado de habitaciones
      /reservar/[id]         # Formulario de reserva web
    /(admin)                 # Panel de administración
      /dashboard             # Dashboard interno
      /habitaciones          # CRUD de habitaciones
    /api                     # Rutas API de Next.js
  
  /components                # UI React
    /reutilizables          # Botones, Modales, Formularios (UI System)
    /layout                  # Navbar, Footer, Sidebar
    
  /modulos                   # MONOLITO MODULAR (Lógica de Negocio)
    /reservas
      /dominio               # Entidades e Interfaces
      /aplicacion            # Casos de uso (Servicios)
      /infraestructura       # Conexión con Supabase
    /habitaciones
      /dominio
      /aplicacion
      /infraestructura
    /usuarios
      /dominio
      /aplicacion
      /infraestructura
      
  /lib                       # Utilidades globales
    /supabase                # Instancias de Supabase Cliente/Servidor
    /whatsapp                # Generador de links de WhatsApp
```

---

## 2. Definición de Módulos

### 🏨 Módulo de Habitaciones
* **Responsabilidad:** Gestionar el catálogo del hotel (precios, descripciones, estado actual).
* **Dependencias:** Ninguna (Independiente).

### 📅 Módulo de Reservas
* **Responsabilidad:** Recibir la intención de reserva del cliente web, guardarla para seguimiento interno, y redireccionar a WhatsApp con un mensaje pre-formateado.
* **Dependencias:** Depende del *Módulo de Habitaciones* para verificar la existencia e información de la habitación antes de la reserva.

### 👥 Módulo de Usuarios
* **Responsabilidad:** Autenticación de administradores, recepcionistas y control de acceso (Auth/RLS).
* **Dependencias:** Ninguna. Se enlaza fuertemente con Supabase Auth.

---

## 3. Diseño de Base de Datos (Supabase / Postgres)

```sql
-- modulo_usuarios
CREATE TABLE usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'recepcionista' CHECK (rol IN ('admin', 'recepcionista')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- modulo_habitaciones
CREATE TABLE habitaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_noche DECIMAL NOT NULL,
  capacidad_personas INT NOT NULL,
  esta_disponible BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- modulo_reservas
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habitacion_id UUID REFERENCES habitaciones(id) NOT NULL,
  nombre_cliente TEXT NOT NULL,
  telefono_cliente TEXT NOT NULL,
  fecha_ingreso DATE NOT NULL,
  fecha_salida DATE NOT NULL,
  estado_reserva TEXT DEFAULT 'pendiente_whatsapp' CHECK (estado_reserva IN ('pendiente_whatsapp', 'confirmada', 'cancelada')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Flujo Completo de Reserva (WhatsApp)

1. **Formulario:** El cliente ve el catálogo, selecciona una habitación, llena un formulario web sencillo (Nombre, Teléfono, Fechas).
2. **Validación:** Se valida vía UI (ej. `Zod`) que las fechas no sean del pasado y los campos estén completos.
3. **Guardado en DB:** Por medio de un Caso de Uso, se inserta una fila en la tabla `reservas` con estado `pendiente_whatsapp`. Esto alerta a la recepción internamente de la intención de compra.
4. **Generación de Mensaje:** El backend construye el texto: *"Hola, soy [Nombre]. Deseo reservar la [Habitación] del [Ingreso] al [Salida]. Mi registro temporal es #[ID]."*
5. **Redirección:** El cliente web es redirigido a la aplicación web o móvil de WhatsApp hacia el número oficial del hotel.

---

## 5. Separación por Capas (Código de Ejemplo en Español)

### A. Capa de Dominio (Entidades y Contratos - Solo TypeScript puro)
`/src/modulos/reservas/dominio/RepositorioReservas.ts`
```typescript
export interface EntidadReserva {
  id?: string;
  habitacionId: string;
  nombreCliente: string;
  telefonoCliente: string;
  fechaIngreso: Date;
  fechaSalida: Date;
}

export interface RepositorioReservas {
  guardarReserva(reserva: EntidadReserva): Promise<string>;
}
```

### B. Capa de Infraestructura (Conexión Base de Datos)
`/src/modulos/reservas/infraestructura/RepositorioReservasSupabase.ts`
```typescript
import { crearClienteSupabaseServidor } from '@/lib/supabase/servidor';
import { EntidadReserva, RepositorioReservas } from '../dominio/RepositorioReservas';

export class RepositorioReservasSupabase implements RepositorioReservas {
  async guardarReserva(reserva: EntidadReserva): Promise<string> {
    const supabase = crearClienteSupabaseServidor();
    
    // Mapeamos de nuestro dominio a la tabla de Postgres
    const { data, error } = await supabase
      .from('reservas')
      .insert({
        habitacion_id: reserva.habitacionId,
        nombre_cliente: reserva.nombreCliente,
        telefono_cliente: reserva.telefonoCliente,
        fecha_ingreso: reserva.fechaIngreso.toISOString().split('T')[0],
        fecha_salida: reserva.fechaSalida.toISOString().split('T')[0]
      })
      .select('id')
      .single();

    if (error) throw new Error('Error al guardar en base de datos');
    return data.id;
  }
}
```

### C. Capa de Aplicación (Caso de Uso / Flujo)
`/src/modulos/reservas/aplicacion/CasoUsoProcesarReserva.ts`
```typescript
import { EntidadReserva, RepositorioReservas } from '../dominio/RepositorioReservas';

export class CasoUsoProcesarReserva {
  constructor(private repositorio: RepositorioReservas) {}

  async ejecutar(reserva: EntidadReserva): Promise<string> {
    // 1. Guardar en Base de Datos como registro preventivo
    const reservaId = await this.repositorio.guardarReserva(reserva);

    // 2. Generar enlace de WhatsApp
    const numeroHotel = "1234567890"; // Reemplazar con env variable
    const mensaje = `Hola! Soy ${reserva.nombreCliente}. Me interesa la habitación para las fechas ${reserva.fechaIngreso.toDateString()} al ${reserva.fechaSalida.toDateString()}. ID de seguimiento: ${reservaId}`;
    
    const urlWhatsApp = `https://wa.me/${numeroHotel}?text=${encodeURIComponent(mensaje)}`;
    
    // 3. Devolver la URL para que el frontend haga la redirección
    return urlWhatsApp;
  }
}
```

---

## 6. Componentes Reutilizables

`/src/components/reutilizables`

- **BotonBase.tsx**: Botón con múltiples variantes (primario, secundario, peligro) reutilizado en admin y vista pública.
- **FormularioInput.tsx**: Encapsula `<input>`, `<label>` y mensajes de error ligados a react-hook-form y Zod.
- **TarjetaHabitacion.tsx**: Se utiliza en el listado público de habitaciones tomando directamente props de tipado `HabitacionDominio`.

---

## 7. Protección de Rutas Admin (Next.js Middleware)

Utilizaremos el archivo de middleware global para asegurar la carpeta `/(admin)`.

`/src/middleware.ts`
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { crearClienteSupabaseMiddleware } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = crearClienteSupabaseMiddleware(request)
  const { data: { session } } = await supabase.auth.getSession()

  const estaEnRutaAdmin = request.nextUrl.pathname.startsWith('/admin')

  if (estaEnRutaAdmin && !session) {
    // Redirigir al inicio de sesión si no hay usuario
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## 8. Reglas de Desarrollo en Equipo (Para evitar conflictos)

Para los **5 desarrolladores** las reglas de oro son:

1. **Desarrollo Vertical (Por Módulos):** Un desarrollador asume todo el módulo `habitaciones` (API, UI, Dominio), otro asume el módulo `reservas`. Nunca se pisan modificando el mismo módulo horizontal (ej: un dev tocando todo el JS y otro todo el CSS).
2. **Independencia en Infraestructura:** Un módulo **nunca** lee tablas de la base de datos de otro módulo. Si `reservas` necesita el precio de una habitación, debe llamar un método público de aplicación ubicado en `/src/modulos/habitaciones/aplicacion`.
3. **Migraciones Unificadas (Supabase):** 
   - Nadie crea tablas directamente en la interfaz de Supabase.
   - Las tablas se crean creando un archivo `.sql` dentro de `supabase/migrations`.
   - Se debe crear un `Branch` por cada módulo. Al fusionar la funcionalidad principal usar *Pull Requests*.
4. **Nombres explícitos y en español:** Variables de negocio (`CasoUso`, `Entidad`) en español para acercarse al lenguaje del usuario, pero los frameworks de terceros y configuraciones de infra mantenidos en nomenclatura de React/Next (ej: `page.tsx`, `layout.tsx`).
