import { createClient } from '@/utils/supabase/client'

export interface Notification {
  id: string
  usuario_id: string
  tipo: 'success' | 'warning' | 'info' | 'error'
  titulo: string
  mensaje: string
  leida: boolean
  url?: string
  metadata?: unknown
  created_at: string
  updated_at: string
}

export class NotificationsService {
  private supabase = createClient()

  async createNotification(
    usuarioId: string,
    tipo: 'success' | 'warning' | 'info' | 'error',
    titulo: string,
    mensaje: string,
    url?: string,
    metadata?: unknown,
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
          leida: false,
        })

      if (error) {
        console.error('Error creando notificacion:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error creando notificacion:', error)
      return false
    }
  }

  async notifyAdmins(
    tipo: 'success' | 'warning' | 'info' | 'error',
    titulo: string,
    mensaje: string,
    url?: string,
    metadata?: unknown,
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo, titulo, mensaje, url, metadata }),
      })

      if (!response.ok) {
        // Fallo silencioso — las notificaciones no deben bloquear el flujo principal
        return false
      }

      return true
    } catch {
      // Fallo silencioso
      return false
    }
  }

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

  async getUnreadNotifications(): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notificaciones')
      .select('*')
      .eq('leida', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo notificaciones no leidas:', error)
      return []
    }

    return data || []
  }

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

  async markAsRead(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id)

    if (error) {
      console.error('Error marcando notificacion como leida:', error)
      return false
    }

    return true
  }

  async markAllAsRead(): Promise<boolean> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) return false

    const { error } = await this.supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', user.id)
      .eq('leida', false)

    if (error) {
      console.error('Error marcando todas como leidas:', error)
      return false
    }

    return true
  }

  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('notificaciones')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error eliminando notificacion:', error)
      return false
    }

    return true
  }

  async deleteAllNotifications(): Promise<boolean> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

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

  subscribeToNotifications(callback: (notification: Notification) => void) {
    const channel = this.supabase
      .channel('notificaciones-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
        },
        (payload) => {
          callback(payload.new as Notification)
        },
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

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
    return `Hace ${days} dia${days > 1 ? 's' : ''}`
  }
}

export const notificationsService = new NotificationsService()
