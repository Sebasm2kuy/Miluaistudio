#!/usr/bin/env node
/**
 * prune-export.mjs — Poda del artefacto estático tras `next build`.
 *
 * El panel de administración (/admin) es una herramienta LOCAL de gestión.
 * Con `output: "export"`, Next.js genera `out/admin/` para cualquier ruta
 * presente en src/app, así que se elimina físicamente de la exportación:
 * el sitio publicado en GitHub Pages no debe incluir ninguna página de
 * administración alcanzable (noindex NO es protección).
 *
 * Se ejecuta como parte de `npm run build` (ver package.json).
 * `scripts/verify-export.mjs` falla el build si el panel reaparece.
 */

import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'out');
const ADMIN = join(OUT, 'admin');

if (existsSync(ADMIN)) {
  rmSync(ADMIN, { recursive: true, force: true });
  console.log('[prune-export] out/admin/ eliminado de la exportación pública.');
} else {
  console.log('[prune-export] out/admin/ no se generó (OK).');
}
