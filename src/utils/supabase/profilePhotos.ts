import type { SupabaseClient } from '@supabase/supabase-js'

const PROFILE_BUCKETS = ['profile-photos', 'public'] as const
const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024

type UploadProfilePhotoParams = {
  supabase: SupabaseClient
  file: File
  ownerUserId: string
  targetUserId?: string
}

export function validateProfilePhotoFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Por favor selecciona una imagen valida.'
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    return 'La imagen no debe superar los 5 MB.'
  }

  return null
}

export async function uploadProfilePhoto({
  supabase,
  file,
  ownerUserId,
  targetUserId,
}: UploadProfilePhotoParams) {
  const normalizedExtension = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const safeExtension = normalizedExtension.replace(/[^a-z0-9]/g, '') || 'jpg'
  const entityId = targetUserId || ownerUserId
  const filePath = `${ownerUserId}/${entityId}-${Date.now()}.${safeExtension}`
  const uploadErrors: string[] = []

  for (const bucket of PROFILE_BUCKETS) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      })

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return {
        bucket,
        filePath,
        publicUrl,
      }
    }

    uploadErrors.push(`${bucket}: ${error.message}`)
  }

  throw new Error(uploadErrors.join(' | '))
}
