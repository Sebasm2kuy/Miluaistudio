'use client'

import { useState, useEffect } from 'react'
import defaultConfig, { type SiteConfig } from '@/data/config'

const STORAGE_KEY = 'milu_config'

export function useConfig(): SiteConfig {
  const [cfg, setCfg] = useState<SiteConfig>(defaultConfig)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as SiteConfig
        if (parsed?.evento?.nombre) {
          setCfg(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  return cfg
}

export function saveConfig(cfg: SiteConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
  } catch {
    // ignore
  }
}

export function clearConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
