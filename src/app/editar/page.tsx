'use client'

/**
 * EDITOR MÓVIL VISUAL — /editar (publicado desde la iteración 017).
 *
 * La experiencia pedida para el teléfono:
 *  1. La invitación se muestra completa, como la verá un invitado.
 *  2. El usuario se desplaza con scroll natural (el contenedor real).
 *  3. Toca un elemento editable (texto, foto, fecha, mapa, botones...)
 *     y se abre un panel inferior contextual con SOLO esos campos.
 *  4. Los cambios se reflejan en vivo, sin recargar nada y sin perder
 *     la posición de scroll (el panel es una capa encima).
 *  5. «Previa» muestra la experiencia completa del invitado (sobre,
 *     carga, música, navegación); «Editar» vuelve al modo directo.
 *     Ningún botón propio de la invitación (RSVP, enlaces, mapas,
 *     lightbox) se dispara mientras se edita.
 *  6. «Guardar» persiste el BORRADOR en este navegador (localStorage,
 *     igual que el panel de escritorio). La invitación REAL se carga y
 *     se publica por slug con el MISMO flujo validado del panel:
 *     Ajustes → «Invitación publicada» (publicarInvitacionDesdePanel),
 *     con el token en sessionStorage y estados honestos.
 *
 * En escritorio funciona igual (el panel de escritorio sigue siendo la
 * herramienta principal de PC); esta ruta está pensada para el pulgar:
 * objetivos ≥44 px, panel inferior, teclado virtual respetado.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { CONFIG_DEMO_BASE, createDemoConfig } from '@/data/demo-config'
import type { SiteConfig } from '@/data/config-schema'
import type { InvitationDesign } from '@/data/invitation-designs'
import { urlPublicaInvitacion } from '@/data/invitacion-publicada'
import InvitationExperience from '@/components/invitation-experience'
import { ConfigProvider, saveConfig, leerConfigGuardada } from '@/hooks/useConfig'
import { sincronizarFondoConGaleria } from '@/lib/activos-editor'
import { leerInvitacionPublicadaDeGitHub } from '@/lib/carga-invitacion'
import { publicarInvitacionDesdePanel } from '@/lib/publicacion-panel'
import { EditorProvider } from '@/components/editor/EditorProvider'
import PanelEdicion from '@/components/editor/PanelEdicion'
import PanelAjustes, { type EstadoGithubUI } from '@/components/editor/PanelAjustes'
import { actualizarCampoEditado } from '@/lib/editor-config'
import type { AccionSpec } from '@/lib/editor-campos'
import type { ValorCampo } from '@/components/editor/CampoControl'

type Modo = 'editar' | 'previsualizar'
/** string[]: el fondo admite asignar el array de fotos completo. */
type ValorEdicion = ValorCampo | string[]

const TOKEN_KEY = 'milu_github_token'
/** Slug activo persistido: al recargar el editor se recuerda qué invitación se edita. */
const SLUG_KEY = 'milu_editor_slug'
/** Solo en desarrollo (npm run dev) existe /admin; en el export no se publica. */
const ES_DEV = process.env.NODE_ENV === 'development'

const GITHUB_EN_REPOSO: EstadoGithubUI = { ocupado: null, mensaje: '', tipoMensaje: 'info' }

export default function PaginaEditar() {
  const [cfg, setCfg] = useState<SiteConfig | null>(null)
  const [modo, setModo] = useState<Modo>('editar')
  const [cfgPrevia, setCfgPrevia] = useState<SiteConfig | null>(null)
  const [guardado, setGuardado] = useState<'reposo' | 'guardando' | 'ok'>('reposo')
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const [token, setToken] = useState('')
  const [guardadaStr, setGuardadaStr] = useState('')
  const [slug, setSlug] = useState('')
  const [github, setGithub] = useState<EstadoGithubUI>(GITHUB_EN_REPOSO)
  const [alturaBarraArriba, setAlturaBarraArriba] = useState(60)
  const [alturaBarraAbajo, setAlturaBarraAbajo] = useState(0)
  const barraArribaRef = useRef<HTMLDivElement>(null)
  const barraAbajoRef = useRef<HTMLDivElement>(null)
  const avisarSalidaActivoRef = useRef(false)

  // Carga inicial: misma fuente que el panel de escritorio (localStorage
  // con versión) y, si no hay nada, la base demo sintética. El slug activo
  // se recuerda de la última sesión y ?slug= de la URL lo preseleccione
  // (ideal para un marcador /editar/?slug=mi-invitacion en el teléfono).
  useEffect(() => {
    // Carga solo posible tras el montaje (localStorage/sessionStorage no
    // existen durante el render estático): mismo patrón que el panel.
    const inicial = leerConfigGuardada() ?? (JSON.parse(JSON.stringify(CONFIG_DEMO_BASE)) as SiteConfig)
    let tokenSesion = ''
    let hintYaVisto = false
    let slugRecordado = ''
    try {
      tokenSesion = sessionStorage.getItem(TOKEN_KEY) ?? ''
      hintYaVisto = sessionStorage.getItem('milu_editor_hint') === 'visto'
      slugRecordado = localStorage.getItem(SLUG_KEY) ?? ''
    } catch { /* storage no disponible */ }
    let slugUrl = ''
    try {
      slugUrl = new URLSearchParams(window.location.search).get('slug') ?? ''
    } catch { /* URL no disponible */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCfg(inicial)
    setGuardadaStr(JSON.stringify(inicial))
    setToken(tokenSesion)
    setHintVisible(!hintYaVisto)
    setSlug(slugUrl || slugRecordado)
  }, [])

  const hayCambios = cfg ? JSON.stringify(cfg) !== guardadaStr : false

  // Ajustes del documento tras hidratar (nunca antes: provocarían un
  // desajuste de hidratación en <html>/<body>).
  useEffect(() => {
    document.documentElement.classList.add('editor-page')
    document.documentElement.style.overflow = 'auto'
    document.documentElement.style.height = 'auto'
    document.documentElement.style.position = 'static'
    document.documentElement.style.background = '#292522'
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    document.body.style.position = 'static'
    document.body.style.background = '#292522'
  }, [])

  // Medir las barras para que el contenedor fijo de la invitación no
  // quede tapado arriba ni abajo (los elementos detrás de la barra no
  // se podrían tocar).
  useEffect(() => {
    if (!barraArribaRef.current) return
    const ro = new ResizeObserver(() => {
      setAlturaBarraArriba(barraArribaRef.current?.offsetHeight ?? 60)
      setAlturaBarraAbajo(barraAbajoRef.current?.offsetHeight ?? 0)
    })
    ro.observe(barraArribaRef.current)
    if (barraAbajoRef.current) ro.observe(barraAbajoRef.current)
    return () => ro.disconnect()
  }, [modo, hintVisible])

  // Aviso de salida con cambios sin guardar (escritorio; en móvil mejor esfuerzo)
  useEffect(() => {
    if (!hayCambios) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!avisarSalidaActivoRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hayCambios])

  // ------------------------------------------------------------------
  // Mutaciones de la configuración en vivo
  // ------------------------------------------------------------------
  const cambiarCampo = useCallback((path: string[], valor: ValorEdicion, idx?: number) => {
    setCfg((prev) => (prev ? actualizarCampoEditado(prev, path, valor, idx) : prev))
  }, [])

  const aplicarAccion = useCallback((accion: AccionSpec['tipo'], idx?: number) => {
    setCfg((prev) => {
      if (!prev) return prev
      if (accion === 'quitar-foto' && idx !== undefined) {
        return {
          ...prev,
          galeria: { ...prev.galeria, fotos: prev.galeria.fotos.filter((_, i) => i !== idx) },
        }
      }
      if (accion === 'agregar-foto') {
        return {
          ...prev,
          galeria: { ...prev.galeria, fotos: [...prev.galeria.fotos, { webp: '', fallback: '' }] },
        }
      }
      if (accion === 'quitar-momento' && idx !== undefined) {
        if (prev.timeline.eventos.length <= 1) return prev
        return {
          ...prev,
          timeline: { ...prev.timeline, eventos: prev.timeline.eventos.filter((_, i) => i !== idx) },
        }
      }
      if (accion === 'agregar-momento') {
        return {
          ...prev,
          timeline: {
            ...prev.timeline,
            eventos: [...prev.timeline.eventos, { hora: '', titulo: '', desc: '', icono: '' }],
          },
        }
      }
      return prev
    })
  }, [])

  const revertir = useCallback(() => {
    if (cfgPrevia) {
      setCfg(cfgPrevia)
      setCfgPrevia(null)
    }
  }, [cfgPrevia])
  // Al abrir el panel de un elemento: snapshot para «Cancelar» (cada
  // panel arranca desde la config vigente; Cancelar revierte SOLO ese panel).
  const tomarSnapshot = useCallback(() => {
    setCfgPrevia(cfg ? (JSON.parse(JSON.stringify(cfg)) as SiteConfig) : null)
  }, [cfg])

  const descartarSnapshot = useCallback(() => {
    setCfgPrevia(null)
  }, [])

  const elegirPlantilla = useCallback((design: InvitationDesign) => {
    setCfgPrevia((previa) => previa) // conserva snapshot pendiente
    setCfg((prev) => {
      const nueva = createDemoConfig(design)
      if (!prev) return nueva
      // Conserva el nombre ya escrito por el usuario si lo había
      return { ...nueva, evento: { ...nueva.evento, nombre: prev.evento.nombre || nueva.evento.nombre } }
    })
    setAjustesAbiertos(false)
  }, [])

  const guardar = useCallback(() => {
    if (!cfg) return
    setGuardado('guardando')
    // Misma regla que «Guardar» del panel de escritorio: el fondo se
    // sincroniza con la galería vigente antes de persistir.
    const sincronizada = sincronizarFondoConGaleria(cfg)
    setCfg(sincronizada)
    saveConfig(sincronizada)
    setGuardadaStr(JSON.stringify(sincronizada))
    avisarSalidaActivoRef.current = false
    setGuardado('ok')
    setTimeout(() => setGuardado('reposo'), 2000)
  }, [cfg])

  const cambiarModo = useCallback((nuevo: Modo) => {
    setModo(nuevo)
    setAjustesAbiertos(false)
  }, [])

  const guardarToken = useCallback((nuevoToken: string) => {
    setToken(nuevoToken)
    try {
      if (nuevoToken.trim()) sessionStorage.setItem(TOKEN_KEY, nuevoToken.trim())
      else sessionStorage.removeItem(TOKEN_KEY)
    } catch { /* storage no disponible */ }
  }, [])

  // ------------------------------------------------------------------
  // Invitación publicada: cargar por slug y publicar cambios reales
  // (mismo flujo validado del panel de escritorio, sin duplicarlo)
  // ------------------------------------------------------------------
  const recordarSlug = useCallback((nuevo: string) => {
    setSlug(nuevo)
    try {
      if (nuevo) localStorage.setItem(SLUG_KEY, nuevo)
      else localStorage.removeItem(SLUG_KEY)
    } catch { /* storage no disponible */ }
  }, [])

  const cargarInvitacion = useCallback(async (slugCandidato: string) => {
    if (hayCambios) {
      const seguir = window.confirm(
        'Hay cambios sin guardar en este navegador. Cargar la invitación publicada los va a reemplazar. ¿Seguro?',
      )
      if (!seguir) return
    }
    setGithub({ ocupado: 'cargando', mensaje: '', tipoMensaje: 'info' })
    const resultado = await leerInvitacionPublicadaDeGitHub({ slug: slugCandidato, token })
    if (resultado.success && resultado.config) {
      const cargada = resultado.config
      setCfg(cargada)
      setGuardadaStr(JSON.stringify(cargada))
      saveConfig(cargada)
      recordarSlug(resultado.slug)
      setGithub({
        ocupado: null,
        mensaje: resultado.message,
        tipoMensaje: 'ok',
        urlPublica: urlPublicaInvitacion(resultado.slug),
      })
    } else {
      setGithub({ ocupado: null, mensaje: resultado.message, tipoMensaje: 'error' })
    }
  }, [token, hayCambios, recordarSlug])

  const publicarCambios = useCallback(async (slugCandidato: string) => {
    if (!cfg) return
    setGithub({ ocupado: 'publicando', mensaje: '', tipoMensaje: 'info' })
    // Misma unidad que «Publicar invitación» del panel de escritorio:
    // valida slug y token, sincroniza fondo ↔ galería y muestra el estado real.
    const resultado = await publicarInvitacionDesdePanel({ slug: slugCandidato, config: cfg, token })
    if (resultado.success) {
      recordarSlug(resultado.slug)
      setGithub({
        ocupado: null,
        mensaje: resultado.message,
        tipoMensaje: 'ok',
        urlPublica: resultado.urlAbsoluta || urlPublicaInvitacion(resultado.slug),
      })
    } else {
      setGithub({
        ocupado: null,
        mensaje: resultado.message,
        tipoMensaje: 'error',
        urlPublica: undefined,
      })
    }
  }, [cfg, token, recordarSlug])

  const ocultarHint = useCallback(() => {
    setHintVisible(false)
    try {
      sessionStorage.setItem('milu_editor_hint', 'visto')
    } catch { /* storage no disponible */ }
  }, [])

  const estiloTema = useMemo(() => {
    if (!cfg) return {} as CSSProperties
    return {
      '--theme-primary': cfg.colores.principal,
      '--theme-accent': cfg.colores.dorado,
      '--theme-accent-light': cfg.colores.doradoClaro,
      '--theme-ivory': cfg.colores.marfil,
      '--theme-background': cfg.colores.fondo,
      '--theme-highlight': cfg.colores.principal === '#3d0202' ? '#fcf6ba' : cfg.colores.doradoClaro,
    } as CSSProperties
  }, [cfg])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (!cfg) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#292522] text-[#fcf6ba]">
        <p className="animate-pulse font-serif text-lg">Abriendo la invitación…</p>
      </div>
    )
  }

  const nombreEvento = cfg.evento.nombre || 'Invitación'

  return (
    <div
      className={(modo === 'editar' ? 'modo-edicion ' : '') + 'editor-con-barra relative min-h-[100dvh] bg-[#292522]'}
      style={{
        ...estiloTema,
        '--editor-bar-arriba': alturaBarraArriba + 'px',
        '--editor-bar-abajo': alturaBarraAbajo + 'px',
      } as CSSProperties}
    >
      {/* ===== Barra superior fija ===== */}
      <div ref={barraArribaRef}>
        <header
          className="fixed inset-x-0 top-0 z-[300] border-b border-white/10 bg-[#292522]/97 backdrop-blur-md"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
        >
          <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-2 py-2">
            {ES_DEV && (
              <a
                href="/Miluaistudio/admin/"
                aria-label="Volver al panel de configuración (solo existe en desarrollo)"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#fcf6ba] transition active:scale-95"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </a>
            )}
            <span className="min-w-0 flex-1 truncate text-left">
              <span className="block truncate text-xs font-semibold text-white/90">{nombreEvento}</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/45">
                {hayCambios ? 'Cambios sin guardar' : 'Sin cambios nuevos'}
              </span>
            </span>

            {/* Alternancia Editar ↔ Vista previa (dos botones grandes) */}
            <div className="flex shrink-0 overflow-hidden rounded-full border border-[#d4af37]/40" role="tablist" aria-label="Modo del editor">
              <button
                type="button"
                role="tab"
                aria-selected={modo === 'editar'}
                onClick={() => cambiarModo('editar')}
                className={
                  'min-h-[44px] px-3 text-xs font-bold transition ' +
                  (modo === 'editar' ? 'bg-[#d4af37] text-[#292522]' : 'bg-transparent text-[#fcf6ba]')
                }
              >
                Editar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modo === 'previsualizar'}
                onClick={() => cambiarModo('previsualizar')}
                className={
                  'min-h-[44px] px-3 text-xs font-bold transition ' +
                  (modo === 'previsualizar' ? 'bg-[#d4af37] text-[#292522]' : 'bg-transparent text-[#fcf6ba]')
                }
              >
                Previa
              </button>
            </div>

            <button
              type="button"
              onClick={guardar}
              className={
                'relative min-h-[44px] shrink-0 rounded-full px-3 text-xs font-bold transition active:scale-95 ' +
                (guardado === 'ok' ? 'bg-[#16a34a] text-white' : 'bg-white/12 text-[#fcf6ba]')
              }
              aria-label="Guardar el borrador en este navegador (publicar es aparte, en Ajustes)"
            >
              {guardado === 'guardando' ? '…' : guardado === 'ok' ? 'Guardado ✓' : 'Guardar'}
              {hayCambios && guardado !== 'ok' && (
                <span aria-hidden="true" className="absolute right-1 top-1.5 h-2 w-2 rounded-full bg-[#d4af37]" />
              )}
            </button>
          </div>
        </header>
      </div>

      {/* ===== La invitación REAL, completa ===== */}
      <EditorProvider modoEdicion={modo === 'editar'} alAbrir={tomarSnapshot}>
        <ConfigProvider config={cfg}>
          <InvitationExperience key={modo} modoEdicion={modo === 'editar'} />
        </ConfigProvider>

        {modo === 'editar' && (
          <PanelEdicion
            cfg={cfg}
            token={token}
            cfgPrevia={cfgPrevia}
            onRevert={revertir}
            onCerrarPanel={descartarSnapshot}
            onCambio={cambiarCampo}
            onAccion={aplicarAccion}
          />
        )}
      </EditorProvider>

      {/* ===== Barra inferior: hint + Ajustes (solo en modo edición) ===== */}
      {modo === 'editar' && (
        <div ref={barraAbajoRef}>
          <div
            className="fixed inset-x-0 bottom-0 z-[300] border-t border-white/10 bg-[#292522]/97 backdrop-blur-md"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
          >
            {hintVisible && (
              <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 pt-2">
                <p className="flex-1 text-[11px] leading-snug text-white/70">
                  Tocá cualquier elemento de la invitación para editarlo: textos, fotos, fecha, mapa y botones.
                </p>
                <button
                  type="button"
                  onClick={ocultarHint}
                  className="min-h-[36px] rounded-full px-2.5 text-[11px] font-semibold text-white/60"
                >
                  Entendido
                </button>
              </div>
            )}
            <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2">
              <p className="flex-1 text-[10px] uppercase tracking-[0.16em] text-white/40">Modo edición</p>
              <button
                type="button"
                onClick={() => setAjustesAbiertos(true)}
                className="min-h-[44px] rounded-full bg-white/12 px-4 text-xs font-bold text-[#fcf6ba] transition active:scale-95"
              >
                ⚙️ Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Ajustes ===== */}
      <PanelAjustes
        abierto={ajustesAbiertos}
        onCerrar={() => setAjustesAbiertos(false)}
        cfg={cfg}
        token={token}
        slug={slug}
        github={github}
        onTokenGuardar={guardarToken}
        onCargarInvitacion={cargarInvitacion}
        onPublicarInvitacion={publicarCambios}
        onCambio={cambiarCampo}
        onCambioSeccionesCompletas={(fotos) => cambiarCampo(['fondo', 'fotos'], fotos)}
        onAplicarColores={(colors) => {
          setCfg((prev) => (prev ? { ...prev, colores: { ...prev.colores, ...colors } } : prev))
        }}
        onElegirPlantilla={elegirPlantilla}
        onAccion={aplicarAccion}
        onAgregarFoto={() => {
          aplicarAccion('agregar-foto')
          setAjustesAbiertos(false)
        }}
      />
    </div>
  )
}
