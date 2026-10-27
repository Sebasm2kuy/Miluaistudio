// ============================================================
// COLECCIÓN DE INVITACIONES PUBLICADAS (solo servidor / build)
// ------------------------------------------------------------
// Lee content/invitaciones/<slug>.json durante `next build`
// (generateStaticParams + render de /i/[slug]/). Este módulo usa
// node:fs y SOLO debe importarse desde componentes de servidor:
// nunca desde componentes cliente (no existe fs en el navegador
// y las rutas de build no son parte del bundle público).
// ============================================================

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  validarInvitacionPublicada,
  type InvitacionPublicada,
} from '../data/invitacion-publicada';

/** Directorio del repositorio con los JSON publicados. */
export const DIRECTORIO_INVITACIONES = join(process.cwd(), 'content', 'invitaciones');

/** Slugs publicados en un directorio: un slug por archivo *.json, ordenados. */
export function listarSlugsEnDirectorio(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((archivo) => archivo.endsWith('.json'))
    .map((archivo) => archivo.slice(0, -'.json'.length))
    .sort();
}

/**
 * Lee y valida una invitación publicada de un directorio.
 * Devuelve null si el archivo no existe, el JSON está roto o la
 * representación no pasa la validación (el build lo reporta).
 */
export function leerInvitacionDeDirectorio(dir: string, slug: string): InvitacionPublicada | null {
  const archivo = join(dir, `${slug}.json`);
  if (!existsSync(archivo)) return null;
  try {
    const data = JSON.parse(readFileSync(archivo, 'utf8'));
    return validarInvitacionPublicada(data);
  } catch {
    return null;
  }
}

/** Slugs de la colección real del repositorio. */
export function listarSlugsPublicados(): string[] {
  return listarSlugsEnDirectorio(DIRECTORIO_INVITACIONES);
}

/** Lee una invitación de la colección real del repositorio. */
export function leerInvitacionPublicada(slug: string): InvitacionPublicada | null {
  return leerInvitacionDeDirectorio(DIRECTORIO_INVITACIONES, slug);
}

/**
 * Parámetros de rutas estáticas para generateStaticParams().
 * Cada invitación publicada produce exactamente una página.
 */
export function parametrosRutasInvitaciones(
  dir: string = DIRECTORIO_INVITACIONES,
): { slug: string }[] {
  return listarSlugsEnDirectorio(dir).map((slug) => ({ slug }));
}
