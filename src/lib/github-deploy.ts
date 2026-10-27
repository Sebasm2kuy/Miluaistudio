// Deploy via GitHub API — works on static sites (GitHub Pages, etc.)

import {
  CARPETA_ACTIVOS_INVITACION,
  validarArchivoImagen,
  nombreArchivoUnico,
  sufijoUnico,
  rutaRepoActivo,
  urlPublicaActivo,
} from './activos-editor';
import {
  serializarInvitacion,
  rutaArchivoInvitacion,
  urlInvitacion,
  urlPublicaInvitacion,
  type InvitacionPublicada,
} from '../data/invitacion-publicada';

/** Repositorio donde viven los datos de las invitaciones (compartido por lectura y publicación). */
export const GITHUB_REPO = 'Sebasm2kuy/Miluaistudio'
const CONFIG_PATH = 'src/data/config.ts'
const BASE_PATH = '/Miluaistudio'

// Type definitions are embedded here so we can build the full config.ts file
const CONFIG_TYPES = `// ============================================================
// CONFIGURACIÓN CENTRAL — Editá todo desde acá o desde /admin
// ============================================================

export interface TimelineEvent {
  hora: string
  titulo: string
  desc: string
  icono: string
}

export interface GalleryPhoto {
  webp: string
  fallback: string
}

export interface SiteConfig {
  evento: {
    tipo: string
    nombre: string
    apellido: string
    apodo: string
    fecha: string
    anio: string
    fechaEvento: string
    lugar: string
    ubicacion: string
    direccion: string
    mapsUrl: string
    hashtag: string
    hashtagUrl: string
  }
  dedicatoria: {
    cita: string
    cuerpo: string
    firma: string
  }
  timeline: {
    titulo: string
    subtitulo: string
    eventos: TimelineEvent[]
  }
  galeria: {
    titulo: string
    subtitulo: string
    botonSubir: string
    photoUploadUrl: string
    fotos: GalleryPhoto[]
  }
  musica: {
    titulo: string
    subtitulo: string
    playlistUrl: string
    embedUrl: string
    botonAgregar: string
    botonSpotify: string
  }
  rsvp: {
    titulo: string
    subtitulo: string
    fechaLimite: string
    fechaLimiteFull: string
    googleSheetUrl: string
    hostPhone: string
    regalos: {
      titulo: string
      subtitulo: string
      abitab: { titulo: string; numero: string }
      miDinero: { titulo: string; numero: string; numeroInterbancario?: string; sucursal?: string }
    }
  }
  footer: {
    apodo: string
    ubicacion: string
    frase: string
  }
  invitacion: {
    imagen: string
    imagenFallback: string
    textoAbrir: string
  }
  countdown: {
    titulo: string
    labels: { D: string; H: string; M: string; S: string }
    botonCalendario: string
    calendarioTitulo: string
    calendarioLocation: string
    calendarioDetalles: string
  }
  fondo: {
    fotos: string[]
  }
  colores: {
    principal: string
    dorado: string
    doradoClaro: string
    marfil: string
    fondo: string
  }
  estilos: {
    fuenteTitulo: string
    fuenteCuerpo: string
    fuenteCursiva: string
    modeloReloj: string
    estiloTarjetas: string
    estiloBotones: string
  }
}

`

export function buildConfigFile(configData: Record<string, unknown>): string {
  return `${CONFIG_TYPES}
// ============================================================
// VALORES — Auto-generated from admin panel
// ============================================================
const config: SiteConfig = ${JSON.stringify(configData, null, 2)} as SiteConfig

export default config
`
}

/**
 * LEGADO — NO publica invitaciones.
 *
 * Qué hace: escribe src/data/config.ts en la rama main vía API de GitHub.
 * Qué NO hace: NO crea ni actualiza ninguna invitación pública; el archivo
 * que escribe no es consumido por ninguna página (desde el desacople de la
 * configuración operativa, useConfig cae a la base de demostración).
 * Ninguna pantalla del panel lo ofrece: la única acción de publicación es
 * publicarInvitacionEnGitHub() (flujo /i/<slug>/). Se conserva exportada
 * para usos programáticos explícitos, con este contrato claro.
 */
export async function deployToGitHub(
  configData: Record<string, unknown>,
  token: string,
): Promise<{ success: boolean; message: string }> {
  if (!token) {
    return { success: false, message: 'Falta el GitHub Token' }
  }

  const apiBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${CONFIG_PATH}`

  try {
    // 1. Get current file SHA
    const getRes = await fetch(apiBase, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!getRes.ok && getRes.status !== 404) {
      const err = await getRes.json().catch(() => ({}))
      return { success: false, message: `Error GitHub API: ${err.message || getRes.status}` }
    }

    const sha = getRes.ok ? (await getRes.json()).sha : undefined

    // 2. Build config content
    const contentStr = buildConfigFile(configData)
    const content = btoa(unescape(encodeURIComponent(contentStr)))

    // 3. Push file
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Config update from admin - ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
        content,
        sha,
        branch: 'main',
      }),
    })

    if (putRes.ok) {
      return {
        success: true,
        message:
          'Config de legado escrito en src/data/config.ts (ninguna página lo consume; esto NO publica una invitación). El build se va a disparar solo (~2 min). Para publicar una invitación usá publicarInvitacionEnGitHub().',
      }
    }

    const err = await putRes.json().catch(() => ({}))
    return { success: false, message: `Error al pushear: ${err.message || putRes.status}` }
  } catch (err) {
    return { success: false, message: `Error de red: ${err instanceof Error ? err.message : 'unknown'}` }
  }
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Upload a file (image) to the repo via GitHub Contents API.
 *
 * Assets del EDITOR (recursos que el propietario carga para su invitación):
 * por defecto se guardan en `public/assets-invitaciones/` y se sirven en
 * `/Miluaistudio/assets-invitaciones/<archivo>` — la URL devuelta coincide
 * exactamente con la ruta publicada en el export.
 *
 * NO es la ruta de las fotos de invitados: esas suben por el backend de
 * moderación (photo-server.gs) y nunca tocan el repositorio; la regla que
 * mantiene `out/uploads/` sin imágenes sigue activa en verify-export.
 *
 * Validación antes de subir: tamaño, extensión, MIME y firma real del
 * archivo (magic bytes). Sin dependencia del atributo HTML accept.
 * La firma es OBLIGATORIA: si los primeros bytes no se pueden leer, la
 * subida se rechaza con un error entendible SIN llamar a la API de GitHub
 * (el validador acepta bytes opcionales solo para prevalidaciones de UI).
 * Si la subida falla, la URL anterior del campo queda intacta: el panel
 * conserva el estado y permite reintentar.
 */
export async function uploadToGitHub(
  file: File,
  token: string,
  subfolder = CARPETA_ACTIVOS_INVITACION,
  fetchImpl: FetchLike = ((input, init) => fetch(input, init)),
): Promise<{ success: boolean; url: string; message: string }> {
  if (!token) {
    return { success: false, url: '', message: 'Falta el GitHub Token' }
  }

  // ------------------------------------------------------------------
  // Firma real OBLIGATORIA en la subida: si los primeros bytes no se
  // pueden leer, la subida se rechaza acá. Nunca se valida solo por
  // extensión/MIME en la ruta real ni se contacta a la API de GitHub.
  // ------------------------------------------------------------------
  let bytes: Uint8Array
  try {
    bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  } catch {
    return {
      success: false,
      url: '',
      message:
        'No se pudo leer el contenido del archivo para verificar que sea una imagen. Volvé a seleccionarlo e intentá de nuevo.',
    }
  }

  // Validación completa (incluye la firma real recién leída)
  const validacion = validarArchivoImagen(
    { name: file.name, type: file.type, size: file.size },
    bytes,
  )
  if (!validacion.ok) {
    return { success: false, url: '', message: validacion.motivo }
  }

  // Nombre saneado + sufijo único: sin colisiones ni sobreescrituras accidentales
  const fileName = nombreArchivoUnico(file.name, sufijoUnico())
  const repoPath = rutaRepoActivo(fileName, subfolder)

  const apiBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${repoPath}`

  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i])
    }
    const base64Content = btoa(binary)

    // Check if file already exists (get SHA)
    const getRes = await fetchImpl(apiBase, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    let sha: string | undefined
    if (getRes.ok) {
      const data = await getRes.json()
      sha = data.sha
    }

    // Push file
    const putRes = await fetchImpl(apiBase, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload asset de invitación ${fileName}`,
        content: base64Content,
        sha,
        branch: 'main',
      }),
    })

    if (putRes.ok) {
      const publicUrl = urlPublicaActivo(fileName, subfolder)
      return { success: true, url: publicUrl, message: `Foto subida: ${fileName}` }
    }

    const err = await putRes.json().catch(() => ({}))
    return { success: false, url: '', message: `Error al subir: ${err.message || putRes.status}` }
  } catch (err) {
    return { success: false, url: '', message: `Error de red: ${err instanceof Error ? err.message : 'unknown'}` }
  }
}

// ---------------------------------------------------------------------------
// Publicación de invitaciones (flujo /i/<slug>/)
// ---------------------------------------------------------------------------

export interface ResultadoPublicacion {
  success: boolean
  /** Slug confirmado de la invitación. */
  slug: string
  /** URL relativa dentro del sitio (con basePath). */
  url: string
  /** URL absoluta pública (la que comparte el anfitrión). */
  urlAbsoluta: string
  /** true = archivo nuevo; false = actualización del mismo slug. */
  creado: boolean
  /** Mensaje honesto para la UI (incluye qué pasó y qué sigue). */
  message: string
}

export function resultadoFallido(parcial: {
  slug: string
  creado?: boolean
  message: string
}): ResultadoPublicacion {
  return {
    success: false,
    slug: parcial.slug,
    url: urlInvitacion(parcial.slug),
    urlAbsoluta: urlPublicaInvitacion(parcial.slug),
    creado: parcial.creado ?? false,
    message: parcial.message,
  }
}

/**
 * Guarda la representación publicada de una invitación en
 * `content/invitaciones/<slug>.json` (rama main) vía GitHub Contents API.
 *
 * Garantías del flujo:
 *  - Cada slug es UN archivo: publicar otra invitación no sobrescribe las
 *    anteriores; actualizar el mismo slug conserva su enlace y la fecha de
 *    primera publicación (publicadoEn) leída del archivo existente.
 *  - El resultado reporta el estado REAL de la operación (creado /
 *    actualizado / error). Guardar en localStorage o iniciar la petición
 *    NO se presenta como publicación.
 *  - Ante error no se modifica nada localmente: la configuración del panel
 *    queda intacta para reintentar.
 */
export async function publicarInvitacionEnGitHub(
  invitacion: InvitacionPublicada,
  token: string,
  fetchImpl: FetchLike = ((input, init) => fetch(input, init)),
): Promise<ResultadoPublicacion> {
  const slug = invitacion.slug
  const urlRelativa = urlInvitacion(slug)
  const urlAbsoluta = urlPublicaInvitacion(slug)

  if (!token) {
    return resultadoFallido({
      slug,
      message:
        'Falta el GitHub Token. Pegalo en la sección «Conexión con GitHub» y probá de nuevo.',
    })
  }

  const repoPath = rutaArchivoInvitacion(slug)
  const apiBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${repoPath}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }

  try {
    // 1. ¿Existe ya una publicación con este slug? (SHA + fecha original)
    let sha: string | undefined
    let publicadoEnOriginal: string | undefined
    const getRes = await fetchImpl(apiBase, { headers })
    if (getRes.ok) {
      const data = await getRes.json()
      sha = data.sha
      try {
        const existente = JSON.parse(atob(String(data.content || '').replace(/\n/g, '')))
        if (existente && typeof existente.publicadoEn === 'string') {
          publicadoEnOriginal = existente.publicadoEn
        }
      } catch {
        // Contenido previo ilegible: se republisha completo con la fecha actual.
      }
    } else if (getRes.status !== 404) {
      return resultadoFallido({
        slug,
        message: `Error GitHub API al leer la publicación existente: ${getRes.status}. Nada se modificó; podés reintentar.`,
      })
    }

    // 2. Serializar la representación conservando la fecha de primera publicación
    const representacion = publicadoEnOriginal
      ? { ...invitacion, publicadoEn: publicadoEnOriginal }
      : invitacion
    const content = btoa(unescape(encodeURIComponent(serializarInvitacion(representacion))))

    // 3. Guardar (crear o actualizar el MISMO archivo del slug)
    const putRes = await fetchImpl(apiBase, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: sha
          ? `Publicación de invitación "${slug}" actualizada (mismo slug y enlace)`
          : `Publicación de invitación "${slug}"`,
        content,
        sha,
        branch: 'main',
      }),
    })

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}))
      return resultadoFallido({
        slug,
        creado: !sha,
        message: `Error al guardar la invitación: ${err.message || putRes.status}. La configuración del panel sigue intacta; podés reintentar.`,
      })
    }

    const creado = !sha
    return {
      success: true,
      slug,
      url: urlRelativa,
      urlAbsoluta,
      creado,
      message: creado
        ? `Invitación publicada como "${slug}". El enlace queda activo cuando termine el deploy de GitHub Pages (≈2-3 min).`
        : `Invitación "${slug}" actualizada: se conservaron el mismo slug y el mismo enlace.`,
    }
  } catch (err) {
    return resultadoFallido({
      slug,
      message: `Error de red: ${err instanceof Error ? err.message : 'unknown'}. La configuración del panel sigue intacta; podés reintentar.`,
    })
  }
}
