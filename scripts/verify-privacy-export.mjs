#!/usr/bin/env node
/**
 * verify-privacy-export.mjs — Prueba de regresión de privacidad (P0).
 *
 * Comprueba los ARTEFACTOS REALMENTE PÚBLICOS (out/) buscando literales de la
 * configuración operativa (src/data/config.ts) que NO están autorizados a
 * publicarse. Si alguien vuelve a conectar config.ts al grafo del cliente
 * (hooks, demos, personalizador, admin en chunks compartidos…), los bundles
 * vuelven a contener esos literales y esta verificación falla el build.
 *
 * Método:
 *  1. Extrae de src/data/config.ts los valores de los campos designados
 *     PRIVADOS (lista explícita abajo). Esos valores son canarios sintéticos
 *     de plantilla: nunca datos reales.
 *  2. Escanea todos los archivos de texto de out/ (HTML, JS, CSS, JSON, SVG,
 *     txt, xml y los __next.*.txt) buscando esos literales.
 *  3. Aplica una lista explícita y mínima de valores/valores-pattern PÚBLICOS
 *     (rutas de assets del propio sitio, la ciudad genérica y la URL de mapa
 *     genérica que las demos también usan legítimamente).
 *
 * En caso de fallo se muestra el ARCHIVO y el CAMPO afectado, nunca se
 * imprime el valor coincidente.
 *
 * Se ejecuta como parte de `npm run build` y de forma manual con
 * `npm run verify:privacy`. Los canarios vigentes se validan también en
 * tests/privacidad-config.test.ts (sin necesidad de build).
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = join(process.cwd(), 'out');
const CONFIG_PATH = join(process.cwd(), 'src/data/config.ts');
const DEMO_PATH = join(process.cwd(), 'src/data/demo-config.ts');

const errors = [];
const notes = [];

/**
 * Campos PRIVADOS de la configuración operativa: lo que un evento real carga
 * por /admin y no está autorizado a viajar en bundles públicos.
 * Es la lista inversa de lo publicable: todo lo que no está acá ni en el
 * allowlist de abajo se considera no autorizado por defecto.
 */
const CAMPOS_PRIVADOS = [
  'nombre', 'apellido', 'apodo', 'fecha', 'fechaEvento', 'lugar', 'direccion',
  'hashtag', 'cita', 'cuerpo', 'firma',
  'calendarioTitulo', 'calendarioLocation', 'calendarioDetalles',
  'hostPhone', 'googleSheetUrl',
  'numero', 'numeroInterbancario', 'sucursal',
  'playlistUrl', 'photoUploadUrl',
];

/**
 * Lista explícita y mínima de valores SÍ autorizados a publicarse.
 * (Patrones y valores que las demos públicas usan legítimamente.)
 */
const ALLOWLIST_EXACTA = new Set([
  'Montevideo', // ciudad genérica usada por las demos
  'https://maps.google.com/?q=Montevideo%2C+Uruguay', // mapa genérico de demos
  'https://open.spotify.com/', // home pública de Spotify
  'https://open.spotify.com/embed/',
]);
const ALLOWLIST_PATRONES = [
  /^\/(catalogo|assets-invitaciones|invitacion|logo|sello|og-image)/, // assets del propio sitio (raíz del dominio propio)
];

if (!existsSync(OUT)) {
  console.error('verify-privacy: out/ no existe. Ejecutá npm run build primero.');
  process.exit(1);
}
if (!existsSync(CONFIG_PATH)) {
  console.error('verify-privacy: no se encontró src/data/config.ts.');
  process.exit(1);
}

// ---- 1. Extraer literales privados de config.ts ----
const configSrc = readFileSync(CONFIG_PATH, 'utf8');
const claves = CAMPOS_PRIVADOS.join('|');
const regex = new RegExp(`"(?:${claves})"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'g');

const canarios = new Map(); // valor (des-escapado) → campo
let match;
while ((match = regex.exec(configSrc)) !== null) {
  const campo = match[0].split('"')[1];
  const valor = match[1]
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
  if (!valor || valor.length < 6) continue; // vacíos y valores demasiado cortos no son canarios útiles
  if (ALLOWLIST_EXACTA.has(valor)) continue;
  if (ALLOWLIST_PATRONES.some((re) => re.test(valor))) continue;
  if (!canarios.has(valor)) canarios.set(valor, campo);
}

if (canarios.size === 0) {
  errors.push(
    'No se extrajo ningún canario de privacidad de src/data/config.ts. ' +
    'Si se vació la plantilla, revisar tests/privacidad-config.test.ts, que ' +
    'exige canarios sintéticos vigentes para que esta prueba tenga sentido.',
  );
} else {
  notes.push(`canarios sintéticos privados en vigilancia: ${canarios.size} (campos: ${[...new Set(canarios.values())].join(', ')})`);
}

// Guardia anti-duplicación: un canario privado NO puede existir también en la
// demo pública; si existiera, el test no podría distinguir una fuga real.
if (existsSync(DEMO_PATH)) {
  const demoSrc = readFileSync(DEMO_PATH, 'utf8');
  for (const [valor, campo] of canarios) {
    if (demoSrc.includes(valor)) {
      errors.push(
        `El valor canario del campo "${campo}" de la config operativa también ` +
        'aparece en src/data/demo-config.ts: la demo debe usar valores ' +
        'sintéticos propios, distintos de la plantilla operativa.',
      );
    }
  }
}

// ---- 2. Escanear los artefactos públicos ----
const TEXT_EXT = /\.(html|js|css|txt|xml|json|svg|webmanifest)$/;
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let scanned = 0;
const htmlCache = new Map();
for (const file of walk(OUT)) {
  if (!TEXT_EXT.test(file)) continue;
  let content;
  try { content = readFileSync(file, 'utf8'); } catch { continue; }
  scanned++;
  htmlCache.set(file, content);
  for (const [valor, campo] of canarios) {
    if (content.includes(valor)) {
      errors.push(
        `FUGA DE CONFIGURACIÓN: un literal del campo PRIVADO "${campo}" de la ` +
        `configuración operativa aparece en el artefacto público ` +
        `"${relative(OUT, file)}". La demo/demos están empaquetando ` +
        'src/data/config.ts (revisar imports del grafo cliente). ' +
        'Por privacidad no se muestra el valor coincidente.',
      );
    }
  }
}
notes.push(`escaneo de privacidad sobre ${scanned} archivos de texto de out/`);

// ---- 3. Verificaciones estructurales complementarias ----
// 3a. Ningún archivo del grafo cliente puede estar importando la config
//     operativa por defecto (imports 100% de tipo sí: se borran al compilar).
const SRC = join(process.cwd(), 'src');
const PATH_CONFIG = /['"]@?\/?data\/config['"]/;

/** Decide si una cláusula `import <clausula> from '…/config'` importa valores. */
function importaValor(clausula) {
  const c = clausula.trim();
  if (/^type\s/.test(c)) return false; // import type …
  if (/^\{[\s\S]*\}$/.test(c)) {
    // import { … }: solo es de tipo si TODOS los especificadores lo son
    const especificadores = c.replace(/^[{]+\s*/, '').replace(/\s*[}]+$/, '').split(',');
    return !especificadores.every((s) => s.trim().startsWith('type '));
  }
  return true; // default, namespace o mixto (default + { type X })
}

function* walkSrc(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walkSrc(full);
    else if (/\.(ts|tsx)$/.test(full)) yield full;
  }
}
for (const file of walkSrc(SRC)) {
  const rel = relative(SRC, file);
  const lineas = readFileSync(file, 'utf8').split('\n');
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    if (!PATH_CONFIG.test(l)) continue;
    if (/export\s+type\s/.test(l)) continue;
    const m = l.match(/import\s+([\s\S]+?)\s+from\s+['"]@?\/?data\/config['"]/);
    if (m && importaValor(m[1])) {
      errors.push(
        `IMPORT PROHIBIDO: ${rel} (línea ${i + 1}) importa la configuración ` +
        'operativa como valor. Los componentes cliente solo pueden importar ' +
        'TIPOS desde data/config-schema o la base de demo (data/demo-config).',
      );
    }
  }
}

console.log('\n=== verify-privacy ===');
for (const n of notes) console.log('OK  ' + n);
if (errors.length > 0) {
  console.error('\nERRORES DE PRIVACIDAD:');
  for (const e of errors) console.error(' ✗ ' + e);
  process.exit(1);
}
console.log('\nVerificación de privacidad del export: sin fugas.');
