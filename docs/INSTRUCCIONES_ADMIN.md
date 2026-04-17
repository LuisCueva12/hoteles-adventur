# Configuración de Usuario Admin - Hotel Adventur

## 1. Variables de Entorno Configuradas

Ya están configuradas en `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=https://dmjgxztdwkrfryptwdcr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtamd4enRkd2tyZnJ5cHR3ZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODI3NTYsImV4cCI6MjA5MTg1ODc1Nn0.6PF3emr9QBi0qapNxXJH6Woc88KgkwH_GZs7eg0Y5p0
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_kDIIUDatXEKoCoKk2CJCAg_NTuY-vZX
```

## 2. Crear Usuario Admin (Manual)

Ve al Dashboard de Supabase:
1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto `dmjgxztdwkrfryptwdcr`
3. Ir a **Authentication** -> **Users**
4. Hacer clic en **Add user**
5. Ingresar:
   - **Email**: `admin@hoteladventur.com`
   - **Password**: `admin123`
6. Marcar **Auto-confirm user**
7. Hacer clic en **Save**

## 3. Asignar Rol Admin

Después de crear el usuario, ejecuta esto en el SQL Editor de Supabase:
```sql
UPDATE usuarios 
SET rol = 'admin', verificado = true 
WHERE email = 'admin@hoteladventur.com';
```

## 4. Verificar Usuario Admin

Para verificar que el usuario fue creado correctamente:
```sql
SELECT id, email, nombre, apellido, rol, verificado 
FROM usuarios 
WHERE email = 'admin@hoteladventur.com';
```

## 5. Probar Login

Inicia sesión en tu aplicación:
- **Email**: `admin@hoteladventur.com`
- **Password**: `admin123`

Si todo está configurado correctamente, deberías ser redirigido a `/admin` y tener acceso completo al sistema.

## 6. Solución de Problemas

Si el login falla:
1. Verifica que las variables de entorno estén correctas
2. Confirma que el usuario exista en la tabla `usuarios`
3. Revisa que el rol sea `'admin'`
4. Verifica que `verificado = true`

## 7. Cambiar Contraseña (Opcional)

Para cambiar la contraseña del admin:
1. Ve a Authentication -> Users en Supabase
2. Encuentra el usuario `admin@hoteladventur.com`
3. Haz clic en los tres puntos y selecciona **Reset password**
