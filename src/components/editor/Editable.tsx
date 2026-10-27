'use client'

/**
 * Capa de edición directa sobre la invitación.
 *
 *  - <Editable id="...">: envuelve un elemento tocable. Fuera del editor
 *    (o con un id no registrado) es transparente: devuelve los children
 *    tal cual, sin envoltorio, sin estilo, sin eventos. En modo edición
 *    convierte la zona en un botón real: captura el tap ANTES de que
 *    llegue a los botones/enlaces interiores (pointer-events: none vía
 *    CSS) y abre el panel de edición de ese elemento.
 *
 *  - <InerteEnEdicion>: en modo edición vuelve totalmente inerte una
 *    zona interactiva propia de la invitación (formulario de RSVP,
 *    lightbox...) para que ninguna acción se dispare por accidente.
 *
 * El diseño original de cada plantilla no cambia: nada de botones
 * flotantes permanentes ni maquetas alternativas.
 */

import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { useEditorEdicion } from './EditorProvider'
import { specDeElemento } from '@/lib/editor-campos'

interface EditableProps {
  id: string
  /** Índice para rutas con '{idx}' (foto de galería, momento del cronograma) */
  idx?: number
  /** Etiqueta del envoltorio: bloque (div) o en línea (span) */
  como?: 'div' | 'span'
  className?: string
  children: ReactNode
}

export default function Editable({ id, idx, como = 'div', className, children }: EditableProps) {
  const editor = useEditorEdicion()
  const spec = specDeElemento(id)

  // Sin editor, sin modo edición o sin registro: el elemento NO es
  // editable y no debe aparentar serlo.
  if (!editor || !editor.modoEdicion || !spec) return <>{children}</>

  const activo = editor.activo?.id === id && (editor.activo?.idx ?? undefined) === (idx ?? undefined)
  const Tag = como

  const capturarTap = (e: MouseEvent) => {
    // Captura en fase burbuja temprana: ni enlaces, ni botones, ni
    // iframes interiores reciben el evento en modo edición.
    e.preventDefault()
    e.stopPropagation()
    editor.abrir(id, idx)
  }

  const activarConTeclado = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      editor.abrir(id, idx)
    }
  }

  return (
    <Tag
      data-editable={id}
      data-editable-activo={activo ? '' : undefined}
      className={className}
      onClickCapture={capturarTap}
      role="button"
      tabIndex={0}
      aria-label={'Editar: ' + spec.titulo}
      onKeyDown={activarConTeclado}
    >
      {children}
      {activo && (
        <span className="editable-badge" aria-hidden="true">
          ✎
        </span>
      )}
    </Tag>
  )
}

interface InerteProps {
  className?: string
  children: ReactNode
}

/** Zona propia de la invitación que en modo edición no reacciona a nada. */
export function InerteEnEdicion({ className, children }: InerteProps) {
  const editor = useEditorEdicion()
  if (!editor || !editor.modoEdicion) return <>{children}</>
  return (
    <div
      className={className}
      data-inerte="true"
      inert={true}
      style={{ pointerEvents: 'none' }}
      aria-hidden="false"
    >
      {children}
    </div>
  )
}
