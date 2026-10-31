// ============================================================
// CONFIGURACIÓN OPERATIVA — PLANTILLA PRIVADA
// ------------------------------------------------------------
// ⚠️ Este archivo es la plantilla de partida del panel /admin y
// el archivo que /admin sobrescribe al desplegar (github-deploy).
// Puede contener datos operativos o privados de un evento real:
//
//   NADIE DEBE IMPORTAR SU EXPORT POR DEFECTO EN CÓDIGO CLIENTE.
//
// - Las demostraciones públicas usan src/data/demo-config.ts,
//   que es 100% autocontenida y no importa este módulo.
// - Los componentes cliente importan los tipos desde
//   src/data/config-schema.ts (solo tipos, se borran al compilar).
// - tests/privacidad-config.test.ts y scripts/verify-privacy-export.mjs
//   fallan si algún literal de este archivo reaparece en out/.
//
// Los valores de abajo son canarios sintéticos de plantilla:
// deliberadamente distintos de los perfiles de demostración para
// que las pruebas puedan distinguirlos. NO son datos reales.
// ============================================================

import type { SiteConfig } from './config-schema';

// Los tipos se re-exportan SOLO como tipos: se borran al compilar y
// no arrastran este módulo a ningún bundle de cliente.
export type { SiteConfig, TimelineEvent, GalleryPhoto, SeccionesConfig } from './config-schema';

const config: SiteConfig = {
  "evento": {
    "tipo": "Mis XV Años",
    "nombre": "NombreEjemplo",
    "apellido": "",
    "apodo": "ApodoPlantilla",
    "fecha": "Sábado 12 de Junio",
    "anio": "2027",
    "fechaEvento": "2027-06-12 21:00",
    "duracionHoras": 5,
    "lugar": "Nombre del salón",
    "ubicacion": "Montevideo",
    "direccion": "",
    "mapsUrl": "https://maps.google.com/?q=Montevideo%2C+Uruguay",
    "hashtag": "#EjemploPrivado2027",
    "hashtagUrl": "https://www.instagram.com/explore/tags/EjemploPrivado2027/"
  },
  "dedicatoria": {
    "cita": "Hay momentos que no se repiten, personas que no se olvidan y recuerdos que se guardan para siempre en el corazón.",
    "cuerpo": "Cada persona que está leyendo esto es parte importante de mi historia. Los esperamos con toda la emoción del mundo para compartir juntos esta noche tan especial.",
    "firma": "NombreEjemplo"
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
        "webp": "/catalogo/galeria/rosa-romantica-1.jpg",
        "fallback": "/catalogo/galeria/rosa-romantica-1.jpg",
        "objectPosition": {
          "desktop": "12% 50%",
          "mobile": "12% 50%"
        }
      },
      {
        "webp": "/catalogo/galeria/rosa-romantica-2.jpg",
        "fallback": "/catalogo/galeria/rosa-romantica-2.jpg",
        "objectPosition": {
          "desktop": "23% 50%",
          "mobile": "23% 50%"
        }
      },
      {
        "webp": "/catalogo/galeria/rosa-romantica-3.jpg",
        "fallback": "/catalogo/galeria/rosa-romantica-3.jpg",
        "objectPosition": {
          "desktop": "90% 50%",
          "mobile": "90% 50%"
        }
      },
      {
        "webp": "/catalogo/galeria/rosa-romantica-4.jpg",
        "fallback": "/catalogo/galeria/rosa-romantica-4.jpg",
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
    "apodo": "ApodoPlantilla",
    "ubicacion": "Montevideo • Uruguay • 2027",
    "frase": "Con amor, para un día inolvidable"
  },
  "invitacion": {
    "imagen": "/invitacion-vertical.webp",
    "imagenFallback": "/invitacion-vertical.jpg",
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
    "calendarioTitulo": "Evento de ejemplo (plantilla privada)",
    "calendarioLocation": "Nombre del salón, Montevideo, Uruguay",
    "calendarioDetalles": "Mis XV Años\nNombre del salón, Montevideo\n21:00 hs\n\n¡Nos vemos!"
  },
  "fondo": {
    "fotos": [
      "/catalogo/galeria/rosa-romantica-1.jpg",
      "/catalogo/galeria/rosa-romantica-2.jpg",
      "/catalogo/galeria/rosa-romantica-3.jpg",
      "/catalogo/galeria/rosa-romantica-4.jpg"
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
