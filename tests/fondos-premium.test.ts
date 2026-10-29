/**
 * Iteraciones 020/022 — Colección «Fondos de autor».
 *
 * 020: 5 florales (rosas) + 5 neón 3D.  022: 3 flores de papel + 3 gala dorada
 * + 3 disco (pistas del propietario en Pinterest).
 *
 * Barra la integridad del sistema de fondos con imagen:
 *  1. Cada preset con `image` apunta a un archivo real y liviano en public/.
 *  2. Cada diseño referencia un preset existente y, si usa imagen, su ficha
 *     de galería demo existe (demoGallery referencia 4 fotos por diseño).
 *  3. Cada diseño tiene su perfil demo cargado (createDemoConfig refleja el
 *     mockupName) y colores de botón con contraste AA sobre texto blanco.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { BACKGROUND_PRESETS } from '../src/data/admin-options.js';
import { INVITATION_DESIGNS } from '../src/data/invitation-designs.js';
import { createDemoConfig } from '../src/data/demo-config.js';

const RAIZ_PUBLIC = resolve(process.cwd(), 'public');
const PESO_MAX_FONDO = 400 * 1024; // presupuestado: 19 fondos ≈ 2,5 MB total

// Colección por familias: papel/gala/disco se suman a rosas/neón de 020
const FAMILIAS = {
  florales: ['rosas-cascada', 'arco-rosado', 'jardin-durazno', 'rosas-rubi', 'blancas-eucalipto'],
  neon: ['neon-violeta', 'neon-azul', 'neon-fucsia', 'neon-turquesa', 'neon-dorado'],
  papel: ['papel-rosado', 'papel-crema', 'papel-malva'],
  gala: ['gala-estrellas', 'gala-cortinas', 'gala-espejos'],
  disco: ['disco-pista', 'disco-fucsia', 'disco-espejos'],
} as const;

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

const FONDOS_AUTOR = INVITATION_DESIGNS.filter((d) => d.backgroundPreset.startsWith('img-'));

test('fondos: cada preset con imagen existe en public/ y pesa menos de 400 KB', () => {
  const conImagen = BACKGROUND_PRESETS.filter((bg) => typeof bg.image === 'string' && bg.image.length > 0);
  // La colección aporta 19 fondos con imagen (5 rosas + 5 neón + 3 papel + 3 gala + 3 disco)
  assert.equal(conImagen.length, 19, 'deben existir 19 presets con imagen');
  for (const bg of conImagen) {
    const rel = (bg.image as string).replace('/Miluaistudio/', '');
    const abs = resolve(RAIZ_PUBLIC, rel);
    assert.ok(existsSync(abs), `falta el archivo del fondo ${bg.id}: ${bg.image}`);
    const peso = statSync(abs).size;
    assert.ok(peso <= PESO_MAX_FONDO, `${bg.image} pesa ${peso} bytes (máx ${PESO_MAX_FONDO})`);
    assert.ok(bg.css.length > 0, `${bg.id} debe conservar css de respaldo mientras carga`);
  }
});

test('fondos: los ids de imagen siguen la ruta canónica de la colección', () => {
  for (const bg of BACKGROUND_PRESETS) {
    if (!bg.image) continue;
    assert.ok(bg.image.startsWith('/Miluaistudio/catalogo/fondos/'), `ruta inesperada: ${bg.image}`);
    assert.match(bg.image, /\.jpg$/, 'los fondos de autor se distribuyen en JPG');
  }
});

test('catálogo: todo diseño referencia un backgroundPreset existente', () => {
  const ids = new Set(BACKGROUND_PRESETS.map((bg) => bg.id));
  for (const design of INVITATION_DESIGNS) {
    assert.ok(ids.has(design.backgroundPreset), `${design.id} → preset inexistente ${design.backgroundPreset}`);
  }
});

test('catálogo: ids únicos y 19 diseños nuevos de la colección', () => {
  const ids = INVITATION_DESIGNS.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, 'ids de diseño duplicados');
  assert.equal(FONDOS_AUTOR.length, 19, 'la colección aporta 19 diseños');
  const idsAutor = new Set(FONDOS_AUTOR.map((d) => d.id));
  for (const [familia, lista] of Object.entries(FAMILIAS)) {
    for (const id of lista) {
      assert.ok(idsAutor.has(id), `falta el diseño ${id} de la familia ${familia}`);
    }
  }
  const claros = FONDOS_AUTOR.filter((d) => d.themeMode === 'light');
  const oscuros = FONDOS_AUTOR.filter((d) => d.themeMode === 'dark');
  assert.equal(claros.length, 8, '8 diseños claros (5 florales + 3 papel)');
  assert.equal(oscuros.length, 11, '11 diseños oscuros (5 neón + 3 gala + 3 disco)');
});

test('catálogo: cada diseño tiene perfil demo cargado (createDemoConfig)', () => {
  for (const design of INVITATION_DESIGNS) {
    const cfg = createDemoConfig(design);
    assert.equal(cfg.evento.nombre, design.mockupName, `${design.id} sin DEMO_PROFILE propio`);
    assert.equal(cfg.modoDemo, true);
    assert.ok(cfg.evento.hashtag.length > 0, `${design.id} sin hashtag demo`);
    // El fondo de la demo apunta al preset del diseño
    assert.deepEqual(cfg.fondo.fotos, [`gradient:${design.backgroundPreset}`]);
  }
});

test('catálogo: galería demo completa para los diseños con imagen', () => {
  for (const design of FONDOS_AUTOR) {
    for (let n = 1; n <= 4; n++) {
      const abs = resolve(RAIZ_PUBLIC, 'catalogo/galeria', `${design.id}-${n}.jpg`);
      assert.ok(existsSync(abs), `falta galería demo ${design.id}-${n}.jpg`);
    }
  }
});

test('accesibilidad: botBg/buttonText de todos los diseños cumplen 4.5:1', () => {
  for (const design of INVITATION_DESIGNS) {
    const r = contraste(design.buttonBg, design.buttonText);
    assert.ok(r >= 4.5, `${design.id}: ${design.buttonBg} sobre ${design.buttonText} = ${r.toFixed(2)}:1`);
  }
});

test('accesibilidad: etiqueta de categoría legible sobre blanco (accentSoft o storeAccent)', () => {
  for (const design of INVITATION_DESIGNS) {
    const color = design.storeAccent ?? design.accentSoft;
    const r = contraste(color, '#ffffff');
    assert.ok(r >= 4.5, `${design.id}: categoría ${color} sobre blanco = ${r.toFixed(2)}:1 (definir storeAccent)`);
  }
});
