# Estándares de Arquitectura: Plataforma Multihotel por WhatsApp

El diseño se centra en un **flujo de captación de leads (Solicitudes)** en lugar de un motor financiero. La arquitectura será Next.js App Router + Monolito Modular.

## 1. Estructura de Directorios

```text
/
├── /src
│   ├── /app                       
│   │   ├── /(cliente)             # Vitrina pública
│   │   │   ├── /page.tsx          # Buscador de ciudades
│   │   │   ├── /hoteles/[id]      # Catálogo del hotel (habitaciones)
│   │   │   ├── /checkout/[habId]  # Formulario personalizado -> Botón 'Reservar por WhatsApp'
│   │   ├── /(admin)               
│   │   │   ├── /dashboard         
│   │   │   ├── /hoteles           # Configurar información y Número de WhatsApp de recepción.
│   │   │   ├── /reservas          # Panel donde el Admin cambia de 'contacto_whatsapp' a 'confirmada'.
│   │
│   ├── /modulos                   # LÓGICA DE NEGOCIO (Monolito Modular)
│   │   ├── /hoteles
│   │   ├── /habitaciones
│   │   ├── /reservas_whatsapp     # Módulo enfocado 100% en capturar el formulario y procesar la URL.
│   │   ├── /usuarios
```

## 2. Flujo Exclusivo de Reserva por WhatsApp

1. **Catálogo:** El cliente selecciona una habitación del hotel deseado y pulsa "Solicitar Reserva".
2. **Formulario:** Se levanta una vista (`/checkout/[id_habitacion]`) ofreciendo un Formulario Personalizado (Nombre, Teléfono, Fechas).
3. **Generación (Action):** Next.js Server Action intercepta los datos, inserta una traza de la intención en Postgres (`estado: contacto_whatsapp`) para que el hotel tenga registro de que alguien intentó agendar.
4. **Mutación de Cadena (Dominio):** 
   - Se consulta el componente `hoteles` para sacar el *Teléfono WhatsApp* oficial del hotel.
   - Se procesa un string de URL: `https://wa.me/52111111111?text=Hola,%20soy...`
5. **Redirección:** El servidor responde con la URL, y el Frontend hace una redirección (o simplemente un `<a href=... target="_blank">`) enviando al cliente a conversar directo con recepción.

## 3. Consideraciones para el Equipo

- **Dev Reservas:** Su lógica es mucho más simple que un gateway de pagos. Se encarga de codificar el `String` del texto para WhatsApp en base a fechas formateadas e información del hotel (`encodeURIComponent`), y grabar pasivamente en base de datos.
- **Panel Admin:** Las reservas ahora son visualizadas por recepción como "Leads/Oportunidades" que llamaron o cribaron por WhatsApp. El recepcionista deberá marcarlas como aprobadas o denegadas.
