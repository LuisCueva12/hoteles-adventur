import { ErrorLimiteVelocidad } from './errores'

interface ConfigLimiteVelocidad {
  intervalo: number
  maxSolicitudes: number
}

interface EntradaLimiteVelocidad {
  contador: number
  tiempoReinicio: number
}

class LimitadorVelocidad {
  private solicitudes: Map<string, EntradaLimiteVelocidad> = new Map()
  private intervaloLimpieza: NodeJS.Timeout

  constructor() {
    this.intervaloLimpieza = setInterval(() => {
      const ahora = Date.now()
      for (const [clave, entrada] of this.solicitudes.entries()) {
        if (entrada.tiempoReinicio < ahora) {
          this.solicitudes.delete(clave)
        }
      }
    }, 60000)
  }

  verificar(identificador: string, config: ConfigLimiteVelocidad): boolean {
    const ahora = Date.now()
    const entrada = this.solicitudes.get(identificador)

    if (!entrada || entrada.tiempoReinicio < ahora) {
      this.solicitudes.set(identificador, {
        contador: 1,
        tiempoReinicio: ahora + config.intervalo,
      })
      return true
    }

    if (entrada.contador >= config.maxSolicitudes) {
      return false
    }

    entrada.contador++
    return true
  }

  obtenerSolicitudesRestantes(identificador: string, config: ConfigLimiteVelocidad): number {
    const entrada = this.solicitudes.get(identificador)
    if (!entrada || entrada.tiempoReinicio < Date.now()) {
      return config.maxSolicitudes
    }
    return Math.max(0, config.maxSolicitudes - entrada.contador)
  }

  obtenerTiempoReinicio(identificador: string): number | null {
    const entrada = this.solicitudes.get(identificador)
    return entrada ? entrada.tiempoReinicio : null
  }

  reiniciar(identificador: string): void {
    this.solicitudes.delete(identificador)
  }

  destruir(): void {
    clearInterval(this.intervaloLimpieza)
    this.solicitudes.clear()
  }
}

const limitadorVelocidad = new LimitadorVelocidad()

export const LIMITES_VELOCIDAD = {
  API_PUBLICA: { intervalo: 60000, maxSolicitudes: 60 },
  LOGIN: { intervalo: 900000, maxSolicitudes: 5 },
  REGISTRO: { intervalo: 3600000, maxSolicitudes: 3 },
  RESETEO_CONTRASENA: { intervalo: 3600000, maxSolicitudes: 3 },
  BUSQUEDA: { intervalo: 60000, maxSolicitudes: 30 },
  CREAR_RESERVA: { intervalo: 300000, maxSolicitudes: 5 },
  FORMULARIO_CONTACTO: { intervalo: 3600000, maxSolicitudes: 3 },
  API_ADMIN: { intervalo: 60000, maxSolicitudes: 120 },
}

export function verificarLimiteVelocidad(
  identificador: string,
  config: ConfigLimiteVelocidad = LIMITES_VELOCIDAD.API_PUBLICA
): void {
  const permitido = limitadorVelocidad.verificar(identificador, config)
  
  if (!permitido) {
    const tiempoReinicio = limitadorVelocidad.obtenerTiempoReinicio(identificador)
    const tiempoEspera = tiempoReinicio ? Math.ceil((tiempoReinicio - Date.now()) / 1000) : 60
    
    throw new ErrorLimiteVelocidad(
      `Demasiadas solicitudes. Intenta de nuevo en ${tiempoEspera} segundos.`
    )
  }
}

export function obtenerIdentificadorCliente(solicitud: Request): string {
  const reenviado = solicitud.headers.get('x-forwarded-for')
  const ipReal = solicitud.headers.get('x-real-ip')
  const ip = reenviado?.split(',')[0] || ipReal || 'desconocido'
  
  const agenteUsuario = solicitud.headers.get('user-agent') || 'desconocido'
  
  return `${ip}-${agenteUsuario.substring(0, 50)}`
}

export function obtenerIdentificadorUsuario(idUsuario: string, accion: string): string {
  return `usuario:${idUsuario}:${accion}`
}

export { limitadorVelocidad }
