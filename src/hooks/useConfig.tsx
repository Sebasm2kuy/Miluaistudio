'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { SiteConfig } from '@/data/config-schema'
import { CONFIG_DEMO_BASE } from '@/data/demo-config'

const STORAGE_KEY = 'milu_config'
const CONFIG_VERSION = '2026-07-15-solo-abitab'
const VERSION_KEY = 'milu_config_version'

const ConfigContext = createContext<SiteConfig | null>(null)

export function ConfigProvider({ config, children }: { config: SiteConfig; children: ReactNode }) {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}

export function useConfig(): SiteConfig {
  const providedConfig = useContext(ConfigContext)
  // El fallback es la base de demostración (pública y sintética), nunca la
  // configuración operativa: si defaultConfig entrara acá, sus literales
  // quedarían embebidos en los bundles públicos del cliente.
  const [cfg, setCfg] = useState<SiteConfig>(CONFIG_DEMO_BASE)

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
        // Carga de configuración persistida: solo posible tras el montaje
        // (localStorage no existe durante el render estático).
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
