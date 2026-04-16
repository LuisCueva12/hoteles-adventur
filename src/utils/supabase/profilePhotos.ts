import { createClient } from './client'

export function validateProfilePhotoFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024
  
  return validTypes.includes(file.type) && file.size <= maxSize
}

export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  const supabase = createClient()
  
  if (!validateProfilePhotoFile(file)) {
    throw new Error('Archivo inválido. Debe ser JPEG, PNG o WebP y no superar 5MB')
  }
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/profile.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file, { upsert: true })
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(fileName)
  
  return publicUrl
}

export async function deleteProfilePhoto(userId: string): Promise<void> {
  const supabase = createClient()
  
  const { data: files } = await supabase.storage
    .from('profile-photos')
    .list(userId)
  
  if (files && files.length > 0) {
    const filePaths = files.map(file => `${userId}/${file.name}`)
    await supabase.storage
      .from('profile-photos')
      .remove(filePaths)
  }
}
