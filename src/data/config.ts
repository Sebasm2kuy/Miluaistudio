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
}

export interface SiteConfig {
  evento: {
    tipo: string
    nombre: string
    apellido: string
    apodo: string
    fecha: string
    anio: string
    fechaEvento: string
    lugar: string
    ubicacion: string
    direccion: string
    mapsUrl: string
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
      miDinero: { titulo: string; numero: string }
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
  }
  colores: {
    principal: string
    dorado: string
    doradoClaro: string
    marfil: string
    fondo: string
  }
  estilos: {
    fuenteTitulo: string
    fuenteCuerpo: string
    fuenteCursiva: string
    modeloReloj: string
    estiloTarjetas: string
    estiloBotones: string
  }
}


// ============================================================
// VALORES — Auto-generated from admin panel
// ============================================================
const config: SiteConfig = {
  "evento": {
    "tipo": "Mis XV Años",
    "nombre": "Milagros",
    "apellido": "Cabrera",
    "apodo": "Milu",
    "fecha": "Sábado 22 de Agosto",
    "anio": "2026",
    "fechaEvento": "2026-08-22 21:00",
    "lugar": "Salón My Father",
    "ubicacion": "Montevideo",
    "direccion": "Granaderos 3875, Montevideo",
    "mapsUrl": "https://maps.app.goo.gl/uXq5HCuF54u8DqJj8",
    "hashtag": "#MilagrosXV2026",
    "hashtagUrl": "https://www.instagram.com/explore/tags/MilagrosXV2026/"
  },
  "dedicatoria": {
    "cita": "Hay momentos que no se repiten, personas que no se olvidan y recuerdos que se guardan para siempre en el corazón.",
    "cuerpo": "Cada persona que está leyendo esto es parte importante de mi historia. Los esperamos con toda la emoción del mundo para compartir juntos esta noche tan especial.",
    "firma": "Milagros"
  },
  "timeline": {
    "titulo": "La Noche",
    "subtitulo": "Cada momento cuenta",
    "eventos": [
      {
        "hora": "21:00",
        "titulo": "Recepción",
        "desc": "Ingreso de invitados",
        "icono": "🥂"
      },
      {
        "hora": "22:00",
        "titulo": "Mi Ingreso",
        "desc": "La noche comienza",
        "icono": "👑"
      },
      {
        "hora": "02:00",
        "titulo": "Espejo Mágico",
        "desc": "Las mejores fotos",
        "icono": "📸"
      }
    ]
  },
  "galeria": {
    "titulo": "Galería",
    "subtitulo": "Momentos que hacen esta celebración inolvidable",
    "botonSubir": "Dejale un recuerdo",
    "fotos": [
      {
        "webp": "/Miluaistudio/gallery/gallery1.webp",
        "fallback": "/Miluaistudio/gallery/gallery1.jpg"
      },
      {
        "webp": "/Miluaistudio/gallery/gallery2.webp",
        "fallback": "/Miluaistudio/gallery/gallery2.jpg"
      },
      {
        "webp": "/Miluaistudio/gallery/gallery3.webp",
        "fallback": "/Miluaistudio/gallery/gallery3.jpg"
      },
      {
        "webp": "/Miluaistudio/gallery/gallery4.webp",
        "fallback": "/Miluaistudio/gallery/gallery4.jpg"
      }
    ]
  },
  "musica": {
    "titulo": "Nuestra Playlist",
    "subtitulo": "Escuchá nuestra selección y ayudanos con la música de la noche",
    "playlistUrl": "https://open.spotify.com/playlist/4RAVjizGdBtJx18kkwttqn?si=cefb9bcb1cdf470c&pt=c7fa8ec582e71775cd0ebda794d251d0",
    "embedUrl": "https://open.spotify.com/embed/playlist/4RAVjizGdBtJx18kkwttqn?utm_source=generator&theme=0&si=cefb9bcb1cdf470c&pt=c7fa8ec582e71775cd0ebda794d251d0",
    "botonAgregar": "Agregar canciones",
    "botonSpotify": "Abre en Spotify y suma tus temas favoritos"
  },
  "rsvp": {
    "titulo": "Confirmar",
    "subtitulo": "Espero poder contar contigo para hacer de esta noche algo inolvidable.",
    "fechaLimite": "10/08",
    "fechaLimiteFull": "10/08/2026",
    "googleSheetUrl": "https://script.google.com/macros/s/AKfycbxOPx5jE1vcgW4nUfXWDkbKqQU8Ejex9RLI4rv64yZweZLFEiKrCoDj_8b7fryti3Sn/exec",
    "hostPhone": "59895239386",
    "regalos": {
      "titulo": "Regalos",
      "subtitulo": "Si deseas tener un detalle conmigo, te dejo las opciones donde podés hacerlo.",
      "abitab": {
        "titulo": "Cuenta Abitab",
        "numero": "145920"
      },
      "miDinero": {
        "titulo": "Cuenta Mi Dinero",
        "numero": "2401461"
      }
    }
  },
  "footer": {
    "apodo": "Milu",
    "ubicacion": "Montevideo • Uruguay • 2026",
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
    "calendarioTitulo": "XV Años de Milagros",
    "calendarioLocation": "Salón My Father, Granaderos 3875, Montevideo",
    "calendarioDetalles": "XV Años de Milagros Cabrera\nSalón My Father - Granaderos 3875, Montevideo\n21:00 hs\n\n¡Nos vemos!"
  },
  "fondo": {
    "fotos": [
      "/Miluaistudio/gallery/gallery1.webp",
      "/Miluaistudio/gallery/gallery2.webp",
      "/Miluaistudio/gallery/gallery3.webp",
      "/Miluaistudio/gallery/gallery4.webp"
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
    "modeloReloj": "minimal",
    "estiloTarjetas": "glass",
    "estiloBotones": "gold-gradient"
  }
} as SiteConfig

export default config
