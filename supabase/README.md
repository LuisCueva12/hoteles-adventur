# Hotel Adventur - Base de Datos Supabase

## Estructura de Migraciones

Este directorio contiene todas las migraciones necesarias para configurar la base de datos del Hotel Adventur.

## Migraciones Disponibles

### Archivos de Migración
- `001_initial_setup.sql` - Tipos ENUM, extensiones y función admin
- `002_tables.sql` - Todas las tablas principales
- `003_rls_policies.sql` - Políticas de Row Level Security
- `004_triggers.sql` - Triggers y funciones automáticas
- `005_indexes.sql` - Índices para optimización
- `006_initial_data.sql` - Datos iniciales

### Archivos de Referencia
- `schema.sql` - Esquema completo de referencia
- `README.md` - Este archivo de documentación

## Ejecución de Migraciones

### Opción 1: Script PowerShell
```powershell
.\migrate.ps1
```

### Opción 2: Manual con psql
```bash
psql "postgresql://postgres:password@db.dmjgxztdwkrfryptwdcr.supabase.co:5432/postgres" -f supabase/migrations/001_initial_setup.sql
psql "postgresql://postgres:password@db.dmjgxztdwkrfryptwdcr.supabase.co:5432/postgres" -f supabase/migrations/002_tables.sql
# ... continuar con el resto
```

### Opción 3: Supabase SQL Editor
Copiar y ejecutar cada archivo en orden en el SQL Editor de Supabase.

## Roles del Sistema

- **turista** - Usuario normal que puede reservar alojamientos
- **propietario** - Dueño de alojamientos, puede gestionar sus propiedades
- **admin** - Administrador del sistema con acceso completo

## Tablas Principales

- **usuarios** - Información de usuarios y roles
- **alojamientos** - Propiedades disponibles
- **disponibilidad** - Fechas disponibles para reservas
- **fotos_alojamiento** - Galería de imágenes
- **reservas** - Reservas de usuarios
- **pagos** - Pagos asociados a reservas
- **opiniones** - Reseñas y calificaciones
- **resenas** - Sistema de reseñas detallado
- **notificaciones** - Sistema de notificaciones
- **configuracion** - Configuración del hotel
- **comprobantes** - Comprobantes fiscales

## Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas granulares por rol y ownership
- Función `is_admin()` para verificación de administradores
- Bucket de storage para fotos de perfil con políticas RLS

## Configuración del Proyecto

- **Project Ref**: dmjgxztdwkrfryptwdcr
- **URL**: https://dmjgxztdwkrfryptwdcr.supabase.co
- **Database**: postgres@db.dmjgxztdwkrfryptwdcr.supabase.co:5432/postgres
