/**
 * Contrato de comunicación con los backends de Google Apps Script.
 *
 * Garantía central: la interfaz NUNCA afirma un guardado/publicación que no
 * pueda verificar. Los tres estados posibles son:
 *
 *  - 'guardado' / 'publicada': el backend respondió JSON legible con éxito.
 *  - 'pendiente':  la respuesta no se pudo leer (CORS, red, wrapper HTML de
 *                  Apps Script) o el backend reportó recepción sin publicación.
 *  - 'error':      el backend respondió un error explícito.
 *
 * Los backends del repo (google-apps-script/gallery-server.gs para RSVP y
 * photo-server.gs para fotos) responden siempre JSON: { success, ... } o
 * { error }. Este módulo interpreta esa respuesta de forma tolerante.
 */

export type ResultadoRsvp = 'guardado' | 'pendiente' | 'error'
export type ResultadoFoto = 'publicada' | 'pendiente' | 'error'

/**
 * Lee el body de una respuesta de Apps Script como JSON.
 * Tolera el wrapper HTML que Google agrega en algunas redirecciones
 * (extrae el primer objeto JSON embebido). Devuelve null si no hay JSON.
 */
export function parseGasResponse(text: string): Record<string, unknown> | null {
  if (!text) return null
  try {
    const parsed = JSON.parse(text)
    return esObjetoRespuesta(parsed) ? (parsed as Record<string, unknown>) : null
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        return esObjetoRespuesta(parsed) ? (parsed as Record<string, unknown>) : null
      } catch { return null }
    }
    return null
  }
}

/** Solo objetos planos cuentan como respuesta de backend (no arrays/escalars). */
function esObjetoRespuesta(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Variante async para un Response ya obtenido. */
export async function parseGasResponseBody(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return parseGasResponse(await res.text())
  } catch {
    return null
  }
}

/**
 * Interpreta la respuesta del backend de RSVP.
 *  - success true                     → 'guardado' (verificable)
 *  - success false con error          → 'error'
 *  - JSON ilegible / vacío / otro     → 'pendiente'
 */
export function interpretarRespuestaRsvp(data: Record<string, unknown> | null): ResultadoRsvp {
  if (!data) return 'pendiente'
  if (data.success === true) return 'guardado'
  if (data.error) return 'error'
  if (data.success === false) return 'error'
  return 'pendiente'
}

/**
 * Interpreta la respuesta del backend de fotos (photo-server.gs).
 *  - success true + estado 'pendiente'   → 'pendiente' (moderación activa)
 *  - success true + url                  → 'publicada' (solo backends legacy
 *    que publican al instante; el backend actual devuelve estado pendiente)
 *  - success false / error               → 'error'
 *  - JSON ilegible / vacío               → 'error' (no hubo confirmación de
 *    recepción: si el chunking falló a mitad, la foto no está en el backend)
 */
export function interpretarRespuestaFoto(data: Record<string, unknown> | null): ResultadoFoto {
  if (!data) return 'error'
  if (data.success !== true) return 'error'
  if (data.estado === 'pendiente') return 'pendiente'
  if (typeof data.url === 'string' && data.url) return 'publicada'
  if (data.estado === 'aprobada' || data.estado === 'publicada') return 'publicada'
  return 'error'
}
