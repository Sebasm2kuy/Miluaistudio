'use client'

/**
 * Estado compartido del editor móvil (/editar).
 *
 * El proveedor solo existe dentro del editor: en invitaciones publicadas,
 * demos y vistas previas useEditorEdicion() devuelve null y todos los
 * componentes de la invitación se comportan EXACTAMENTE igual que hoy.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface ElementoActivo {
  id: string
  /** Índice del elemento cuando la ruta usa '{idx}' (foto, momento) */
  idx?: number
}

export interface EditorContexto {
  modoEdicion: boolean
  activo: ElementoActivo | null
  abrir: (id: string, idx?: number) => void
  cerrar: () => void
}

const Ctx = createContext<EditorContexto | null>(null)

export function EditorProvider({
  modoEdicion,
  alAbrir,
  children,
}: {
  modoEdicion: boolean
  /** Se invoca justo antes de abrir un panel (snapshot para «Cancelar») */
  alAbrir?: (id: string, idx?: number) => void
  children: ReactNode
}) {
  const [activo, setActivo] = useState<ElementoActivo | null>(null)

  const valor = useMemo<EditorContexto>(
    () => ({
      modoEdicion,
      activo: modoEdicion ? activo : null,
      abrir: (id, idx) => {
        alAbrir?.(id, idx)
        setActivo({ id, idx })
      },
      cerrar: () => setActivo(null),
    }),
    [modoEdicion, activo, alAbrir],
  )

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

/** null = no hay editor (el componente debe comportarse como siempre). */
export function useEditorEdicion(): EditorContexto | null {
  return useContext(Ctx)
}
