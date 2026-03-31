'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/utils/supabase/client'
import { defaultSiteConfig, normalizeSiteConfig, type SiteConfig } from '@/lib/site-config'

type SiteConfigContextValue = {
  config: SiteConfig
  loading: boolean
  refreshConfig: () => Promise<SiteConfig>
  overwriteConfig: (config: Partial<SiteConfig>) => void
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null)

export function SiteConfigProvider({
  children,
  initialConfig,
}: {
  children: ReactNode
  initialConfig?: Partial<SiteConfig> | null
}) {
  const [config, setConfig] = useState<SiteConfig>(normalizeSiteConfig(initialConfig))
  const [loading, setLoading] = useState(false)

  const refreshConfig = useCallback(async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error refreshing site config:', error)
        return config
      }

      const normalized = normalizeSiteConfig(data)
      setConfig(normalized)
      return normalized
    } catch (error) {
      console.error('Unexpected error refreshing site config:', error)
      return config
    } finally {
      setLoading(false)
    }
  }, [config])

  const overwriteConfig = useCallback((nextConfig: Partial<SiteConfig>) => {
    setConfig((prev) => normalizeSiteConfig({ ...prev, ...nextConfig }))
  }, [])

  const value = useMemo(
    () => ({
      config,
      loading,
      refreshConfig,
      overwriteConfig,
    }),
    [config, loading, overwriteConfig, refreshConfig],
  )

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext)

  if (!context) {
    throw new Error('useSiteConfig must be used inside <SiteConfigProvider>')
  }

  return context
}

export function useOptionalSiteConfig() {
  return useContext(SiteConfigContext) ?? {
    config: defaultSiteConfig,
    loading: false,
    refreshConfig: async () => defaultSiteConfig,
    overwriteConfig: () => undefined,
  }
}
