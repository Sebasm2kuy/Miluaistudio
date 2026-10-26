'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import defaultConfig, { type SiteConfig } from '@/data/config'

const STORAGE_KEY = 'milu_config'
const CONFIG_VERSION = '2026-07-15-solo-abitab'
const VERSION_KEY = 'milu_config_version'

const ConfigContext = createContext<SiteConfig | null>(null)

export function ConfigProvider({ config, children }: { config: SiteConfig; children: ReactNode }) {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}

export function useConfig(): SiteConfig {
  const providedConfig = useContext(ConfigContext)
  const [cfg, setCfg] = useState<SiteConfig>(defaultConfig)

  useEffect(() => {
    // Public catalog previews use an isolated, read-only config and must not
    // inherit the live invitation's localStorage snapshot.
    if (providedConfig) return

    try {
      const savedVersion = localStorage.getItem(VERSION_KEY)
      const saved = localStorage.getItem(STORAGE_KEY)

      if (savedVersion !== CONFIG_VERSION) {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.setItem(VERSION_KEY, CONFIG_VERSION)
        return
      }

      if (saved) {
        const parsed = JSON.parse(saved) as SiteConfig
        if (parsed?.evento?.nombre) setCfg(parsed)
      }
    } catch {
      // Storage can be unavailable; built-in defaults still work.
    }
  }, [providedConfig])

  return providedConfig ?? cfg
}

export function saveConfig(cfg: SiteConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
    localStorage.setItem(VERSION_KEY, CONFIG_VERSION)
  } catch {
    // Storage can be unavailable.
  }
}

export function clearConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(VERSION_KEY)
  } catch {
    // Storage can be unavailable.
  }
}
