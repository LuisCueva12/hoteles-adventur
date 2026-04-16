export function limpiarEntrada(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function limpiarHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
}

export function limpiarUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

export function generarTokenCsrf(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function validarTokenCsrf(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken || token.length !== expectedToken.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i)
  }
  
  return result === 0
}

export async function hashearContrasena(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generarIdSeguro(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function esUuidValido(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)
}

export function escaparSql(value: string): string {
  return value.replace(/'/g, "''")
}

export function esEmailValido(email: string): boolean {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)
}

export function esTelefonoPeruanoValido(phone: string): boolean {
  return /^(\+51)?9\d{8}$/.test(phone.replace(/\s/g, ''))
}

export function esDniValido(dni: string): boolean {
  return /^\d{8}$/.test(dni)
}

export function esRucValido(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc)) {
    return false
  }
  
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let sum = 0
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(ruc[i]) * weights[i]
  }
  
  const remainder = sum % 11
  const checkDigit = remainder === 0 ? 0 : 11 - remainder
  
  return checkDigit === parseInt(ruc[10])
}

export function enmascararDatosSensibles(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length)
  }
  
  const visible = data.slice(-visibleChars)
  const masked = '*'.repeat(data.length - visibleChars)
  
  return masked + visible
}

export function obtenerFortalezaContrasena(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  else feedback.push('Usa al menos 12 caracteres')
  
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

export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

export function aplicarCabecerasSeguridad(headers: Headers): Headers {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value)
  })
  return headers
}
