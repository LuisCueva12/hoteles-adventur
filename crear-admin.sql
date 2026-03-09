-- Script para crear o actualizar un usuario administrador
-- Opción 1: Actualizar un usuario existente (reemplaza 'tu-email@ejemplo.com' con tu email)
UPDATE usuarios 
SET rol = 'admin_adventur' 
WHERE email = 'tu-email@ejemplo.com';

-- Opción 2: Si necesitas crear un nuevo usuario directamente en la base de datos
-- IMPORTANTE: Primero debes crear el usuario en Supabase Auth, luego ejecutar esto:
-- INSERT INTO usuarios (id, email, nombre, apellido, rol, created_at, updated_at)
-- VALUES (
--   'uuid-del-usuario-de-auth',  -- Obtén esto de auth.users
--   'admin@adventur.com',
--   'Admin',
--   'Adventur',
--   'admin_adventur',
--   NOW(),
--   NOW()
-- );

-- Verificar usuarios y sus roles
SELECT id, email, nombre, apellido, rol, created_at 
FROM usuarios 
ORDER BY created_at DESC;
