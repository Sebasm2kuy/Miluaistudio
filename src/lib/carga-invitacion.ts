// ============================================================
// CARGA DE UNA INVITACIÓN PUBLICADA — unidad testeable del editor
// móvil (iteración 017)
// ------------------------------------------------------------
// El editor móvil (/editar) necesita editar la invitación REAL que
// ya está publicada, no solo el borrador local del navegador. Esta
// unidad lee content/invitaciones/<slug>.json por la API de GitHub
// (mismo repositorio y misma carpeta que publicarInvitacionEnGitHub)
// y devuelve la SiteConfig lista para el editor.
//
// Contrato:
//  - Nunca lanza: todo resultado (ok / slug inválido / falta token /
//    no existe / JSON inválido / error de red) viaja en ResultadoCarga
//    con un mensaje accionable, igual que el flujo de publicación.
//  - Requiere token ANTES de contactar la API: la lectura de contents
//    de un repositorio privado de datos exige autenticación y evita
//    consultas anónimas innecesarias.
//  - La validación de la representación reutiliza validarInvitacionPublicada
//    (misma regla que el build estático).
//  - fetch inyectable para pruebas; nada toca la red en la suite.
// ============================================================

import {
  GITHUB_REPO,
} from './github-deploy';
import {
  motivoSlugInvalido,
  normalizarSlug,
  esSlugValido,
  rutaArchivoInvitacion,
  validarInvitacionPublicada,
} from '../data/invitacion-publicada';
import type { SiteConfig } from '../data/config-schema';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface EntradaCargaInvitacion {
  /** Slug de la invitación publicada (se normaliza). */
  slug: string;
  /** Token de GitHub pegado en «Conexión con GitHub». */
  token: string;
  /** fetch inyectable para pruebas; por defecto el global. */
  fetchImpl?: FetchLike;
}

export interface ResultadoCarga {
  success: boolean;
  /** Slug confirmado de la invitación (normalizado). */
  slug: string;
  /** Configuración lista para el editor (solo si success). */
  config?: SiteConfig;
  /** Fecha ISO de primera publicación, si el archivo la trae. */
  publicadoEn?: string;
  /** Mensaje honesto para la UI (incluye qué pasó y qué hacer). */
  message: string;
}

/**
 * Lee la invitación publicada <slug>.json desde GitHub y devuelve su
 * configuración para el editor. Nunca lanza; el estado real viaja en
 * ResultadoCarga.
 */
export async function leerInvitacionPublicadaDeGitHub(
  entrada: EntradaCargaInvitacion,
): Promise<ResultadoCarga> {
  const slug = normalizarSlug(entrada.slug || '');
  if (!esSlugValido(slug)) {
    return {
      success: false,
      slug,
      message: motivoSlugInvalido(slug) || `Slug inválido: "${entrada.slug}".`,
    };
  }

  const token = entrada.token.trim();
  if (!token) {
    return {
      success: false,
      slug,
      message:
        'Falta el GitHub Token. Pegalo en «Conexión con GitHub» y probá de nuevo: la invitación publicada vive en el repositorio.',
    };
  }

  const fetchImpl = entrada.fetchImpl ?? ((input, init) => fetch(input, init));
  const apiBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${rutaArchivoInvitacion(slug)}`;

  try {
    const res = await fetchImpl(apiBase, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 404) {
      return {
        success: false,
        slug,
        message: `No existe una invitación publicada con el slug "${slug}". Revisá el slug o publicala por primera vez desde acá mismo (botón «Publicar cambios»).`,
      };
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string };
      return {
        success: false,
        slug,
        message: `Error de la API de GitHub al leer la invitación (${res.status}${err.message ? `: ${err.message}` : ''}). Nada se modificó; podés reintentar.`,
      };
    }

    const data = (await res.json()) as { content?: string };
    const jsonStr = decodeURIComponent(escape(atob(String(data.content || '').replace(/\n/g, ''))));
    let crudo: unknown;
    try {
      crudo = JSON.parse(jsonStr);
    } catch {
      return {
        success: false,
        slug,
        message: 'El archivo publicado no es un JSON legible. No se cargó nada al editor.',
      };
    }

    const invitacion = validarInvitacionPublicada(crudo);
    if (!invitacion) {
      return {
        success: false,
        slug,
        message: 'El archivo publicado no tiene el formato esperado de una invitación. No se cargó nada al editor.',
      };
    }

    return {
      success: true,
      slug,
      config: invitacion.config,
      publicadoEn: invitacion.publicadoEn,
      message: `Invitación "${slug}" cargada. Tus cambios se reflejan en el borrador; usá «Publicar cambios» para aplicarlos a la invitación real.`,
    };
  } catch {
    return {
      success: false,
      slug,
      message: 'No se pudo conectar con GitHub (red o token). Probá de nuevo en unos segundos.',
    };
  }
}
