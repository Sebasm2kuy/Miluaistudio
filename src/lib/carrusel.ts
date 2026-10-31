/**
 * Lógica pura del carrusel de diseños de la portada (componente
 * carrusel-modelos.tsx). Separada en funciones testables: el carrusel es
 * circular (del último pasa al primero y del primero al último).
 */

/** Índice donde arranca el carrusel (primer diseño de la colección) */
export const INDICE_INICIAL = 0;

/** Milisegundos entre pasadas automáticas del carrusel */
export const INTERVALO_AUTOPLAY_MS = 5000;

/** Tiempo (ms) tras una interacción manual en que el autoplay se espera */
export const PAUSA_TRAS_INTERACCION_MS = 6500;

/** Desplazamiento mínimo (px) del dedo para considerar que deslizó */
export const UMBRAL_DESLIZAR_PX = 36;

/** Índice circular: suma delta (puede ser negativo) y vuelve al rango 0..total-1 */
export function indiceVecino(indice: number, delta: number, total: number): number {
  if (total <= 0) return 0;
  const base = ((indice % total) + total) % total;
  return (((base + delta) % total) + total) % total;
}

/** Posición visual de un slide dentro del carrusel tipo mazo (deck) */
export type PosicionSlide = 'actual' | 'izquierda' | 'derecha' | 'oculta';

/**
 * Posición del slide i cuando el slide `actual` está en frente:
 *  - 'actual'    → centrado
 *  - 'izquierda' → el vecino anterior (asoma por la izquierda)
 *  - 'derecha'   → el vecino siguiente (asoma por la derecha)
 *  - 'oculta'    → el resto, fuera de vista
 */
export function posicionSlide(i: number, actual: number, total: number): PosicionSlide {
  if (i === actual) return 'actual';
  if (i === indiceVecino(actual, -1, total)) return 'izquierda';
  if (i === indiceVecino(actual, 1, total)) return 'derecha';
  return 'oculta';
}

/**
 * ¿El slide necesita su invitación COMPLETA montada? (iteración 032)
 * Solo el diseño activo y sus dos vecinos asoman en pantalla: montar las
 * 29 invitaciones completas —incluidas las invisibles— procesaba miniaturas
 * que nadie veía. Los slides 'oculta' usan una representación liviana (solo
 * el marco del teléfono) y montan su invitación al entrar al conjunto visible.
 */
export function renderCompleto(pos: PosicionSlide): boolean {
  return pos !== 'oculta';
}
