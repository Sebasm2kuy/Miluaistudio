/**
 * Cliente de envío de RSVP — privacidad primero.
 *
 * Contrato verificado con el backend del repositorio
 * (google-apps-script/gallery-server.gs):
 *
 *   POST JSON  { tipo: "rsvp_grupo", codigo, cantidad, invitados, telefono, fecha }
 *   Respuesta SIEMPRE JSON: { success: true, ... } o { success: false, error }
 *
 * Garantías:
 *  - Los datos personales (nombres, teléfono) viajan SOLO en el cuerpo de la
 *    solicitud, nunca en la query string: quedan fuera de URLs, historiales,
 *    logs de proxies y registres de acceso.
 *  - Se usa Content-Type text/plain (solicitud "simple"): no dispara el
 *    preflight OPTIONS que los Web Apps de Google Apps Script no responden.
 *  - Nunca se usa mode: 'no-cors' ni respuestas opacas: si la respuesta no
 *    puede leerse y verificarse, el resultado es 'pendiente', jamás 'guardado'.
 *  - Timeout con AbortController: si el servicio no responde, 'pendiente'.
 *
 * Estados de ResultadoRsvp (ver contrato-backend.ts):
 *  - 'guardado'  → el backend respondió JSON legible con success: true.
 *  - 'pendiente' → no se pudo verificar (CORS, red, timeout, respuesta
 *                  ilegible o backend desactualizado). El pedido puede haber
 *                  llegado, pero NO se puede afirmar.
 *  - 'error'     → el backend respondió un error explícito.
 */

import { parseGasResponse, interpretarRespuestaRsvp, type ResultadoRsvp } from './contrato-backend';

export interface RsvpPayload {
  /** Código de grupo generado en el cliente (MIL-XXXX) */
  codigo: string;
  /** Cantidad total de personas */
  cantidad: number;
  /** Nombres de los invitados (solo información necesaria, ya validada) */
  invitados: string[];
  /** Teléfono de contacto ya normalizado */
  telefono: string;
  /** Fecha ISO de la confirmación */
  fecha: string;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface EnviarRsvpOpciones {
  /** URL del Web App de Apps Script (rsvp.googleSheetUrl) */
  url: string;
  payload: RsvpPayload;
  /** Inyectable para pruebas (por defecto, fetch global) */
  fetchImpl?: FetchLike;
  /** Milisegundos máximos de espera (default 15000) */
  timeoutMs?: number;
}

/**
 * Envía el RSVP como POST JSON en el cuerpo de la solicitud.
 * Devuelve SOLO estados verificables: nunca afirma un guardado sin
 * respuesta legible del backend.
 */
export async function enviarRsvpPost({
  url,
  payload,
  fetchImpl,
  timeoutMs = 15000,
}: EnviarRsvpOpciones): Promise<ResultadoRsvp> {
  if (!url) return 'pendiente';

  const doFetch: FetchLike = fetchImpl ?? ((input, init) => fetch(input, init));

  // El controlador de aborto vive dentro de la función: cada envío tiene su
  // propio timeout y nunca se cancela un envío ajeno.
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);

  try {
    // Solicitud "simple" (text/plain): sin preflight CORS. El cuerpo —no la
    // URL— transporta los datos personales. La URL va limpia: sin parámetros.
    const res = await doFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ tipo: 'rsvp_grupo', ...payload }),
      redirect: 'follow',
      signal: controlador.signal,
    });

    // Apps Script responde JSON directo o envuelto en HTML tras la
    // redirección a googleusercontent.com; parseGasResponse tolera ambos.
    const data = parseGasResponse(await res.text());
    return interpretarRespuestaRsvp(data);
  } catch {
    // Red caída, timeout (abort) o respuesta ilegible: no se puede verificar.
    // NO hay reintento opaco: ningún dato sale de acá sin contrato verificable.
    return 'pendiente';
  } finally {
    clearTimeout(temporizador);
  }
}
