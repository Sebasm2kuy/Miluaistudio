/**
 * Navegación superior de la portada (escritorio y menú móvil).
 *
 * Los servicios extra «próximamente» (src/data/servicios.ts) tienen su
 * propio ítem de menú: cada uno apunta al ancla de su tarjeta
 * (#servicio-<id>); al abrirse, la tarjeta se despliega mostrando el
 * badge «Próximamente» y el detalle (ver componentes/servicios-extras.tsx).
 *
 * Este archivo es la fuente única: los tests verifican que cada servicio
 * tenga su menú y que cada ancla de menú exista de verdad.
 */

export interface ItemNav {
  label: string;
  /** Ancla dentro de la portada (empieza con #) */
  href: string;
  /** true si el ítem corresponde a un servicio «próximamente» */
  servicio?: boolean;
}

export const ITEMS_NAV: ItemNav[] = [
  /* Primero lo disponible (producto real), al final la expansión futura:
     los 4 servicios «próximamente» siguen con su ítem y su ancla —contrato
     testado— pero ya no lideran el encabezado (iteración 032). */
  { label: 'Invitaciones', href: '#disenos' },
  { label: 'Preguntas', href: '#faq' },
  { label: 'Álbum digital', href: '#servicio-album-digital', servicio: true },
  { label: 'Videos', href: '#servicio-edicion-video', servicio: true },
  { label: 'Historia de vida', href: '#servicio-video-historia', servicio: true },
  { label: 'Tráiler', href: '#servicio-trailer-evento', servicio: true },
];

/**
 * Secciones de la portada a las que apunta la navegación (sin el #).
 * La página debe tener estos ids exactos; los tests y el E2E lo confirman.
 */
export const SECCIONES_PORTADA = ['disenos', 'coleccion', 'incluye', 'proceso', 'servicios', 'faq'] as const;

/** Prefijo de ancla de las tarjetas de servicio */
export const PREFIJO_ANCLA_SERVICIO = '#servicio-';
