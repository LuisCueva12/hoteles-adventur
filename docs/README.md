# Documentación - Hotel Adventur

## 📁 Archivos

- `BASE_DE_DATOS.md` - Esquema de la base de datos
- `INSTRUCCIONES_ADMIN.md` - Configuración de usuarios admin

## 🔐 Autenticación

Sistema optimizado con arquitectura SOLID en `src/lib/auth/`:
- Solo valida rol `admin` para acceso al panel
- Middleware protege rutas en servidor
- RLS policies en base de datos
- Hook `useAdminAuth` para estado en cliente

## SQL Útil

```sql
-- Ver admins
SELECT email, nombre FROM usuarios WHERE rol = 'admin';

-- Hacer admin
UPDATE usuarios SET rol = 'admin' WHERE email = 'usuario@ejemplo.com';
```

