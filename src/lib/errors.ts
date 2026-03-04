/**
 * Sistema centralizado de manejo de errores
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Demasiadas solicitudes') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Error de base de datos') {
    super(message, 500, 'DATABASE_ERROR', false)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `Error en servicio externo: ${service}`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      false
    )
  }
}

/**
 * Logger centralizado
 */
export class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development'

  static error(error: Error | AppError, context?: Record<string, any>) {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        code: error.code,
        isOperational: error.isOperational,
      }),
      ...context,
    }

    if (this.isDevelopment) {
      console.error('❌ Error:', errorData)
    } else {
      // En producción, enviar a servicio de logging (Sentry, LogRocket, etc.)
      console.error(JSON.stringify(errorData))
    }
  }

  static warn(message: string, context?: Record<string, any>) {
    const logData = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }

    if (this.isDevelopment) {
      console.warn('⚠️ Warning:', logData)
    } else {
      console.warn(JSON.stringify(logData))
    }
  }

  static info(message: string, context?: Record<string, any>) {
    const logData = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }

    if (this.isDevelopment) {
      console.info('ℹ️ Info:', logData)
    } else {
      console.info(JSON.stringify(logData))
    }
  }

  static debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      console.debug('🐛 Debug:', {
        message,
        timestamp: new Date().toISOString(),
        ...context,
      })
    }
  }
}

/**
 * Manejador de errores para APIs
 */
export function handleApiError(error: unknown): {
  message: string
  statusCode: number
  code?: string
} {
  Logger.error(error as Error)

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    }
  }

  if (error instanceof Error) {
    return {
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error interno del servidor',
      statusCode: 500,
      code: 'INTERNAL_ERROR',
    }
  }

  return {
    message: 'Error desconocido',
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
  }
}

/**
 * Wrapper para funciones async con manejo de errores
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args)
    } catch (error) {
      Logger.error(error as Error, { function: fn.name, args })
      throw error
    }
  }
}

/**
 * Retry logic para operaciones que pueden fallar
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoff?: boolean
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        break
      }

      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
      
      Logger.warn(`Reintentando operación (${attempt}/${maxRetries})`, {
        error: lastError.message,
        waitTime,
      })

      if (onRetry) {
        onRetry(attempt, lastError)
      }

      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError!
}
