# Base de Datos - Hotel Adventur

## Estructura General

La base de datos está diseñada para gestionar un sistema hotelero completo con roles de usuario, alojamientos, reservas y pagos.

## Tipos ENUM

- `rol_usuario`: `'turista'`, `'propietario'`, `'admin'`
- `categoria_alojamiento`: `'Económico'`, `'Familiar'`, `'Parejas'`, `'Premium'`, `'Naturaleza'`
- `tipo_alojamiento`: `'Cabaña'`, `'EcoLodge'`, `'Hotel'`, `'Hostal'`, `'Casa'`
- `estado_reserva`: `'pendiente'`, `'confirmada'`, `'cancelada'`
- `estado_pago`: `'pendiente'`, `'aprobado'`, `'rechazado'`
- `metodo_pago`: `'yape'`, `'plin'`, `'tarjeta'`, `'transferencia'`, `'efectivo'`

## Tablas Principales

### usuarios
Perfiles de usuarios del sistema con roles y datos personales.

### alojamientos
Información de propiedades hoteleras, sus características y propietarios.

### reservas
Gestión de reservas de huéspedes con estados y fechas.

### pagos
Registro de pagos asociados a reservas con diferentes métodos.

### resenas
Sistema de reseñas y calificaciones con respuestas de admin.

### configuracion
Configuración general del hotel y políticas.

## Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Función `is_admin()`** para validaciones administrativas
- **Políticas granulares** por rol y propiedad de recursos

## Migraciones

Las migraciones se ejecutan en orden:
1. `001_types_and_extensions` - Tipos y extensiones
2. `002_create_tables` - Creación de tablas
3. `003_create_admin_function` - Función admin
4. `004_enable_rls_and_policies` - Políticas RLS
5. `005_triggers_and_functions` - Triggers automáticos
6. `006_indexes` - Índices optimizados
7. `007_initial_data` - Datos iniciales

## Conexión

- **URL**: `https://dmjgxztdwkrfryptwdcr.supabase.co`
- **Proyecto**: `dmjgxztdwkrfryptwdcr`

*Última actualización: 15/04/2026*
