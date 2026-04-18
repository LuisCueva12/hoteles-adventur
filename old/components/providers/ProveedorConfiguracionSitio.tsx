'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { createClient } from '@/utils/supabase/client'
import { SiteConfigRepository } from '@/lib/repositories/site-config.repository'
import { defaultSiteConfig, type SiteConfig } from '@/lib/validations/site-config.schema'

type SiteConfigContextValue = {
  config: SiteConfig
  loading: boolean
  refreshConfig: () => Promise<SiteConfig>
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null)

export function SiteConfigProvider({
  children,
  initialConfig,
}: {
  children: ReactNode
  initialConfig?: SiteConfig
}) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig || defaultSiteConfig)
  const [loading, setLoading] = useState(false)

  const refreshConfig = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const repository = new SiteConfigRepository(supabase)
      const newConfig = await repository.getConfig()
      setConfig(newConfig)
      return newConfig
    } catch (error) {
      console.error('Error refreshing site config:', error)
      return config
    } finally {
      setLoading(false)
    }
  }, [config])

  useEffect(() => {
    if (!initialConfig) {
      refreshConfig()
    }
  }, [initialConfig, refreshConfig])

  const value = useMemo(
    () => ({
      config,
      loading,
      refreshConfig,
    }),
    [config, loading, refreshConfig],
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
  const context = useContext(SiteConfigContext)
  return context ?? {
    config: defaultSiteConfig,
    loading: false,
    refreshConfig: async () => defaultSiteConfig,
  }
}
