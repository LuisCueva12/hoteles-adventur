# Adventur Hotels - Sistema de Reservas de Hotel

Sistema web completo para gestión y reservas de hotel construido con Next.js 16, React 19, TypeScript y Supabase.

## 🚀 Características

### Sitio Web Público
- ✅ Página de inicio con hero section y búsqueda de habitaciones
- ✅ Catálogo completo de habitaciones con filtros y ordenamiento
- ✅ Página sobre nosotros con historia y valores
- ✅ Servicios del hotel (restaurante, spa, piscina, eventos, etc.)
- ✅ Galería de imágenes con filtros por categoría
- ✅ Sección de testimonios de clientes
- ✅ Calendario de eventos próximos
- ✅ Formulario de contacto
- ✅ Diseño responsive y moderno
- ✅ Navegación intuitiva con menú móvil

### Panel de Usuario
- 🔄 Gestión de perfil
- 🔄 Historial de reservas
- 🔄 Gestión de pagos

### Panel de Administración
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de habitaciones (CRUD)
- ✅ Gestión de reservas con cambio de estados
- ✅ Gestión de usuarios y roles
- ✅ Reportes y análisis de rendimiento
- ✅ Gráficos de ingresos y ocupación
- ✅ Exportación de reportes
- ✅ Sidebar colapsable y navegación intuitiva

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Despliegue**: Vercel (recomendado)

## 📦 Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd hoteles-adventur
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env.local` en la raíz del proyecto:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu_supabase_anon_key
```

4. Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

5. Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (web)/              # Rutas públicas del sitio web
│   │   ├── page.tsx        # Página de inicio
│   │   ├── hoteles/        # Catálogo de habitaciones
│   │   ├── nosotros/       # Sobre nosotros
│   │   ├── servicios/      # Servicios del hotel
│   │   ├── galeria/        # Galería de imágenes
│   │   └── contacto/       # Formulario de contacto
│   ├── (cuenta)/           # Panel de usuario
│   │   ├── perfil/
│   │   ├── reservas/
│   │   └── pagos/
│   ├── admin/              # Panel de administración
│   ├── login/              # Autenticación
│   └── layout.tsx          # Layout principal
├── components/
│   ├── admin/              # Componentes del panel admin
│   │   ├── StatCard.tsx    # Tarjetas de estadísticas
│   │   ├── DataTable.tsx   # Tabla de datos con paginación
│   │   ├── Modal.tsx       # Modal reutilizable
│   │   └── index.ts        # Exportaciones
│   ├── web/                # Componentes del sitio web
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSeccion.tsx
│   │   ├── SearchBar.tsx
│   │   ├── HabitacionesSeccion.tsx
│   │   ├── PorQueElegirnosSeccion.tsx
│   │   ├── TestimoniosSeccion.tsx
│   │   └── EventosSeccion.tsx
│   └── ui/                 # Componentes UI reutilizables
├── utils/
│   └── supabase/           # Configuración de Supabase
│       ├── client.ts
│       ├── server.ts
│       ├── middleware.ts
│       └── migrations/
└── types/                  # Tipos de TypeScript
```

## 🎨 Páginas Disponibles

- `/` - Página de inicio
- `/hoteles` - Catálogo de habitaciones
- `/nosotros` - Sobre nosotros
- `/servicios` - Servicios del hotel
- `/galeria` - Galería de imágenes
- `/contacto` - Contacto
- `/login` - Inicio de sesión
- `/perfil` - Perfil de usuario
- `/reservas` - Mis reservas
- `/pagos` - Gestión de pagos
- `/admin` - Panel de administración
- `/admin/hoteles` - Gestión de habitaciones
- `/admin/reservas` - Gestión de reservas
- `/admin/usuarios` - Gestión de usuarios
- `/admin/reportes` - Reportes y estadísticas

## 🗄️ Base de Datos

El proyecto utiliza Supabase con las siguientes tablas principales:

- `habitaciones` - Información de habitaciones
- `reservas` - Reservas de clientes
- `usuarios` - Datos de usuarios
- `pagos` - Transacciones de pago

Scripts disponibles:
```bash
npm run db:push      # Aplicar migraciones
npm run db:pull      # Obtener esquema actual
npm run db:reset     # Resetear base de datos
npm run db:types     # Generar tipos TypeScript
```

## 🚀 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
```

## 🎯 Próximas Características

- [ ] Sistema de reservas funcional
- [ ] Integración de pagos (Stripe/PayPal)
- [ ] Panel de administración completo
- [ ] Sistema de notificaciones
- [ ] Integración con calendario
- [ ] Sistema de reviews y ratings
- [ ] Multi-idioma (i18n)
- [ ] PWA (Progressive Web App)

## 📝 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado por el equipo de Adventur Hotels.

---

**Nota**: Asegúrate de configurar correctamente las variables de entorno antes de ejecutar el proyecto.
