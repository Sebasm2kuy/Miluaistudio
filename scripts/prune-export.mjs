#!/usr/bin/env node
/**
 * prune-export.mjs — Poda del artefacto estático tras `next build`.
 *
 * El panel de administración (/admin) y el editor móvil (/editar) son
 * herramientas LOCALES de gestión. Con `output: "export"`, Next.js genera
 * out/admin/ y out/editar/ para cualquier ruta presente en src/app, así
 * que se eliminan físicamente de la exportación: el sitio publicado en
 * GitHub Pages no debe incluir ninguna página de administración o de
 * edición alcanzable (noindex NO es protección).
 *
 * Se ejecuta como parte de `npm run build` (ver package.json).
 * `scripts/verify-export.mjs` falla el build si alguna reaparece.
 */

import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'out');
const RUTAS_PROHIBIDAS = [
  { dir: join(OUT, 'admin'), nombre: 'out/admin/' },
  { dir: join(OUT, 'editar'), nombre: 'out/editar/' },
];

for (const ruta of RUTAS_PROHIBIDAS) {
  if (existsSync(ruta.dir)) {
    rmSync(ruta.dir, { recursive: true, force: true });
    console.log(`[prune-export] ${ruta.nombre} eliminado de la exportación pública.`);
  } else {
    console.log(`[prune-export] ${ruta.nombre} no se generó (OK).`);
  }
}
