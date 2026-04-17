# DOCUMENTO DEL PROYECTO: PLATAFORMA WEB DE RESERVAS DE HOTELES (VÍA WHATSAPP)

## 1. OBJETIVO DEL PROYECTO
Desarrollar una plataforma web profesional que funcione como un catálogo digital de hoteles y habitaciones, pero donde **todo el cierre y control de reservas se maneje a través de WhatsApp**. 
El cliente navegará por la web, verá disponibilidad y detalles, llenará un "formulario personalizado de reserva" y el sistema lo enviará directamente al WhatsApp del hotel seleccionado, dejando un registro preventivo en la base de datos interna.

## 2. TECNOLOGÍAS UTILIZADAS
- **Frontend:** Next.js (React) con App Router.
- **Diseño:** Tailwind CSS.
- **Backend y Base de Datos:** Supabase (PostgreSQL + Autenticación).
- **Hosting y despliegue:** Vercel.
- **Control de versiones:** GitHub.

## 3. FUNCIONALIDADES DEL SISTEMA

### 3.1 Funcionalidades para Usuarios (Clientes)
- Registro e inicio de sesión (opcional para reservar, pero permite ver historial).
- Búsqueda de hoteles por ciudad.
- Visualización de detalles del hotel (información, comodidades, fotos).
- Visualización de habitaciones disponibles.
- **Cierre de Reserva por WhatsApp:** Formulario personalizado que capta Nombre, Teléfono e Intención de Fechas, y redirige a la app de WhatsApp con un mensaje estructurado.
- Visualización de "Solicitudes de Reserva" (historial) en caso de iniciar sesión.

### 3.2 Funcionalidades para Administrador
- Crear, editar y eliminar hoteles.
- Crear, editar y eliminar habitaciones asociadas a hoteles.
- Configurar el Número de WhatsApp de cada hotel para recibir los mensajes.
- **Gestión Visual de Reservas:** Un panel para marcar manualmente si una solicitud que entró por WhatsApp se concretó ("confirmada") o se rechazó ("cancelada").
- Visualizar usuarios registrados.

## 4. ALCANCE DEL PROYECTO
Incluye:
- Catálogo web rápido y optimizado (SEO).
- Generador dinámico de enlaces y mensajes de WhatsApp.
- Panel administrativo para gestionar la vitrina de hoteles y controlar estados de clientes potenciales.
- Deploy en producción y base de datos configurada.
