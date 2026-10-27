#!/usr/bin/env node
/**
 * verify-export.mjs — Verificación post-build del artefacto estático.
 *
 * Falla (exit 1) si:
 *  1. El panel de administración vuelve a incluirse en la exportación
 *     (out/admin/ o cualquier archivo bajo esa ruta).
 *  2. Falta alguna ruta comercial obligatoria (inicio, catálogo,
 *     personalizador, las 10 demos, 404, robots, sitemap).
 *  3. Un asset clave no usa la ruta base /Miluaistudio.
 *  4. Hay indicios de secretos embebidos en el artefacto público.
 *  5. Reaparecen imágenes personales retiradas de public/ por privacidad
 *     (o aparecen imágenes en out/uploads/, la ruta de fotos de invitados).
 *  6. Una invitación publicada (content/invitaciones/*.json) no genera su
 *     ruta out/i/<slug>/index.html, un asset que enlaza no existe en el
 *     export, o hay rutas i/ sin JSON declarado.
 *
 * Se ejecuta como parte de `npm run build` y de forma manual con
 * `npm run verify:export`.
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = join(process.cwd(), 'out');
const BASE = '/Miluaistudio';
const errors = [];
const notes = [];

function fail(msg) { errors.push(msg); }
function ok(msg) { notes.push('OK  ' + msg); }

// ---- 1. El panel de administración no debe existir en el artefacto ----
const ADMIN = join(OUT, 'admin');
if (existsSync(ADMIN)) {
  fail('RUTA PROHIBIDA: out/admin/ existe en la exportación. El panel de administración no puede publicarse.');
} else {
  ok('out/admin/ no está en el artefacto público');
}

// ---- 2. Rutas obligatorias ----
const DESIGNS = [
  'rosa-romantica', 'noche-dorada', 'azul-celestial', 'jardin-botanico',
  'lavanda', 'terracota', 'blanco-perla', 'rojo-glamour',
  'geometria-moderna', 'azul-romantico',
];
const required = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'catalogo/index.html',
  'personalizar/index.html',
  ...DESIGNS.map((d) => `catalogo/${d}/index.html`),
  'og-image.jpg',
  'logo.svg',
];
for (const rel of required) {
  if (existsSync(join(OUT, rel))) ok('ruta/asset presente: ' + rel);
  else fail('FALTA en la exportación: ' + rel);
}

// ---- 3. Base path en páginas clave ----
for (const rel of ['index.html', 'catalogo/index.html', 'personalizar/index.html']) {
  const file = join(OUT, rel);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  const hasBase = html.includes(BASE + '/');
  if (!hasBase) fail('SIN basePath: ' + rel + ' no referencia ' + BASE + '/');
  else ok('basePath presente en ' + rel);
  const stray = html.match(/(?:src|href)="\/(?!Miluaistudio\/|_next\/)/);
  if (stray) notes.push('AVISO  ' + rel + ': referencia absoluta fuera de basePath (revisar): ' + stray[0]);
}

// ---- 4. Secretos embebidos en assets públicos ----
const SECRET_PATTERNS = [
  [/ghp_[A-Za-z0-9]{20,}/, 'token de GitHub (ghp_)'],
  [/github_pat_[A-Za-z0-9_]{20,}/, 'fine-grained token de GitHub'],
  [/gho_[A-Za-z0-9]{20,}/, 'token OAuth de GitHub'],
  [/AKIA[0-9A-Z]{16}/, 'Access Key de AWS'],
  [/AIza[0-9A-Za-z\-_]{30,}/, 'API key de Google'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, 'token de Slack'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'clave privada'],
];
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
for (const file of walk(OUT)) {
  if (!TEXT_EXT.test(file)) continue;
  scanned++;
  let content;
  try { content = readFileSync(file, 'utf8'); } catch { continue; }
  for (const [re, label] of SECRET_PATTERNS) {
    if (re.test(content)) fail('POSIBLE SECRETO (' + label + ') en ' + relative(OUT, file));
  }
}
ok('escaneo de secretos en ' + scanned + ' archivos de texto del artefacto');

// ---- 5. Imágenes personales retiradas (privacidad) ----
const FORBIDDEN_ASSETS = [
  'Screenshot_20261017-131752.png',
  'uploads/01e904c1-9acb-4d2b-af36-c0c0ca106f2c_mqqvi62r.jpg',
  'uploads/7e4d0e80-a737-404b-a5f5-ffeb013fa77c_mqqviamj.jpg',
  'uploads/8861f927-8212-402e-89e0-62fc77e82d90_mqqvhw6u.jpg',
];
for (const rel of FORBIDDEN_ASSETS) {
  if (existsSync(join(OUT, rel))) fail('ASSET RETIRADO POR PRIVACIDAD presente en la exportación: ' + rel);
  else ok('asset privado ausente: ' + rel);
}
if (existsSync(join(OUT, 'uploads'))) {
  const restantes = readdirSync(join(OUT, 'uploads')).filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f));
  if (restantes.length > 0) {
    fail('out/uploads/ contiene imágenes (' + restantes.length + '). Las fotos de invitados no deben publicarse en el repositorio; usan el backend de moderación (photo-server.gs). Los recursos del editor van a public/assets-invitaciones/.');
  } else {
    ok('out/uploads/ sin imágenes');
  }
}

// ---- 6. Invitaciones publicadas: rutas /i/<slug>/ y assets enlazados ----
const DIR_INVITACIONES = join(process.cwd(), 'content', 'invitaciones');
const OUT_I = join(OUT, 'i');
if (existsSync(DIR_INVITACIONES)) {
  const archivos = readdirSync(DIR_INVITACIONES).filter((f) => f.endsWith('.json'));
  if (archivos.length === 0) ok('content/invitaciones/ presente pero sin invitaciones publicadas');
  const activosReferenciados = new Set();
  for (const archivo of archivos) {
    const slug = archivo.slice(0, -'.json'.length);
    let data;
    try {
      data = JSON.parse(readFileSync(join(DIR_INVITACIONES, archivo), 'utf8'));
    } catch {
      fail('invitación publicada con JSON inválido: ' + archivo);
      continue;
    }
    if (!data || data.esquema !== 1 || data.slug !== slug) {
      fail('invitación con esquema/slug inconsistente (esperado esquema 1 y slug igual al nombre de archivo): ' + archivo);
      continue;
    }
    if (!data.config || !data.config.evento || typeof data.config.evento.nombre !== 'string') {
      fail('invitación sin config.evento.nombre (no renderizable): ' + archivo);
      continue;
    }
    const rutaGenerada = join(OUT, 'i', slug, 'index.html');
    if (existsSync(rutaGenerada)) ok('ruta de invitación publicada: i/' + slug + '/');
    else fail('FALTA la página de la invitación publicada: out/i/' + slug + '/index.html');

    // Assets que la invitación referencia dentro del sitio (ignora gradientes y URLs externas)
    const anotar = (u) => {
      if (typeof u === 'string' && u.startsWith(BASE + '/')) activosReferenciados.add(u);
    };
    const cfg = data.config;
    for (const foto of cfg.galeria?.fotos ?? []) { anotar(foto.webp); anotar(foto.fallback); }
    for (const foto of cfg.fondo?.fotos ?? []) anotar(foto);
    anotar(cfg.invitacion?.imagen);
    anotar(cfg.invitacion?.imagenFallback);
  }
  for (const ref of activosReferenciados) {
    const rel = ref.slice((BASE + '/').length);
    if (existsSync(join(OUT, rel))) ok('asset enlazado por invitación presente: ' + rel);
    else fail('ASSET ENLAZADO POR UNA INVITACIÓN NO EXISTE en el export: ' + ref);
  }
  // Toda ruta i/ del export debe corresponder a un JSON declarado
  if (existsSync(OUT_I)) {
    for (const entrada of readdirSync(OUT_I)) {
      if (!existsSync(join(DIR_INVITACIONES, entrada + '.json'))) {
        fail('ruta out/i/' + entrada + '/ generada sin JSON declarado en content/invitaciones/');
      }
    }
  }
} else {
  ok('sin invitaciones publicadas (content/invitaciones/ ausente)');
  if (existsSync(OUT_I)) fail('out/i/ existe pero content/invitaciones/ no está en el repo');
}

console.log('\n=== verify-export ===');
for (const n of notes) console.log(n);
if (errors.length > 0) {
  console.error('\nERRORES DE VERIFICACIÓN:');
  for (const e of errors) console.error(' ✗ ' + e);
  process.exit(1);
}
console.log('\nVerificación de exportación: sin errores.');
