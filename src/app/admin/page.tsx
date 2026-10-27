'use client'

/**
 * ⚠️ HERRAMIENTA LOCAL DE ADMINISTRACIÓN — NO SE PUBLICA.
 *
 * Esta ruta existe para usarse SOLO en desarrollo local (`npm run dev`
 * → http://localhost:3000/admin). El build de producción la elimina del
 * artefacto estático (scripts/prune-export.mjs) y scripts/verify-export.mjs
 * falla si vuelve a generarse, porque GitHub Pages no ofrece autenticación
 * de servidor y un panel público no puede considerarse protegido.
 *
 * Reglas de seguridad de esta herramienta:
 *  - El token de GitHub NO se guarda en localStorage. Vive en sessionStorage
 *    (muere al cerrar la pestaña) y se puede borrar con "Cerrar sesión".
 *  - No incrustar tokens en el código, ni en NEXT_PUBLIC_*, ni en commits.
 *  - Alternativa sin panel: editar src/data/config.ts y abrir un Pull Request.
 *  Ver docs/ADMINISTRACION.md para el flujo completo.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { SiteConfig } from '@/data/config-schema'
import { CONFIG_DEMO_BASE } from '@/data/demo-config'
import { saveConfig, clearConfig } from '@/hooks/useConfig'
import { FONT_OPTIONS, CLOCK_STYLES, CARD_STYLES, BUTTON_STYLES, COLOR_PRESETS, BACKGROUND_PRESETS } from '@/data/admin-options'
import { uploadToGitHub, type ResultadoPublicacion } from '@/lib/github-deploy'
import { publicarInvitacionDesdePanel, prepararInvitacionDesdePanel } from '@/lib/publicacion-panel'
import { sincronizarFondoConGaleria } from '@/lib/activos-editor'
import {
  normalizarSlug,
  esSlugValido,
  motivoSlugInvalido,
  urlInvitacion,
  urlPublicaInvitacion,
  serializarInvitacion,
} from '@/data/invitacion-publicada'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GOLD = '#d4af37'

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function downloadJSON(data: SiteConfig) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'config.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Collapsible Section
// ---------------------------------------------------------------------------

function Section({
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string
  icon: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-colors duration-200"
      style={{ borderColor: GOLD + '55', background: '#111111' }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left select-none hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-cursive text-xl" style={{ color: GOLD }}>
            {title}
          </span>
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke={GOLD}
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: GOLD + '33' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reusable Field Components
// ---------------------------------------------------------------------------

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  rows,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'url' | 'datetime-local' | 'tel' | 'date' | 'number'
  placeholder?: string
  rows?: number
}) {
  const baseClasses =
    'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-white border border-[#e8e0d7] text-[#292522] placeholder:text-[#8f867c] focus:border-[#d4af37]'

  if (rows) {
    return (
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-[#716a63] uppercase tracking-wide">{label}</span>
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${baseClasses} resize-y`}
        />
      </label>
    )
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[#716a63] uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={baseClasses}
      />
    </label>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[#716a63] uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
        />
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-6 h-6 rounded-md border border-[#ded4c8] shrink-0"
            style={{ backgroundColor: value }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-white border border-[#e8e0d7] text-[#292522] font-mono focus:border-[#d4af37]"
            maxLength={7}
          />
        </div>
      </div>
    </label>
  )
}

function applyColorPreset(setCfg: React.Dispatch<React.SetStateAction<SiteConfig>>, colors: typeof COLOR_PRESETS[number]['colors']) {
  setCfg(prev => ({
    ...prev,
    colores: { ...prev.colores, ...colors },
  }))
}

// ---------------------------------------------------------------------------
// Option Picker (for fonts, clock styles, etc.)
// ---------------------------------------------------------------------------

function OptionPicker({
  label,
  options,
  value,
  onChange,
  renderOption,
}: {
  label: string
  options: readonly { id: string; name: string; description?: string; preview?: string; style?: string; category?: string }[]
  value: string
  onChange: (v: string) => void
  renderOption?: (opt: typeof options[number], isSelected: boolean) => React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-[#716a63] uppercase tracking-wide">{label}</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.id
          if (renderOption) {
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(opt.id)}
                className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-[#d4af37] bg-[#d4af37]/10 ring-1 ring-[#d4af37]/30'
                    : 'border-[#e8e0d7] bg-white hover:border-[#ded4c8]'
                }`}
              >
                {renderOption(opt, isSelected)}
              </button>
            )
          }
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-[#d4af37] bg-[#d4af37]/10 ring-1 ring-[#d4af37]/30'
                  : 'border-[#e8e0d7] bg-white hover:border-[#ded4c8]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#292522]">{opt.name}</span>
                {isSelected && <span className="text-[#d4af37] text-xs font-bold">ACTIVO</span>}
              </div>
              {opt.description && (
                <p className="text-[10px] text-[#8f867c]">{opt.description}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Image Upload Card
// ---------------------------------------------------------------------------

function ImageCard({
  label,
  url,
  onUpload,
  onRemove,
  token,
}: {
  label: string
  url: string
  onUpload: (url: string) => void
  onRemove: () => void
  token: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!token) {
      setUploadMsg('Falta el GitHub Token: pegalo en «Conexión con GitHub»')
      setTimeout(() => setUploadMsg(''), 3000)
      return
    }
    setUploading(true)
    setUploadMsg('')
    try {
      const result = await uploadToGitHub(file, token)
      if (result.success) {
        onUpload(result.url)
        setUploadMsg('Subida!')
        setTimeout(() => setUploadMsg(''), 3000)
      } else {
        setUploadMsg(result.message)
        setTimeout(() => setUploadMsg(''), 5000)
      }
    } catch (err) {
      setUploadMsg('Error al subir')
      setTimeout(() => setUploadMsg(''), 5000)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border border-[#e8e0d7] bg-white/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#8f867c]">{label}</span>
        {url && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Eliminar ${label}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xl leading-none transition-colors"
            title="Eliminar"
          >
            &times;
          </button>
        )}
      </div>
      {url ? (
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#f0ebe4]">
          <img src={url} alt={label} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="aspect-[3/4] rounded-lg border-2 border-dashed border-[#e8e0d7] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#c9bbaa] transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <svg className="animate-spin h-6 w-6 text-[#8f867c]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              <svg className="w-6 h-6 text-[#a39a8e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-[10px] text-[#a39a8e]">Subir foto</span>
            </>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 min-h-[40px] text-[11px] px-3 py-2 rounded-lg bg-[#f0ebe4] text-[#716a63] hover:bg-[#e0d7cb] transition-colors"
          >
            {uploading ? 'Subiendo...' : url ? 'Cambiar' : 'Subir'}
          </button>
          {uploadMsg && (
            <span className={`text-[10px] ${uploadMsg === 'Subida!' ? 'text-green-400' : 'text-red-400'}`}>
              {uploadMsg}
            </span>
          )}
        </div>
        <Field
          label=""
          value={url}
          onChange={onUpload}
          type="url"
          placeholder="O pegá URL..."
        />
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const SECTION_KEYS = [
  'evento',
  'dedicatoria',
  'timeline',
  'galeria',
  'musica',
  'rsvp',
  'footer',
  'invitacion',
  'countdown',
  'fondo',
  'colores',
  'estilos',
] as const

type SectionKey = (typeof SECTION_KEYS)[number]

const SECTION_META: Record<SectionKey, { title: string; icon: string }> = {
  evento: { title: 'Evento', icon: '🎉' },
  dedicatoria: { title: 'Dedicatoria', icon: '💌' },
  timeline: { title: 'Timeline', icon: '🕰️' },
  galeria: { title: 'Galería', icon: '📸' },
  musica: { title: 'Música', icon: '🎵' },
  rsvp: { title: 'RSVP', icon: '✅' },
  footer: { title: 'Footer', icon: '🌸' },
  invitacion: { title: 'Invitación', icon: '📨' },
  countdown: { title: 'Countdown', icon: '⏳' },
  fondo: { title: 'Fondo', icon: '🖼️' },
  colores: { title: 'Colores', icon: '🎨' },
  estilos: { title: 'Estilos', icon: '✨' },
}

export default function AdminPage() {
  // Punto de partida del editor: la base de demostración (pública y
  // sintética). El panel ya NO importa la configuración operativa
  // (src/data/config.ts): ese archivo puede llegar a contener datos
  // privados de un evento real y no debe entrar al grafo del cliente.
  const [cfg, setCfg] = useState<SiteConfig>(() => deepClone(CONFIG_DEMO_BASE))
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['evento']))
  const [saved, setSaved] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [showToken, setShowToken] = useState(true)
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tokenInputRef = useRef<HTMLInputElement>(null)

  // --- Publicación de invitaciones (/i/<slug>/) ---
  const [slugPublicacion, setSlugPublicacion] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [resultadoPublicacion, setResultadoPublicacion] = useState<ResultadoPublicacion | null>(null)

  // Force scroll fix on mount.
  // Antes esto vivía en un script bloqueante del layout: mutar <html>/<body>
  // antes de hidratar genera un desajuste de hidratación (issue en consola).
  // Tras el montaje es seguro y logra el mismo resultado visual.
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('admin-page')
    html.style.overflow = 'auto'
    html.style.height = 'auto'
    html.style.position = 'static'
    html.style.background = '#faf8f4'
    body.style.overflow = 'auto'
    body.style.height = 'auto'
    body.style.position = 'static'
    body.style.background = '#faf8f4'
    body.style.color = '#292522'
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCfg = localStorage.getItem('milu_config')
      if (savedCfg) {
        const parsed = JSON.parse(savedCfg) as SiteConfig
        if (parsed?.evento?.nombre) {
          // Carga de configuración persistida: solo posible tras el montaje.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCfg((prev) => ({ ...deepClone(prev), ...parsed, estilos: { ...prev.estilos, ...parsed.estilos } }))
        }
      }
      // El token ya NO se persiste en localStorage: vive en sessionStorage
      // (muere al cerrar la pestaña). Si existe un token heredado de versiones
      // anteriores, se migra a sessionStorage y se borra de localStorage.
      const sessionToken = sessionStorage.getItem('milu_github_token')
      if (sessionToken?.trim()) {
        setGithubToken(sessionToken.trim())
      } else {
        const legacy = localStorage.getItem('milu_github_token')
        if (legacy?.trim()) {
          setGithubToken(legacy.trim())
          sessionStorage.setItem('milu_github_token', legacy.trim())
          localStorage.removeItem('milu_github_token')
        }
      }
    } catch { /* ignore */ }
  }, [])

  // --- Mutators ---
  const setNested = useCallback(
    <K extends keyof SiteConfig>(section: K, field: string, value: string) => {
      setCfg((prev) => ({
        ...prev,
        // Secciones planas del panel: el spread seguro exige objeto
        [section]: { ...(prev[section] as unknown as Record<string, unknown>), [field]: value },
      }))
    },
    [],
  )

  const setDeep = useCallback(
    (path: string[], value: string) => {
      setCfg((prev) => {
        const next = deepClone(prev)
        let obj: any = next
        for (let i = 0; i < path.length - 1; i++) {
          obj = obj[path[i]]
        }
        obj[path[path.length - 1]] = value
        return next
      })
    },
    [],
  )

  // --- Section toggle ---
  const toggle = useCallback((key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // --- Import / Export / Reset ---
  const handleExport = useCallback(() => downloadJSON(cfg), [cfg])

  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string) as SiteConfig
          // Merge with defaults
          setCfg((prev) => ({ ...deepClone(prev), ...parsed, estilos: { ...prev.estilos, ...parsed.estilos } }))
        } catch {
          alert('Archivo JSON inválido')
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [],
  )

  const handleReset = useCallback(() => {
    if (confirm('¿Restaurar todos los valores por defecto? Se eliminarán los cambios guardados.')) {
      setCfg(deepClone(CONFIG_DEMO_BASE))
      clearConfig()
      setSaved(false)
    }
  }, [])

  const handleSave = useCallback(() => {
    // «Guardar» = guardar la configuración en ESTE navegador. Antes de
    // guardar se aplica la sincronización fondo ↔ galería (la misma que
    // venía aplicando la acción heredada): en modo fotos el fondo usa la
    // galería vigente y nunca fotos viejas o borradas.
    const cfgSincronizada = sincronizarFondoConGaleria(cfg)
    setCfg(cfgSincronizada)
    saveConfig(cfgSincronizada)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [cfg])

  const handleVerifyToken = useCallback(async () => {
    const token = githubToken.trim()
    if (!token) {
      setTokenStatus('error')
      return
    }
    setTokenStatus('checking')
    try {
      const res = await fetch('https://api.github.com/repos/Sebasm2kuy/Miluaistudio/contents/src/data/config.ts', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
      })
      if (res.ok) {
        setTokenStatus('ok')
        setGithubToken(token)
        // Token solo para la sesión: no queda en disco al cerrar el navegador
        sessionStorage.setItem('milu_github_token', token)
      } else {
        setTokenStatus('error')
      }
    } catch {
      setTokenStatus('error')
    }
  }, [githubToken])

  // Borrar el token de TODA la persistencia local y cerrar la sesión local
  const handleClearToken = useCallback(() => {
    sessionStorage.removeItem('milu_github_token')
    localStorage.removeItem('milu_github_token')
    setGithubToken('')
    setTokenStatus('idle')
  }, [])

  // =====================================================================
  // Publicación de invitaciones: genera la representación publicable y
  // la guarda como SU PROPIO archivo (content/invitaciones/<slug>.json).
  // El resultado muestra el estado real (creada/actualizada/error):
  // guardar en localStorage o iniciar la petición NO se presenta como
  // publicación. Ante error la configuración del panel queda intacta.
  // =====================================================================

  // Slug sugerido a partir del nombre/apodo cargados (editable)
  const slugSugerido = useMemo(
    () => normalizarSlug(cfg.evento.apodo || cfg.evento.nombre || ''),
    [cfg.evento.apodo, cfg.evento.nombre],
  )
  const slugFinal = slugPublicacion.trim() ? normalizarSlug(slugPublicacion) : slugSugerido
  const slugPublicable = slugFinal && esSlugValido(slugFinal) ? slugFinal : ''

  const handlePublicar = useCallback(async () => {
    // Acción principal de publicación: pasa por publicarInvitacionDesdePanel
    // (flujo por slug, content/invitaciones/<slug>.json). La unidad valida
    // slug y token, arma la representación y devuelve el estado REAL:
    // creada / actualizada / error. Nunca se presenta éxito de publicación
    // por solo guardar en este navegador o por escribir config.ts.
    setPublicando(true)
    setResultadoPublicacion(null)
    try {
      const resultado = await publicarInvitacionDesdePanel({
        slug: slugFinal,
        config: cfg,
        token: githubToken.trim(),
      })
      setResultadoPublicacion(resultado)
    } catch (err) {
      // Defensa: la unidad no lanza, pero si algo inesperado ocurre el
      // panel muestra fallo honesto y conserva la configuración intacta.
      setResultadoPublicacion({
        success: false,
        slug: slugFinal,
        url: '',
        urlAbsoluta: '',
        creado: false,
        message: err instanceof Error ? err.message : 'Error desconocido al preparar la publicación.',
      })
    } finally {
      setPublicando(false)
    }
  }, [cfg, githubToken, slugFinal])

  // Vista previa fiel ANTES de publicar: guarda en este navegador (con la
  // misma sincronización fondo ↔ galería que «Guardar») y abre la
  // experiencia real de invitación (misma que verán los invitados).
  const handleVistaPrevia = useCallback(() => {
    const cfgSincronizada = sincronizarFondoConGaleria(cfg)
    setCfg(cfgSincronizada)
    saveConfig(cfgSincronizada)
    window.open('/Miluaistudio/previsualizar/', '_blank', 'noopener')
  }, [cfg])

  // Alternativa sin token: descarga el JSON publicable para commitearlo a mano
  const handleDescargarPublicable = useCallback(() => {
    if (!slugPublicable) {
      setResultadoPublicacion({
        success: false,
        slug: slugFinal,
        url: '',
        urlAbsoluta: '',
        creado: false,
        message: motivoSlugInvalido(slugFinal) || 'Elegí un slug válido para descargar el JSON.',
      })
      return
    }
    try {
      const invitacion = prepararInvitacionDesdePanel({ slug: slugPublicable, config: cfg })
      const blob = new Blob([serializarInvitacion(invitacion)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slugPublicable}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setResultadoPublicacion({
        success: false,
        slug: slugPublicable,
        url: '',
        urlAbsoluta: '',
        creado: false,
        message: err instanceof Error ? err.message : 'No se pudo generar el JSON publicable.',
      })
    }
  }, [cfg, slugFinal, slugPublicable])

  // --- Expand / Collapse all ---
  const expandAll = useCallback(() => {
    setOpenSections(new Set(SECTION_KEYS))
  }, [])

  const collapseAll = useCallback(() => {
    setOpenSections(new Set())
  }, [])

  // =====================================================================
  // Render
  // =====================================================================

  return (
    <div
      className="min-h-screen bg-[#faf8f4] text-[#292522]"
      style={{ overflow: 'auto', height: '100vh', position: 'relative' }}
    >
      {/* --- Fixed Header --- */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: 'rgba(250, 248, 244, 0.9)',
          borderColor: GOLD + '44',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="font-cursive text-2xl md:text-3xl text-center sm:text-left" style={{ color: GOLD }}>
            Panel de Configuración
          </h1>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Acceso directo al editor móvil visual (/editar): la edición
                directa sobre la invitación es más cómoda en el teléfono. */}
            <a
              href="/Miluaistudio/editar/"
              className="px-4 min-h-[40px] inline-flex items-center rounded-lg text-xs font-bold transition-colors"
              style={{ background: '#8a6534', color: '#fff', border: 'none' }}
            >
              📱 Editor móvil
            </a>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 min-h-[40px] rounded-lg text-xs font-bold transition-colors"
              style={{
                background: saved ? '#16a34a' : '#d4af37',
                color: '#fff',
                border: 'none',
              }}
            >
              {saved ? 'Guardado ✓' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors"
              style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors"
              style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
            >
              Importar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors bg-red-950/60 text-red-300 border border-red-800/50 hover:bg-red-900/60"
            >
              Reset
            </button>
            <button type="button" onClick={expandAll} aria-label="Abrir todas las secciones" className="w-10 h-10 rounded-lg text-xs bg-[#f0ebe4] text-[#54483e] border border-[#e8e0d7]">+</button>
            <button type="button" onClick={collapseAll} aria-label="Cerrar todas las secciones" className="w-10 h-10 rounded-lg text-xs bg-[#f0ebe4] text-[#54483e] border border-[#e8e0d7]">−</button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </div>
      </header>

      {/* --- Form Body --- */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-16">

        {/* CONEXIÓN CON GITHUB — token usado por «Publicar invitación» y la subida de imágenes */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2563eb55', background: '#111111' }}>
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="w-full flex items-center justify-between px-5 py-4 text-left select-none hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">🔑</span>
              <span className="font-cursive text-xl" style={{ color: '#2563eb' }}>Conexión con GitHub (token)</span>
            </span>
            <svg className={`w-5 h-5 transition-transform duration-200 ${showToken ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showToken && (
            <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: '#2563eb33' }}>
              <div className="space-y-3">
                <p className="text-xs text-[#716a63]">
                  Para publicar la invitación y subir imágenes necesitás un GitHub Personal Access Token con permiso de <code className="text-blue-400">Contents read/write</code>.
                  Pegar el token acá NO publica nada por sí solo: la publicación se hace desde la sección <strong className="text-blue-300">«Publicar invitación»</strong> (enlace propio /i/slug/).
                </p>
                <div className="relative">
                  <input
                    ref={tokenInputRef}
                    type="password"
                    value={githubToken}
                    onChange={(e) => {
                      const v = e.target.value
                      setGithubToken(v)
                      // Persistencia de sesión solamente (se borra al cerrar la pestaña)
                      if (v.trim()) sessionStorage.setItem('milu_github_token', v.trim())
                      else sessionStorage.removeItem('milu_github_token')
                      setTokenStatus('idle')
                    }}
                    placeholder="Pegá tu token acá..."
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-white border border-[#e8e0d7] text-[#292522] placeholder:text-[#8f867c] focus:border-[#2563eb] pr-28"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const inp = tokenInputRef.current
                        if (inp) inp.type = inp.type === 'password' ? 'text' : 'password'
                      }}
                      className="px-2 py-1 text-[10px] rounded bg-[#f0ebe4] text-[#716a63] hover:text-[#292522]"
                    >
                      Mostrar
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyToken}
                      disabled={tokenStatus === 'checking'}
                      className="px-2 py-1 text-[10px] rounded font-bold transition-colors"
                      style={{
                        background: tokenStatus === 'ok' ? '#16a34a' : tokenStatus === 'error' ? '#dc2626' : '#2563eb',
                        color: '#fff',
                      }}
                    >
                      {tokenStatus === 'checking' ? '...' : tokenStatus === 'ok' ? 'OK' : tokenStatus === 'error' ? 'Error' : 'Verificar'}
                    </button>
                  </div>
                </div>
                {tokenStatus === 'ok' && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-400">Token válido: podés publicar la invitación y subir imágenes</span>
                  </div>
                )}
                {tokenStatus === 'error' && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-400">Token invalido o sin permisos. Verificá que tenga Contents read/write.</span>
                  </div>
                )}
                <p className="text-[10px] text-[#a39a8e]">
                  Si no tenés token: GitHub &gt; Settings &gt; Developer settings &gt; Personal access tokens &gt; Fine-grained tokens. Dale permiso de &quot;Contents&quot; read/write al repo Miluaistudio. El token se guarda solo para esta sesión y se borra al cerrar la pestaña.
                </p>
                {githubToken.trim() ? (
                  <button
                    type="button"
                    onClick={handleClearToken}
                    className="w-full rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                  >
                    Borrar el token de este navegador (cerrar sesión)
                  </button>
                ) : (
                  <p className="text-[10px] text-[#8f867c]">No hay token guardado en este navegador.</p>
                )}
              </div>
            </div>
          )}
        </div>
        {/* PUBLICAR INVITACIÓN — flujo /i/<slug>/ */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#16a34a55', background: '#111111' }}>
          <div className="px-5 py-4">
            <p className="flex items-center gap-3 font-cursive text-xl" style={{ color: '#22c55e' }}>
              <span className="text-xl">🕊️</span> Publicar invitación (enlace propio /i/slug/)
            </p>
            <p className="mt-1 text-xs text-[#a39a8e] leading-relaxed">
              Publica la configuración de este panel como una invitación independiente con su propia URL.
              Cada invitación vive en su propio archivo: publicar otra no sobrescribe las anteriores y
              actualizar conserva el mismo slug y el mismo enlace. Vista previa fiel antes de publicar.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label htmlFor="pub-slug" className="text-[10px] font-semibold uppercase tracking-wide text-[#8f867c]">
                  Slug de la invitación (define la URL)
                </label>
                <input
                  id="pub-slug"
                  type="text"
                  value={slugPublicacion}
                  onChange={(e) => setSlugPublicacion(e.target.value)}
                  placeholder={slugSugerido || 'ej: quince-de-muestra'}
                  aria-describedby="pub-slug-ayuda"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-white border border-[#e8e0d7] text-[#292522] placeholder:text-[#b3aa9d] focus:border-[#16a34a] mt-1"
                />
                <p id="pub-slug-ayuda" className="mt-1 text-[10px] text-[#8f867c]">
                  Minúsculas, números y guiones. Sugerido a partir del nombre del evento; podés cambiarlo.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleVistaPrevia}
                  className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: '#d4af3722', color: '#d4af37', border: '1px solid #d4af3755' }}
                >
                  Ver vista previa
                </button>
                <button
                  type="button"
                  onClick={handleDescargarPublicable}
                  className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: '#d4af3722', color: '#d4af37', border: '1px solid #d4af3755' }}
                >
                  Descargar JSON
                </button>
                <button
                  type="button"
                  onClick={handlePublicar}
                  disabled={publicando}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                  style={{ background: publicando ? '#4b5563' : '#16a34a', opacity: publicando ? 0.75 : 1 }}
                >
                  {publicando ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Publicando…
                    </>
                  ) : (
                    'Publicar en GitHub'
                  )}
                </button>
              </div>
            </div>

            {/* Estado en vivo del slug y la URL destino */}
            <div className="mt-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[11px] leading-relaxed">
              {slugFinal ? (
                <>
                  <span className={slugPublicable ? 'text-green-400' : 'text-red-400'}>
                    {slugPublicable ? '✓ Slug válido' : '✗ ' + (motivoSlugInvalido(slugFinal) || 'Slug inválido')}
                  </span>
                  {slugPublicable && (
                    <span className="text-[#a39a8e]">
                      {' '}→ URL: <code className="text-[#8fd4a5]">{urlInvitacion(slugPublicable)}</code>
                      {' '}· <code className="text-[#8fd4a5]">{urlPublicaInvitacion(slugPublicable)}</code>
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[#a39a8e]">Cargá el nombre del evento arriba o escribí un slug.</span>
              )}
            </div>

            {/* Resultado REAL de la publicación (nunca éxito por solo guardar) */}
            {resultadoPublicacion && (
              <div
                role="status"
                className={
                  'mt-3 rounded-lg px-3 py-2.5 text-xs leading-relaxed border ' +
                  (resultadoPublicacion.success
                    ? 'bg-green-950/70 text-green-200 border-green-800/60'
                    : 'bg-red-950/70 text-red-200 border-red-800/60')
                }
              >
                <p className="font-semibold">
                  {resultadoPublicacion.success
                    ? (resultadoPublicacion.creado ? 'Invitación creada' : 'Invitación actualizada')
                    : 'No se publicó'}
                </p>
                <p className="mt-0.5">{resultadoPublicacion.message}</p>
                {resultadoPublicacion.success && (
                  <p className="mt-1 font-mono text-[11px] break-all">
                    {resultadoPublicacion.urlAbsoluta || urlPublicaInvitacion(resultadoPublicacion.slug)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* EVENTO */}
        <Section title={SECTION_META.evento.title} icon={SECTION_META.evento.icon} open={openSections.has('evento')} onToggle={() => toggle('evento')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo" value={cfg.evento.tipo} onChange={(v) => setNested('evento', 'tipo', v)} />
            <Field label="Nombre" value={cfg.evento.nombre} onChange={(v) => setNested('evento', 'nombre', v)} />
            <Field label="Apellido" value={cfg.evento.apellido} onChange={(v) => setNested('evento', 'apellido', v)} />
            <Field label="Apodo" value={cfg.evento.apodo} onChange={(v) => setNested('evento', 'apodo', v)} />
            <Field label="Fecha (texto)" value={cfg.evento.fecha} onChange={(v) => setNested('evento', 'fecha', v)} />
            <Field label="Año" value={cfg.evento.anio} onChange={(v) => setNested('evento', 'anio', v)} />
            <Field
              label="Fecha y Hora del Evento (hora de Montevideo)"
              type="datetime-local"
              value={cfg.evento.fechaEvento}
              onChange={(v) => setNested('evento', 'fechaEvento', v)}
            />
            <Field
              label="Duración del evento en horas (para el calendario)"
              type="number"
              value={String(cfg.evento.duracionHoras ?? 5)}
              onChange={(v) => setNested('evento', 'duracionHoras', v)}
            />
            <Field label="Lugar" value={cfg.evento.lugar} onChange={(v) => setNested('evento', 'lugar', v)} />
            <Field label="Ubicación" value={cfg.evento.ubicacion} onChange={(v) => setNested('evento', 'ubicacion', v)} />
            <Field label="Dirección" value={cfg.evento.direccion} onChange={(v) => setNested('evento', 'direccion', v)} />
            <Field label="Maps URL" type="url" value={cfg.evento.mapsUrl} onChange={(v) => setNested('evento', 'mapsUrl', v)} />
            <Field label="Hashtag" value={cfg.evento.hashtag} onChange={(v) => setNested('evento', 'hashtag', v)} />
            <Field label="Hashtag URL" type="url" value={cfg.evento.hashtagUrl} onChange={(v) => setNested('evento', 'hashtagUrl', v)} />
          </div>
        </Section>

        {/* DEDICATORIA */}
        <Section title={SECTION_META.dedicatoria.title} icon={SECTION_META.dedicatoria.icon} open={openSections.has('dedicatoria')} onToggle={() => toggle('dedicatoria')}>
          <div className="space-y-4">
            <Field label="Cita" value={cfg.dedicatoria.cita} onChange={(v) => setNested('dedicatoria', 'cita', v)} rows={3} />
            <Field label="Cuerpo" value={cfg.dedicatoria.cuerpo} onChange={(v) => setNested('dedicatoria', 'cuerpo', v)} rows={4} />
            <Field label="Firma" value={cfg.dedicatoria.firma} onChange={(v) => setNested('dedicatoria', 'firma', v)} />
          </div>
        </Section>

        {/* TIMELINE */}
        <Section title={SECTION_META.timeline.title} icon={SECTION_META.timeline.icon} open={openSections.has('timeline')} onToggle={() => toggle('timeline')}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Título" value={cfg.timeline.titulo} onChange={(v) => setNested('timeline', 'titulo', v)} />
              <Field label="Subtítulo" value={cfg.timeline.subtitulo} onChange={(v) => setNested('timeline', 'subtitulo', v)} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#716a63] uppercase tracking-wide">Eventos</span>
                <button
                  type="button"
                  onClick={() =>
                    setCfg((prev) => ({
                      ...prev,
                      timeline: { ...prev.timeline, eventos: [...prev.timeline.eventos, { hora: '', titulo: '', desc: '', icono: '' }] },
                    }))
                  }
                  className="px-3 py-2 min-h-[40px] rounded-md text-xs font-medium"
                  style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
                >
                  + Agregar
                </button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
                {cfg.timeline.eventos.map((ev, i) => (
                  <div key={i} className="relative rounded-xl border border-[#e8e0d7] bg-white/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#8f867c]">#{i + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            timeline: { ...prev.timeline, eventos: prev.timeline.eventos.filter((_, idx) => idx !== i) },
                          }))
                        }
                        className="text-red-400 hover:text-red-300 text-lg leading-none"
                      >
                        &times;
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Hora" value={ev.hora} onChange={(v) => { const evs = [...cfg.timeline.eventos]; evs[i] = { ...evs[i], hora: v }; setCfg((p) => ({ ...p, timeline: { ...p.timeline, eventos: evs } })) }} />
                      <Field label="Título" value={ev.titulo} onChange={(v) => { const evs = [...cfg.timeline.eventos]; evs[i] = { ...evs[i], titulo: v }; setCfg((p) => ({ ...p, timeline: { ...p.timeline, eventos: evs } })) }} />
                      <Field label="Descripción" value={ev.desc} onChange={(v) => { const evs = [...cfg.timeline.eventos]; evs[i] = { ...evs[i], desc: v }; setCfg((p) => ({ ...p, timeline: { ...p.timeline, eventos: evs } })) }} />
                      <Field label="Icono (emoji)" value={ev.icono} onChange={(v) => { const evs = [...cfg.timeline.eventos]; evs[i] = { ...evs[i], icono: v }; setCfg((p) => ({ ...p, timeline: { ...p.timeline, eventos: evs } })) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* GALERÍA */}
        <Section title={SECTION_META.galeria.title} icon={SECTION_META.galeria.icon} open={openSections.has('galeria')} onToggle={() => toggle('galeria')}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Título" value={cfg.galeria.titulo} onChange={(v) => setNested('galeria', 'titulo', v)} />
              <Field label="Subtítulo" value={cfg.galeria.subtitulo} onChange={(v) => setNested('galeria', 'subtitulo', v)} />
              <Field label="Botón subir" value={cfg.galeria.botonSubir} onChange={(v) => setNested('galeria', 'botonSubir', v)} />
            </div>

            <Field
              label="Photo Upload URL (backend Google Apps Script para subida de fotos)"
              type="url"
              value={cfg.galeria.photoUploadUrl}
              onChange={(v) => setNested('galeria', 'photoUploadUrl', v)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            />
            {cfg.galeria.photoUploadUrl && (
              <p className="text-xs text-green-400 italic">
                ✓ Backend de subida activo. Las fotos que suban los invitados van a quedar pendientes de aprobación en el spreadsheet.
              </p>
            )}
            {!cfg.galeria.photoUploadUrl && (
              <p className="text-xs text-amber-400 italic">
                ⚠ Sin configurar: el botón "Dejale un recuerdo" muestra un error. Pegá acá la URL del script de Google Apps Script para fotos.
              </p>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#716a63] uppercase tracking-wide">Fotos ({cfg.galeria.fotos.length})</span>
                <button
                  type="button"
                  onClick={() =>
                    setCfg((prev) => ({
                      ...prev,
                      galeria: { ...prev.galeria, fotos: [...prev.galeria.fotos, { webp: '', fallback: '' }] },
                    }))
                  }
                  className="px-3 py-2 min-h-[40px] rounded-md text-xs font-medium"
                  style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
                >
                  + Agregar foto
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1 custom-scroll">
                {cfg.galeria.fotos.map((foto, i) => (
                  <ImageCard
                    key={i}
                    label={`Foto ${i + 1}`}
                    url={foto.webp}
                    token={githubToken}
                    onUpload={(url) => {
                      const fotos = [...cfg.galeria.fotos]
                      fotos[i] = { webp: url, fallback: url }
                      setCfg((p) => ({ ...p, galeria: { ...p.galeria, fotos } }))
                    }}
                    onRemove={() => {
                      setCfg((p) => ({
                        ...p,
                        galeria: { ...p.galeria, fotos: p.galeria.fotos.filter((_, idx) => idx !== i) },
                      }))
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* MÚSICA */}
        <Section title={SECTION_META.musica.title} icon={SECTION_META.musica.icon} open={openSections.has('musica')} onToggle={() => toggle('musica')}>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Título" value={cfg.musica.titulo} onChange={(v) => setNested('musica', 'titulo', v)} />
            <Field label="Subtítulo" value={cfg.musica.subtitulo} onChange={(v) => setNested('musica', 'subtitulo', v)} />
            <Field label="Playlist URL" type="url" value={cfg.musica.playlistUrl} onChange={(v) => setNested('musica', 'playlistUrl', v)} />
            <Field label="Embed URL" type="url" value={cfg.musica.embedUrl} onChange={(v) => setNested('musica', 'embedUrl', v)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Botón Agregar" value={cfg.musica.botonAgregar} onChange={(v) => setNested('musica', 'botonAgregar', v)} />
              <Field label="Botón Spotify" value={cfg.musica.botonSpotify} onChange={(v) => setNested('musica', 'botonSpotify', v)} />
            </div>
          </div>
        </Section>

        {/* RSVP */}
        <Section title={SECTION_META.rsvp.title} icon={SECTION_META.rsvp.icon} open={openSections.has('rsvp')} onToggle={() => toggle('rsvp')}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Título" value={cfg.rsvp.titulo} onChange={(v) => setNested('rsvp', 'titulo', v)} />
              <Field label="Fecha Límite" value={cfg.rsvp.fechaLimite} onChange={(v) => setNested('rsvp', 'fechaLimite', v)} />
              <Field label="Fecha Límite Full" value={cfg.rsvp.fechaLimiteFull} onChange={(v) => setNested('rsvp', 'fechaLimiteFull', v)} />
              <Field label="Host Phone" type="tel" value={cfg.rsvp.hostPhone} onChange={(v) => setNested('rsvp', 'hostPhone', v)} />
            </div>
            <Field label="Subtítulo" value={cfg.rsvp.subtitulo} onChange={(v) => setNested('rsvp', 'subtitulo', v)} rows={3} />
            <Field label="Google Sheet URL" type="url" value={cfg.rsvp.googleSheetUrl} onChange={(v) => setNested('rsvp', 'googleSheetUrl', v)} />
            <div className="rounded-xl border border-[#e8e0d7] bg-white/40 p-4 space-y-4">
              <h4 className="font-cursive text-lg" style={{ color: GOLD }}>🎁 Regalos</h4>
              <Field label="Título" value={cfg.rsvp.regalos.titulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'titulo'], v)} />
              <Field label="Subtítulo" value={cfg.rsvp.regalos.subtitulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'subtitulo'], v)} rows={2} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#8f867c] uppercase">Abitab</span>
                  <Field label="Título" value={cfg.rsvp.regalos.abitab.titulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'abitab', 'titulo'], v)} />
                  <Field label="Número" value={cfg.rsvp.regalos.abitab.numero} onChange={(v) => setDeep(['rsvp', 'regalos', 'abitab', 'numero'], v)} />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#8f867c] uppercase">Mi Dinero</span>
                  <Field label="Título" value={cfg.rsvp.regalos.miDinero.titulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'miDinero', 'titulo'], v)} />
                  <Field label="Número" value={cfg.rsvp.regalos.miDinero.numero} onChange={(v) => setDeep(['rsvp', 'regalos', 'miDinero', 'numero'], v)} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* FOOTER */}
        <Section title={SECTION_META.footer.title} icon={SECTION_META.footer.icon} open={openSections.has('footer')} onToggle={() => toggle('footer')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Apodo" value={cfg.footer.apodo} onChange={(v) => setNested('footer', 'apodo', v)} />
            <Field label="Ubicación" value={cfg.footer.ubicacion} onChange={(v) => setNested('footer', 'ubicacion', v)} />
            <Field label="Frase" value={cfg.footer.frase} onChange={(v) => setNested('footer', 'frase', v)} />
          </div>
        </Section>

        {/* INVITACIÓN */}
        <Section title={SECTION_META.invitacion.title} icon={SECTION_META.invitacion.icon} open={openSections.has('invitacion')} onToggle={() => toggle('invitacion')}>
          <div className="space-y-4">
            <ImageCard
              label="Imagen de Invitación"
              url={cfg.invitacion.imagen}
              token={githubToken}
              onUpload={(url) => setNested('invitacion', 'imagen', url)}
              onRemove={() => setNested('invitacion', 'imagen', '')}
            />
            <ImageCard
              label="Imagen Fallback"
              url={cfg.invitacion.imagenFallback}
              token={githubToken}
              onUpload={(url) => setNested('invitacion', 'imagenFallback', url)}
              onRemove={() => setNested('invitacion', 'imagenFallback', '')}
            />
            <Field label="Texto Abrir" value={cfg.invitacion.textoAbrir} onChange={(v) => setNested('invitacion', 'textoAbrir', v)} />
          </div>
        </Section>

        {/* COUNTDOWN */}
        <Section title={SECTION_META.countdown.title} icon={SECTION_META.countdown.icon} open={openSections.has('countdown')} onToggle={() => toggle('countdown')}>
          <div className="space-y-4">
            <Field label="Título" value={cfg.countdown.titulo} onChange={(v) => setNested('countdown', 'titulo', v)} />
            <div className="rounded-xl border border-[#e8e0d7] bg-white/40 p-4">
              <span className="text-xs font-semibold text-[#8f867c] uppercase mb-3 block">Labels (D / H / M / S)</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['D', 'H', 'M', 'S'] as const).map((key) => (
                  <Field key={key} label={key} value={cfg.countdown.labels[key]} onChange={(v) => setCfg((prev) => ({ ...prev, countdown: { ...prev.countdown, labels: { ...prev.countdown.labels, [key]: v } } }))} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Botón Calendario" value={cfg.countdown.botonCalendario} onChange={(v) => setNested('countdown', 'botonCalendario', v)} />
              <Field label="Calendario Título" value={cfg.countdown.calendarioTitulo} onChange={(v) => setNested('countdown', 'calendarioTitulo', v)} />
              <Field label="Calendario Location" value={cfg.countdown.calendarioLocation} onChange={(v) => setNested('countdown', 'calendarioLocation', v)} />
            </div>
            <Field label="Calendario Detalles" value={cfg.countdown.calendarioDetalles} onChange={(v) => setNested('countdown', 'calendarioDetalles', v)} rows={4} />
          </div>
        </Section>

        {/* FONDO */}
        <Section title={SECTION_META.fondo.title} icon={SECTION_META.fondo.icon} open={openSections.has('fondo')} onToggle={() => toggle('fondo')}>
          <div className="space-y-4">
            <p className="text-xs text-[#716a63] mb-2">Elegí un fondo para tu invitación. Podés usar un degradado o las fotos de la galería.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BACKGROUND_PRESETS.map((bg) => {
                const isGradientActive = cfg.fondo.fotos[0]?.startsWith('gradient:') === true && cfg.fondo.fotos[0] === `gradient:${bg.id}`
                const isPhotosActive = bg.id === 'fotos' && cfg.fondo.fotos.length > 0 && !cfg.fondo.fotos[0]?.startsWith('gradient:')
                const isActive = isGradientActive || isPhotosActive
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => {
                      if (bg.id === 'fotos') {
                        // Restore gallery photos
                        setCfg(prev => ({
                          ...prev,
                          fondo: { fotos: prev.galeria.fotos.map(f => f.webp).filter(Boolean) },
                        }))
                      } else {
                        // Use gradient (store empty fotos, we handle gradient in config)
                        setCfg(prev => ({ ...prev, fondo: { fotos: [`gradient:${bg.id}`] } }))
                      }
                    }}
                    className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.02] ${isActive ? 'ring-2 ring-[#d4af37] ring-offset-2 ring-offset-gray-950' : ''}`}
                    style={{
                      borderColor: isActive ? '#d4af37' : 'rgba(75,85,99,0.4)',
                    }}
                  >
                    <div
                      className="h-24 flex items-center justify-center relative"
                      style={{
                        background: bg.css || 'rgba(255,255,255,0.05)',
                      }}
                    >
                      {bg.id === 'fotos' ? (
                        <span className="text-3xl">📸</span>
                      ) : (
                        <span className="text-4xl">{bg.emoji}</span>
                      )}
                      {/* Active checkmark */}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2 bg-white/90">
                      <div className="text-xs font-semibold text-[#292522] truncate">{bg.name}</div>
                      <div className="text-[10px] text-[#8f867c] truncate mt-0.5">{bg.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </Section>

        {/* COLORES */}
        <Section title={SECTION_META.colores.title} icon={SECTION_META.colores.icon} open={openSections.has('colores')} onToggle={() => toggle('colores')}>
          <div className="space-y-4">
            <p className="text-xs text-[#716a63] mb-2">Elegí un tema de colores predefinido o personalizá cada uno.</p>
            {/* Color Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COLOR_PRESETS.map((preset) => {
                const isActive = cfg.colores.principal === preset.colors.principal
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyColorPreset(setCfg, preset.colors)}
                    className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.02] ${isActive ? 'ring-2 ring-[#d4af37] ring-offset-2 ring-offset-gray-950' : ''}`}
                    style={{
                      borderColor: isActive ? '#d4af37' : 'rgba(75,85,99,0.4)',
                    }}
                  >
                    <div
                      className="h-24 flex flex-col items-center justify-center gap-2 relative"
                      style={{ background: preset.colors.principal }}
                    >
                      <span className="text-2xl">{preset.emoji}</span>
                      <span className="text-xs font-bold" style={{ color: preset.colors.doradoClaro }}>{preset.name}</span>
                      {/* Active checkmark */}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Color bar showing all 4 colors */}
                    <div className="flex h-5">
                      <div className="flex-1" style={{ background: preset.colors.dorado }} />
                      <div className="flex-1" style={{ background: preset.colors.doradoClaro }} />
                      <div className="flex-1" style={{ background: preset.colors.marfil }} />
                      <div className="flex-1" style={{ background: preset.colors.fondo }} />
                    </div>
                    <div className="px-3 py-2 bg-white/90">
                      <div className="text-[10px] text-[#8f867c] truncate">{preset.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
            {/* Individual Color Pickers */}
            <details className="group">
              <summary className="text-xs text-[#8f867c] cursor-pointer hover:text-[#54483e] transition-colors flex items-center gap-1">
                <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                Personalizar colores individualmente
              </summary>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t border-[#e8e0d7]">
                <ColorField label="Principal" value={cfg.colores.principal} onChange={(v) => setNested('colores', 'principal', v)} />
                <ColorField label="Dorado" value={cfg.colores.dorado} onChange={(v) => setNested('colores', 'dorado', v)} />
                <ColorField label="Dorado Claro" value={cfg.colores.doradoClaro} onChange={(v) => setNested('colores', 'doradoClaro', v)} />
                <ColorField label="Marfil" value={cfg.colores.marfil} onChange={(v) => setNested('colores', 'marfil', v)} />
                <ColorField label="Fondo" value={cfg.colores.fondo} onChange={(v) => setNested('colores', 'fondo', v)} />
              </div>
            </details>
          </div>
        </Section>

        {/* ESTILOS */}
        <Section title={SECTION_META.estilos.title} icon={SECTION_META.estilos.icon} open={openSections.has('estilos')} onToggle={() => toggle('estilos')}>
          <div className="space-y-6">
            {/* Font Pickers */}
            <OptionPicker
              label="Fuente Títulos"
              options={FONT_OPTIONS}
              value={cfg.estilos.fuenteTitulo}
              onChange={(v) => setNested('estilos', 'fuenteTitulo', v)}
              renderOption={(opt, isSelected) => (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#292522]">{opt.name}</span>
                    {opt.category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f0ebe4] text-[#8f867c]">{opt.category}</span>}
                    {isSelected && <span className="text-[#d4af37] text-[10px] font-bold">✓</span>}
                  </div>
                  <p className="text-lg truncate" style={{ fontFamily: opt.style, color: '#e8d48b' }}>{opt.preview}</p>
                </div>
              )}
            />

            <OptionPicker
              label="Fuente Cuerpo"
              options={FONT_OPTIONS}
              value={cfg.estilos.fuenteCuerpo}
              onChange={(v) => setNested('estilos', 'fuenteCuerpo', v)}
              renderOption={(opt, isSelected) => (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#292522]">{opt.name}</span>
                    {opt.category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f0ebe4] text-[#8f867c]">{opt.category}</span>}
                    {isSelected && <span className="text-[#d4af37] text-[10px] font-bold">✓</span>}
                  </div>
                  <p className="text-sm truncate" style={{ fontFamily: opt.style, color: '#ccc' }}>Texto de ejemplo para ver la fuente</p>
                </div>
              )}
            />

            <OptionPicker
              label="Fuente Cursiva"
              options={FONT_OPTIONS.filter(f => f.category === 'Script')}
              value={cfg.estilos.fuenteCursiva}
              onChange={(v) => setNested('estilos', 'fuenteCursiva', v)}
              renderOption={(opt, isSelected) => (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#292522]">{opt.name}</span>
                    {isSelected && <span className="text-[#d4af37] text-[10px] font-bold">✓</span>}
                  </div>
                  <p className="text-xl truncate" style={{ fontFamily: opt.style, color: '#e8d48b' }}>{opt.preview}</p>
                </div>
              )}
            />

            {/* Clock Style */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#716a63] uppercase tracking-wide">Modelo de Reloj</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLOCK_STYLES.map((opt) => {
                  const s = opt as unknown as typeof CLOCK_STYLES[number]
                  const isSelected = cfg.estilos.modeloReloj === opt.id
                  const labels = [
                    cfg.countdown.labels?.D || 'Días',
                    cfg.countdown.labels?.H || 'Horas',
                    cfg.countdown.labels?.M || 'Min',
                    cfg.countdown.labels?.S || 'Seg',
                  ]
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNested('estilos', 'modeloReloj', s.id)}
                      className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.01] text-left ${isSelected ? 'ring-2 ring-[#d4af37] ring-offset-2 ring-offset-gray-950' : ''}`}
                      style={{ borderColor: isSelected ? '#d4af37' : 'rgba(75,85,99,0.4)' }}
                    >
                      {/* Preview area */}
                      <div
                        className="px-4 py-5 flex flex-col items-center justify-center relative"
                        style={{ background: s.previewBg, minHeight: '120px' }}
                      >
                        {/* Title */}
                        <div
                          className="text-sm mb-3"
                          style={{
                            color: s.previewTitleColor,
                            fontFamily: s.previewTitleFont,
                          }}
                        >
                          {cfg.countdown.titulo || 'El tiempo...'}
                        </div>
                        {/* Time units */}
                        <div className="flex items-start gap-2">
                          {['08', '12', '45', '30'].map((n, i) => (
                            <div key={i} className="flex flex-col items-center">
                              {s.previewShape === 'rectangle' ? (
                                <div
                                  className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center bg-white rounded-lg"
                                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                                >
                                  <span className="text-xl sm:text-2xl font-bold" style={{ color: s.previewNumberColor }}>{n}</span>
                                </div>
                              ) : s.previewShape === 'none' ? (
                                <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center">
                                  <span className="text-2xl sm:text-3xl font-bold" style={{ color: s.previewNumberColor }}>{n}</span>
                                </div>
                              ) : s.previewShape === 'rounded-dark' ? (
                                <div
                                  className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center rounded-xl"
                                  style={{
                                    background: s.previewBg === '#0a0508' || s.previewBg === '#000000' || s.previewBg === '#0a0000'
                                      ? 'rgba(255,255,255,0.08)'
                                      : 'rgba(255,255,255,0.15)',
                                    border: `1px solid ${s.previewAccentColor}44`,
                                    boxShadow: (s as Record<string, unknown>).numberGlow as string
                                      ? (s as Record<string, unknown>).numberGlow as string
                                      : undefined,
                                  }}
                                >
                                  <span
                                    className="text-xl sm:text-2xl font-bold"
                                    style={{
                                      color: s.previewNumberColor,
                                      textShadow: (s as Record<string, unknown>).numberGlow as string
                                        ? (s as Record<string, unknown>).numberGlow as string
                                        : 'none',
                                    }}
                                  >
                                    {n}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center rounded-lg px-2"
                                  style={{
                                    background: (s as Record<string, string>).containerBg,
                                    border: `1px solid ${(s as Record<string, string>).containerBorder}`,
                                  }}
                                >
                                  <span
                                    className="text-xl sm:text-2xl font-bold"
                                    style={{
                                      color: (s as Record<string, string>).previewNumberColor,
                                      textShadow: (s as Record<string, unknown>).numberGlow as string
                                        ? (s as Record<string, unknown>).numberGlow as string
                                        : 'none',
                                    }}
                                  >
                                    {n}
                                  </span>
                                </div>
                              )}
                              <span className="text-[10px] uppercase mt-1" style={{ color: (s as Record<string, string>).previewLabelColor }}>
                                {labels[i]}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* Active checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Info bar */}
                      <div className="px-3 py-2 bg-white/90">
                        <div className="text-xs font-semibold text-[#292522]">{s.name}</div>
                        <div className="text-[10px] text-[#8f867c]">{s.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card Style */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#716a63] uppercase tracking-wide">Estilo de Tarjetas</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CARD_STYLES.map((opt) => {
                  const s = opt as unknown as typeof CARD_STYLES[number]
                  const isSelected = cfg.estilos.estiloTarjetas === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNested('estilos', 'estiloTarjetas', s.id)}
                      className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.02] text-left ${isSelected ? 'ring-2 ring-[#d4af37] ring-offset-2 ring-offset-gray-950' : ''}`}
                      style={{ borderColor: isSelected ? '#d4af37' : 'rgba(75,85,99,0.4)' }}
                    >
                      {/* Mini card preview */}
                      <div
                        className="p-3 flex flex-col gap-2 relative"
                        style={{
                          background: s.previewBg,
                          border: s.previewBorder,
                          borderRadius: '0.75rem',
                          minHeight: '80px',
                        }}
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: s.previewText }}>
                          Timeline
                        </div>
                        <div className="text-[8px]" style={{ color: s.previewText, opacity: 0.7 }}>
                          Descripción breve del evento aquí...
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <div className="text-[7px] px-1.5 py-0.5 rounded" style={{ color: s.previewText, border: `1px solid ${s.previewText}33`, background: 'transparent' }}>
                            Ver más
                          </div>
                        </div>
                        {/* Active checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#d4af37] flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Info bar */}
                      <div className="px-3 py-2 bg-white/90">
                        <div className="text-[10px] font-semibold text-[#292522]">{s.name}</div>
                        <div className="text-[9px] text-[#8f867c]">{s.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Button Style */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#716a63] uppercase tracking-wide">Estilo de Botones</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BUTTON_STYLES.map((opt) => {
                  const s = opt as unknown as typeof BUTTON_STYLES[number]
                  const isSelected = cfg.estilos.estiloBotones === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNested('estilos', 'estiloBotones', s.id)}
                      className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.02] text-left ${isSelected ? 'ring-2 ring-[#d4af37] ring-offset-2 ring-offset-gray-950' : ''}`}
                      style={{ borderColor: isSelected ? '#d4af37' : 'rgba(75,85,99,0.4)' }}
                    >
                      {/* Button preview area */}
                      <div
                        className="p-4 flex items-center justify-center relative"
                        style={{ minHeight: '72px', background: 'rgba(41, 37, 34, 0.45)' }}
                      >
                        <button
                          type="button"
                          className="px-4 py-2 rounded-full text-xs font-bold"
                          style={{
                            background: s.previewBg,
                            border: s.previewBorder,
                            color: s.previewText,
                          }}
                        >
                          Agregar al Calendario
                        </button>
                        {/* Active checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#d4af37] flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Info bar */}
                      <div className="px-3 py-2 bg-white/90">
                        <div className="text-[10px] font-semibold text-[#292522]">{s.name}</div>
                        <div className="text-[9px] text-[#8f867c]">{s.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Section>
      </main>

      {/* Custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}} />
    </div>
  )
}
