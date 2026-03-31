import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import { defaultSiteConfig, normalizeSiteConfig } from './site-config'

export const getSiteConfig = cache(async () => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('Site config not available, using defaults:', error.message)
      return defaultSiteConfig
    }

    return normalizeSiteConfig(data)
  } catch {
    return defaultSiteConfig
  }
})
