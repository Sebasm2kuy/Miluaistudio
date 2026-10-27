/**
 * PRECIO — única fuente de verdad para toda la web.
 * Portada, catálogo, personalizador y preguntas frecuentes leen de acá.
 * ⚠️ No cambies el importe sin actualizar también la publicación de
 * Mercado Libre (src/data/contacto.ts → MERCADO_LIBRE_URL).
 */
export const PRECIO = {
  /** Monto numérico (para cálculos o estructuras futuras) */
  monto: 1200,
  /** Moneda del pago */
  moneda: 'UYU',
  /** Texto listo para mostrar en la interfaz */
  texto: '$ 1.200 UYU',
  /** Condición comercial */
  condicion: 'Pago único',
  /** Qué incluye, en una línea (coherente con el personalizador) */
  incluye: 'Diseño personalizado con tus datos, apertura animada, música, galería, RSVP y publicación con tu enlace final',
} as const;
