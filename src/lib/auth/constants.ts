// Constantes de autenticación
export const AUTH_ROUTES = {
  LOGIN: '/login',
  ADMIN: '/admin',
  ACCESS_DENIED: '/acceso-denegado',
  HOME: '/',
} as const

export const ADMIN_ROLE = 'admin' as const

export const AUTH_ERRORS = {
  NO_SESSION: 'No hay sesión activa',
  NO_USER: 'Usuario no encontrado',
  NOT_ADMIN: 'Usuario no es administrador',
  AUTH_FAILED: 'Autenticación fallida',
} as const
