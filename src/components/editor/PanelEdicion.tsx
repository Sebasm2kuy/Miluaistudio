'use client'

/**
 * Panel de edición contextual (bottom sheet) del editor móvil.
 *
 * Se abre al tocar un elemento editable de la invitación y muestra SOLO
 * los campos de ese elemento (registro ELEMENTOS_EDITABLES). Los cambios
 * se reflejan en vivo; «Cancelar» vuelve a la configuración previa a
 * abrir el panel y «Listo» confirma y cierra.
 *
 * Adaptado a teléfono:
 *  - Se ancla abajo, con tirador visual (sin arrastre obligatorio: el
 *    cierre siempre tiene botones grandes).
 *  - Altura limitada por visualViewport para no quedar tapada por el
 *    teclado virtual; el cuerpo scrollea.
 *  - Respeta safe-area-inset-bottom.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useEditorEdicion } from './EditorProvider'
import { ELEMENTOS_EDITABLES, type AccionSpec } from '@/lib/editor-campos'
import { leerCampoEditado } from '@/lib/editor-config'
import CampoControl, { type ValorCampo } from './CampoControl'
import type { SiteConfig } from '@/data/config-schema'

interface Props {
  cfg: SiteConfig
  token: string
  onCambio: (path: string[], valor: ValorCampo | string[], idx?: number) => void
  onAccion: (accion: AccionSpec['tipo'], idx?: number) => void
  /** Copia de la config al momento de abrir el panel (para Cancelar) */
  cfgPrevia: SiteConfig | null
  onRevert: () => void
  /** Cierre confirmando los cambios (limpia el snapshot pendiente) */
  onCerrarPanel: () => void
}

export default function PanelEdicion({ cfg, token, onCambio, onAccion, cfgPrevia, onRevert, onCerrarPanel }: Props) {
  const editor = useEditorEdicion()
  const activo = editor?.activo ?? null
  const grupo = activo ? ELEMENTOS_EDITABLES[activo.id] : undefined

  // Altura disponible real (visualViewport) para convivir con el teclado
  const [alturaDisponible, setAlturaDisponible] = useState<number | null>(null)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const actualizar = () => setAlturaDisponible(vv.height)
    actualizar()
    vv.addEventListener('resize', actualizar)
    return () => vv.removeEventListener('resize', actualizar)
  }, [])

  const cerrarConEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') editor?.cerrar()
    },
    [editor],
  )
  useEffect(() => {
    if (!activo) return
    window.addEventListener('keydown', cerrarConEscape)
    return () => window.removeEventListener('keydown', cerrarConEscape)
  }, [activo, cerrarConEscape])

  /** Cerrar conservando los cambios (✕, fondo o «Listo») */
  const cerrarConfirmado = useCallback(() => {
    onCerrarPanel()
    editor?.cerrar()
  }, [onCerrarPanel, editor])

  const cancelar = useCallback(() => {
    if (cfgPrevia) onRevert()
    editor?.cerrar()
  }, [cfgPrevia, onRevert, editor])

  const hayIdx = activo?.idx !== undefined
  const prefijo = useMemo(() => (hayIdx ? ` #${(activo?.idx ?? 0) + 1}` : ''), [hayIdx, activo?.idx])

  if (!editor || !activo || !grupo) return null

  return (
    <>
      {/* Fondo oscuro: tap cierra (mismo efecto que «Listo») */}
      <div
        className="fixed inset-0 z-[400] bg-black/45 transition-opacity duration-200"
        onClick={cerrarConfirmado}
        aria-hidden="true"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={'Editar ' + grupo.titulo + prefijo}
        className="fixed inset-x-0 bottom-0 z-[410] flex flex-col rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.25)]"
        style={{
          maxHeight: alturaDisponible ? Math.round(alturaDisponible * 0.92) + 'px' : '86dvh',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
          animation: 'editorSheetSube 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Tirador decorativo (el cierre es por botones, nunca por gesto) */}
        <div className="flex justify-center pt-2.5" aria-hidden="true">
          <span className="h-1.5 w-12 rounded-full bg-[#ded4c8]" />
        </div>

        <header className="flex items-start justify-between gap-3 px-5 pt-2.5 pb-1">
          <div className="min-w-0">
            <h2 className="font-serif text-xl leading-snug text-[#292522]">
              {grupo.titulo}
              {prefijo}
            </h2>
            {grupo.desc && <p className="mt-0.5 text-xs leading-relaxed text-[#787168]">{grupo.desc}</p>}
          </div>
          <button
            type="button"
            onClick={cerrarConfirmado}
            aria-label="Cerrar y conservar los cambios"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0ebe4] text-[#54483e] transition active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-3">
          {grupo.campos.map((campo) => (
            <CampoControl
              key={campo.path.join('.')}
              campo={campo}
              token={token}
              valor={leerCampoEditado(cfg, campo.path, activo.idx) as ValorCampo | undefined}
              onCambio={(v) => onCambio(campo.path, v, activo.idx)}
            />
          ))}

          {grupo.acciones && (
            <div className="space-y-2 border-t border-[#e8e0d7] pt-4">
              {grupo.acciones.map((accion) => (
                <button
                  key={accion.tipo}
                  type="button"
                  onClick={() => {
                    if (accion.tono === 'peligro') {
                      const mensaje =
                        accion.tipo === 'quitar-foto'
                          ? '¿Quitar esta foto de la galería? Se quita de la invitación al guardar.'
                          : accion.tipo === 'quitar-momento'
                            ? '¿Quitar este momento del cronograma?'
                            : '¿Confirmás quitar este elemento?'
                      if (!window.confirm(mensaje)) return
                    }
                    onAccion(accion.tipo, activo.idx)
                  }}
                  className={
                    'min-h-[44px] w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition ' +
                    (accion.tono === 'peligro'
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-[#e8e0d7] bg-white text-[#54483e]')
                  }
                >
                  {accion.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <footer className="flex gap-3 border-t border-[#e8e0d7] px-5 py-3">
          <button
            type="button"
            onClick={cancelar}
            className="min-h-[48px] flex-1 rounded-xl border border-[#e8e0d7] bg-white text-sm font-semibold text-[#54483e] transition active:scale-[0.98]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={cerrarConfirmado}
            className="min-h-[48px] flex-1 rounded-xl bg-[#8a6534] text-sm font-bold text-white shadow-[0_6px_18px_rgba(138,101,52,0.35)] transition active:scale-[0.98]"
          >
            Listo
          </button>
        </footer>
      </section>
    </>
  )
}
