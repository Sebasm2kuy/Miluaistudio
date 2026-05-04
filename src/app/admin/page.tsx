'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import config, { type SiteConfig } from '@/data/config'
import { saveConfig, clearConfig } from '@/hooks/useConfig'

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
  type?: 'text' | 'url' | 'datetime-local' | 'tel'
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
}

export default function AdminPage() {
  const [cfg, setCfg] = useState<SiteConfig>(deepClone(config))
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['evento']))
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('milu_config')
      if (saved) {
        const parsed = JSON.parse(saved) as SiteConfig
        if (parsed?.evento?.nombre) setCfg(parsed)
      }
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
          setCfg(parsed)
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
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
              {saved ? 'Guardado ✓' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = GOLD + '44')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = GOLD + '22')}
            >
              Descargar JSON
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = GOLD + '44')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = GOLD + '22')}
            >
              Importar JSON
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-red-950/60 text-red-300 border border-red-800/50 hover:bg-red-900/60"
            >
              Restaurar Valores
            </button>
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
            >
              Expandir
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
            >
              Colapsar
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </header>

      {/* --- Form Body --- */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-16">
        {/* EVENTO */}
        <Section
          title={SECTION_META.evento.title}
          icon={SECTION_META.evento.icon}
          open={openSections.has('evento')}
          onToggle={() => toggle('evento')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo" value={cfg.evento.tipo} onChange={(v) => setNested('evento', 'tipo', v)} />
            <Field label="Nombre" value={cfg.evento.nombre} onChange={(v) => setNested('evento', 'nombre', v)} />
            <Field label="Apellido" value={cfg.evento.apellido} onChange={(v) => setNested('evento', 'apellido', v)} />
            <Field label="Apodo" value={cfg.evento.apodo} onChange={(v) => setNested('evento', 'apodo', v)} />
            <Field label="Fecha (texto)" value={cfg.evento.fecha} onChange={(v) => setNested('evento', 'fecha', v)} />
            <Field label="Año" value={cfg.evento.anio} onChange={(v) => setNested('evento', 'anio', v)} />
            <Field
              label="Fecha Evento"
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
        <Section
          title={SECTION_META.dedicatoria.title}
          icon={SECTION_META.dedicatoria.icon}
          open={openSections.has('dedicatoria')}
          onToggle={() => toggle('dedicatoria')}
        >
          <div className="space-y-4">
            <Field label="Cita" value={cfg.dedicatoria.cita} onChange={(v) => setNested('dedicatoria', 'cita', v)} rows={3} />
            <Field label="Cuerpo" value={cfg.dedicatoria.cuerpo} onChange={(v) => setNested('dedicatoria', 'cuerpo', v)} rows={4} />
            <Field label="Firma" value={cfg.dedicatoria.firma} onChange={(v) => setNested('dedicatoria', 'firma', v)} />
          </div>
        </Section>

        {/* TIMELINE */}
        <Section
          title={SECTION_META.timeline.title}
          icon={SECTION_META.timeline.icon}
          open={openSections.has('timeline')}
          onToggle={() => toggle('timeline')}
        >
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
                      timeline: {
                        ...prev.timeline,
                        eventos: [...prev.timeline.eventos, { hora: '', titulo: '', desc: '', icono: '' }],
                      },
                    }))
                  }
                  className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
                >
                  + Agregar evento
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
                {cfg.timeline.eventos.map((ev, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">#{i + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            timeline: {
                              ...prev.timeline,
                              eventos: prev.timeline.eventos.filter((_, idx) => idx !== i),
                            },
                          }))
                        }
                        className="text-red-400 hover:text-red-300 text-lg leading-none transition-colors"
                        title="Eliminar evento"
                      >
                        &times;
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field
                        label="Hora"
                        value={ev.hora}
                        onChange={(v) =>
                          setCfg((prev) => {
                            const evs = [...prev.timeline.eventos]
                            evs[i] = { ...evs[i], hora: v }
                            return { ...prev, timeline: { ...prev.timeline, eventos: evs } }
                          })
                        }
                      />
                      <Field
                        label="Título"
                        value={ev.titulo}
                        onChange={(v) =>
                          setCfg((prev) => {
                            const evs = [...prev.timeline.eventos]
                            evs[i] = { ...evs[i], titulo: v }
                            return { ...prev, timeline: { ...prev.timeline, eventos: evs } }
                          })
                        }
                      />
                      <Field
                        label="Descripción"
                        value={ev.desc}
                        onChange={(v) =>
                          setCfg((prev) => {
                            const evs = [...prev.timeline.eventos]
                            evs[i] = { ...evs[i], desc: v }
                            return { ...prev, timeline: { ...prev.timeline, eventos: evs } }
                          })
                        }
                      />
                      <Field
                        label="Icono (emoji)"
                        value={ev.icono}
                        onChange={(v) =>
                          setCfg((prev) => {
                            const evs = [...prev.timeline.eventos]
                            evs[i] = { ...evs[i], icono: v }
                            return { ...prev, timeline: { ...prev.timeline, eventos: evs } }
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* GALERÍA */}
        <Section
          title={SECTION_META.galeria.title}
          icon={SECTION_META.galeria.icon}
          open={openSections.has('galeria')}
          onToggle={() => toggle('galeria')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Título" value={cfg.galeria.titulo} onChange={(v) => setNested('galeria', 'titulo', v)} />
              <Field label="Subtítulo" value={cfg.galeria.subtitulo} onChange={(v) => setNested('galeria', 'subtitulo', v)} />
              <Field label="Botón subir" value={cfg.galeria.botonSubir} onChange={(v) => setNested('galeria', 'botonSubir', v)} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fotos</span>
                <button
                  type="button"
                  onClick={() =>
                    setCfg((prev) => ({
                      ...prev,
                      galeria: {
                        ...prev.galeria,
                        fotos: [...prev.galeria.fotos, { webp: '', fallback: '' }],
                      },
                    }))
                  }
                  className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
                >
                  + Agregar foto
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
                {cfg.galeria.fotos.map((foto, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">Foto #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCfg((prev) => ({
                            ...prev,
                            galeria: {
                              ...prev.galeria,
                              fotos: prev.galeria.fotos.filter((_, idx) => idx !== i),
                            },
                          }))
                        }
                        className="text-red-400 hover:text-red-300 text-lg leading-none transition-colors"
                        title="Eliminar foto"
                      >
                        &times;
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field
                        label="WebP URL"
                        type="url"
                        value={foto.webp}
                        onChange={(v) =>
                          setCfg((prev) => {
                            const fotos = [...prev.galeria.fotos]
                            fotos[i] = { ...fotos[i], webp: v }
                            return { ...prev, galeria: { ...prev.galeria, fotos } }
                          })
                        }
                      />
                      <Field
                        label="Fallback URL"
                        type="url"
                        value={foto.fallback}
                        onChange={(v) =>
                          setCfg((prev) => {
                            const fotos = [...prev.galeria.fotos]
                            fotos[i] = { ...fotos[i], fallback: v }
                            return { ...prev, galeria: { ...prev.galeria, fotos } }
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* MÚSICA */}
        <Section
          title={SECTION_META.musica.title}
          icon={SECTION_META.musica.icon}
          open={openSections.has('musica')}
          onToggle={() => toggle('musica')}
        >
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
        <Section
          title={SECTION_META.rsvp.title}
          icon={SECTION_META.rsvp.icon}
          open={openSections.has('rsvp')}
          onToggle={() => toggle('rsvp')}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Título" value={cfg.rsvp.titulo} onChange={(v) => setNested('rsvp', 'titulo', v)} />
              <Field label="Fecha Límite" value={cfg.rsvp.fechaLimite} onChange={(v) => setNested('rsvp', 'fechaLimite', v)} />
              <Field label="Fecha Límite Full" value={cfg.rsvp.fechaLimiteFull} onChange={(v) => setNested('rsvp', 'fechaLimiteFull', v)} />
              <Field label="Host Phone" type="tel" value={cfg.rsvp.hostPhone} onChange={(v) => setNested('rsvp', 'hostPhone', v)} />
            </div>
            <Field label="Subtítulo" value={cfg.rsvp.subtitulo} onChange={(v) => setNested('rsvp', 'subtitulo', v)} rows={3} />
            <Field label="Google Sheet URL" type="url" value={cfg.rsvp.googleSheetUrl} onChange={(v) => setNested('rsvp', 'googleSheetUrl', v)} />

            {/* Regalos sub-section */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-4">
              <h4 className="font-cursive text-lg" style={{ color: GOLD }}>
                🎁 Regalos
              </h4>
              <Field label="Título" value={cfg.rsvp.regalos.titulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'titulo'], v)} />
              <Field label="Subtítulo" value={cfg.rsvp.regalos.subtitulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'subtitulo'], v)} rows={2} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Abitab</span>
                  <Field label="Título" value={cfg.rsvp.regalos.abitab.titulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'abitab', 'titulo'], v)} />
                  <Field label="Número" value={cfg.rsvp.regalos.abitab.numero} onChange={(v) => setDeep(['rsvp', 'regalos', 'abitab', 'numero'], v)} />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mi Dinero</span>
                  <Field label="Título" value={cfg.rsvp.regalos.miDinero.titulo} onChange={(v) => setDeep(['rsvp', 'regalos', 'miDinero', 'titulo'], v)} />
                  <Field label="Número" value={cfg.rsvp.regalos.miDinero.numero} onChange={(v) => setDeep(['rsvp', 'regalos', 'miDinero', 'numero'], v)} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* FOOTER */}
        <Section
          title={SECTION_META.footer.title}
          icon={SECTION_META.footer.icon}
          open={openSections.has('footer')}
          onToggle={() => toggle('footer')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Apodo" value={cfg.footer.apodo} onChange={(v) => setNested('footer', 'apodo', v)} />
            <Field label="Ubicación" value={cfg.footer.ubicacion} onChange={(v) => setNested('footer', 'ubicacion', v)} />
            <Field label="Frase" value={cfg.footer.frase} onChange={(v) => setNested('footer', 'frase', v)} />
          </div>
        </Section>

        {/* INVITACIÓN */}
        <Section
          title={SECTION_META.invitacion.title}
          icon={SECTION_META.invitacion.icon}
          open={openSections.has('invitacion')}
          onToggle={() => toggle('invitacion')}
        >
          <div className="grid grid-cols-1 gap-4">
            <Field label="Imagen URL" type="url" value={cfg.invitacion.imagen} onChange={(v) => setNested('invitacion', 'imagen', v)} />
            <Field label="Imagen Fallback URL" type="url" value={cfg.invitacion.imagenFallback} onChange={(v) => setNested('invitacion', 'imagenFallback', v)} />
            <Field label="Texto Abrir" value={cfg.invitacion.textoAbrir} onChange={(v) => setNested('invitacion', 'textoAbrir', v)} />
          </div>
        </Section>

        {/* COUNTDOWN */}
        <Section
          title={SECTION_META.countdown.title}
          icon={SECTION_META.countdown.icon}
          open={openSections.has('countdown')}
          onToggle={() => toggle('countdown')}
        >
          <div className="space-y-4">
            <Field label="Título" value={cfg.countdown.titulo} onChange={(v) => setNested('countdown', 'titulo', v)} />

            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Labels (D / H / M / S)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['D', 'H', 'M', 'S'] as const).map((key) => (
                  <Field
                    key={key}
                    label={key}
                    value={cfg.countdown.labels[key]}
                    onChange={(v) =>
                      setCfg((prev) => ({
                        ...prev,
                        countdown: {
                          ...prev.countdown,
                          labels: { ...prev.countdown.labels, [key]: v },
                        },
                      }))
                    }
                  />
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
        <Section
          title={SECTION_META.fondo.title}
          icon={SECTION_META.fondo.icon}
          open={openSections.has('fondo')}
          onToggle={() => toggle('fondo')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Fotos de fondo ({cfg.fondo.fotos.length})
              </span>
              <button
                type="button"
                onClick={() =>
                  setCfg((prev) => ({
                    ...prev,
                    fondo: { ...prev.fondo, fotos: [...prev.fondo.fotos, ''] },
                  }))
                }
                className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}55` }}
              >
                + Agregar foto
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
              {cfg.fondo.fotos.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-6 text-right shrink-0">{i + 1}</span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) =>
                      setCfg((prev) => {
                        const fotos = [...prev.fondo.fotos]
                        fotos[i] = e.target.value
                        return { ...prev, fondo: { ...prev.fondo, fotos } }
                      })
                    }
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-gray-900 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-[#d4af37]"
                    placeholder="URL de imagen"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCfg((prev) => ({
                        ...prev,
                        fondo: {
                          ...prev.fondo,
                          fotos: prev.fondo.fotos.filter((_, idx) => idx !== i),
                        },
                      }))
                    }
                    className="text-red-400 hover:text-red-300 text-lg leading-none transition-colors shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-950/50"
                    title="Eliminar"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* COLORES */}
        <Section
          title={SECTION_META.colores.title}
          icon={SECTION_META.colores.icon}
          open={openSections.has('colores')}
          onToggle={() => toggle('colores')}
        >
          <div className="space-y-4">
            <ColorField label="Principal" value={cfg.colores.principal} onChange={(v) => setNested('colores', 'principal', v)} />
            <ColorField label="Dorado" value={cfg.colores.dorado} onChange={(v) => setNested('colores', 'dorado', v)} />
            <ColorField label="Dorado Claro" value={cfg.colores.doradoClaro} onChange={(v) => setNested('colores', 'doradoClaro', v)} />
            <ColorField label="Marfil" value={cfg.colores.marfil} onChange={(v) => setNested('colores', 'marfil', v)} />
            <ColorField label="Fondo" value={cfg.colores.fondo} onChange={(v) => setNested('colores', 'fondo', v)} />

            {/* Live preview strip */}
            <div className="pt-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Vista previa
              </span>
              <div className="flex gap-1 h-10 rounded-lg overflow-hidden border border-gray-700">
                {([cfg.colores.principal, cfg.colores.dorado, cfg.colores.doradoClaro, cfg.colores.marfil, cfg.colores.fondo] as string[]).map(
                  (c, i) => (
                    <div key={i} className="flex-1 transition-colors duration-200" style={{ backgroundColor: c }} />
                  ),
                )}
              </div>
              <div className="flex gap-1 mt-1">
                {['Principal', 'Dorado', 'Dorado C.', 'Marfil', 'Fondo'].map((name, i) => (
                  <span key={name} className="flex-1 text-center text-[10px] text-gray-600 truncate">
                    {name}
                  </span>
                ))}
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
