import { RateLimitError } from './errors'

/**
 * Rate limiter simple basado en memoria
 * Para producción, usar Redis o similar
 */

interface RateLimitConfig {
  interval: number // en milisegundos
  maxRequests: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpiar entradas expiradas cada minuto
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.requests.entries()) {
        if (entry.resetTime < now) {
          this.requests.delete(key)
        }
      }
    }, 60000)
  }

  check(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    if (!entry || entry.resetTime < now) {
      // Nueva ventana de tiempo
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + config.interval,
      })
      return true
    }

    if (entry.count >= config.maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingRequests(identifier: string, config: RateLimitConfig): number {
    const entry = this.requests.get(identifier)
    if (!entry || entry.resetTime < Date.now()) {
      return config.maxRequests
    }
    return Math.max(0, config.maxRequests - entry.count)
  }

  getResetTime(identifier: string): number | null {
    const entry = this.requests.get(identifier)
    return entry ? entry.resetTime : null
  }

  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.requests.clear()
  }
}

// Instancia global
const rateLimiter = new RateLimiter()

/**
 * Configuraciones predefinidas
 */
export const RATE_LIMITS = {
  // APIs públicas
  PUBLIC_API: { interval: 60000, maxRequests: 60 }, // 60 req/min
  
  // Autenticación
  LOGIN: { interval: 900000, maxRequests: 5 }, // 5 intentos/15min
  REGISTER: { interval: 3600000, maxRequests: 3 }, // 3 registros/hora
  PASSWORD_RESET: { interval: 3600000, maxRequests: 3 }, // 3 resets/hora
  
  // Búsquedas
  SEARCH: { interval: 60000, maxRequests: 30 }, // 30 búsquedas/min
  
  // Reservas
  CREATE_RESERVATION: { interval: 300000, maxRequests: 5 }, // 5 reservas/5min
  
  // Contacto
  CONTACT_FORM: { interval: 3600000, maxRequests: 3 }, // 3 mensajes/hora
  
  // Admin
  ADMIN_API: { interval: 60000, maxRequests: 120 }, // 120 req/min
}

/**
 * Middleware de rate limiting
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.PUBLIC_API
): void {
  const allowed = rateLimiter.check(identifier, config)
  
  if (!allowed) {
    const resetTime = rateLimiter.getResetTime(identifier)
    const waitTime = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60
    
    throw new RateLimitError(
      `Demasiadas solicitudes. Intenta de nuevo en ${waitTime} segundos.`
    )
  }
}

/**
 * Helper para obtener identificador único del cliente
 */
export function getClientIdentifier(request: Request): string {
  // Intentar obtener IP real detrás de proxies
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // Combinar con user agent para mayor precisión
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}-${userAgent.substring(0, 50)}`
}

/**
 * Helper para rate limiting por usuario autenticado
 */
export function getUserIdentifier(userId: string, action: string): string {
  return `user:${userId}:${action}`
}

export { rateLimiter }
