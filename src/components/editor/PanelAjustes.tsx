'use client'

/**
 * Panel de «Ajustes» del editor móvil: todo lo estructural que no tiene
 * una representación directa tocable sobre la invitación (plantilla,
 * colores, tipografías, secciones, fondo, sobre, cronograma completo,
 * datos especiales y la conexión con GitHub para subir fotos).
 *
 * Reutiliza los mismos datos y validaciones que el panel de escritorio:
 * COLOR_PRESETS/BACKGROUND_PRESETS, FONT_OPTIONS, createDemoConfig para
 * las plantillas y el token de sessionStorage de «Conexión con GitHub».
 */

import { useEffect, useState } from 'react'
import { INVITATION_DESIGNS, type InvitationDesign } from '@/data/invitation-designs'
import { createDemoConfig } from '@/data/demo-config'
import { COLOR_PRESETS, BACKGROUND_PRESETS } from '@/data/admin-options'
import CatalogScene from '@/components/catalog-scene'
import { ELEMENTOS_EDITABLES, PANELES_AJUSTES, type AccionSpec, type PanelAjuste } from '@/lib/editor-campos'
import { leerEnConfig } from '@/lib/editor-config'
import CampoControl, { type ValorCampo } from './CampoControl'
import PanelImportarWhatsApp from './PanelImportarWhatsApp'
import type { ResultadoImportacion } from '@/lib/importar-whatsapp'
import type { SiteConfig } from '@/data/config-schema'

interface Props {
  abierto: boolean
  onCerrar: () => void
  cfg: SiteConfig
  onCambio: (path: string[], valor: ValorCampo | string[], idx?: number) => void
  onCambioSeccionesCompletas: (fotos: string[]) => void
  onAplicarColores: (colors: Record<string, string>) => void
  onElegirPlantilla: (design: InvitationDesign) => void
  onAccion: (accion: AccionSpec['tipo'], idx?: number) => void
  onAgregarFoto: () => void
  token: string
  onTokenGuardar: (token: string) => void
  /** Slug activo de la invitación cargada/publicada (para preseleccionar el campo). */
  slug: string
  /** Estado del vínculo con la invitación publicada (carga y publicación). */
  github: EstadoGithubUI
  onCargarInvitacion: (slug: string) => void
  onPublicarInvitacion: (slug: string) => void
  /** Lee el mensaje de WhatsApp pegado y devuelve la importación (sin aplicar). */
  onImportarLeer: (mensaje: string) => ResultadoImportacion
  /** Aplica la importación leída: reemplaza el borrador del editor. */
  onImportarAplicar: (resultado: ResultadoImportacion) => void
}

/** Estado compartido página ↔ panel para la invitación publicada. */
export interface EstadoGithubUI {
  ocupado: 'cargando' | 'publicando' | null
  mensaje: string
  tipoMensaje: 'info' | 'ok' | 'error'
  /** URL absoluta de la invitación publicada (tras una carga/publicación exitosa). */
  urlPublica?: string
}

type EstadoToken = 'indefinido' | 'verificando' | 'ok' | 'error'

/**
 * El contenido se monta SOLO cuando el panel está abierto: los estados
 * internos (borrador del token, grupo desplegado) nacen limpios en cada
 * apertura sin necesidad de sincronizarlos con efectos.
 */
export default function PanelAjustes(props: Props) {
  if (!props.abierto) return null
  return <ContenidoAjustes {...props} />
}

function ContenidoAjustes({
  onCerrar,
  cfg,
  onCambio,
  onCambioSeccionesCompletas,
  onAplicarColores,
  onElegirPlantilla,
  onAccion,
  onAgregarFoto,
  token,
  onTokenGuardar,
  slug,
  github,
  onCargarInvitacion,
  onPublicarInvitacion,
  onImportarLeer,
  onImportarAplicar,
}: Props) {
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>('ajustes-plantillas')
  const [alturaDisponible, setAlturaDisponible] = useState<number | null>(null)
  const [tokenBorrador, setTokenBorrador] = useState(token)
  const [estadoToken, setEstadoToken] = useState<EstadoToken>('indefinido')
  const [slugBorrador, setSlugBorrador] = useState(slug)

  // Altura real con teclado virtual
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const actualizar = () => setAlturaDisponible(vv.height)
    actualizar()
    vv.addEventListener('resize', actualizar)
    return () => vv.removeEventListener('resize', actualizar)
  }, [])

  // Cerrar con Escape (escritorio)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCerrar])

  const fondoActual = cfg.fondo.fotos[0] ?? ''

  const verificarToken = async () => {
    const candidato = tokenBorrador.trim()
    if (!candidato) {
      setEstadoToken('error')
      return
    }
    setEstadoToken('verificando')
    try {
      const res = await fetch('https://api.github.com/repos/Sebasm2kuy/Miluaistudio/contents/src/data/config.ts', {
        headers: { Authorization: `Bearer ${candidato}`, Accept: 'application/vnd.github.v3+json' },
      })
      if (res.ok) {
        onTokenGuardar(candidato)
        setEstadoToken('ok')
      } else {
        setEstadoToken('error')
      }
    } catch {
      setEstadoToken('error')
    }
  }

  const renderCustom = (panel: PanelAjuste) => {
    if (panel.custom === 'plantillas') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {INVITATION_DESIGNS.map((design) => (
            <button
              key={design.id}
              type="button"
              onClick={() => {
                if (window.confirm('¿Empezar con la plantilla «' + design.name + '»? Reemplaza los textos y fotos actuales de esta edición.')) {
                  onElegirPlantilla(design)
                }
              }}
              className="relative block overflow-hidden rounded-2xl border border-[#e8e0d7] text-left shadow-sm transition active:scale-[0.98]"
            >
              <span className="block aspect-[4/5] w-full">
                <CatalogScene design={design} />
              </span>
              <span className="absolute inset-x-2 bottom-2 rounded-lg bg-black/55 px-2 py-1.5 text-center text-[11px] font-semibold text-white">
                {design.name}
              </span>
            </button>
          ))}
        </div>
      )
    }

    if (panel.custom === 'colores') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {COLOR_PRESETS.map((preset) => {
            const activo = cfg.colores.principal === preset.colors.principal
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onAplicarColores(preset.colors as unknown as Record<string, string>)}
                className={
                  'overflow-hidden rounded-2xl border text-left transition active:scale-[0.98] ' +
                  (activo ? 'border-[#8a6534] shadow-[0_0_0_2px_rgba(181,140,90,0.45)]' : 'border-[#e8e0d7]')
                }
              >
                <span className="flex h-14 items-center justify-center text-xl" style={{ background: preset.colors.principal }}>
                  {preset.emoji}
                </span>
                <span className="flex h-3">
                  <span className="flex-1" style={{ background: preset.colors.dorado }} />
                  <span className="flex-1" style={{ background: preset.colors.doradoClaro }} />
                  <span className="flex-1" style={{ background: preset.colors.marfil }} />
                  <span className="flex-1" style={{ background: preset.colors.fondo }} />
                </span>
                <span className="block bg-white px-3 py-2 text-xs font-semibold text-[#292522]">{preset.name}</span>
              </button>
            )
          })}
        </div>
      )
    }

    if (panel.custom === 'fondo') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {BACKGROUND_PRESETS.map((bg) => {
            const esFotos = bg.id === 'fotos'
            const activo = esFotos
              ? cfg.fondo.fotos.length > 0 && !fondoActual.startsWith('gradient:')
              : fondoActual === `gradient:${bg.id}`
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => {
                  if (esFotos) {
                    onCambioSeccionesCompletas(cfg.galeria.fotos.map((f) => f.webp).filter(Boolean))
                  } else {
                    onCambioSeccionesCompletas([`gradient:${bg.id}`])
                  }
                }}
                className={
                  'overflow-hidden rounded-2xl border text-left transition active:scale-[0.98] ' +
                  (activo ? 'border-[#8a6534] shadow-[0_0_0_2px_rgba(181,140,90,0.45)]' : 'border-[#e8e0d7]')
                }
              >
                <span className="flex h-16 items-center justify-center text-2xl" style={{ background: bg.image ? `url(${bg.image}) center/cover` : (bg.css || '#f0ebe4') }}>
                  {bg.emoji}
                </span>
                <span className="block bg-white px-3 py-2">
                  <span className="block truncate text-xs font-semibold text-[#292522]">{bg.name}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#8f867c]">{bg.description}</span>
                </span>
              </button>
            )
          })}
          <p className="col-span-2 text-[11px] leading-relaxed text-[#787168]">
            «Mis Fotos» usa las fotos de la galería. Al guardar, el fondo se sincroniza con la galería vigente.
          </p>
        </div>
      )
    }

    if (panel.custom === 'cronograma') {
      return (
        <div className="space-y-3">
          {cfg.timeline.eventos.map((evento, i) => (
            <div key={i} className="rounded-xl border border-[#e8e0d7] bg-white/70 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#8f867c]">Momento #{i + 1}</span>
                <button
                  type="button"
                  onClick={() => onAccion('quitar-momento', i)}
                  className="min-h-[44px] rounded-lg px-3 text-xs font-semibold text-red-500"
                >
                  Quitar
                </button>
              </div>
              <div className="space-y-2">
                {ELEMENTOS_EDITABLES['cronograma.momento'].campos.map((campo) => (
                  <CampoControl
                    key={campo.path.join('.')}
                    campo={campo}
                    token={token}
                    valor={leerEnConfig(cfg, ['timeline', 'eventos', String(i), campo.path[campo.path.length - 1]]) as ValorCampo | undefined}
                    onCambio={(v) => onCambio(campo.path, v, i)}
                  />
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAccion('agregar-momento')}
            className="min-h-[48px] w-full rounded-xl border-2 border-dashed border-[#d9c9b2] text-sm font-semibold text-[#8a6534]"
          >
            + Agregar momento
          </button>
        </div>
      )
    }

    if (panel.custom === 'galeria') {
      return (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-[#787168]">
            {cfg.galeria.fotos.length === 0
              ? 'La galería está vacía.'
              : `${cfg.galeria.fotos.length} foto${cfg.galeria.fotos.length === 1 ? '' : 's'} en la invitación.`}{' '}
            Para reemplazar una foto, tocála directamente sobre la invitación (modo Editar).
          </p>
          <button
            type="button"
            onClick={onAgregarFoto}
            className="min-h-[48px] w-full rounded-xl border-2 border-dashed border-[#d9c9b2] text-sm font-semibold text-[#8a6534]"
          >
            + Agregar foto
          </button>
        </div>
      )
    }

    if (panel.custom === 'importar-wa') {
      return <PanelImportarWhatsApp onLeer={onImportarLeer} onAplicar={onImportarAplicar} />
    }

    if (panel.custom === 'github') {
      return (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-[#787168]">
            «Guardar» (arriba) guarda un <strong>borrador en este navegador</strong>. Para que cambie la
            invitación real (<span className="whitespace-nowrap">/i/slug/</span>), cargá acá la publicada
            por su slug, editá y tocá «Publicar cambios». Necesita el token de «Conexión con GitHub».
          </p>
          <input
            type="text"
            value={slugBorrador}
            onChange={(e) => setSlugBorrador(e.target.value)}
            placeholder="slug de la invitación · ej: quince-de-muestra"
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="url"
            className="w-full min-h-[44px] rounded-xl border border-[#e8e0d7] bg-white px-3.5 py-2.5 text-sm text-[#292522] outline-none focus:border-[#2563eb]"
            aria-label="Slug de la invitación publicada"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onCargarInvitacion(slugBorrador)}
              disabled={github.ocupado !== null}
              className="min-h-[44px] flex-1 rounded-xl border border-[#2563eb] bg-white text-sm font-bold text-[#2563eb] disabled:opacity-60"
            >
              {github.ocupado === 'cargando' ? 'Cargando…' : 'Cargar publicada'}
            </button>
            <button
              type="button"
              onClick={() => onPublicarInvitacion(slugBorrador)}
              disabled={github.ocupado !== null || !token}
              title={token ? undefined : 'Pegá primero el token en «Conexión con GitHub»'}
              className="min-h-[44px] flex-1 rounded-xl bg-[#16a34a] text-sm font-bold text-white disabled:opacity-60"
            >
              {github.ocupado === 'publicando' ? 'Publicando…' : 'Publicar cambios'}
            </button>
          </div>
          {!token && (
            <p className="text-xs font-semibold text-[#8a6534]">
              Para cargar o publicar hace falta el token: pegalo en «Conexión con GitHub».
            </p>
          )}
          {github.mensaje && (
            <p
              role={github.tipoMensaje === 'error' ? 'alert' : 'status'}
              className={
                'rounded-lg px-3 py-2 text-xs font-medium ' +
                (github.tipoMensaje === 'error'
                  ? 'bg-red-50 text-red-600'
                  : github.tipoMensaje === 'ok'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-[#f0ebe4] text-[#54483e]')
              }
            >
              {github.mensaje}
            </p>
          )}
          {github.urlPublica && (
            <a
              href={github.urlPublica}
              target="_blank"
              rel="noreferrer"
              className="block min-h-[44px] rounded-xl bg-[#292522] px-3 py-2.5 text-center text-xs font-bold text-[#fcf6ba]"
            >
              Ver la invitación publicada ↗
            </a>
          )}
        </div>
      )
    }

    if (panel.custom === 'token') {
      return (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-[#787168]">
            Para subir fotos hace falta un GitHub token con permiso <strong>Contents read/write</strong>. Se guarda solo
            en esta sesión (sessionStorage) y se borra al cerrar la pestaña. Pegarlo no publica nada por sí solo.
          </p>
          <input
            type="password"
            value={tokenBorrador}
            onChange={(e) => {
              setTokenBorrador(e.target.value)
              setEstadoToken('indefinido')
            }}
            placeholder="Pegá tu token acá…"
            className="w-full min-h-[44px] rounded-xl border border-[#e8e0d7] bg-white px-3.5 py-2.5 text-sm text-[#292522] outline-none focus:border-[#2563eb]"
            aria-label="GitHub token"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={verificarToken}
              disabled={estadoToken === 'verificando'}
              className="min-h-[44px] flex-1 rounded-xl bg-[#2563eb] text-sm font-bold text-white disabled:opacity-60"
            >
              {estadoToken === 'verificando' ? 'Verificando…' : 'Verificar y usar'}
            </button>
            {token && (
              <button
                type="button"
                onClick={() => {
                  onTokenGuardar('')
                  setTokenBorrador('')
                  setEstadoToken('indefinido')
                }}
                className="min-h-[44px] rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600"
              >
                Borrar
              </button>
            )}
          </div>
          {estadoToken === 'ok' && <p className="text-xs font-semibold text-green-600">Token válido: podés subir fotos.</p>}
          {estadoToken === 'error' && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              Token inválido o sin permisos de Contents read/write.
            </p>
          )}
          {token && estadoToken !== 'ok' && <p className="text-xs text-green-600">Ya hay un token activo en esta sesión.</p>}
        </div>
      )
    }

    return null
  }

  return (
    <>
      <div className="fixed inset-0 z-[400] bg-black/45" onClick={onCerrar} aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Ajustes de la invitación"
        className="fixed inset-x-0 bottom-0 z-[410] flex flex-col rounded-t-3xl bg-[#faf8f4] shadow-[0_-12px_40px_rgba(0,0,0,0.25)]"
        style={{
          maxHeight: alturaDisponible ? Math.round(alturaDisponible * 0.94) + 'px' : '90dvh',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
          animation: 'editorSheetSube 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="flex justify-center pt-2.5" aria-hidden="true">
          <span className="h-1.5 w-12 rounded-full bg-[#ded4c8]" />
        </div>
        <header className="flex items-center justify-between gap-3 px-5 pt-2.5 pb-2">
          <h2 className="font-serif text-xl text-[#292522]">Ajustes</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ajustes"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0ebe4] text-[#54483e] transition active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 pb-4">
          {PANELES_AJUSTES.map((panel) => {
            const abierto = grupoAbierto === panel.id
            return (
              <div key={panel.id} className="overflow-hidden rounded-2xl border border-[#e8e0d7] bg-white">
                <button
                  type="button"
                  onClick={() => setGrupoAbierto(abierto ? null : panel.id)}
                  aria-expanded={abierto}
                  className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-lg" aria-hidden="true">
                      {panel.icono}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#292522]">{panel.titulo}</span>
                      {panel.desc && <span className="mt-0.5 block text-[11px] leading-snug text-[#787168]">{panel.desc}</span>}
                    </span>
                  </span>
                  <svg
                    className={'h-4 w-4 shrink-0 text-[#8f867c] transition-transform ' + (abierto ? 'rotate-180' : '')}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {abierto && (
                  <div className="space-y-4 border-t border-[#e8e0d7] px-4 pb-4 pt-3">
                    {renderCustom(panel)}
                    {(panel.campos ?? []).map((campo) => (
                      <CampoControl
                        key={campo.path.join('.')}
                        campo={campo}
                        token={token}
                        valor={leerEnConfig(cfg, campo.path) as ValorCampo | undefined}
                        onCambio={(v) => onCambio(campo.path, v)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <footer className="border-t border-[#e8e0d7] px-5 py-3">
          <button
            type="button"
            onClick={onCerrar}
            className="min-h-[48px] w-full rounded-xl bg-[#8a6534] text-sm font-bold text-white shadow-[0_6px_18px_rgba(138,101,52,0.35)] transition active:scale-[0.98]"
          >
            Listo
          </button>
        </footer>
      </section>
    </>
  )
}
