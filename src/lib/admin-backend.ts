// ============================================================
// CLIENTE DEL BACKEND DE MÉTRICAS (metricas_admin) — iteración 042
// ------------------------------------------------------------
// Único camino hacia los datos de tráfico: la acción metricas_admin del
// Web App de Apps Script, que re-verifica la credencial de Google
// (tokeninfo: firma, audiencia, vigencia, email verificado) y SOLO
// responde si el email es la cuenta del estudio. Sin backend activo no
// hay métricas: el panel muestra la sección como «no disponible»
// (fail-closed, nunca ceros inventados).
//
//  - La credencial viaja SOLO en el cuerpo (text/plain simple: sin
//    preflight CORS, igual que registro/RSVP). Nunca en query string.
//  - parseGasResponse tolera el wrapper HTML de Apps Script.
//  - fetch inyectable: nada toca la red en la suite.
// ============================================================

import { parseGasResponse } from './contrato-backend';
import { validarFilasMetricas, type FilaMetrica } from '../data/metricas-esquema';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type ResultadoMetricasAdmin =
  | { ok: true; filas: FilaMetrica[]; backendActivo: true }
  | {
      ok: false;
      motivo:
        | 'sin-endpoint'      // ENDPOINT_REGISTRO vacío (no debería ocurrir en producción)
        | 'red'               // timeout / CORS / red caída
        | 'backend'           // error explícito del backend
        | 'sin-actualizar'    // Web App viejo: aún no tiene la acción metricas_admin
        | 'credencial'        // Google rechazó el token (vencido, audiencia, etc.)
        | 'no-autorizado';    // email distinto del estudio (fail-closed)
      mensaje: string;
    }

/** Mensajes honestos por motivo (mostrados tal cual en el panel). */
export const MENSAJES_METRICAS: Record<string, string> = {
  'sin-endpoint': 'El backend de métricas no está configurado en el sitio.',
  red: 'No se pudo conectar con el backend de métricas. Probá de nuevo en unos segundos.',
  backend: 'El backend de métricas reportó un error. Probá de nuevo en unos segundos.',
  'sin-actualizar':
    'El Web App del estudio todavía no tiene la acción de métricas: actualizá el código de Apps Script (ver docs/METRICAS-ADMIN.md) y volvé a entrar.',
  credencial:
    'La sesión de Google venció o fue rechazada. Volvé a ingresar con tu cuenta del estudio.',
  'no-autorizado': 'Esta cuenta no tiene autorización para ver las métricas del estudio.',
};

/**
 * Pide las filas de métricas al backend con la credencial de la sesión.
 * Nunca lanza; el estado real viaja en el resultado tipado.
 */
export async function consultarMetricasAdmin(
  credencial: string,
  opciones: { endpoint: string; fetchImpl?: FetchLike; timeoutMs?: number },
): Promise<ResultadoMetricasAdmin> {
  const endpoint = String(opciones.endpoint || '').trim();
  if (!endpoint) {
    return { ok: false, motivo: 'sin-endpoint', mensaje: MENSAJES_METRICAS['sin-endpoint'] };
  }
  if (!String(credencial || '').trim()) {
    return { ok: false, motivo: 'credencial', mensaje: MENSAJES_METRICAS.credencial };
  }

  const doFetch: FetchLike = opciones.fetchImpl ?? ((input, init) => fetch(input, init));
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), opciones.timeoutMs ?? 25000);

  try {
    const res = await doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ tipo: 'metricas_admin', credential: credencial }),
      redirect: 'follow',
      signal: controlador.signal,
    });
    const data = parseGasResponse(await res.text());
    if (!data) {
      return { ok: false, motivo: 'red', mensaje: MENSAJES_METRICAS.red };
    }
    if (data.success === true && Array.isArray(data.filas)) {
      return { ok: true, filas: validarFilasMetricas(data.filas), backendActivo: true };
    }
    // Web App viejo (sin la acción): doGet responde {ok:true,message:...} sin `success`.
    if (data.success === undefined && data.ok === true) {
      return { ok: false, motivo: 'sin-actualizar', mensaje: MENSAJES_METRICAS['sin-actualizar'] };
    }
    const error = String(data.error || '').toLowerCase();
    if (error.includes('credencial') || error.includes('token') || error.includes('vencid')) {
      return { ok: false, motivo: 'credencial', mensaje: MENSAJES_METRICAS.credencial };
    }
    if (error.includes('autoriz') || error.includes('email')) {
      return { ok: false, motivo: 'no-autorizado', mensaje: MENSAJES_METRICAS['no-autorizado'] };
    }
    return { ok: false, motivo: 'backend', mensaje: MENSAJES_METRICAS.backend };
  } catch {
    return { ok: false, motivo: 'red', mensaje: MENSAJES_METRICAS.red };
  } finally {
    clearTimeout(temporizador);
  }
}
