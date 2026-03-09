import { createClient } from '@/utils/supabase/client'

export interface Notification {
  id: string
  usuario_id: string
  tipo: 'success' | 'warning' | 'info' | 'error'
  titulo: string
  mensaje: string
  leida: boolean
  url?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export class NotificationsService {
  private supabase = createClient()

  // Crear una nueva notificación
  async createNotification(
    usuarioId: string,
    tipo: 'success' | 'warning' | 'info' | 'error',
    titulo: string,
    mensaje: string,
    url?: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notificaciones')
        .insert({
          usuario_id: usuarioId,
          tipo,
          titulo,
          mensaje,
          url,
          metadata,
          leida: false
        })

      if (error) {
        console.error('Error creando notificación:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error creando notificación:', error)
      return false
    }
  }

  // Notificar a todos los administradores
  async notifyAdmins(
    tipo: 'success' | 'warning' | 'info' | 'error',
    titulo: string,
    mensaje: string,
    url?: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      // Obtener todos los administradores
      const { data: admins, error: adminError } = await this.supabase
        .from('usuarios')
        .select('id')
        .eq('rol', 'admin_adventur')

      if (adminError || !admins || admins.length === 0) {
        console.warn('No se encontraron administradores')
        return false
      }

      // Crear notificación para cada admin
      const promises = admins.map(admin =>
        this.createNotification(admin.id, tipo, titulo, mensaje, url, metadata)
      )

      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Error notificando a administradores:', error)
      return false
    }
  }

  // Obtener notificaciones del usuario actual
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notificaciones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error obteniendo notificaciones:', error)
      return []
    }

    return data || []
  }

  // Obtener notificaciones no leídas
  async getUnreadNotifications(): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notificaciones')
      .select('*')
      .eq('leida', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo notificaciones no leídas:', error)
      return []
    }

    return data || []
  }

  // Contar notificaciones no leídas
  async getUnreadCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('leida', false)

    if (error) {
      console.error('Error contando notificaciones:', error)
      return 0
    }

    return count || 0
  }

  // Marcar notificación como leída
  async markAsRead(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id)

    if (error) {
      console.error('Error marcando notificación como leída:', error)
      return false
    }

    return true
  }

  // Marcar todas como leídas
  async markAllAsRead(): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) return false

    const { error } = await this.supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', user.id)
      .eq('leida', false)

    if (error) {
      console.error('Error marcando todas como leídas:', error)
      return false
    }

    return true
  }

  // Eliminar notificación
  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('notificaciones')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error eliminando notificación:', error)
      return false
    }

    return true
  }

  // Eliminar todas las notificaciones
  async deleteAllNotifications(): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) return false

    const { error } = await this.supabase
      .from('notificaciones')
      .delete()
      .eq('usuario_id', user.id)

    if (error) {
      console.error('Error eliminando todas las notificaciones:', error)
      return false
    }

    return true
  }

  // Suscribirse a cambios en tiempo real
  subscribeToNotifications(callback: (notification: Notification) => void) {
    const channel = this.supabase
      .channel('notificaciones-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones'
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  // Formatear tiempo relativo
  getTimeAgo(date: string): string {
    const now = new Date()
    const notificationDate = new Date(date)
    const diff = now.getTime() - notificationDate.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Hace un momento'
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  }
}

export const notificationsService = new NotificationsService()
