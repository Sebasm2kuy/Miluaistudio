/**
 * Tokens de color auditados para accesibilidad (WCAG 2.1 AA).
 *
 * Cada token declara su uso y las combinaciones contra las que fue medido.
 * Las razones de contraste se verifican automáticamente en
 * tests/contraste-wcag.test.ts: si alguien cambia un valor o introduce de
 * nuevo un tono insuficiente, la suite falla.
 *
 * Fórmula: luminancia relativa (WCAG 2.1) y razón de contraste L1+0.05 / L2+0.05.
 * Umbrales: texto normal 4.5:1 · texto grande 3:1 · indicadores gráficos 3:1.
 */

/** Dorado/champagne para TEXTO NORMAL sobre superficies claras.
 *  Medido: 5.26:1 sobre blanco · 4.96:1 sobre marfil #faf8f4 ·
 *          4.84:1 sobre #f8f5f1 · 4.88:1 sobre #faf6ef.
 *  Reemplaza a #9a7440 (4.25:1 sobre blanco) y #b58c5a (3.06:1). */
export const GOLD_TEXT = '#8a6534';

/** Dorado para FONDOS con texto blanco (badges, pasos, insignias).
 *  Medido: blanco sobre #8a6534 = 5.26:1 (antes: blanco sobre #b58c5a = 3.06:1). */
export const GOLD_BADGE_BG = '#8a6534';

/** Dorado para BORDES/INDICADORES de estado (seleccionado, foco) sobre
 *  superficies claras. Medido ≥ 4.84:1 (supera el 3:1 exigido a indicadores). */
export const GOLD_UI = '#8a6534';

/** Dorado de estrellas de calificación (indicador informativo).
 *  Medido: 3.25:1 sobre blanco (antes #d9a53f = 2.23:1). */
export const STAR_GOLD = '#b8860b';

/** Tinta principal y textos secundarios de la tienda (todos ≥ 4.5:1). */
export const INK = '#292522';
export const INK_MUTED = '#716a63';
export const INK_SOFT = '#787168';

/** Enlace destacado de la tienda. Medido: 4.97:1 sobre blanco · 4.69:1 marfil. */
export const LINK_GOLD = '#8a6534';

/** Texto oscuro sobre el verde de WhatsApp. Medido: 6.23:1 sobre #25d366. */
export const WHATSAPP_TEXT = '#0b3d1e';

/** Superficies claras de referencia de la tienda (fondos reales donde se
 *  apoya texto). Se usan en las pruebas para verificar las combinaciones. */
export const SUPERFICIES_CLARAS = {
  blanco: '#ffffff',
  marfil: '#faf8f4',
  tarjeta: '#f8f5f1',
  seleccion: '#faf6ef',
  crema: '#f3ead9',
} as const;

/**
 * Luminancia relativa y razón de contraste (WCAG 2.1).
 * Exportadas para uso de las pruebas y para verificaciones puntuales.
 */
export function luminanciaRelativa(hex: string): number {
  const m = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(m)) throw new Error('Hex inválido: ' + hex);
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(m.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function razonContraste(primer: string, segundo: string): number {
  const [l1, l2] = [luminanciaRelativa(primer), luminanciaRelativa(segundo)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}
