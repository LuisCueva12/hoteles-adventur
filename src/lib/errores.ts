export class ErrorApp extends Error {
  constructor(
    message: string,
    public codigoEstado: number = 500,
    public codigo?: string,
    public esOperacional: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ErrorValidacion extends ErrorApp {
  constructor(message: string, public campo?: string) {
    super(message, 400, 'ERROR_VALIDACION')
  }
}

export class ErrorAutenticacion extends ErrorApp {
  constructor(message: string = 'No autenticado') {
    super(message, 401, 'ERROR_AUTENTICACION')
  }
}

export class ErrorAutorizacion extends ErrorApp {
  constructor(message: string = 'No autorizado') {
    super(message, 403, 'ERROR_AUTORIZACION')
  }
}

export class ErrorNoEncontrado extends ErrorApp {
  constructor(recurso: string = 'Recurso') {
    super(`${recurso} no encontrado`, 404, 'NO_ENCONTRADO')
  }
}

export class ErrorConflicto extends ErrorApp {
  constructor(message: string) {
    super(message, 409, 'CONFLICTO')
  }
}

export class ErrorLimiteVelocidad extends ErrorApp {
  constructor(message: string = 'Demasiadas solicitudes') {
    super(message, 429, 'LIMITE_VELOCIDAD_EXCEDIDO')
  }
}

export class ErrorBaseDatos extends ErrorApp {
  constructor(message: string = 'Error de base de datos') {
    super(message, 500, 'ERROR_BASE_DATOS', false)
  }
}

export class ErrorServicioExterno extends ErrorApp {
  constructor(servicio: string, message?: string) {
    super(
      message || `Error en servicio externo: ${servicio}`,
      503,
      'ERROR_SERVICIO_EXTERNO',
      false
    )
  }
}

export class Registrador {
  private static esDesarrollo = process.env.NODE_ENV === 'development'

  static error(error: Error | ErrorApp, contexto?: Record<string, any>) {
    const datosError = {
      nombre: error.name,
      mensaje: error.message,
      pila: error.stack,
      marcaTiempo: new Date().toISOString(),
      ...(error instanceof ErrorApp && {
        codigoEstado: error.codigoEstado,
        codigo: error.codigo,
        esOperacional: error.esOperacional,
      }),
      ...contexto,
    }

    if (this.esDesarrollo) {
      console.error('❌ Error:', datosError)
    } else {
      console.error(JSON.stringify(datosError))
    }
  }

  static advertencia(mensaje: string, contexto?: Record<string, any>) {
    const datosLog = {
      nivel: 'advertencia',
      mensaje,
      marcaTiempo: new Date().toISOString(),
      ...contexto,
    }

    if (this.esDesarrollo) {
      console.warn('⚠️ Advertencia:', datosLog)
    } else {
      console.warn(JSON.stringify(datosLog))
    }
  }

  static info(mensaje: string, contexto?: Record<string, any>) {
    const datosLog = {
      nivel: 'info',
      mensaje,
      marcaTiempo: new Date().toISOString(),
      ...contexto,
    }

    if (this.esDesarrollo) {
      console.info('ℹ️ Info:', datosLog)
    } else {
      console.info(JSON.stringify(datosLog))
    }
  }

  static depurar(mensaje: string, contexto?: Record<string, any>) {
    if (this.esDesarrollo) {
      console.debug('🐛 Debug:', {
        mensaje,
        marcaTiempo: new Date().toISOString(),
        ...contexto,
      })
    }
  }
}

export function manejarErrorApi(error: unknown): {
  mensaje: string
  codigoEstado: number
  codigo?: string
} {
  Registrador.error(error as Error)

  if (error instanceof ErrorApp) {
    return {
      mensaje: error.message,
      codigoEstado: error.codigoEstado,
      codigo: error.codigo,
    }
  }

  if (error instanceof Error) {
    return {
      mensaje: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error interno del servidor',
      codigoEstado: 500,
      codigo: 'ERROR_INTERNO',
    }
  }

  return {
    mensaje: 'Error desconocido',
    codigoEstado: 500,
    codigo: 'ERROR_DESCONOCIDO',
  }
}

export function manejadorAsincrono<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args)
    } catch (error) {
      Registrador.error(error as Error, { funcion: fn.name, argumentos: args })
      throw error
    }
  }
}

export async function reintentarOperacion<T>(
  operacion: () => Promise<T>,
  opciones: {
    maxReintentos?: number
    retraso?: number
    retroceso?: boolean
    alReintentar?: (intento: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxReintentos = 3,
    retraso = 1000,
    retroceso = true,
    alReintentar,
  } = opciones

  let ultimoError: Error

  for (let intento = 1; intento <= maxReintentos; intento++) {
    try {
      return await operacion()
    } catch (error) {
      ultimoError = error as Error
      
      if (intento === maxReintentos) {
        break
      }

      const tiempoEspera = retroceso ? retraso * Math.pow(2, intento - 1) : retraso
      
      Registrador.advertencia(`Reintentando operación (${intento}/${maxReintentos})`, {
        error: ultimoError.message,
        tiempoEspera,
      })

      if (alReintentar) {
        alReintentar(intento, ultimoError)
      }

      await new Promise(resolve => setTimeout(resolve, tiempoEspera))
    }
  }

  throw ultimoError!
}
