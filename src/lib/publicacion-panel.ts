// ============================================================
// PUBLICACIÓN DESDE EL PANEL — unidad testeable del flujo principal
// ------------------------------------------------------------
// Extrae la lógica de la acción principal «Publicar invitación» del
// panel de administración para que sea comprobable sin montar el
// componente React (la suite corre con node:test, sin DOM).
//
// Contrato:
//  - La ÚNICA ruta de publicación es publicarInvitacionEnGitHub()
//    (invitaciones con URL propia /i/<slug>/). Esta unidad NO depende
//    de deployToGitHub(): escribir src/data/config.ts no publica nada.
//  - Valida slug y token ANTES de contactar la API de GitHub; cada
//    fallo devuelve un ResultadoPublicacion con el estado real y un
//    mensaje accionable (nunca lanza).
//  - La representación publicada se prepara con la misma regla de
//    coherencia que el resto del panel: en modo fotos, el fondo usa
//    exactamente las fotos vigentes de la galería
//    (sincronizarFondoConGaleria), sin mutar el estado del editor.
// ============================================================

import type { SiteConfig } from '../data/config-schema';
import {
  crearInvitacionPublicada,
  esSlugValido,
  motivoSlugInvalido,
  normalizarSlug,
  type InvitacionPublicada,
} from '../data/invitacion-publicada';
import { sincronizarFondoConGaleria } from './activos-editor';
import {
  publicarInvitacionEnGitHub,
  resultadoFallido,
  type ResultadoPublicacion,
} from './github-deploy';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface EntradaPublicacionPanel {
  /** Slug candidato (normalizado o sin normalizar: se normaliza acá). */
  slug: string;
  /** Configuración actual del editor. */
  config: SiteConfig;
  /** Token de GitHub pegado en «Conexión con GitHub». */
  token: string;
  /** Reloj inyectable para pruebas; por defecto ahora mismo. */
  ahora?: Date;
  /** fetch inyectable para pruebas; por defecto el global. */
  fetchImpl?: FetchLike;
}

/**
 * Prepara la representación publicable a partir del estado del panel:
 * normaliza y valida el slug y sincroniza fondo ↔ galería. Lanza con un
 * mensaje entendible si el slug no es publicable (la página lo captura).
 */
export function prepararInvitacionDesdePanel({
  slug,
  config,
  ahora,
}: Pick<EntradaPublicacionPanel, 'slug' | 'config' | 'ahora'>): InvitacionPublicada {
  const slugNormalizado = normalizarSlug(slug || '');
  if (!esSlugValido(slugNormalizado)) {
    throw new Error(
      motivoSlugInvalido(slugNormalizado) || `Slug inválido: "${slug}".`,
    );
  }
  return crearInvitacionPublicada({
    slug: slugNormalizado,
    config: sincronizarFondoConGaleria(config),
    ahora,
  });
}

/**
 * Acción principal de publicación del panel: valida slug y token, arma la
 * representación publicada y la guarda por el flujo por slug
 * (content/invitaciones/<slug>.json vía publicarInvitacionEnGitHub).
 * Nunca lanza: todo resultado (creada / actualizada / error) viaja en el
 * ResultadoPublicacion para que la UI muestre lo que REALMENTE pasó.
 */
export async function publicarInvitacionDesdePanel(
  entrada: EntradaPublicacionPanel,
): Promise<ResultadoPublicacion> {
  const slug = normalizarSlug(entrada.slug || '');

  if (!esSlugValido(slug)) {
    return resultadoFallido({
      slug,
      message:
        motivoSlugInvalido(slug) || `Slug inválido: "${entrada.slug}".`,
    });
  }

  const token = entrada.token.trim();
  if (!token) {
    return resultadoFallido({
      slug,
      message:
        'Falta el GitHub Token. Pegalo en la sección «Conexión con GitHub» y probá de nuevo.',
    });
  }

  try {
    const invitacion = prepararInvitacionDesdePanel({
      slug,
      config: entrada.config,
      ahora: entrada.ahora,
    });
    return await publicarInvitacionEnGitHub(invitacion, token, entrada.fetchImpl);
  } catch (err) {
    return resultadoFallido({
      slug,
      message:
        err instanceof Error
          ? err.message
          : 'Error desconocido al preparar la publicación.',
    });
  }
}
