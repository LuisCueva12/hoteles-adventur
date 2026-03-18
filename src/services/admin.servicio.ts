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

export class AdminService {
  public supabase = createClient()

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Total de alojamientos
      const { count: totalHabitaciones } = await this.supabase
        .from('alojamientos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      // Reservas activas (confirmadas y pendientes)
      const { count: reservasActivas } = await this.supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['confirmada', 'pendiente'])

      // Total usuarios
      const { count: usuariosRegistrados } = await this.supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })

      // Ingresos del mes actual
      const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { data: pagosData } = await this.supabase
        .from('pagos')
        .select('monto')
        .eq('estado', 'aprobado')
        .gte('fecha_pago', primerDiaMes)

      const ingresosMes = pagosData?.reduce((sum, pago) => sum + Number(pago.monto), 0) || 0

      // Check-ins y check-outs de hoy
      const hoy = new Date().toISOString().split('T')[0]
      const { count: checkinsHoy } = await this.supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .eq('fecha_inicio', hoy)
        .eq('estado', 'confirmada')

      const { count: checkoutsHoy } = await this.supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .eq('fecha_fin', hoy)
        .eq('estado', 'confirmada')

      // Reservas pendientes
      const { count: pendientes } = await this.supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')

      // Calcular ocupación actual
      const { data: reservasHoy } = await this.supabase
        .from('reservas')
        .select('alojamiento_id')
        .eq('estado', 'confirmada')
        .lte('fecha_inicio', hoy)
        .gte('fecha_fin', hoy)

      const habitacionesOcupadas = new Set(reservasHoy?.map(r => r.alojamiento_id)).size
      const ocupacionActual = totalHabitaciones ? Math.round((habitacionesOcupadas / totalHabitaciones) * 100) : 0

      return {
        totalHabitaciones: totalHabitaciones || 0,
        reservasActivas: reservasActivas || 0,
        usuariosRegistrados: usuariosRegistrados || 0,
        ingresosMes,
        ocupacionActual,
        checkinsHoy: checkinsHoy || 0,
        checkoutsHoy: checkoutsHoy || 0,
        pendientes: pendientes || 0,
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
        .select(`
          *,
          usuarios(nombre, apellido),
          alojamientos(nombre)
        `)
        .order('fecha_creacion', { ascending: false })
        .limit(limit)

      const { data: pagos } = await this.supabase
        .from('pagos')
        .select(`
          *,
          reservas(usuarios(nombre, apellido))
        `)
        .order('fecha_pago', { ascending: false })
        .limit(limit)

      const activities: ActivityLog[] = []

      reservas?.forEach(reserva => {
        const usuario = reserva.usuarios as any
        activities.push({
          type: 'reserva',
          user: `${usuario?.nombre} ${usuario?.apellido}`,
          action: `Nueva reserva - ${(reserva.alojamientos as any)?.nombre}`,
          time: this.getTimeAgo(new Date(reserva.fecha_creacion)),
          status: reserva.estado === 'confirmada' ? 'success' : reserva.estado === 'cancelada' ? 'warning' : 'info'
        })
      })

      pagos?.forEach(pago => {
        const usuario = (pago.reservas as any)?.usuarios
        activities.push({
          type: 'pago',
          user: `${usuario?.nombre} ${usuario?.apellido}`,
          action: `Pago ${pago.estado} - S/. ${pago.monto}`,
          time: this.getTimeAgo(new Date(pago.fecha_pago)),
          status: pago.estado === 'aprobado' ? 'success' : pago.estado === 'rechazado' ? 'warning' : 'info'
        })
      })

      return activities.sort((a, b) => {
        const timeA = this.parseTimeAgo(a.time)
        const timeB = this.parseTimeAgo(b.time)
        return timeA - timeB
      }).slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
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

  async getAlojamientos() {
    const { data, error } = await this.supabase
      .from('alojamientos')
      .select(`
        *,
        usuarios(nombre, apellido),
        fotos_alojamiento(url, es_principal)
      `)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data
  }

  async createAlojamiento(alojamiento: any) {
    const { data, error } = await this.supabase
      .from('alojamientos')
      .insert([alojamiento])
      .select()

    if (error) throw error
    return data
  }

  async getReservas() {
    try {
      const { data, error } = await this.supabase
        .from('reservas')
        .select(`
          *,
          usuarios:usuario_id(nombre, apellido, email),
          alojamientos:alojamiento_id(nombre, tipo),
          pagos(monto, estado, metodo)
        `)
        .order('fecha_creacion', { ascending: false })

      if (error) {
        console.error('Error en getReservas:', error)
        throw error
      }
      
      console.log('Datos de reservas obtenidos:', data)
      return data || []
    } catch (error) {
      console.error('Error completo en getReservas:', error)
      return []
    }
  }

  async getUsuarios() {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .order('fecha_registro', { ascending: false })

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

  async getMonthlyRevenue(): Promise<{ month: string; value: number; raw: number }[]> {
    try {
      const year = new Date().getFullYear()
      const { data } = await this.supabase
        .from('pagos')
        .select('monto, fecha_pago')
        .eq('estado', 'aprobado')
        .gte('fecha_pago', `${year}-01-01`)
        .lte('fecha_pago', `${year}-12-31`)

      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
      const totals = Array(12).fill(0)

      data?.forEach(pago => {
        const month = new Date(pago.fecha_pago).getMonth()
        totals[month] += Number(pago.monto)
      })

      const maxVal = Math.max(...totals, 1)
      return months.map((month, i) => ({
        month,
        raw: totals[i],
        value: Math.round((totals[i] / maxVal) * 100)
      }))
    } catch {
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
      return months.map(month => ({ month, value: 0, raw: 0 }))
    }
  }
}

export const adminService = new AdminService()
