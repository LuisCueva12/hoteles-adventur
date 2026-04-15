import { createClient } from '@/utils/supabase/client'

export interface DashboardStats {
  totalHabitaciones: number
  reservasActivas: number
  usuariosRegistrados: number
  ingresosMes: number
  ocupacionActual: number
  checkinsHoy: number
  checkoutsHoy: number
  pendientes: number
}

export interface ActivityLog {
  type: string
  user: string
  action: string
  time: string
  status: string
}

export interface RecentActivity {
  id: string
  type: 'reserva' | 'usuario' | 'resena' | 'hotel'
  title: string
  description: string
  timestamp: string
  user?: string
}

class DashboardService {
  private supabase = createClient()

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        totalHabitaciones,
        reservasActivas,
        usuariosRegistrados,
        checkinsHoy,
        checkoutsHoy,
        pendientes
      ] = await Promise.all([
        this.supabase.from('alojamientos').select('*', { count: 'exact', head: true }).eq('activo', true),
        this.supabase.from('reservas').select('*', { count: 'exact', head: true }).in('estado', ['confirmada', 'pendiente']),
        this.supabase.from('usuarios').select('*', { count: 'exact', head: true }),
        this.supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('fecha_inicio', new Date().toISOString().split('T')[0]).eq('estado', 'confirmada'),
        this.supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('fecha_fin', new Date().toISOString().split('T')[0]).eq('estado', 'confirmada'),
        this.supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente')
      ])

      const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { data: pagosData } = await this.supabase
        .from('pagos')
        .select('monto')
        .eq('estado', 'aprobado')
        .gte('fecha_pago', primerDiaMes)

      const ingresosMes = pagosData?.reduce((sum: number, pago: any) => sum + Number(pago.monto), 0) || 0

      const hoy = new Date().toISOString().split('T')[0]
      const { data: reservasHoy } = await this.supabase
        .from('reservas')
        .select('alojamiento_id')
        .eq('estado', 'confirmada')
        .lte('fecha_inicio', hoy)
        .gte('fecha_fin', hoy)

      const habitacionesOcupadas = new Set(reservasHoy?.map((r: any) => r.alojamiento_id)).size
      const ocupacionActual = totalHabitaciones.count ? Math.round((habitacionesOcupadas / totalHabitaciones.count) * 100) : 0

      return {
        totalHabitaciones: totalHabitaciones.count || 0,
        reservasActivas: reservasActivas.count || 0,
        usuariosRegistrados: usuariosRegistrados.count || 0,
        ingresosMes,
        ocupacionActual,
        checkinsHoy: checkinsHoy.count || 0,
        checkoutsHoy: checkoutsHoy.count || 0,
        pendientes: pendientes.count || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
    try {
      const { data: reservas } = await this.supabase
        .from('reservas')
        .select('*, usuarios(nombre, apellido), alojamientos(nombre)')
        .order('fecha_creacion', { ascending: false })
        .limit(limit)

      const { data: pagos } = await this.supabase
        .from('pagos')
        .select('*, reservas(usuarios(nombre, apellido))')
        .order('fecha_pago', { ascending: false })
        .limit(limit)

      const activities: ActivityLog[] = []

      reservas?.forEach((reserva: any) => {
        activities.push({
          type: 'reserva',
          user: `${reserva.usuarios?.nombre} ${reserva.usuarios?.apellido}`,
          action: `Nueva reserva - ${reserva.alojamientos?.nombre}`,
          time: this.getTimeAgo(new Date(reserva.fecha_creacion)),
          status: reserva.estado === 'confirmada' ? 'success' : reserva.estado === 'cancelada' ? 'warning' : 'info'
        })
      })

      pagos?.forEach((pago: any) => {
        const usuario = pago.reservas?.usuarios
        activities.push({
          type: 'pago',
          user: `${usuario?.nombre} ${usuario?.apellido}`,
          action: `Pago ${pago.estado} - S/. ${pago.monto}`,
          time: this.getTimeAgo(new Date(pago.fecha_pago)),
          status: pago.estado === 'aprobado' ? 'success' : pago.estado === 'rechazado' ? 'warning' : 'info'
        })
      })

      return activities.sort((a, b) => this.parseTimeAgo(a.time) - this.parseTimeAgo(b.time)).slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  async getReservasDelMes(): Promise<any[]> {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const { data, error } = await this.supabase
      .from('reservas')
      .select('*')
      .gte('fecha_inicio', inicioMes.toISOString())
      .order('fecha_inicio', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getUsuariosNuevos(): Promise<any[]> {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .gte('created_at', inicioMes.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getAlojamientos() {
    const { data, error } = await this.supabase
      .from('alojamientos')
      .select(`
        *,
        usuarios(nombre, apellido),
        fotos_alojamiento(url, es_principal, orden)
      `)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data?.map((a: any) => ({
      ...a,
      foto_principal: a.foto_principal || a.fotos_alojamiento?.find((f: any) => f.es_principal)?.url || a.fotos_alojamiento?.[0]?.url || null,
      slug: a.slug || a.id,
    }))
  }

  async createAlojamiento(alojamiento: any) {
    const { data, error } = await this.supabase
      .from('alojamientos')
      .insert([alojamiento])
      .select()

    if (error) throw error
    return data
  }

  async updateAlojamiento(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('alojamientos')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }

  async deleteAlojamiento(id: string) {
    const { error } = await this.supabase
      .from('alojamientos')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getReservas() {
    const { data, error } = await this.supabase
      .from('reservas')
      .select(`
        *,
        usuarios:usuario_id(nombre, apellido, email),
        alojamientos:alojamiento_id(nombre, tipo),
        pagos(monto, estado, metodo)
      `)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getUsuarios() {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .order('fecha_registro', { ascending: false })

    if (error) throw error
    return data
  }

  async updateReserva(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('reservas')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }

  async updateUsuario(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data
  }

  async deleteUsuario(id: string) {
    const { error } = await this.supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async deleteReserva(id: string) {
    const { error } = await this.supabase
      .from('reservas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async createUsuario(userData: any) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .insert([userData])
      .select()

    if (error) throw error
    return data
  }

  async createReserva(reservaData: any) {
    const { data, error } = await this.supabase
      .from('reservas')
      .insert([reservaData])
      .select()

    if (error) throw error
    return data
  }

  private getTimeAgo(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Hace un momento'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  }

  private parseTimeAgo(timeStr: string): number {
    if (timeStr.includes('momento')) return 0
    const match = timeStr.match(/\d+/)
    if (!match) return 0
    const num = parseInt(match[0])
    if (timeStr.includes('min')) return num
    if (timeStr.includes('hora')) return num * 60
    if (timeStr.includes('día')) return num * 1440
    return 0
  }
}

export const dashboardService = new DashboardService()
