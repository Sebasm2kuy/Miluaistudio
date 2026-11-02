// ============================================================
// CLIENTE DEL REGISTRO AUTOMÁTICO DE CLIENTES (iteración 036)
// ------------------------------------------------------------
// Envía la credencial de Google al backend de Apps Script
// (src/data/registro-auto.ts) para que dé de alta la cuenta sin
// aprobación manual. El backend es quien verifica el id_token con
// Google (tokeninfo) y escribe en GitHub; acá solo viaja el POST.
//
// Garantías (mismas que rsvp-client.ts):
//  - La credencial viaja SOLO en el cuerpo de la solicitud, nunca en
//    la query string. Content-Type text/plain (solicitud "simple"):
//    no dispara el preflight que Apps Script no responde.
//  - Nunca se usa mode: 'no-cors' ni respuestas opacas.
//  - Timeout con AbortController: sin respuesta verificable → error
//    honesto (el usuario puede reintentar o usar el fallback).
//  - fetch inyectable para pruebas: nada toca la red en la suite.
// ============================================================

import { parseGasResponse } from './contrato-backend';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type ResultadoRegistroCliente =
  | { ok: true; nuevo: boolean; email: string; nombre: string; slug: string }
  | {
      ok: false;
      motivo: 'credencial' | 'sin-endpoint' | 'red' | 'backend';
      mensaje: string;
    };

export interface OpcionesRegistroCliente {
  /** URL del Web App de Apps Script con la acción registro_cliente. */
  endpoint: string;
  /** Inyectable para pruebas (por defecto, fetch global). */
  fetchImpl?: FetchLike;
  /** Milisegundos máximos de espera (default 20000: el backend hace GET+PUT a GitHub). */
  timeoutMs?: number;
}

/** Mensaje genérico si la respuesta no es verificable. */
const MENSAJE_RED = 'No se pudo confirmar el registro con el servidor. Probá de nuevo en unos segundos.';

/** Recorta un texto del backend a un largo razonable para mostrar en UI. */
function mensajeBackend(texto: unknown): string {
  const limpio = String(texto || '').trim().slice(0, 200);
  return limpio || MENSAJE_RED;
}

/**
 * Pide el alta automática al backend. Nunca lanza: cualquier problema
 * (configuración, red, timeout, backend) devuelve un resultado tipado.
 */
export async function registrarClienteGoogle(
  credencial: string,
  opciones: OpcionesRegistroCliente,
): Promise<ResultadoRegistroCliente> {
  if (!credencial) {
    return { ok: false, motivo: 'credencial', mensaje: 'No hay credencial de Google para registrar.' };
  }
  const endpoint = String(opciones.endpoint || '').trim();
  if (!endpoint) {
    return {
      ok: false,
      motivo: 'sin-endpoint',
      mensaje: 'El registro automático no está configurado en el sitio.',
    };
  }

  const doFetch: FetchLike = opciones.fetchImpl ?? ((input, init) => fetch(input, init));

  // El backend hace GET + PUT a GitHub (y reintentos): margen más amplio que el RSVP.
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), opciones.timeoutMs ?? 20000);

  try {
    const res = await doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ tipo: 'registro_cliente', credential: credencial }),
      redirect: 'follow',
      signal: controlador.signal,
    });

    // Apps Script responde JSON directo o envuelto en HTML tras redirigir
    // a googleusercontent.com; parseGasResponse tolera ambos.
    const data = parseGasResponse(await res.text());
    if (!data) {
      return { ok: false, motivo: 'backend', mensaje: MENSAJE_RED };
    }
    if (data.success !== true) {
      return { ok: false, motivo: 'backend', mensaje: mensajeBackend(data.error) };
    }

    const email = typeof data.email === 'string' ? data.email.trim() : '';
    const nombre = typeof data.nombre === 'string' ? data.nombre.trim() : '';
    const slug = typeof data.slug === 'string' ? data.slug.trim().toLowerCase() : '';
    if (!email || !slug) {
      return { ok: false, motivo: 'backend', mensaje: MENSAJE_RED };
    }
    return {
      ok: true,
      nuevo: data.nuevo !== false,
      email,
      nombre,
      slug,
    };
  } catch {
    // Red caída, timeout (abort) o CORS: no se pudo confirmar nada.
    return { ok: false, motivo: 'red', mensaje: MENSAJE_RED };
  } finally {
    clearTimeout(temporizador);
  }
}
