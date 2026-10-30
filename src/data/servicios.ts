/**
 * Servicios extra que Lumen Gala va a desarrollar a futuro (colección
 * «próximamente»). Se muestran en la portada para que el sitio comunique
 * todo lo que viene; NINGUNO está disponible todavía, por eso cada uno
 * lleva el badge «Próximamente» y la CTA consulta/aviso por WhatsApp.
 *
 * Textos 100% propios (no copian ninguna web de referencia).
 */

export interface ServicioExtra {
  id: string;
  nombre: string;
  /** Frase corta bajo el nombre (una línea) */
  tagline: string;
  /** Descripción del servicio (2-3 líneas) */
  desc: string;
  /** Qué incluye, en bullets cortos */
  puntos: string[];
}

export const SERVICIOS_EXTRA: ServicioExtra[] = [
  {
    id: 'album-digital',
    nombre: 'Álbum digital del evento',
    tagline: 'Las fotos de todos tus invitados, en un solo lugar',
    desc:
      'Un álbum web con enlace y QR propios: tus invitados suben las fotos y los videos que sacaron en la fiesta, y todo queda junto, ordenado y listo para revivir cuando quieras.',
    puntos: [
      'Subida desde el celu con un enlace o QR',
      'Revisás y elegís qué fotos quedan',
      'Descargá el álbum completo al finalizar',
    ],
  },
  {
    id: 'edicion-video',
    nombre: 'Edición de video',
    tagline: 'Tus clips y fotos, convertidos en un video prolijo',
    desc:
      'Nos pasás los videos y las fotos crudas de tu evento y los devolvemos editados con la música que elijas: un video digno de proyectar en el salón o de subir a redes.',
    puntos: [
      'Montaje con la música que elijas',
      'Ideal para el ingreso, el vals o el brindis',
      'Entrega en formato vertical y horizontal',
    ],
  },
  {
    id: 'video-historia',
    nombre: 'Video de tu historia',
    tagline: 'Un recorrido por tus mejores momentos, hasta hoy',
    desc:
      'Una recopilación emotiva que cuenta tu historia en orden: desde las fotos de siempre hasta los videos más recientes, con textos y música que acompañan cada etapa.',
    puntos: [
      'Recorrido cronológico con textos y música',
      'Perfecto para sorprender durante la fiesta',
      'Versiones cortas listas para Reels',
    ],
  },
  {
    id: 'trailer-evento',
    nombre: 'Tráiler de tu evento',
    tagline: 'Un adelanto que deja a todos con ganas de más',
    desc:
      'Un video estilo cine con los momentos más lindos de tu preparación o de la invitación misma, pensado para compartir por WhatsApp antes de la fecha.',
    puntos: [
      'Estilo cinematográfico con tus imágenes',
      'Funciona como save the date animado',
      'Hecho para verse primero en el celular',
    ],
  },
];

/** Mensaje de WhatsApp para la CTA de la sección de servicios */
export const MENSAJE_SERVICIOS_EXTRA =
  'Hola! Vi los servicios extra de Lumen Gala (álbum digital, edición de video, video de historia y tráiler) y quiero saber más / reservar para mi evento.';
