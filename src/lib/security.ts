/**
 * Utilidades de seguridad
 */

/**
 * Sanitizar input del usuario para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim()
}

/**
 * Sanitizar HTML permitiendo solo tags seguros
 */
export function sanitizeHtml(html: string): string {
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li']
  const allowedAttributes = ['href', 'title']
  
  // Implementación básica - en producción usar DOMPurify
  let sanitized = html
  
  // Remover scripts
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remover event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remover javascript: en hrefs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
  
  return sanitized
}

/**
 * Validar y sanitizar URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Generar token CSRF
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validar token CSRF
 */
export function validateCsrfToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false
  }
  
  // Comparación de tiempo constante para prevenir timing attacks
  if (token.length !== expectedToken.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Hash de contraseña (para verificación adicional, Supabase ya maneja esto)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generar ID único seguro
 */
export function generateSecureId(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validar que un string es un UUID válido
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Escapar caracteres especiales para SQL (prevención adicional)
 */
export function escapeSql(value: string): string {
  return value.replace(/'/g, "''")
}

/**
 * Validar email con regex robusto
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * Validar teléfono peruano
 */
export function isValidPeruvianPhone(phone: string): boolean {
  // Formato: +51 9XX XXX XXX o 9XX XXX XXX
  const phoneRegex = /^(\+51)?9\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validar DNI peruano
 */
export function isValidDni(dni: string): boolean {
  return /^\d{8}$/.test(dni)
}

/**
 * Validar RUC peruano
 */
export function isValidRuc(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc)) {
    return false
  }
  
  // Validación de dígito verificador
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let sum = 0
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(ruc[i]) * weights[i]
  }
  
  const remainder = sum % 11
  const checkDigit = remainder === 0 ? 0 : 11 - remainder
  
  return checkDigit === parseInt(ruc[10])
}

/**
 * Ofuscar información sensible para logs
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length)
  }
  
  const visible = data.slice(-visibleChars)
  const masked = '*'.repeat(data.length - visibleChars)
  
  return masked + visible
}

/**
 * Validar fuerza de contraseña
 */
export function getPasswordStrength(password: string): {
  score: number // 0-4
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Longitud
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  else feedback.push('Usa al menos 12 caracteres')
  
  // Complejidad
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Incluye mayúsculas y minúsculas')
  }
  
  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Incluye números')
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Incluye caracteres especiales')
  }
  
  // Patrones comunes
  const commonPatterns = ['123456', 'password', 'qwerty', 'abc123']
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score = Math.max(0, score - 2)
    feedback.push('Evita patrones comunes')
  }
  
  return {
    score: Math.min(4, score),
    feedback,
  }
}

/**
 * Headers de seguridad recomendados
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

/**
 * Aplicar headers de seguridad a una respuesta
 */
export function applySecurityHeaders(headers: Headers): Headers {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value)
  })
  return headers
}
