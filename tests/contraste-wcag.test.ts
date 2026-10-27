/**
 * Pruebas de contraste WCAG 2.1 AA de los tokens de la tienda y el
 * personalizador (src/data/store-tokens.ts).
 *
 * Verifica las combinaciones críticas contra las superficies reales donde se
 * apoyan, de modo que una futura modificación de color no vuelva a introducir
 * contrastes insuficientes (la auditoría encontró #9a7440 = 4.25:1 y
 * #b58c5a = 3.06:1 sobre blanco, y blanco sobre #b58c5a = 3.06:1).
 *
 * Además, barra los fuentes buscando los tonos históricamente insuficientes
 * para que no regresen ni como texto, ni como fondo, ni como borde indicador.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  GOLD_TEXT,
  GOLD_BADGE_BG,
  GOLD_UI,
  STAR_GOLD,
  WHATSAPP_TEXT,
  SUPERFICIES_CLARAS,
  razonContraste,
} from '../src/data/store-tokens.js';

const { blanco, marfil, tarjeta, seleccion, crema } = SUPERFICIES_CLARAS;

// ---------------------------------------------------------------------------
// Utilidades WCAG (doble implementación de control: si alguien cambia la de
// store-tokens.ts, estas siguen midiendo con la fórmula canónica).
// ---------------------------------------------------------------------------
function luminancia(hex: string): number {
  const m = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(m.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const UMBRAL_TEXTO_NORMAL = 4.5;
const UMBRAL_TEXTO_GRANDE = 3.0;
const UMBRAL_GRAFICO = 3.0;

// ---------------------------------------------------------------------------
// Texto normal dorado sobre superficies claras (≥ 4.5:1)
// ---------------------------------------------------------------------------
test('contraste: GOLD_TEXT cumple 4.5:1 en las superficies de texto', () => {
  const superficiesTexto: Array<[string, string]> = [
    ['blanco', blanco],
    ['marfil', marfil],
    ['tarjeta', tarjeta],
    ['seleccion', seleccion],
  ];
  for (const [nombre, fondo] of superficiesTexto) {
    const r = contraste(GOLD_TEXT, fondo);
    assert.ok(
      r >= UMBRAL_TEXTO_NORMAL,
      `GOLD_TEXT (${GOLD_TEXT}) sobre ${nombre} = ${r.toFixed(2)}:1 < 4.5:1`,
    );
  }
});

test('contraste: el dorado sobre crema (#f3ead9) es solo gráfico (≥ 3:1)', () => {
  // Sobre crema el champagne se usa para iconos/indicadores, no para texto
  // normal: aplica el umbral de gráficos (WCAG 1.4.11).
  const r = contraste(GOLD_TEXT, crema);
  assert.ok(r >= UMBRAL_GRAFICO, `dorado sobre crema = ${r.toFixed(2)}:1 < 3:1`);
});

test('contraste: el token exportado mide igual que la fórmula canónica', () => {
  assert.equal(
    Math.round(razonContraste(GOLD_TEXT, blanco) * 100),
    Math.round(contraste(GOLD_TEXT, blanco) * 100),
  );
});

// ---------------------------------------------------------------------------
// Texto blanco sobre fondos dorados (badges, pasos) (≥ 4.5:1)
// ---------------------------------------------------------------------------
test('contraste: texto blanco sobre GOLD_BADGE_BG cumple 4.5:1', () => {
  const r = contraste('#ffffff', GOLD_BADGE_BG);
  assert.ok(r >= UMBRAL_TEXTO_NORMAL, `blanco sobre ${GOLD_BADGE_BG} = ${r.toFixed(2)}:1 < 4.5:1`);
});

// ---------------------------------------------------------------------------
// Indicadores gráficos: bordes de estado y foco (≥ 3:1 contra superficies)
// ---------------------------------------------------------------------------
test('contraste: GOLD_UI (bordes seleccionado/foco) cumple 3:1', () => {
  for (const [nombre, fondo] of Object.entries(SUPERFICIES_CLARAS)) {
    const r = contraste(GOLD_UI, fondo);
    assert.ok(r >= UMBRAL_GRAFICO, `GOLD_UI sobre ${nombre} = ${r.toFixed(2)}:1 < 3:1`);
  }
});

// ---------------------------------------------------------------------------
// Estrellas de calificación (indicador informativo) (≥ 3:1)
// ---------------------------------------------------------------------------
test('contraste: STAR_GOLD cumple 3:1 sobre blanco y marfil', () => {
  assert.ok(contraste(STAR_GOLD, blanco) >= UMBRAL_GRAFICO);
  assert.ok(contraste(STAR_GOLD, marfil) >= UMBRAL_GRAFICO);
});

// ---------------------------------------------------------------------------
// Botones de WhatsApp de la tienda (≥ 4.5:1)
// ---------------------------------------------------------------------------
test('contraste: texto oscuro sobre verde WhatsApp cumple 4.5:1 (normal y hover)', () => {
  assert.ok(contraste(WHATSAPP_TEXT, '#25d366') >= UMBRAL_TEXTO_NORMAL);
  assert.ok(contraste(WHATSAPP_TEXT, '#1db957') >= UMBRAL_TEXTO_NORMAL);
});

// ---------------------------------------------------------------------------
// Combinaciones de texto secundario de la tienda (≥ 4.5:1)
// ---------------------------------------------------------------------------
test('contraste: textos secundarios de la tienda cumplen 4.5:1', () => {
  const pares: [string, string, number][] = [
    ['#292522', blanco, UMBRAL_TEXTO_NORMAL], // tinta principal
    ['#292522', marfil, UMBRAL_TEXTO_NORMAL],
    ['#716a63', blanco, UMBRAL_TEXTO_NORMAL], // bajadas
    ['#716a63', marfil, UMBRAL_TEXTO_NORMAL],
    ['#787168', blanco, UMBRAL_TEXTO_NORMAL], // etiquetas suaves
    ['#787168', marfil, UMBRAL_TEXTO_NORMAL],
    ['#62584f', blanco, UMBRAL_TEXTO_NORMAL], // botón "Ver detalles"
    ['#8a6a44', blanco, UMBRAL_TEXTO_NORMAL], // enlaces dorados
    ['#8a6a44', marfil, UMBRAL_TEXTO_NORMAL],
  ];
  for (const [color, fondo, umbral] of pares) {
    const r = contraste(color, fondo);
    assert.ok(r >= umbral, `${color} sobre ${fondo} = ${r.toFixed(2)}:1 < ${umbral}:1`);
  }
});

// ---------------------------------------------------------------------------
// Etiquetas de categoría del catálogo (storeAccent/accentSoft por diseño)
// ---------------------------------------------------------------------------
test('contraste: etiquetas de categoría de los 10 diseños cumplen 4.5:1 sobre blanco', () => {
  const etiquetas: Array<[string, string]> = [
    ['rosa-romantica', '#9d5f6f'],
    ['noche-dorada', '#8a6f3c'],
    ['terracota', '#61735a'],
    ['azul-celestial', '#3a5a82'],
    ['blanco-perla', '#6f675a'],
    ['lavanda', '#7b5599'],
    ['rojo-glamour', '#8a2434'],
    ['jardin-botanico', '#42584a'],
    ['geometria-moderna', '#a05c3c'],
    ['azul-romantico', '#96555f'],
  ];
  for (const [id, color] of etiquetas) {
    const r = contraste(color, blanco);
    assert.ok(r >= UMBRAL_TEXTO_NORMAL, `etiqueta de ${id} (${color}) = ${r.toFixed(2)}:1 < 4.5:1`);
  }
});

// ---------------------------------------------------------------------------
// Regresión: los tonos insuficientes no pueden volver al código de la tienda
// ---------------------------------------------------------------------------
/** Quita comentarios de bloque y de línea para escanear solo código real. */
function sinComentarios(texto: string): string {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^[\]\s]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

const HEX_PROHIBIDOS = ['#b58c5a', '#9a7440', '#d9a53f'];

test('contraste: los tonos históricos insuficientes no reaparecen en src', () => {
  const encontrados: string[] = [];
  function* walk(dir: string): Generator<string> {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) yield* walk(full);
      else if (/\.(ts|tsx|css)$/.test(full)) yield full;
    }
  }
  for (const file of walk(join(process.cwd(), 'src'))) {
    const contenido = sinComentarios(readFileSync(file, 'utf8'));
    for (const hex of HEX_PROHIBIDOS) {
      if (contenido.toLowerCase().includes(hex)) {
        encontrados.push(`${relative(process.cwd(), file)} (hex ${hex.slice(1, 4)}…)`);
      }
    }
  }
  assert.deepEqual(
    encontrados,
    [],
    'Reaparecieron tonos que no cumplen WCAG AA. Usá los tokens de ' +
    'src/data/store-tokens.ts (GOLD_TEXT/GOLD_UI/GOLD_BADGE_BG/STAR_GOLD). ' +
    'El mensaje no reproduce el valor completo por brevedad; el hex buscado ' +
    'es un tono dorado/claramente insuficiente documentado en la auditoría.',
  );
});

test('contraste: umbrales exigidos por la auditoría están presentes', () => {
  assert.equal(UMBRAL_TEXTO_NORMAL, 4.5);
  assert.equal(UMBRAL_TEXTO_GRANDE, 3.0);
  assert.equal(UMBRAL_GRAFICO, 3.0);
});
