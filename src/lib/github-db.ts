// ============================================================
// GITHUB COMO BASE DE DATOS — JSON leídos y escritos por la API
// de contenido de GitHub (Contents API) con commits automáticos.
// ------------------------------------------------------------
// Mismo patrón que github-deploy.ts (fetch directo a api.github.com,
// CERO dependencias nuevas): el repositorio ES la base de datos.
//
// Reglas del servicio:
//  - Lecturas de un repositorio público NO necesitan token: el login
//    y el panel leen sin credenciales (rate limit anónimo amplio).
//  - TODA escritura exige token y queda registrada como commit
//    auditable en la rama main.
//  - Los RSVPs se commitean con [skip ci] para NO disparar el rebuild
//    de GitHub Pages (deploy.yml solo escucha push a main): confirmar
//    asistencia no reconstruye el sitio.
//  - agregarEntradaRsvp reintenta ante conflicto de SHA (dos escrituras
//    simultáneas): relee el archivo, re-aplica el append y reintenta.
//  - fetch inyectable para pruebas: nada toca la red en la suite.
// ============================================================

import { GITHUB_REPO } from './github-deploy';
import {
  type EntradaRsvp,
  type ColeccionRsvps,
  MAX_RSVPS_POR_ARCHIVO,
  coleccionRsvpsVacia,
  normalizarEntradaRsvp,
  rutaArchivoRsvps,
  serializarRsvps,
  validarColeccionRsvps,
} from '../data/rsvps-esquema';

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface OpcionesGitHubDB {
  /** Rama del repositorio (default: main). */
  rama?: string;
  /** Token de GitHub (solo necesario para escribir). */
  token?: string;
  /** fetch inyectable para pruebas; por defecto el global. */
  fetchImpl?: FetchLike;
}

export type ResultadoLectura<T> =
  | { ok: true; data: T; sha: string }
  | { ok: false; motivo: 'no-existe' | 'red' | 'formato' | 'github'; mensaje: string };

export type ResultadoEscritura =
  | { ok: true; sha: string; creado: boolean; mensaje: string }
  | { ok: false; motivo: 'token' | 'conflicto' | 'red' | 'formato' | 'github'; mensaje: string };

const RAMA_POR_DEFECTO = 'main';
const REINTENTOS_CONFLICTO = 3;
const ESPERA_CONFLICTO_MS = 450;

function apiUrl(ruta: string): string {
  return `https://api.github.com/repos/${GITHUB_REPO}/contents/${ruta}`;
}

function encabezados(token: string | undefined, json: boolean): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

/** Decodifica el campo content (base64 con saltos de línea) a texto UTF-8. */
export function decodificarContenido(content: string): string {
  return decodeURIComponent(escape(atob(String(content || '').replace(/\n/g, ''))));
}

/** Codifica texto UTF-8 a base64 para el body del PUT. */
export function codificarContenido(texto: string): string {
  return btoa(unescape(encodeURIComponent(texto)));
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Lee un archivo JSON del repositorio. Nunca lanza:
 *  - 404  → motivo 'no-existe' (estado natural de una colección nueva).
 *  - JSON ilegible → motivo 'formato'.
 *  - Sin token hace la lectura anónima (repo público).
 */
export async function leerJSON<T>(
  ruta: string,
  opciones: OpcionesGitHubDB = {},
): Promise<ResultadoLectura<T>> {
  const fetchImpl = opciones.fetchImpl ?? ((input, init) => fetch(input, init));
  const url = `${apiUrl(ruta)}?ref=${encodeURIComponent(opciones.rama || RAMA_POR_DEFECTO)}`;

  let res: Response;
  try {
    res = await fetchImpl(url, { headers: encabezados(opciones.token, false) });
  } catch {
    return { ok: false, motivo: 'red', mensaje: 'No se pudo conectar con GitHub (red). Probá de nuevo en unos segundos.' };
  }

  if (res.status === 404) {
    return { ok: false, motivo: 'no-existe', mensaje: `No existe ${ruta} en la rama ${opciones.rama || RAMA_POR_DEFECTO}.` };
  }
  if (!res.ok) {
    return { ok: false, motivo: 'github', mensaje: `Error de la API de GitHub al leer ${ruta} (${res.status}).` };
  }

  let crudo: unknown;
  let sha = '';
  try {
    const data = (await res.json()) as { content?: string; sha?: string };
    sha = String(data.sha || '');
    crudo = JSON.parse(decodificarContenido(data.content || ''));
  } catch {
    return { ok: false, motivo: 'formato', mensaje: `El archivo ${ruta} no es un JSON legible.` };
  }

  return { ok: true, data: crudo as T, sha };
}

export interface OpcionesEscritura extends OpcionesGitHubDB {
  /** Mensaje del commit automático (aparece en la historia del repo). */
  mensaje: string;
  /** SHA del archivo si ya existe (actualización); ausente = creación. */
  shaPrevio?: string;
}

/**
 * Escribe un archivo JSON en el repositorio (crear o actualizar) con un
 * commit automático. Exige token; ante 409/422 de SHA desactualizado
 * devuelve motivo 'conflicto' (agregarEntradaRsvp es quien reintenta).
 */
export async function escribirJSON(
  ruta: string,
  contenidoJSON: string,
  opciones: OpcionesEscritura,
): Promise<ResultadoEscritura> {
  const token = (opciones.token || '').trim();
  if (!token) {
    return { ok: false, motivo: 'token', mensaje: 'Falta el token de GitHub: conectate desde el panel para guardar cambios.' };
  }
  const fetchImpl = opciones.fetchImpl ?? ((input, init) => fetch(input, init));
  const rama = opciones.rama || RAMA_POR_DEFECTO;

  let res: Response;
  try {
    res = await fetchImpl(apiUrl(ruta), {
      method: 'PUT',
      headers: encabezados(token, true),
      body: JSON.stringify({
        message: opciones.mensaje,
        content: codificarContenido(contenidoJSON),
        ...(opciones.shaPrevio ? { sha: opciones.shaPrevio } : {}),
        branch: rama,
      }),
    });
  } catch {
    return { ok: false, motivo: 'red', mensaje: 'No se pudo conectar con GitHub (red). Nada se modificó; podés reintentar.' };
  }

  if (res.ok) {
    let sha = '';
    try {
      const data = (await res.json()) as { content?: { sha?: string } };
      sha = String(data.content?.sha || '');
    } catch {
      // Respuesta sin cuerpo utilizable: la escritura igualmente OK (2xx).
    }
    return {
      ok: true,
      sha,
      creado: !opciones.shaPrevio,
      mensaje: opciones.shaPrevio
        ? `Actualizado ${ruta} (commit automático en la rama ${rama}).`
        : `Creado ${ruta} (commit automático en la rama ${rama}).`,
    };
  }

  if (res.status === 409 || res.status === 422) {
    return { ok: false, motivo: 'conflicto', mensaje: 'El archivo cambió mientras se guardaba (otra escritura en curso).' };
  }

  let detalle = String(res.status);
  try {
    const err = (await res.json()) as { message?: string };
    if (err.message) detalle = `${res.status}: ${err.message}`;
  } catch {
    // cuerpo ilegible: usamos el código solo.
  }
  if (res.status === 401 || res.status === 403) {
    return { ok: false, motivo: 'token', mensaje: `El token de GitHub fue rechazado (${detalle}). Revisá la conexión del panel.` };
  }
  return { ok: false, motivo: 'github', mensaje: `Error de la API de GitHub al escribir ${ruta} (${detalle}).` };
}

export interface OpcionesAgregarRsvp extends OpcionesGitHubDB {
  /** Token OBLIGATORIO para escribir. */
  token: string;
}

export type ResultadoAgregarRsvp =
  | { ok: true; dedup: boolean; creado: boolean; mensaje: string }
  | { ok: false; motivo: 'token' | 'validacion' | 'conflicto' | 'red' | 'formato' | 'github'; mensaje: string };

/**
 * Agrega una confirmación de asistencia a content/rsvps/<slug>.json con
 * commit automático ([skip ci]). Reintenta ante conflictos de escritura
 * simultánea re-leyendo el archivo; ignora duplicados por código de grupo.
 * La entrada se normaliza (sin teléfonos) antes de serializar.
 */
export async function agregarEntradaRsvp(
  slug: string,
  entradaCruda: unknown,
  opciones: OpcionesAgregarRsvp,
): Promise<ResultadoAgregarRsvp> {
  const entrada = normalizarEntradaRsvp(entradaCruda);
  if (!entrada) {
    return { ok: false, motivo: 'validacion', mensaje: 'La confirmación no tiene un nombre válido o falta el código de grupo.' };
  }

  const ruta = rutaArchivoRsvps(slug);
  const fetchImpl = opciones.fetchImpl ?? ((input, init) => fetch(input, init));

  let ultimoError: ResultadoEscritura | null = null;
  for (let intento = 0; intento < REINTENTOS_CONFLICTO; intento++) {
    if (intento > 0) await dormir(ESPERA_CONFLICTO_MS * intento);

    const lectura = await leerJSON<ColeccionRsvps>(ruta, {
      rama: opciones.rama,
      token: opciones.token,
      fetchImpl,
    });
    const coleccion = lectura.ok ? validarColeccionRsvps(lectura.data) : coleccionRsvpsVacia();
    if (!coleccion) {
      return { ok: false, motivo: 'formato', mensaje: `El archivo ${ruta} existe pero no es una colección de RSVPs válida.` };
    }

    // Dedup: el mismo código de grupo ya está registrado (doble clic, reintento del formulario).
    if (coleccion.rsvps.some((r) => r.codigo === entrada.codigo)) {
      return { ok: true, dedup: true, creado: false, mensaje: `La confirmación ${entrada.codigo} ya estaba registrada.` };
    }
    if (coleccion.rsvps.length >= MAX_RSVPS_POR_ARCHIVO) {
      return { ok: false, motivo: 'validacion', mensaje: 'El archivo de confirmaciones alcanzó su tope de seguridad.' };
    }

    const actualizada = {
      ...coleccion,
      actualizadoEn: new Date().toISOString(),
      rsvps: [...coleccion.rsvps, entrada],
    };
    // Mensaje de commit SIN datos personales (los nombres viajan solo dentro del JSON).
    const mensaje = `rsvp(${slug}): +1 confirmación (${entrada.cantidad} persona${entrada.cantidad === 1 ? '' : 's'}) [skip ci]`;

    const escritura = await escribirJSON(ruta, serializarRsvps(actualizada), {
      mensaje,
      rama: opciones.rama,
      token: opciones.token,
      fetchImpl,
      ...(lectura.ok ? { shaPrevio: lectura.sha } : {}),
    });

    if (escritura.ok) {
      return { ok: true, dedup: false, creado: escritura.creado, mensaje: escritura.mensaje };
    }
    ultimoError = escritura;
    if (escritura.motivo !== 'conflicto') break; // token/red/github: sin sentido reintentar
  }

  return (
    ultimoError ?? { ok: false, motivo: 'github', mensaje: 'No se pudo guardar la confirmación.' }
  );
}
