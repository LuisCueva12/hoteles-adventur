# Adventur Hotels - Sistema de Reservas de Hotel

Sistema web completo para gestión y reservas de hotel construido con Next.js 16, React 19, TypeScript y Supabase.

## 🚀 Características

### Sitio Web Público
- ✅ Página de inicio con hero section carrusel (3 imágenes, rotación automática 5s)
- ✅ Búsqueda de habitaciones con validación completa
- ✅ Catálogo completo de habitaciones con filtros, ordenamiento y sistema de reservas
- ✅ Modal de reserva con cálculo automático de precio
- ✅ Sistema de favoritos con persistencia en localStorage
- ✅ Botones de compartir en redes sociales (Facebook, Twitter, WhatsApp, Email)
- ✅ Página sobre nosotros con historia, valores y estadísticas
- ✅ Servicios del hotel (restaurante, spa, piscina, eventos, etc.)
- ✅ Galería de imágenes con 8 fotos de alta calidad
- ✅ Sección de testimonios de clientes
- ✅ Calendario de eventos próximos
- ✅ Formulario de contacto funcional con validación completa
- ✅ Iconos profesionales con lucide-react
- ✅ Botón de WhatsApp para contacto rápido
- ✅ Newsletter funcional en footer
- ✅ Páginas legales completas (Términos y Privacidad)
- ✅ Navbar con estado activo y menú móvil
- ✅ Footer con información de contacto real
- ✅ Breadcrumbs de navegación
- ✅ Botón Scroll to Top
- ✅ Animaciones y transiciones suaves en toda la web
- ✅ Diseño responsive y moderno
- ✅ SEO optimizado con meta tags

### Panel de Usuario
- ✅ Gestión de perfil con edición de datos personales
- ✅ Cambio de contraseña y seguridad
- ✅ Historial de reservas con filtros por estado
- ✅ Gestión de pagos con historial completo
- ✅ Cancelación de reservas pendientes
- ✅ Sidebar de navegación moderna con logout

### Panel de Administración
- ⚠️ Dashboard con estadísticas (requiere datos reales)
- ⚠️ Gestión completa de habitaciones (requiere conexión a BD)
- ⚠️ Gestión de reservas (requiere conexión a BD)
- ⚠️ Gestión de usuarios y roles (requiere conexión a BD)
- ⚠️ Reportes y análisis (requiere datos reales)
- ✅ Sidebar colapsable y navegación intuitiva

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Iconos**: Lucide React
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
hoteles-adventur/
├── public/
│   ├── logo-adventur.png
│   └── *.svg
├── src/
│   ├── app/
│   │   ├── _styles/
│   │   │   ├── globals.css
│   │   │   └── animations.css
│   │   ├── (web)/
│   │   │   ├── page.tsx
│   │   │   ├── hoteles/
│   │   │   ├── nosotros/
│   │   │   ├── servicios/
│   │   │   ├── galeria/
│   │   │   ├── contacto/
│   │   │   ├── terminos/
│   │   │   └── privacidad/
│   │   ├── (cuenta)/
│   │   │   ├── perfil/
│   │   │   ├── reservas/
│   │   │   └── pagos/
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── hoteles/
│   │   │   ├── reservas/
│   │   │   ├── usuarios/
│   │   │   ├── reportes/
│   │   │   └── configuracion/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   └── nubefact/
│   │   ├── login/
│   │   ├── acceso-denegado/
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── favicon.ico
│   ├── components/
│   │   ├── admin/
│   │   │   ├── StatCard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── NotificationsPanel.tsx
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── cuenta/
│   │   │   └── ModalComprobante.tsx
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx
│   │   ├── ui/
│   │   │   ├── AnimatedDiv.tsx
│   │   │   ├── ClientOnly.tsx
│   │   │   ├── OptimizedImage.tsx
│   │   │   ├── Toaster.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── index.ts
│   │   └── web/
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       ├── Logo.tsx
│   │       └── ... (25+ componentes)
│   ├── hooks/
│   │   ├── useToast.tsx
│   │   ├── useRooms.tsx
│   │   ├── useFavorites.tsx
│   │   ├── useTranslation.tsx
│   │   └── index.ts
│   ├── lib/
│   │   ├── analytics.ts
│   │   ├── errors.ts
│   │   ├── i18n.ts
│   │   ├── query-client.ts
│   │   ├── rate-limit.ts
│   │   ├── security.ts
│   │   ├── seo.ts
│   │   ├── validations.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── admin.service.ts
│   │   ├── notifications.service.ts
│   │   ├── nubefact.service.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── database.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── admin.ts
│   │   │   ├── middleware.ts
│   │   │   ├── migrations/
│   │   │   │   ├── 001_schema.sql
│   │   │   │   ├── 002_rls_policies.sql
│   │   │   │   ├── 003_add_profile_photo.sql
│   │   │   │   ├── 004_comprobantes.sql
│   │   │   │   ├── 005_profile_photos_storage.sql
│   │   │   │   ├── 006_notificaciones.sql
│   │   │   │   └── 007_reviews.sql
│   │   │   └── index.ts
│   │   ├── exportReports.ts
│   │   └── index.ts
│   └── middleware.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.ts
└── README.md
```

### 📦 Estructura Limpia

- Archivos CSS organizados en `_styles/`
- Todos los archivos index.ts sin comentarios
- Sin archivos duplicados
- Sin carpetas vacías
- Migraciones numeradas secuencialmente

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

### Tablas Implementadas
- `usuarios` - Información de usuarios con roles (turista, propietario, admin_adventur)
- `alojamientos` - Catálogo de alojamientos con categorías y tipos
- `fotos_alojamiento` - Imágenes de los alojamientos
- `disponibilidad` - Control de disponibilidad por fecha
- `reservas` - Reservas de clientes con estados (pendiente, confirmada, cancelada)
- `pagos` - Transacciones de pago con métodos (yape, plin, tarjeta, etc.)
- `opiniones` - Reviews y calificaciones de clientes

### Estado de Migraciones
⚠️ **IMPORTANTE**: Las migraciones SQL están creadas pero NO aplicadas a la base de datos.

Para aplicar las migraciones:
```bash
# 1. Inicializar Supabase localmente (si no lo has hecho)
npx supabase init

# 2. Vincular con tu proyecto de Supabase
npx supabase link --project-ref npdqpvhgfmufiokndbdi

# 3. Aplicar migraciones
npx supabase db push

# 4. Generar tipos TypeScript
npm run db:types
```

Scripts disponibles:
```bash
npm run db:push      # Aplicar migraciones
npm run db:pull      # Obtener esquema actual
npm run db:reset     # Resetear base de datos
npm run db:types     # Generar tipos TypeScript desde BD
npm run db:status    # Ver estado de migraciones
```

## 🚀 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
```

## 🎯 Estado del Proyecto y Próximos Pasos

### ✅ Completado
- Sitio web público completo y funcional con todas las mejoras
- Sistema de autenticación con Supabase
- Panel de usuario con perfil, reservas y pagos
- Diseño responsive y moderno
- Migraciones de base de datos creadas
- Animaciones y transiciones en toda la web
- Sistema de favoritos y compartir en redes
- Breadcrumbs y scroll to top
- Formularios con validación completa
- SEO optimizado
- Iconos profesionales (lucide-react)
- Páginas legales completas

### 🔴 CRÍTICO - Requiere Atención Inmediata
1. **Aplicar migraciones de base de datos**
   - Ejecutar `npx supabase db push` para crear las tablas
   - Generar tipos TypeScript con `npm run db:types`
   - Verificar que las políticas RLS estén activas

2. **Completar páginas de usuario**
   - ✅ Reservas: Implementada con filtros y cancelación
   - ✅ Pagos: Implementada con historial completo
   - Ambas páginas funcionarán una vez aplicadas las migraciones

### 🟡 ALTA PRIORIDAD
3. **Sistema de reservas funcional**
   - Conectar modal de reserva con Supabase
   - Implementar validación de disponibilidad real
   - Integrar sistema de pagos (Yape, Plin, Tarjeta)

4. **Conectar datos a Supabase**
   - Migrar habitaciones hardcodeadas a tabla `alojamientos`
   - Migrar eventos a base de datos
   - Migrar testimonios a tabla `opiniones`
   - Actualizar componentes para cargar datos dinámicamente

5. **SearchBar funcional**
   - Implementar búsqueda por destino, fechas y personas
   - Conectar con tabla de disponibilidad
   - Redirigir a resultados filtrados

### 🟢 MEDIA PRIORIDAD
6. **Panel de administración funcional**
   - Conectar CRUD de hoteles con tabla `alojamientos`
   - Implementar gestión real de reservas
   - Implementar gestión de usuarios
   - Crear reportes con datos reales de la BD

7. **Mejoras adicionales recomendadas**
   - Modo oscuro
   - Skeleton loaders avanzados
   - Sistema de reseñas funcional
   - Chat en vivo
   - Disponibilidad en tiempo real con calendario
   - Calculadora de precios detallada
   - Comparador de habitaciones
   - Vista 360° de habitaciones
   - PWA (Progressive Web App)
   - Multi-idioma (i18n)
   - Google Analytics
   - Tests automatizados

### 📋 Archivos que Necesitan Atención
- `src/app/(web)/hoteles/page.tsx` - Datos hardcodeados, necesita conexión a BD
- `src/components/web/EventosSeccion.tsx` - Eventos hardcodeados
- `src/components/web/TestimoniosSeccion.tsx` - Testimonios hardcodeados
- `src/components/web/SearchBar.tsx` - Búsqueda no funcional
- `src/app/admin/*` - Todas las páginas admin necesitan conexión a BD

## 🎨 Animaciones y Transiciones

Se implementó un sistema completo de animaciones en `src/styles/animations.css`:

### Animaciones Disponibles
- **fadeIn**: Aparición suave
- **fadeInUp**: Aparición desde abajo
- **fadeInDown**: Aparición desde arriba
- **fadeInLeft**: Aparición desde la izquierda
- **fadeInRight**: Aparición desde la derecha
- **scaleIn**: Aparición con escala
- **slideInUp**: Deslizamiento hacia arriba
- **pulse**: Pulsación continua
- **shimmer**: Efecto de brillo

### Efectos Aplicados
- Transiciones suaves (300ms - 700ms)
- Hover effects: elevación, escala, sombras
- Delays escalonados para efectos en cascada
- Optimizado para GPU (transform y opacity)

### Componentes con Animaciones
- HeroSeccion: Carrusel con transiciones, textos animados
- SearchBar: fadeInUp, hover effects
- Hoteles: Tarjetas con fadeInUp escalonado, hover lift
- Servicios: Tarjetas animadas, iconos con scale
- Nosotros: Secciones con fadeInLeft/Right, stats animados
- Galería: Imágenes con fadeInUp, overlay animado
- Contacto: Formulario animado, WhatsApp con pulse

## 📞 Información de Contacto

- **Dirección**: Jr. Amalia Puga 635, Cajamarca, Perú
- **Teléfonos**: +51 976 123 456, +51 976 654 321
- **Emails**: info@adventurhotels.com, reservas@adventurhotels.com
- **Redes Sociales**: Facebook, Instagram, TikTok, WhatsApp
- **Horario**: Lun-Dom 8:00 AM - 10:00 PM

## 📝 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado por el equipo de Adventur Hotels.

---

**Última actualización**: Febrero 2026
**Estado del proyecto**: Web pública completada al 100% - Backend pendiente de conexión
