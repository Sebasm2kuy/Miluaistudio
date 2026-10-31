// ============================================================
// VALIDACIÓN DE CAMPOS DEL PANEL DE CLIENTE (/dashboard)
// ------------------------------------------------------------
// Reglas puras y testeables para el editor del evento y el alta
// manual de confirmaciones. Sin dependencias: cada validador
// devuelve { ok, valor | motivo } para mapear directo a mensajes
// de campo. Los enlaces musicales reutilizan spotifyEmbedUrl
// (misma regla que el personalizador y el panel del estudio).
// ============================================================

import { spotifyEmbedUrl } from './personalizador';

export type Valido<T> = { ok: true; valor: T } | { ok: false; motivo: string };

/** Texto requerido con tope de largo (trim). */
export function validarTextoRequerido(valor: string, etiqueta: string, maxLargo = 120): Valido<string> {
  const texto = String(valor ?? '').trim();
  if (!texto) return { ok: false, motivo: `Ingresá ${etiqueta}.` };
  if (texto.length > maxLargo) return { ok: false, motivo: `${etiqueta}: máximo ${maxLargo} caracteres.` };
  return { ok: true, valor: texto };
}

/** Texto opcional con tope de largo (trim; '' = sin valor). */
export function validarTextoOpcional(valor: string, etiqueta: string, maxLargo = 400): Valido<string> {
  const texto = String(valor ?? '').trim();
  if (texto.length > maxLargo) return { ok: false, motivo: `${etiqueta}: máximo ${maxLargo} caracteres.` };
  return { ok: true, valor: texto };
}

/** URL http(s) opcional ('' = sin valor). */
export function validarUrlOpcional(valor: string, etiqueta: string): Valido<string> {
  const texto = String(valor ?? '').trim();
  if (!texto) return { ok: true, valor: '' };
  if (texto.length > 500) return { ok: false, motivo: `${etiqueta}: el enlace es demasiado largo.` };
  try {
    const url = new URL(texto);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return { ok: false, motivo: `${etiqueta}: usá un enlace http(s).` };
    }
  } catch {
    return { ok: false, motivo: `${etiqueta}: el enlace no es válido (copialo completo desde la barra del navegador).` };
  }
  return { ok: true, valor: texto };
}

/**
 * Enlace de playlist/álbum/tema de Spotify ('' = sin música).
 * Devuelve además el embed derivado para la vista de la invitación.
 */
export function validarSpotify(valor: string): Valido<string> & { embed?: string } {
  const resultado = validarUrlOpcional(valor, 'El enlace de Spotify');
  if (!resultado.ok) return resultado;
  const url = resultado.valor;
  if (!url) return resultado;
  if (!spotifyEmbedUrl(url)) {
    return { ok: false, motivo: 'El enlace debe ser de Spotify: open.spotify.com/playlist/… (también sirve álbum o tema).' };
  }
  return { ...resultado, embed: spotifyEmbedUrl(url) as string };
}

/**
 * Fecha/hora del evento. Acepta el formato del input datetime-local
 * ("2026-11-21T21:00" o con segundos) o ISO completo; normaliza a ISO UTC.
 */
export function validarFechaEvento(valor: string): Valido<string> {
  const texto = String(valor ?? '').trim();
  if (!texto) return { ok: false, motivo: 'Ingresá la fecha y hora del evento.' };
  const fecha = new Date(texto);
  if (Number.isNaN(fecha.getTime())) {
    return { ok: false, motivo: 'La fecha no es válida (usá el selector de fecha y hora).' };
  }
  const anio = fecha.getFullYear();
  if (anio < 2020 || anio > 2100) {
    return { ok: false, motivo: 'La fecha queda fuera del rango razonable (2020–2100).' };
  }
  return { ok: true, valor: fecha.toISOString() };
}

/** Email con forma válida (para el alta manual de cuentas del estudio). */
export function validarEmail(valor: string): Valido<string> {
  const texto = String(valor ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) {
    return { ok: false, motivo: 'Ingresá un email válido.' };
  }
  return { ok: true, valor: texto };
}

/** Cantidad de personas de un grupo (1..40). */
export function validarCantidad(valor: string | number): Valido<number> {
  const n = parseInt(String(valor ?? ''), 10);
  if (!Number.isFinite(n) || n < 1) return { ok: false, motivo: 'La cantidad mínima es 1.' };
  if (n > 40) return { ok: false, motivo: 'La cantidad máxima por grupo es 40.' };
  return { ok: true, valor: n };
}

/** Lista de nombres desde un textarea (uno por línea); mínimo 1 nombre de 2+ caracteres. */
export function validarListaNombres(valor: string): Valido<string[]> {
  const nombres = String(valor ?? '')
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length >= 2)
    .slice(0, 12);
  if (nombres.length === 0) {
    return { ok: false, motivo: 'Ingresá al menos un nombre (uno por línea, 2+ caracteres).' };
  }
  return { ok: true, valor: nombres };
}

// ---------------------------------------------------------------------------
// Fecha y hora del evento — desglose en los tres campos de SiteConfig
// ---------------------------------------------------------------------------

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export interface FechaDesglosada {
  /** "2026-11-21 21:00" — lo que parsea el countdown (fechaEventoEnMontevideo). */
  fechaEvento: string;
  /** "21 de noviembre" — etiqueta visual del evento. */
  fecha: string;
  /** "2026" — año visual. */
  anio: string;
}

/**
 * Convierte el valor del input datetime-local ("2026-11-21T21:00" o con
 * segundos) en los tres campos del evento. Devuelve null si no parsea.
 */
export function desglosarFecha(valorInput: string): FechaDesglosada | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(valorInput ?? '').trim());
  if (!m) return null;
  const [, anio, mes, dia, hh, mm] = m;
  const mesNum = parseInt(mes, 10);
  if (mesNum < 1 || mesNum > 12) return null;
  if (parseInt(hh, 10) > 23 || parseInt(mm, 10) > 59) return null;
  const diaNum = parseInt(dia, 10);
  if (diaNum < 1 || diaNum > 31) return null;
  return {
    fechaEvento: `${anio}-${mes}-${dia} ${hh}:${mm}`,
    fecha: `${diaNum} de ${MESES_ES[mesNum - 1]}`,
    anio,
  };
}

/** "YYYY-MM-DD HH:mm" (o ISO) → valor para <input type="datetime-local">. */
export function valorInputDesdeFecha(fechaEvento: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(String(fechaEvento ?? '').trim());
  return m ? `${m[1]}T${m[2]}` : '';
}
