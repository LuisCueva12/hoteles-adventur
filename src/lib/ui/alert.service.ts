import Swal, { type SweetAlertIcon, type SweetAlertResult } from 'sweetalert2'

interface AlertOptions {
  title: string
  text?: string
  icon?: SweetAlertIcon
  confirmButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  timer?: number
  html?: string
}

interface ConfirmOptions {
  title: string
  text: string
  confirmButtonText?: string
  cancelButtonText?: string
  icon?: SweetAlertIcon
}

export class AlertService {
  private static readonly DEFAULT_COLORS = {
    confirm: '#3B82F6',
    cancel: '#6B7280',
    danger: '#dc2626',
  }

  static async success(title: string, text?: string, timer = 2000): Promise<void> {
    await Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: this.DEFAULT_COLORS.confirm,
      timer,
      showConfirmButton: !timer,
    })
  }

  static async error(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: this.DEFAULT_COLORS.danger,
    })
  }

  static async info(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: this.DEFAULT_COLORS.confirm,
    })
  }

  static async warning(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: this.DEFAULT_COLORS.confirm,
    })
  }

  static async confirm(options: ConfirmOptions): Promise<boolean> {
    const result = await Swal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon || 'question',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || 'Confirmar',
      cancelButtonText: options.cancelButtonText || 'Cancelar',
      confirmButtonColor: this.DEFAULT_COLORS.confirm,
      cancelButtonColor: this.DEFAULT_COLORS.cancel,
    })

    return result.isConfirmed
  }

  static async confirmDanger(options: ConfirmOptions): Promise<boolean> {
    const result = await Swal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon || 'warning',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || 'Confirmar',
      cancelButtonText: options.cancelButtonText || 'Cancelar',
      confirmButtonColor: this.DEFAULT_COLORS.danger,
      cancelButtonColor: this.DEFAULT_COLORS.cancel,
    })

    return result.isConfirmed
  }

  static async custom(options: AlertOptions): Promise<SweetAlertResult> {
    return await Swal.fire({
      title: options.title,
      text: options.text,
      html: options.html,
      icon: options.icon,
      showCancelButton: options.showCancelButton,
      confirmButtonText: options.confirmButtonText || 'Aceptar',
      cancelButtonText: options.cancelButtonText || 'Cancelar',
      confirmButtonColor: this.DEFAULT_COLORS.confirm,
      cancelButtonColor: this.DEFAULT_COLORS.cancel,
      timer: options.timer,
    })
  }
}
