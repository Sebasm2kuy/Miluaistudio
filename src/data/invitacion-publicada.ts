// ============================================================
// REPRESENTACIÓN PUBLICABLE DE UNA INVITACIÓN
// ------------------------------------------------------------
// La página pública (/i/[slug]/) consume durante el build estático
// una colección de archivos JSON (content/invitaciones/<slug>.json).
// Este módulo define esa representación: tipos, validación y
// helpers puros (slug, URLs, serialización).
//
// Reglas:
//  - La representación NO contiene funciones ni objetos internos
//    del editor: se serializa con JSON (JSON.parse(JSON.stringify))
//    para garantizar que solo viajan datos.
//  - Cada invitación publicada vive en SU PROPIO archivo por slug:
//    publicar una nueva no sobrescribe las anteriores y actualizar
//    conserva el mismo slug y el mismo enlace.
//  - Los slugs evitan colisionar con rutas reales del sitio
//    (admin, catalogo, personalizar, i, uploads, etc.).
// ============================================================

import type { SiteConfig } from '../data/config-schema';

/** Prefijo de rutas del sitio: vacío porque vive en la RAÍZ del dominio propio (lumengala.site). */
export const BASE_PATH = '';
/** Origen público donde se publica el artefacto (dominio propio). */
export const ORIGEN_PUBLICO = 'https://lumengala.site';
/** Versión del esquema de la representación publicada. */
export const ESQUEMA_INVITACION = 1;
/** Carpeta del repositorio con la colección de invitaciones publicadas. */
export const CARPETA_PUBLICACION = 'content/invitaciones';

/**
 * Slugs que chocan con rutas existentes del sitio o del artefacto.
 * La ruta pública de invitaciones es /i/<slug>/, así que "i" también
 * queda reservado para evitar /i/i/.
 */
export const SLUGS_RESERVADOS: ReadonlySet<string> = new Set([
  'admin',
  'api',
  'assets-invitaciones',
  'audio',
  'catalogo',
  'favicon.ico',
  'i',
  'personalizar',
  'previsualizar',
  'robots',
  'sitemap',
  'uploads',
  '_next',
]);

/** Representación publicada: datos puros listos para el build estático. */
export interface InvitacionPublicada {
  /** Versión del esquema (ESQUEMA_INVITACION). Permite evolucionar el formato. */
  esquema: number;
  /** Slug estable: define la URL /i/<slug>/ y el nombre del archivo JSON. */
  slug: string;
  /** Fecha ISO de la primera publicación (se conserva al actualizar). */
  publicadoEn: string;
  /** Fecha ISO de la última actualización. */
  actualizadoEn: string;
  /** Id del diseño del catálogo usado como base (informativo, opcional). */
  disenoBase?: string;
  /** Configuración completa y serializable que renderiza InvitationExperience. */
  config: SiteConfig;
}

/**
 * "Mis XV Años!" → "mis-xv-anos". Normaliza acentos y ñ, pasa a
 * minúsculas y reemplaza todo lo que no sea [a-z0-9] por guiones.
 * Devuelve cadena vacía si no queda nada utilizable.
 */
export function normalizarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

/** Un slug publicable: 2–60 caracteres, [a-z0-9] con guiones internos, no reservado. */
export function esSlugValido(slug: string): boolean {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return false;
  if (slug.length < 2 || slug.length > 60) return false;
  return !SLUGS_RESERVADOS.has(slug);
}

/** Motivo por el que un slug no es publicable (para feedback del panel). */
export function motivoSlugInvalido(slug: string): string {
  if (!slug) return 'Elegí un slug para la invitación.';
  if (SLUGS_RESERVADOS.has(slug)) return `"${slug}" está reservado por otra ruta del sitio.`;
  if (slug.length < 2) return 'El slug necesita al menos 2 caracteres.';
  if (slug.length > 60) return 'El slug no puede superar 60 caracteres.';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return 'Usá solo minúsculas, números y guiones (sin espacios ni acentos).';
  }
  return '';
}

export interface OpcionesCrearInvitacion {
  slug: string;
  /** Config del editor. Se serializa: funciones y valores undefined se descartan. */
  config: SiteConfig;
  /** Id del diseño base del catálogo (opcional). */
  disenoBase?: string;
  /** Fecha ISO de primera publicación (para conservarla al actualizar). */
  publicadoEn?: string;
  /** Reloj inyectable para pruebas; por defecto ahora mismo. */
  ahora?: Date;
}

/**
 * Construye la representación publicable a partir de la configuración
 * del editor. La serialización en dos pasos garantiza datos puros y
 * marca la invitación como real (no demo) para que la confirmación de
 * asistencia funcione contra el backend configurado.
 */
export function crearInvitacionPublicada({
  slug,
  config,
  disenoBase,
  publicadoEn,
  ahora = new Date(),
}: OpcionesCrearInvitacion): InvitacionPublicada {
  if (!esSlugValido(slug)) {
    throw new Error(motivoSlugInvalido(slug) || `Slug inválido: "${slug}".`);
  }
  if (!config || typeof config !== 'object') {
    throw new Error('La configuración de la invitación está vacía o es inválida.');
  }

  // Solo datos: funciones, símbolos y undefined se pierden acá a propósito.
  const configSerializable = JSON.parse(JSON.stringify(config)) as SiteConfig;
  // Una invitación publicada es real: la confirmación NO se simula.
  configSerializable.modoDemo = false;
  delete configSerializable.demoNombreDiseno;

  const marcaTiempo = ahora.toISOString();
  return {
    esquema: ESQUEMA_INVITACION,
    slug,
    publicadoEn: publicadoEn || marcaTiempo,
    actualizadoEn: marcaTiempo,
    ...(disenoBase ? { disenoBase } : {}),
    config: configSerializable,
  };
}

/**
 * Valida la forma de una representación leída de un JSON.
 * No re-valida cada campo de SiteConfig (eso lo hace el build con las
 * páginas reales): comprueba lo esencial para renderizar con seguridad.
 * Devuelve null si el objeto no sirve.
 */
export function validarInvitacionPublicada(data: unknown): InvitacionPublicada | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const d = data as Record<string, unknown>;
  if (d.esquema !== ESQUEMA_INVITACION) return null;
  if (typeof d.slug !== 'string' || !d.slug) return null;
  if (typeof d.publicadoEn !== 'string' || !d.publicadoEn) return null;
  if (typeof d.actualizadoEn !== 'string' || !d.actualizadoEn) return null;
  const config = d.config as Record<string, unknown> | undefined;
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null;
  const evento = config.evento as Record<string, unknown> | undefined;
  if (!evento || typeof evento.nombre !== 'string') return null;
  if (d.disenoBase !== undefined && typeof d.disenoBase !== 'string') return null;
  return data as InvitacionPublicada;
}

/** URL relativa de la invitación dentro del sitio (anclada a la raíz del dominio). */
export function urlInvitacion(slug: string): string {
  return `${BASE_PATH}/i/${slug}/`;
}

/** URL absoluta pública (la que comparte el anfitrión con sus invitados). */
export function urlPublicaInvitacion(slug: string): string {
  return `${ORIGEN_PUBLICO}${BASE_PATH}/i/${slug}/`;
}

/** Ruta del archivo JSON dentro del repositorio. */
export function rutaArchivoInvitacion(slug: string): string {
  return `${CARPETA_PUBLICACION}/${slug}.json`;
}

/** Serialización estable para commits revisables (JSON con indentación + salto final). */
export function serializarInvitacion(invitacion: InvitacionPublicada): string {
  return JSON.stringify(invitacion, null, 2) + '\n';
}
