'use client'

import { useState, useEffect } from 'react'
import defaultConfig, { type SiteConfig } from '@/data/config'

// Versión de la configuración. Incrementar cuando se hagan cambios estructurales
// o de valores en config.ts que deban reemplazar cualquier snapshot guardado en
// localStorage del navegador del usuario. Esto evita el problema de "veo datos
// viejos aunque ya deployé" sin tener que pedir al usuario que borre localStorage.
const STORAGE_KEY = 'milu_config'
const CONFIG_VERSION = '2026-07-14-timeline-6'
const VERSION_KEY = 'milu_config_version'

export function useConfig(): SiteConfig {
  const [cfg, setCfg] = useState<SiteConfig>(defaultConfig)

  useEffect(() => {
    try {
      const savedVersion = localStorage.getItem(VERSION_KEY)
      const saved = localStorage.getItem(STORAGE_KEY)

      // Si la versión guardada no coincide con la actual, descartar el snapshot
      // viejo y usar el default del repo (que ya tiene los valores nuevos).
      if (savedVersion !== CONFIG_VERSION) {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.setItem(VERSION_KEY, CONFIG_VERSION)
        return // usar defaultConfig
      }

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
    localStorage.setItem(VERSION_KEY, CONFIG_VERSION)
  } catch {
    // ignore
  }
}

export function clearConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(VERSION_KEY)
  } catch {
    // ignore
  }
}
