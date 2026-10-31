// ============================================================
// ESQUEMA DE CONFIRMACIONES DE ASISTENCIA (RSVP) —
// content/rsvps/<slug>.json
// ------------------------------------------------------------
// Cada invitación publicada tiene su propio archivo de RSVPs en el
// repositorio ("GitHub como base de datos"). Los escriben:
//  - el backend de Google Apps Script cuando está configurado con
//    GITHUB_TOKEN (espejo automático de cada confirmación), y
//  - el panel de cliente /dashboard/confirmaciones (alta manual,
//    alternar asistencia, eliminar) con commits automáticos.
//
// Privacidad por diseño:
//  - El archivo del repo NUNCA guarda teléfonos (quedan solo en la
//    hoja de cálculo del backend, que no es pública).
//  - Los mensajes de commit no contienen nombres ni teléfonos.
//  - Los commits llevan [skip ci] para NO disparar rebuilds del sitio.
// ============================================================

/** Versión del esquema de la colección de RSVPs. */
export const ESQUEMA_RSVPS = 1;

/** Carpeta del repositorio con las colecciones de RSVPs. */
export const CARPETA_RSVPS = 'content/rsvps';

/** Tope de seguridad por archivo (una evento real no supera esto; evita archivos gigantes por abuso). */
export const MAX_RSVPS_POR_ARCHIVO = 2000;

/** Máximo de acompañantes+cantidad por grupo aceptado en el esquema. */
export const MAX_CANTIDAD_GRUPO = 40;

export type AsistenciaRsvp = 'si' | 'no';
export type OrigenRsvp = 'formulario' | 'manual' | 'whatsapp';

export interface EntradaRsvp {
  /** Código de grupo (MIL-XXXX del formulario, o LGS-XXXX del alta manual). */
  codigo: string;
  /** Fecha ISO de la confirmación. */
  fecha: string;
  /** Cantidad total de personas del grupo (incluye al anfitrión del grupo). */
  cantidad: number;
  /** Nombres de los integrantes (mínimo 1). */
  invitados: string[];
  /** Si asiste o no. El formulario registra 'si'; el panel puede alternar a 'no'. */
  asistencia: AsistenciaRsvp;
  /** Sugerencia de canción para la pista (opcional). */
  cancion?: string;
  /** Origen del registro (auditoría liviana). */
  origen: OrigenRsvp;
}

export interface ColeccionRsvps {
  esquema: number;
  actualizadoEn: string;
  rsvps: EntradaRsvp[];
}

/** Ruta del archivo de RSVPs de una invitación dentro del repositorio. */
export function rutaArchivoRsvps(slug: string): string {
  // Normaliza como los slugs del sitio: minúsculas + [a-z0-9-]. El saneo
  // evita además cualquier intento de path traversal ('..', '/', '\\').
  const limpio = String(slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
  return `${CARPETA_RSVPS}/${limpio}.json`;
}

/**
 * Sanitiza y normaliza una entrada cruda (del formulario, del espejo de
 * Apps Script o del alta manual). Devuelve null si no alcanza el mínimo:
 * al menos un nombre (2+ caracteres) y cantidad entre 1 y MAX.
 */
export function normalizarEntradaRsvp(bruto: unknown): EntradaRsvp | null {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return null;
  const b = bruto as Record<string, unknown>;

  const invitadosCrudos = Array.isArray(b.invitados) ? b.invitados : [];
  const invitados = invitadosCrudos
    .map((n) => String(n ?? '').trim().slice(0, 60))
    .filter((n) => n.length >= 2)
    .slice(0, 12);
  if (invitados.length === 0) return null;

  const cantidadCruda = parseInt(String(b.cantidad ?? ''), 10);
  const cantidad = Number.isFinite(cantidadCruda)
    ? Math.min(MAX_CANTIDAD_GRUPO, Math.max(1, cantidadCruda))
    : invitados.length;

  const asistencia: AsistenciaRsvp = b.asistencia === 'no' ? 'no' : 'si';
  const origen: OrigenRsvp =
    b.origen === 'manual' || b.origen === 'whatsapp' ? b.origen : 'formulario';

  const fechaCruda = String(b.fecha ?? '');
  const fecha =
    fechaCruda && !Number.isNaN(Date.parse(fechaCruda))
      ? new Date(fechaCruda).toISOString()
      : new Date().toISOString();

  const codigo = String(b.codigo ?? '').trim().slice(0, 20) || null;
  if (!codigo) return null;

  const cancion = String(b.cancion ?? '').trim().slice(0, 120);

  return {
    codigo,
    fecha,
    cantidad,
    invitados,
    asistencia,
    ...(cancion ? { cancion } : {}),
    origen,
  };
}

/** Valida una colección leída del repositorio (no lanza; null = archivo inservible). */
export function validarColeccionRsvps(data: unknown): ColeccionRsvps | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const d = data as Record<string, unknown>;
  if (d.esquema !== ESQUEMA_RSVPS) return null;
  if (!Array.isArray(d.rsvps)) return null;

  const rsvps: EntradaRsvp[] = [];
  const vistos = new Set<string>();
  for (const crudo of d.rsvps) {
    const entrada = normalizarEntradaRsvp(crudo);
    if (!entrada || vistos.has(entrada.codigo)) continue;
    vistos.add(entrada.codigo);
    rsvps.push(entrada);
  }
  return {
    esquema: ESQUEMA_RSVPS,
    actualizadoEn: typeof d.actualizadoEn === 'string' ? d.actualizadoEn : '',
    rsvps,
  };
}

/** Colección nueva (para el primer RSVP de una invitación). */
export function coleccionRsvpsVacia(ahora = new Date()): ColeccionRsvps {
  return { esquema: ESQUEMA_RSVPS, actualizadoEn: ahora.toISOString(), rsvps: [] };
}

/** Serialización estable para commits revisables (JSON con indentación + salto final). */
export function serializarRsvps(coleccion: ColeccionRsvps): string {
  return JSON.stringify(coleccion, null, 2) + '\n';
}

/** Resumen para las tarjetas del panel (personas = suma de cantidades). */
export function resumenRsvps(rsvps: EntradaRsvp[]): {
  grupos: number;
  personas: number;
  asisten: number;
  noAsisten: number;
} {
  let personas = 0;
  let asisten = 0;
  let noAsisten = 0;
  for (const r of rsvps) {
    if (r.asistencia === 'no') {
      noAsisten += 1;
      continue; // un grupo que no asiste no suma personas esperadas
    }
    asisten += 1;
    personas += r.cantidad;
  }
  return { grupos: rsvps.length, personas, asisten, noAsisten };
}
