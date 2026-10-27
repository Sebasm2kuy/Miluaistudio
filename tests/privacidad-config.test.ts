/**
 * Pruebas de privacidad de la configuración (P0).
 *
 * Garantiza la separación entre la configuración operativa
 * (src/data/config.ts, que puede contener datos privados de un evento real)
 * y la demo pública (src/data/demo-config.ts, 100% sintética):
 *
 *  1. Ningún módulo del grafo cliente importa el export por defecto de la
 *     config operativa (los imports de tipo están permitidos: se borran al
 *     compilar).
 *  2. La config operativa mantiene canarios sintéticos vigentes en sus
 *     campos privados (sin ellos, las pruebas de artefactos no tendrían
 *     nada que vigilar).
 *  3. Los valores privados de la plantilla NO aparecen en la demo pública
 *     (si se solaparan, la prueba de artefactos no distinguiría una fuga).
 *
 * El escaneo de los artefactos realmente públicos (out/) vive en
 * scripts/verify-privacy-export.mjs y corre dentro de `npm run build`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const CONFIG = readFileSync(join(ROOT, 'src/data/config.ts'), 'utf8');
const DEMO = readFileSync(join(ROOT, 'src/data/demo-config.ts'), 'utf8');

// ---------------------------------------------------------------------------
// 1. Grafo cliente: sin imports de valor de la config operativa
// ---------------------------------------------------------------------------
const CLIENT_GRAPH_DIRS = ['src/app', 'src/components', 'src/hooks', 'src/lib', 'src/data'];
const EXCEPCIONES = new Set(['src/app/admin']); // herramienta local, nunca publicada

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(full)) yield full;
  }
}

test('privacidad: ningún módulo cliente importa la config operativa como valor', () => {
  const infractores: string[] = [];

  /** Decide si una cláusula `import <clausula> from '…/config'` importa valores. */
  const importaValor = (clausula: string): boolean => {
    const c = clausula.trim();
    if (/^type\s/.test(c)) return false; // import type …
    if (/^\{[\s\S]*\}$/.test(c)) {
      // import { … }: solo es de tipo si TODOS los especificadores lo son
      const especificadores = c.replace(/^[{]+\s*/, '').replace(/\s*[}]+$/, '').split(',');
      return !especificadores.every((s) => s.trim().startsWith('type '));
    }
    return true; // default, namespace o mixto (default + { type X })
  };

  for (const dir of CLIENT_GRAPH_DIRS) {
    for (const file of walk(join(ROOT, dir))) {
      const rel = relative(ROOT, file).replaceAll('\\', '/');
      if ([...EXCEPCIONES].some((e) => rel.startsWith(e))) continue;
      const lineas = readFileSync(file, 'utf8').split('\n');
      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        if (!/['"]@?\/?data\/config['"]/.test(linea)) continue;
        if (/export\s+type\s/.test(linea)) continue;
        const m = linea.match(/import\s+([\s\S]+?)\s+from\s+['"]@?\/?data\/config['"]/);
        if (m && importaValor(m[1])) infractores.push(`${rel} (línea ${i + 1})`);
      }
    }
  }
  assert.deepEqual(
    infractores,
    [],
    'Estos módulos importan la config operativa como valor. Usá los TIPOS de ' +
    'data/config-schema o la base de demo data/demo-config (CONFIG_DEMO_BASE). ' +
    'Importar config.ts como valor mete sus literales en los bundles públicos.',
  );
});

test('privacidad: config-schema.ts no contiene datos, solo tipos', () => {
  const schema = readFileSync(join(ROOT, 'src/data/config-schema.ts'), 'utf8');
  // Quita comentarios JSDoc/de línea: el esquema puede documentar ejemplos.
  const codigo = schema
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  // No debe haber literales de datos de evento (solo anotaciones de tipo)
  assert.doesNotMatch(codigo, /:\s*"[^"]{6,}"/, 'el esquema no debe contener valores literales');
  assert.match(schema, /export interface SiteConfig/);
});

// ---------------------------------------------------------------------------
// 2. Canarios sintéticos vigentes en la plantilla operativa
// ---------------------------------------------------------------------------
test('privacidad: la plantilla operativa mantiene sus canarios sintéticos', () => {
  const canarios = [
    'NombreEjemplo', // evento.nombre / dedicatoria.firma
    '#EjemploPrivado2027', // evento.hashtag
    'Nombre del salón', // evento.lugar / calendarioLocation
    'Evento de ejemplo (plantilla privada)', // countdown.calendarioTitulo
    'Hay momentos que no se repiten', // dedicatoria.cita
  ];
  for (const canario of canarios) {
    assert.ok(
      CONFIG.includes(canario),
      `Falta el canario sintético de privacidad en config.ts. Sin canarios, ` +
      `verify-privacy-export.mjs no puede detectar si la config vuelve al ` +
      `grafo cliente. Valor esperado (sintético, no es dato real): campo de plantilla.`,
    );
  }
});

test('privacidad: los campos de escritura y contacto parten vacíos en la plantilla', () => {
  const vaciosEsperados = ['googleSheetUrl', 'hostPhone', 'photoUploadUrl'];
  for (const campo of vaciosEsperados) {
    const re = new RegExp(`"${campo}"\\s*:\\s*""`);
    assert.match(CONFIG, re, `El campo ${campo} de la plantilla operativa debe partir vacío`);
  }
});

// ---------------------------------------------------------------------------
// 3. Demo pública sin solapamientos con la plantilla operativa
// ---------------------------------------------------------------------------
test('privacidad: los valores privados de la plantilla no aparecen en la demo', () => {
  const canarios = ['NombreEjemplo', '#EjemploPrivado2027', 'Nombre del salón', 'Evento de ejemplo (plantilla privada)'];
  for (const canario of canarios) {
    assert.ok(
      !DEMO.includes(canario),
      'La demo pública comparte un valor con la plantilla operativa. ' +
      'Las demos deben usar perfiles sintéticos propios (ver DEMO_PROFILES).',
    );
  }
});

test('privacidad: la demo exporta base autocontenida y endpoints vacíos', () => {
  assert.match(DEMO, /export const CONFIG_DEMO_BASE/);
  assert.doesNotMatch(DEMO, /from '@\/data\/config'/, 'la demo no debe importar la config operativa');
  assert.match(DEMO, /from '@\/data\/config-schema'/, 'la demo debe tiparse desde el esquema');
});
