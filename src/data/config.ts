// ============================================================
// CONFIGURACIÓN CENTRAL — Editá todo desde acá o desde /admin
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
  /** Música de fondo en loop (ausente = sin música de fondo) */
  musicaFondo?: { tono: string; url: string };
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


// ============================================================
// VALORES — PLANTILLA NEUTRA (sin datos de celebraciones reales)
// ------------------------------------------------------------
// Esta configuración base NO debe contener datos personales de un evento
// real: es el punto de partida del panel /admin. Los datos de cada cliente
// se cargan desde el panel y se publican sobre esta plantilla.
// Las demostraciones públicas usan src/data/demo-config.ts, que ya garantiza
// su propia separación (sin teléfonos, sin endpoints, sin datos bancarios).
// ============================================================
const config: SiteConfig = {
  "evento": {
    "tipo": "Mis XV Años",
    "nombre": "Valentina",
    "apellido": "",
    "apodo": "Vale",
    "fecha": "Sábado 12 de Junio",
    "anio": "2027",
    "fechaEvento": "2027-06-12 21:00",
    "duracionHoras": 5,
    "lugar": "Nombre del salón",
    "ubicacion": "Montevideo",
    "direccion": "",
    "mapsUrl": "https://maps.google.com/?q=Montevideo%2C+Uruguay",
    "hashtag": "#ValentinaXV2027",
    "hashtagUrl": "https://www.instagram.com/explore/tags/ValentinaXV2027/"
  },
  "dedicatoria": {
    "cita": "Hay momentos que no se repiten, personas que no se olvidan y recuerdos que se guardan para siempre en el corazón.",
    "cuerpo": "Cada persona que está leyendo esto es parte importante de mi historia. Los esperamos con toda la emoción del mundo para compartir juntos esta noche tan especial.",
    "firma": "Valentina"
  },
  "timeline": {
    "titulo": "La Noche",
    "subtitulo": "Cada momento cuenta",
    "eventos": [
      {
        "hora": "21:00",
        "titulo": "Recepción",
        "desc": "Cóctel de bienvenida y catering",
        "icono": "🥂"
      },
      {
        "hora": "22:00",
        "titulo": "Ingreso de la cumpleañera",
        "desc": "Vals y comienzo de la fiesta",
        "icono": "👑"
      },
      {
        "hora": "22:30",
        "titulo": "Discoteca",
        "desc": "A bailar toda la noche",
        "icono": "💃"
      },
      {
        "hora": "23:00",
        "titulo": "Espejo Mágico",
        "desc": "Las mejores fotos (2 hs)",
        "icono": "📸"
      },
      {
        "hora": "03:00",
        "titulo": "Torta y Velas",
        "desc": "Brindis y momento especial",
        "icono": "🎂"
      },
      {
        "hora": "04:00",
        "titulo": "Café de cierre",
        "desc": "Agradecemos su presencia",
        "icono": "☕"
      }
    ]
  },
  "galeria": {
    "titulo": "Galería",
    "subtitulo": "Momentos que hacen esta celebración inolvidable",
    "botonSubir": "Dejale un recuerdo",
    "photoUploadUrl": "",
    "fotos": [
      {
        "webp": "/Miluaistudio/catalogo/galeria/rosa-romantica-1.jpg",
        "fallback": "/Miluaistudio/catalogo/galeria/rosa-romantica-1.jpg",
        "objectPosition": {
          "desktop": "12% 50%",
          "mobile": "12% 50%"
        }
      },
      {
        "webp": "/Miluaistudio/catalogo/galeria/rosa-romantica-2.jpg",
        "fallback": "/Miluaistudio/catalogo/galeria/rosa-romantica-2.jpg",
        "objectPosition": {
          "desktop": "23% 50%",
          "mobile": "23% 50%"
        }
      },
      {
        "webp": "/Miluaistudio/catalogo/galeria/rosa-romantica-3.jpg",
        "fallback": "/Miluaistudio/catalogo/galeria/rosa-romantica-3.jpg",
        "objectPosition": {
          "desktop": "90% 50%",
          "mobile": "90% 50%"
        }
      },
      {
        "webp": "/Miluaistudio/catalogo/galeria/rosa-romantica-4.jpg",
        "fallback": "/Miluaistudio/catalogo/galeria/rosa-romantica-4.jpg",
        "objectPosition": {
          "desktop": "50% 0%",
          "mobile": "50% 0%"
        }
      }
    ]
  },
  "musica": {
    "titulo": "Nuestra Playlist",
    "subtitulo": "Escuchá nuestra selección y ayudanos con la música de la noche",
    "playlistUrl": "https://open.spotify.com/",
    "embedUrl": "https://open.spotify.com/embed/",
    "botonAgregar": "Agregar canciones",
    "botonSpotify": "Hagamos una playlist en equipo"
  },
  "rsvp": {
    "titulo": "Confirmar",
    "subtitulo": "Espero poder contar contigo para hacer de esta noche algo inolvidable.",
    "fechaLimite": "",
    "fechaLimiteFull": "",
    "googleSheetUrl": "",
    "hostPhone": "",
    "regalos": {
      "titulo": "Regalos",
      "subtitulo": "Si deseas tener un detalle conmigo, te dejo las opciones donde podés hacerlo.",
      "abitab": {
        "titulo": "",
        "numero": ""
      },
      "miDinero": {
        "titulo": "",
        "numero": "",
        "numeroInterbancario": "",
        "sucursal": ""
      }
    }
  },
  "footer": {
    "apodo": "Vale",
    "ubicacion": "Montevideo • Uruguay • 2027",
    "frase": "Con amor, para un día inolvidable"
  },
  "invitacion": {
    "imagen": "/Miluaistudio/invitacion-vertical.webp",
    "imagenFallback": "/Miluaistudio/invitacion-vertical.png",
    "textoAbrir": "Toca para abrir"
  },
  "countdown": {
    "titulo": "El tiempo vuela...",
    "labels": {
      "D": "Días",
      "H": "Horas",
      "M": "Min",
      "S": "Seg"
    },
    "botonCalendario": "Agregar al calendario",
    "calendarioTitulo": "Mis XV Años de Valentina",
    "calendarioLocation": "Nombre del salón, Montevideo, Uruguay",
    "calendarioDetalles": "Mis XV Años\nNombre del salón, Montevideo\n21:00 hs\n\n¡Nos vemos!"
  },
  "fondo": {
    "fotos": [
      "/Miluaistudio/catalogo/galeria/rosa-romantica-1.jpg",
      "/Miluaistudio/catalogo/galeria/rosa-romantica-2.jpg",
      "/Miluaistudio/catalogo/galeria/rosa-romantica-3.jpg",
      "/Miluaistudio/catalogo/galeria/rosa-romantica-4.jpg"
    ]
  },
  "colores": {
    "principal": "#3d0202",
    "dorado": "#b8860b",
    "doradoClaro": "#d4af37",
    "marfil": "#fdfcfb",
    "fondo": "#050505"
  },
  "estilos": {
    "fuenteTitulo": "playfair",
    "fuenteCuerpo": "montserrat",
    "fuenteCursiva": "alex-brush",
    "modeloReloj": "classic",
    "estiloTarjetas": "gold-border",
    "estiloBotones": "gold-gradient"
  }
} as SiteConfig

export default config
