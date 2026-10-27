#!/usr/bin/env node
/**
 * prune-export.mjs — Poda del artefacto estático tras `next build`.
 *
 * El panel de administración (/admin) es una herramienta LOCAL de gestión.
 * Con `output: "export"`, Next.js genera out/admin/ para cualquier ruta
 * presente en src/app, así que se elimina físicamente de la exportación:
 * el sitio publicado en GitHub Pages no debe incluir el panel completo de
 * administración (noindex NO es protección).
 *
 * El editor móvil (/editar) SÍ se publica desde la iteración 017: es la
 * forma en que el anfitrión edita la invitación desde el teléfono. No
 * contiene secretos ni datos privados; toda acción que modifica el sitio
 * (cargar por slug, publicar, subir fotos) exige el GitHub token del
 * propietario, y la ruta lleva noindex. La protección real es el token,
 * no la URL. Ver scripts/verify-export.mjs, que ahora EXIGE su presencia.
 *
 * Se ejecuta como parte de `npm run build` (ver package.json).
 * `scripts/verify-export.mjs` falla el build si out/admin reaparece.
 */

import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'out');
const RUTAS_PROHIBIDAS = [
  { dir: join(OUT, 'admin'), nombre: 'out/admin/' },
];

for (const ruta of RUTAS_PROHIBIDAS) {
  if (existsSync(ruta.dir)) {
    rmSync(ruta.dir, { recursive: true, force: true });
    console.log(`[prune-export] ${ruta.nombre} eliminado de la exportación pública.`);
  } else {
    console.log(`[prune-export] ${ruta.nombre} no se generó (OK).`);
  }
}
