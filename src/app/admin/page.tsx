'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import config, { type SiteConfig } from '@/data/config'
import { saveConfig, clearConfig } from '@/hooks/useConfig'
import { FONT_OPTIONS, CLOCK_STYLES, CARD_STYLES, BUTTON_STYLES } from '@/data/admin-options'
import { deployToGitHub, uploadToGitHub } from '@/lib/github-deploy'

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
  type?: 'text' | 'url' | 'datetime-local' | 'tel' | 'date'
  placeholder?: string
  rows?: number
}) {
  const baseClasses =
    'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-gray-900 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-[#d4af37]'

  if (rows) {
    return (
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
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
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
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
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
        />
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-6 h-6 rounded-md border border-gray-600 shrink-0"
            style={{ backgroundColor: value }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-gray-900 border border-gray-700 text-gray-100 font-mono focus:border-[#d4af37]"
            maxLength={7}
          />
        </div>
      </div>
    </label>
  )
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
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
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
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
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
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-200">{opt.name}</span>
                {isSelected && <span className="text-[#d4af37] text-xs font-bold">ACTIVO</span>}
              </div>
              {opt.description && (
                <p className="text-[10px] text-gray-500">{opt.description}</p>
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
      setUploadMsg('Falta el GitHub Token')
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
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">{label}</span>
        {url && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 text-lg leading-none"
            title="Eliminar"
          >
            &times;
          </button>
        )}
      </div>
      {url ? (
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800">
          <img src={url} alt={label} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gray-500 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <svg className="animate-spin h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-[10px] text-gray-600">Subir foto</span>
            </>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 text-[10px] px-2 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
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
  const [cfg, setCfg] = useState<SiteConfig>(deepClone(config))
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['evento']))
  const [saved, setSaved] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState<string | null>(null)
  const [githubToken, setGithubToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Force scroll fix on mount
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.style.overflow = 'auto'
    html.style.height = 'auto'
    html.style.position = 'static'
    body.style.overflow = 'auto'
    body.style.height = 'auto'
    body.style.position = 'static'
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCfg = localStorage.getItem('milu_config')
      if (savedCfg) {
        const parsed = JSON.parse(savedCfg) as SiteConfig
        if (parsed?.evento?.nombre) {
          setCfg((prev) => ({ ...deepClone(config), ...parsed, estilos: { ...config.estilos, ...parsed.estilos } }))
        }
      }
      const savedToken = localStorage.getItem('milu_github_token')
      if (savedToken) setGithubToken(savedToken)
    } catch { /* ignore */ }
  }, [])

  // --- Mutators ---
  const setNested = useCallback(
    <K extends keyof SiteConfig>(section: K, field: string, value: string) => {
      setCfg((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }))
    },
    [],
  )

  const setDeep = useCallback(
    (path: string[], value: string) => {
      setCfg((prev) => {
        const next = deepClone(prev)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          setCfg((prev) => ({ ...deepClone(config), ...parsed, estilos: { ...config.estilos, ...parsed.estilos } }))
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
      setCfg(deepClone(config))
      clearConfig()
      setSaved(false)
    }
  }, [])

  const handleSave = useCallback(() => {
    saveConfig(cfg)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [cfg])

  const handleDeploy = useCallback(async () => {
    if (!githubToken) {
      setDeployResult('Falta el GitHub Token. Configuralo abajo.')
      setTimeout(() => setDeployResult(null), 5000)
      return
    }
    localStorage.setItem('milu_github_token', githubToken)
    saveConfig(cfg)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setDeploying(true)
    setDeployResult(null)
    try {
      const result = await deployToGitHub(cfg as unknown as Record<string, unknown>, githubToken)
      setDeployResult(result.message)
    } catch (err) {
      setDeployResult(`Error: ${err instanceof Error ? err.message : 'unknown'}`)
    } finally {
      setDeploying(false)
      setTimeout(() => setDeployResult(null), 8000)
    }
  }, [cfg, githubToken])

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
      className="min-h-screen bg-gray-950 text-gray-100"
      style={{ overflow: 'auto', height: '100vh', position: 'relative' }}
    >
      {/* --- Fixed Header --- */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: 'rgba(3, 7, 18, 0.85)',
          borderColor: GOLD + '44',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="font-cursive text-2xl md:text-3xl text-center sm:text-left" style={{ color: GOLD }}>
            Panel de Configuración
          </h1>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
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
              onClick={handleDeploy}
              disabled={deploying}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              style={{
                background: deploying ? '#6b7280' : '#2563eb',
                color: '#fff',
                border: 'none',
                opacity: deploying ? 0.7 : 1,
              }}
            >
              {deploying ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Deploying...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Deploy
                </>
              )}
            </button>
            {deployResult && (
              <span className={`text-xs px-2 py-1 rounded-md ${deployResult.startsWith('Error') ? 'bg-red-950/80 text-red-300' : 'bg-green-950/80 text-green-300'}`}>
                {deployResult}
              </span>
            )}
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
            >
              Importar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-red-950/60 text-red-300 border border-red-800/50 hover:bg-red-900/60"
            >
              Reset
            </button>
            <button type="button" onClick={expandAll} className="px-2 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-300 border border-gray-700">+</button>
            <button type="button" onClick={collapseAll} className="px-2 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-300 border border-gray-700">-</button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </div>
      </header>

      {/* --- Form Body --- */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-16">

        {/* DEPLOY - GitHub Token */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2563eb55', background: '#111111' }}>
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="w-full flex items-center justify-between px-5 py-4 text-left select-none hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">🚀</span>
              <span className="font-cursive text-xl" style={{ color: '#2563eb' }}>Deploy (Git Push)</span>
            </span>
            <svg className={`w-5 h-5 transition-transform duration-200 ${showToken ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showToken && (
            <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: '#2563eb33' }}>
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Para deployar, necesitás un GitHub Personal Access Token con permiso de <code className="text-blue-400">repo</code>.
                </p>
                <div className="relative">
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => { setGithubToken(e.target.value); localStorage.setItem('milu_github_token', e.target.value) }}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-gray-900 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-[#2563eb] pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => { const inp = document.querySelector<HTMLInputElement>('.token-input'); if(inp) inp.type = inp.type === 'password' ? 'text' : 'password' }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] rounded bg-gray-800 text-gray-400 hover:text-gray-200"
                  >
                    Mostrar
                  </button>
                </div>
                <p className="text-[10px] text-gray-600">
                  Creá tu token en: GitHub &gt; Settings &gt; Developer settings &gt; Personal access tokens &gt; Fine-grained tokens. Dale permiso de &quot;Contents&quot; read/write al repo Miluaistudio.
                </p>
                {githubToken && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-400">Token configurado</span>
                  </div>
                )}
              </div>
            </div>
          )}
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
              label="Fecha y Hora del Evento"
              type="datetime-local"
              value={cfg.evento.fechaEvento}
              onChange={(v) => setNested('evento', 'fechaEvento', v)}
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
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Eventos</span>
                <button
                  type="button"
                  onClick={() =>
                    setCfg((prev) => ({
                      ...prev,
                      timeline: { ...prev.timeline, eventos: [...prev.timeline.eventos, { hora: '', titulo: '', desc: '', icono: '' }] },
                    }))
                  }
                  className="px-3 py-1 rounded-md text-xs font-medium"
                  style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
                >
                  + Agregar
                </button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
                {cfg.timeline.eventos.map((ev, i) => (
                  <div key={i} className="relative rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">#{i + 1}</span>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fotos ({cfg.galeria.fotos.length})</span>
                <button
                  type="button"
                  onClick={() =>
                    setCfg((prev) => ({
                      ...prev,
                      galeria: { ...prev.galeria, fotos: [...prev.galeria.fotos, { webp: '', fallback: '' }] },
                    }))
                  }
                  className="px-3 py-1 rounded-md text-xs font-medium"
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
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-4">
              <h4 className="font-cursive text-lg" style={{ color: GOLD }}>🎁 Regalos</h4>
              <Field label="Título" value={cfg.rsvp.regalos.titulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'titulo'], v)} />
              <Field label="Subtítulo" value={cfg.rsvp.regalos.subtitulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'subtitulo'], v)} rows={2} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Abitab</span>
                  <Field label="Título" value={cfg.rsvp.regalos.abitab.titulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'abitab', 'titulo'], v)} />
                  <Field label="Número" value={cfg.rsvp.regalos.abitab.numero} onChange={(v) => setDeep(['rsvp', 'regalos', 'abitab', 'numero'], v)} />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Mi Dinero</span>
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
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <span className="text-xs font-semibold text-gray-500 uppercase mb-3 block">Labels (D / H / M / S)</span>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fotos de fondo ({cfg.fondo.fotos.length})</span>
              <button
                type="button"
                onClick={() => setCfg((prev) => ({ ...prev, fondo: { ...prev.fondo, fotos: [...prev.fondo.fotos, ''] } }))}
                className="px-3 py-1 rounded-md text-xs font-medium"
                style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
              >
                + Agregar
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
              {cfg.fondo.fotos.map((url, i) => (
                <ImageCard
                  key={i}
                  label={`Fondo ${i + 1}`}
                  url={url}
                  onUpload={(newUrl) => {
                    const fotos = [...cfg.fondo.fotos]
                    fotos[i] = newUrl
                    setCfg((p) => ({ ...p, fondo: { ...p.fondo, fotos } }))
                  }}
                  onRemove={() => setCfg((p) => ({ ...p, fondo: { ...p.fondo, fotos: p.fondo.fotos.filter((_, idx) => idx !== i) } }))}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* COLORES */}
        <Section title={SECTION_META.colores.title} icon={SECTION_META.colores.icon} open={openSections.has('colores')} onToggle={() => toggle('colores')}>
          <div className="space-y-4">
            <ColorField label="Principal" value={cfg.colores.principal} onChange={(v) => setNested('colores', 'principal', v)} />
            <ColorField label="Dorado" value={cfg.colores.dorado} onChange={(v) => setNested('colores', 'dorado', v)} />
            <ColorField label="Dorado Claro" value={cfg.colores.doradoClaro} onChange={(v) => setNested('colores', 'doradoClaro', v)} />
            <ColorField label="Marfil" value={cfg.colores.marfil} onChange={(v) => setNested('colores', 'marfil', v)} />
            <ColorField label="Fondo" value={cfg.colores.fondo} onChange={(v) => setNested('colores', 'fondo', v)} />
            <div className="pt-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Vista previa</span>
              <div className="flex gap-1 h-10 rounded-lg overflow-hidden border border-gray-700">
                {[cfg.colores.principal, cfg.colores.dorado, cfg.colores.doradoClaro, cfg.colores.marfil, cfg.colores.fondo].map((c, i) => (
                  <div key={i} className="flex-1 transition-colors duration-200" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                {['Principal', 'Dorado', 'Dorado C.', 'Marfil', 'Fondo'].map((name) => (
                  <span key={name} className="flex-1 text-center text-[10px] text-gray-600 truncate">{name}</span>
                ))}
              </div>
            </div>
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
                    <span className="text-sm font-medium text-gray-200">{opt.name}</span>
                    {opt.category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{opt.category}</span>}
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
                    <span className="text-sm font-medium text-gray-200">{opt.name}</span>
                    {opt.category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{opt.category}</span>}
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
                    <span className="text-sm font-medium text-gray-200">{opt.name}</span>
                    {isSelected && <span className="text-[#d4af37] text-[10px] font-bold">✓</span>}
                  </div>
                  <p className="text-xl truncate" style={{ fontFamily: opt.style, color: '#e8d48b' }}>{opt.preview}</p>
                </div>
              )}
            />

            {/* Clock Style */}
            <OptionPicker
              label="Modelo de Reloj / Countdown"
              options={CLOCK_STYLES}
              value={cfg.estilos.modeloReloj}
              onChange={(v) => setNested('estilos', 'modeloReloj', v)}
              renderOption={(opt, isSelected) => (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-200">{opt.name}</span>
                    {isSelected && <span className="text-[#d4af37] text-[10px] font-bold">✓</span>}
                  </div>
                  <div className="text-2xl font-bold text-center py-1" style={{ color: '#e8d48b' }}>{opt.preview}</div>
                  <p className="text-[10px] text-gray-500 text-center">{opt.description}</p>
                </div>
              )}
            />

            {/* Card Style */}
            <OptionPicker
              label="Estilo de Tarjetas"
              options={CARD_STYLES}
              value={cfg.estilos.estiloTarjetas}
              onChange={(v) => setNested('estilos', 'estiloTarjetas', v)}
            />

            {/* Button Style */}
            <OptionPicker
              label="Estilo de Botones"
              options={BUTTON_STYLES}
              value={cfg.estilos.estiloBotones}
              onChange={(v) => setNested('estilos', 'estiloBotones', v)}
            />
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
