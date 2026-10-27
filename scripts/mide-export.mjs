#!/usr/bin/env node
/**
 * mide-export.mjs — Medición consistente del peso del artefacto estático.
 * Métrica: longitud de archivo (caracteres/bytes) del HTML de páginas clave,
 * y bytes totales de JS/CSS del artefacto. NO equivale a peso de red comprimido.
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'out');
if (!existsSync(OUT)) {
  console.error('out/ no existe: ejecutá npm run build primero.');
  process.exit(1);
}

const PAGES = [
  'index.html',
  'catalogo/index.html',
  'personalizar/index.html',
  'catalogo/rosa-romantica/index.html',
];

console.log('=== HTML por página (bytes de archivo) ===');
for (const page of PAGES) {
  const file = join(OUT, page);
  if (existsSync(file)) {
    const size = statSync(file).size;
    console.log(`${page}: ${size} bytes`);
  } else {
    console.log(`${page}: AUSENTE`);
  }
}

let jsTotal = 0, cssTotal = 0, jsCount = 0, cssCount = 0;
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (full.endsWith('.js')) { jsTotal += st.size; jsCount++; }
    else if (full.endsWith('.css')) { cssTotal += st.size; cssCount++; }
  }
}
walk(OUT);
console.log('=== Totales del artefacto ===');
console.log(`JS:  ${jsCount} archivos, ${jsTotal} bytes`);
console.log(`CSS: ${cssCount} archivos, ${cssTotal} bytes`);

// Coincidencias de configuración operativa en bundles (diagnóstico P0)
const marcadores = ['NombreEjemplo', 'Nombre del salón', 'Hay momentos que no se repiten'];
console.log('=== Marcadores de config operativa en artefacto (diagnóstico) ===');
for (const marcador of marcadores) {
  let hits = [];
  function scan(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) scan(full);
      else if (/\.(html|js|css|txt|xml|json|svg)$/.test(full)) {
        try {
          if (readFileSync(full, 'utf8').includes(marcador)) hits.push(full.replace(OUT + '/', ''));
        } catch { /* binario */ }
      }
    }
  }
  scan(OUT);
  console.log(`"${marcador.slice(0, 12)}…" → ${hits.length === 0 ? 'ausente' : hits.join(', ')}`);
}
