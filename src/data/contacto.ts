// ============================================================
// CANALES DE CONTACTO — Editá todo desde acá
// ------------------------------------------------------------
// Este archivo es la ÚNICA fuente de verdad para los botones
// de contacto de toda la web (portada, catálogo y tarjetas).
// ============================================================

/**
 * Número de WhatsApp del negocio.
 * Formato internacional SIN "+", SIN espacios ni guiones:
 *   código de país + número de celular
 * Ejemplo Uruguay: 598 + 95 239 386  →  59895239386
 *
 * ⬇️ CAMBIÁ EL NÚMERO ACÁ ⬇️
 */
export const WHATSAPP_NUMERO = '59895239386';

/** Mensaje pre-cargado cuando la consulta no es por un diseño puntual */
export const WHATSAPP_MENSAJE_GENERAL =
  'Hola! Me interesan las invitaciones digitales de Lumen Gala. ¿Me pasás más info?';

/** Construye el enlace wa.me con el mensaje pre-cargado y codificado */
export function whatsappLink(mensaje: string): string {
  return 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(mensaje);
}

/**
 * Enlace de WhatsApp con mensaje por diseño:
 * "Hola! Me interesa la invitación [Nombre del diseño]"
 */
export function whatsappLinkDiseno(nombreDiseno: string): string {
  return whatsappLink(
    'Hola! Me interesa la invitación ' + nombreDiseno + '. ¿Me pasás más info?'
  );
}
