// ============================================================
// ESQUEMA DE CONFIGURACIÓN — solo tipos, sin datos
// ------------------------------------------------------------
// Los tipos de SiteConfig viven acá para que cualquier módulo
// (demos, personalizador, invitación) pueda tiparse SIN importar
// la configuración operativa (src/data/config.ts), que nunca debe
// entrar al grafo del cliente: sus literales terminarían embebidos
// en los bundles públicos aunque luego se sobrescriban.
// ============================================================

export interface TimelineEvent {
  hora: string
  titulo: string
  desc: string
  icono: string
}

export interface GalleryPhoto {
  webp: string
  fallback: string
  objectPosition?: { desktop: string; mobile: string }
}

/**
 * Secciones prendibles/apagables de la invitación. Todo opcional:
 * una config sin `secciones` muestra todo (compatibilidad con invitaciones
 * ya publicadas y con las demos).
 */
export interface SeccionesConfig {
  /** Sobre animado de apertura. En demos/previews sin esto se salta. */
  sobre?: boolean
  /** Cuenta regresiva (#detalles) */
  cuentaRegresiva?: boolean
  /** Cronograma de la noche (Timeline) */
  cronograma?: boolean
  /** Galería de fotos */
  galeria?: boolean
  /** Módulo de música (Spotify) */
  musica?: boolean
  /** Formulario de confirmación de asistencia */
  confirmacion?: boolean
  /** Bloque de regalos y datos bancarios (vive dentro de Confirmación) */
  regalos?: boolean
}

export interface SiteConfig {
  /** Public preview mode: external RSVP/photo submissions are disabled. */
  modoDemo?: boolean;
  /** Solo demos: nombre del diseño del catálogo, mostrado en la pantalla de carga. */
  demoNombreDiseno?: string;
  /** Secciones prendidas/apagadas (ausente = todas prendidas) */
  secciones?: SeccionesConfig;
  /** Apertura animada elegida (id de APERTURAS_META; ausente = sobre clásico) */
  apertura?: { tipo: string };
  /** true = el cliente cargó su propia foto de portada (sobre y fondo la usan) */
  portadaPersonalizada?: boolean;
  /** Sección de Instagram (se muestra solo si `usuario` está cargado) */
  instagram?: { usuario: string; url: string };
  evento: {
    tipo: string
    nombre: string
    apellido: string
    apodo: string
    fecha: string
    anio: string
    fechaEvento: string
    /** Duración estimada del evento en horas (para el botón de calendario; default 5) */
    duracionHoras?: number
    lugar: string
    ubicacion: string
    direccion: string
    /** Texto del código de vestimenta (default: "Gala / Elegante") */
    dressCode?: string
    mapsUrl: string
    mapsEmbedUrl?: string
    hashtag: string
    hashtagUrl: string
  }
  dedicatoria: {
    cita: string
    cuerpo: string
    firma: string
  }
  timeline: {
    titulo: string
    subtitulo: string
    eventos: TimelineEvent[]
  }
  galeria: {
    titulo: string
    subtitulo: string
    botonSubir: string
    photoUploadUrl: string
    fotos: GalleryPhoto[]
  }
  musica: {
    titulo: string
    subtitulo: string
    playlistUrl: string
    embedUrl: string
    botonAgregar: string
    botonSpotify: string
  }
  rsvp: {
    titulo: string
    subtitulo: string
    fechaLimite: string
    fechaLimiteFull: string
    googleSheetUrl: string
    hostPhone: string
    /** Slug de la invitación publicada (inyectado al publicar): permite que el backend
     *  de RSVP espeje la confirmación en content/rsvps/<slug>.json por commit. */
    slugInvitacion?: string
    regalos: {
      titulo: string
      subtitulo: string
      abitab: { titulo: string; numero: string }
      miDinero: { titulo: string; numero: string; numeroInterbancario?: string; sucursal?: string }
    }
  }
  footer: {
    apodo: string
    ubicacion: string
    frase: string
  }
  invitacion: {
    imagen: string
    imagenFallback: string
    textoAbrir: string
  }
  countdown: {
    titulo: string
    labels: { D: string; H: string; M: string; S: string }
    botonCalendario: string
    calendarioTitulo: string
    calendarioLocation: string
    calendarioDetalles: string
  }
  fondo: {
    fotos: string[]
    /** Posición de recorte por foto del slideshow (desktop/mobile), opcional */
    posiciones?: { desktop: string; mobile: string }[]
  }
  colores: {
    principal: string
    dorado: string
    doradoClaro: string
    marfil: string
    fondo: string
  }
  estilos: {
    modeloComposicion?: string
    fuenteTitulo: string
    fuenteCuerpo: string
    fuenteCursiva: string
    modeloReloj: string
    estiloTarjetas: string
    estiloBotones: string
    /** true = tema de fondo claro (ajusta overlays, sombras y adornos) */
    modoClaro?: boolean
    /** Set de adornos SVG temáticos de la miniatura (rosas, luna-estrellas, etc.) */
    adorno?: string
  }
}
