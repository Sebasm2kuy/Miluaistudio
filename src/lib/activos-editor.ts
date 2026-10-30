// ============================================================
// ACTIVOS DEL EDITOR — imágenes que el anfitrión sube para SU invitación
// ------------------------------------------------------------
// Diferencia clave:
//  - Fotos que suben los INVITADOS ("Dejale un recuerdo"): van por el
//    backend de moderación (photo-server.gs → Google Drive) y NUNCA al
//    repositorio. Esa regla no cambia: verify-export falla si out/uploads/
//    contiene imágenes.
//  - Recursos que el PROPIETARIO carga desde el editor para mostrarse en
//    la invitación (galería, portada, fondo): se publican en una carpeta
//    de assets propia, public/assets-invitaciones/, que el export SÍ
//    incluye y que no choca con la carpeta bloqueada uploads/.
// ============================================================

import type { SiteConfig } from '../data/config-schema';

/** Prefijo de rutas del sitio: vacío, el sitio vive en la RAÍZ del dominio propio (lumengala.site). */
export const BASE_PATH = '';
/** Carpeta de assets de invitaciones dentro de public/. */
export const CARPETA_ACTIVOS_INVITACION = 'assets-invitaciones';
/** Extensiones aceptadas para activos del editor. */
export const EXTENSIONES_IMAGEN: readonly string[] = ['jpg', 'jpeg', 'png', 'webp'];
/** Límite razonable por archivo (5 MB). */
export const TAMANIO_MAX_ACTIVO_BYTES = 5 * 1024 * 1024;

const MIME_POR_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/** Extensión en minúsculas de un nombre de archivo ('' si no tiene). */
export function extensionDeArchivo(nombre: string): string {
  const punto = nombre.lastIndexOf('.');
  if (punto <= 0 || punto === nombre.length - 1) return '';
  return nombre.slice(punto + 1).toLowerCase();
}

/** Normaliza variantes que envían los navegadores (image/jpg → image/jpeg). */
export function normalizarMime(mime: string): string {
  const limpio = (mime || '').trim().toLowerCase();
  return limpio === 'image/jpg' ? 'image/jpeg' : limpio;
}

/**
 * Detecta el tipo real por magic bytes: JPEG (FF D8 FF), PNG (89 50 4E 47)
 * y WebP (RIFF….WEBP). Devuelve null si no reconoce el contenido.
 */
export function detectarTipoReal(bytes: Uint8Array): 'jpeg' | 'png' | 'webp' | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'webp';
  }
  return null;
}

const EXTENSIONES_POR_TIPO_REAL: Record<'jpeg' | 'png' | 'webp', string[]> = {
  jpeg: ['jpg', 'jpeg'],
  png: ['png'],
  webp: ['webp'],
};

export type ValidacionActivo = { ok: true } | { ok: false; motivo: string };

/**
 * Valida un archivo de imagen ANTES de subirlo. No depende del atributo
 * HTML accept: comprueba tamaño, extensión, MIME (si el navegador lo
 * informa) y, cuando hay bytes disponibles, la firma real del contenido
 * (evita executables u otros archivos disfrazados de imagen).
 *
 * `bytes` es opcional (p.ej. validaciones de UI previas a leer el archivo).
 */
export function validarArchivoImagen(
  archivo: { name: string; type?: string; size: number },
  bytes?: Uint8Array,
): ValidacionActivo {
  if (!archivo.name) return { ok: false, motivo: 'El archivo no tiene nombre.' };

  if (!Number.isFinite(archivo.size) || archivo.size <= 0) {
    return { ok: false, motivo: 'El archivo está vacío.' };
  }
  if (archivo.size > TAMANIO_MAX_ACTIVO_BYTES) {
    const mb = (archivo.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      motivo: `El archivo pesa ${mb} MB y el límite es 5 MB. Reducilo o elegí otra versión.`,
    };
  }

  const extension = extensionDeArchivo(archivo.name);
  if (!EXTENSIONES_IMAGEN.includes(extension)) {
    return {
      ok: false,
      motivo: 'Formato no permitido. Usá JPG, PNG o WebP.',
    };
  }

  const mime = normalizarMime(archivo.type ?? '');
  if (mime && mime !== MIME_POR_EXTENSION[extension]) {
    return {
      ok: false,
      motivo: 'El contenido del archivo no coincide con un formato permitido (JPG, PNG o WebP).',
    };
  }

  if (bytes) {
    const tipoReal = detectarTipoReal(bytes);
    if (!tipoReal || !EXTENSIONES_POR_TIPO_REAL[tipoReal].includes(extension)) {
      return {
        ok: false,
        motivo: 'El archivo no es una imagen JPG, PNG o WebP válida.',
      };
    }
  }

  return { ok: true };
}

/**
 * Base saneada para nombre de archivo: sin extensión, minúsculas, acentos
 * fuera, [^a-z0-9_-] → '-', colapsados, sin bordes, máx. 40 caracteres.
 * Nunca devuelve vacío (usa "foto").
 */
export function sanearNombreBase(nombre: string): string {
  const base = (nombre || '')
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .slice(0, 40)
    .replace(/[-_]+$/g, '');
  return base || 'foto';
}

/**
 * Nombre final único: `<base-saneada>_<sufijo>.<ext>` con extensión de la
 * lista permitida (jpeg → jpeg; si el nombre no tiene extensión válida,
 * usa jpg como último recurso tras haber pasado la validación).
 * El sufijo (tiempo + aleatorio en el llamador) evita colisiones y
 * reutilizaciones accidentales de CDN.
 */
export function nombreArchivoUnico(nombreOriginal: string, sufijo: string): string {
  const extension = extensionDeArchivo(nombreOriginal);
  const extFinal = EXTENSIONES_IMAGEN.includes(extension) ? extension : 'jpg';
  return `${sanearNombreBase(nombreOriginal)}_${sufijo}.${extFinal}`;
}

/** Sufijo único: tiempo en base36 + tramo aleatorio. */
export function sufijoUnico(ahora: Date = new Date(), aleatorio: () => number = Math.random): string {
  return `${ahora.getTime().toString(36)}${Math.floor(aleatorio() * 1296).toString(36).padStart(2, '0')}`;
}

/** Ruta del activo dentro del repositorio. */
export function rutaRepoActivo(nombreArchivo: string, carpeta = CARPETA_ACTIVOS_INVITACION): string {
  return `public/${carpeta}/${nombreArchivo}`;
}

/**
 * URL pública EXACTA del activo, anclada a la raíz del dominio propio.
 * La URL que devuelve el uploader debe coincidir 1:1 con la ruta
 * publicada en el export (/assets-invitaciones/<archivo>).
 */
export function urlPublicaActivo(nombreArchivo: string, carpeta = CARPETA_ACTIVOS_INVITACION): string {
  return `${BASE_PATH}/${carpeta}/${nombreArchivo}`;
}

/**
 * Sincronización que espera el editor (mismo comportamiento que el panel
 * venía aplicando al deployar): si el fondo está en modo gradiente se
 * conserva; si está en modo fotos, el fondo usa exactamente las fotos de
 * la galería (webp válidos), para que galería y fondo nunca muestren
 * recursos desactualizados.
 */
export function sincronizarFondoConGaleria(cfg: SiteConfig): SiteConfig {
  const esModoGradiente = cfg.fondo?.fotos?.[0]?.startsWith('gradient:') === true;
  if (esModoGradiente) return cfg;
  return {
    ...cfg,
    fondo: {
      fotos: (cfg.galeria?.fotos ?? []).map((foto) => foto.webp).filter(Boolean),
    },
  };
}
