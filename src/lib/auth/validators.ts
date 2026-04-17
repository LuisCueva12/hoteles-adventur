import { ADMIN_ROLE } from './constants'
import type { AdminProfile } from './types'

export function isAdmin(profile: { rol: string } | null): profile is AdminProfile {
  return profile?.rol === ADMIN_ROLE
}

export function validateAdminAccess(profile: { rol: string } | null): boolean {
  return isAdmin(profile)
}
