// ============================================================
// EDITOR MÓVIL — registro de elementos editables
// ------------------------------------------------------------
// Mapa único entre lo que el usuario toca sobre la invitación y
// los campos de SiteConfig que ese elemento permite cambiar.
//  - ELEMENTOS_EDITABLES: elementos visibles que se tocan directo
//    (cada componente de la invitación referencia estos ids).
//  - PANELES_AJUSTES: ajustes estructurales sin representación
//    visual directa (colores, tipografías, secciones, fondo...).
// Sin React ni DOM para poder probar el registro con node:test.
// ============================================================

// Imports relativos (sin alias '@/') para que el módulo también entre al
// grafo de pruebas de node:test (tsconfig.tests.json no define paths).
import { FONT_OPTIONS, CLOCK_STYLES, CARD_STYLES, BUTTON_STYLES } from '../data/admin-options';
import { APERTURAS_META } from './aperturas';
import { TONOS_FONDO } from './musica';

export type TipoCampo =
  | 'texto'
  | 'texto-largo'
  | 'url'
  | 'fecha-evento'
  | 'numero'
  | 'color'
  | 'imagen'
  | 'opciones'
  | 'interruptor';

export interface CampoSpec {
  /** Ruta dentro de SiteConfig; '{idx}' se reemplaza por el índice del elemento */
  path: string[];
  label: string;
  tipo: TipoCampo;
  placeholder?: string;
  ayuda?: string;
  filas?: number;
  opciones?: { id: string; nombre: string }[];
}

export interface AccionSpec {
  tipo: 'quitar-foto' | 'agregar-foto' | 'quitar-momento' | 'agregar-momento';
  label: string;
  /** 'peligro' = acción destructiva (se pinta en rojo y pide confirmación) */
  tono?: 'normal' | 'peligro';
}

export interface GrupoCampos {
  id: string;
  /** Nombre que encabeza el panel al tocar el elemento */
  titulo: string;
  /** Explicación corta de qué representa el elemento tocado */
  desc?: string;
  campos: CampoSpec[];
  acciones?: AccionSpec[];
}

// ---------------------------------------------------------------------------
// Elementos tocables directamente sobre la invitación
// ---------------------------------------------------------------------------

const OPCIONES_FUENTES = FONT_OPTIONS.map((f) => ({ id: f.id, nombre: f.name }));
const OPCIONES_RELOJ = CLOCK_STYLES.map((o) => ({ id: o.id, nombre: o.name }));
const OPCIONES_TARJETAS = CARD_STYLES.map((o) => ({ id: o.id, nombre: o.name }));
const OPCIONES_BOTONES = BUTTON_STYLES.map((o) => ({ id: o.id, nombre: o.name }));
const OPCIONES_APERTURA = APERTURAS_META.map((a) => ({ id: a.id, nombre: a.nombre }));
const OPCIONES_TONO = TONOS_FONDO.map((t) => ({ id: t.id, nombre: t.nombre }));

const ADORNOS: { id: string; nombre: string }[] = [
  { id: 'rosas', nombre: 'Rosas' },
  { id: 'hojas-oro', nombre: 'Hojas de oro' },
  { id: 'flores-silvestres', nombre: 'Flores silvestres' },
  { id: 'luna-estrellas', nombre: 'Luna y estrellas' },
  { id: 'eucalipto', nombre: 'Eucalipto' },
  { id: 'mariposas', nombre: 'Mariposas' },
  { id: 'hojas-tropicales', nombre: 'Hojas tropicales' },
  { id: 'geometrico', nombre: 'Geométrico' },
  { id: 'rosas-coral', nombre: 'Rosas coral' },
];

export const ELEMENTOS_EDITABLES: Record<string, GrupoCampos> = {
  'portada.tipo': {
    id: 'portada.tipo',
    titulo: 'Tipo de evento',
    desc: 'El texto chico de la portada («Mis XV años», «Nuestra boda»...).',
    campos: [{ path: ['evento', 'tipo'], label: 'Tipo de evento', tipo: 'texto', placeholder: 'Mis XV años' }],
  },
  'portada.nombre': {
    id: 'portada.nombre',
    titulo: 'Nombre de la portada',
    desc: 'El nombre grande que abre la invitación.',
    campos: [{ path: ['evento', 'nombre'], label: 'Nombre', tipo: 'texto', placeholder: 'Nombre' }],
  },
  'portada.fecha': {
    id: 'portada.fecha',
    titulo: 'Fecha de la portada',
    desc: 'La línea con la fecha y el año debajo del nombre.',
    campos: [
      { path: ['evento', 'fecha'], label: 'Fecha (texto)', tipo: 'texto', placeholder: 'Sábado 14 de noviembre' },
      { path: ['evento', 'anio'], label: 'Año', tipo: 'texto', placeholder: '2026' },
    ],
  },
  'portada.lugar': {
    id: 'portada.lugar',
    titulo: 'Lugar de la portada',
    desc: 'Salón y ciudad que cierran la portada.',
    campos: [
      { path: ['evento', 'lugar'], label: 'Lugar / salón', tipo: 'texto' },
      { path: ['evento', 'ubicacion'], label: 'Ciudad o ubicación', tipo: 'texto' },
    ],
  },
  'dedicatoria.cita': {
    id: 'dedicatoria.cita',
    titulo: 'Frase de dedicatoria',
    desc: 'La cita entre comillas del mensaje principal.',
    campos: [{ path: ['dedicatoria', 'cita'], label: 'Cita', tipo: 'texto-largo', filas: 3 }],
  },
  'dedicatoria.cuerpo': {
    id: 'dedicatoria.cuerpo',
    titulo: 'Mensaje de dedicatoria',
    desc: 'El párrafo que acompaña a la cita.',
    campos: [{ path: ['dedicatoria', 'cuerpo'], label: 'Mensaje', tipo: 'texto-largo', filas: 5 }],
  },
  'dedicatoria.firma': {
    id: 'dedicatoria.firma',
    titulo: 'Firma de la dedicatoria',
    desc: 'Quién firma el mensaje, en letra cursiva.',
    campos: [{ path: ['dedicatoria', 'firma'], label: 'Firma', tipo: 'texto' }],
  },
  'detalles.titulo': {
    id: 'detalles.titulo',
    titulo: 'Título de la cuenta regresiva',
    campos: [{ path: ['countdown', 'titulo'], label: 'Título', tipo: 'texto' }],
  },
  'detalles.etiquetas': {
    id: 'detalles.etiquetas',
    titulo: 'Etiqueta de la cuenta regresiva',
    desc: 'Los textos que acompañan a los números (días, horas...).',
    campos: [
      { path: ['countdown', 'labels', 'D'], label: 'Días', tipo: 'texto' },
      { path: ['countdown', 'labels', 'H'], label: 'Horas', tipo: 'texto' },
      { path: ['countdown', 'labels', 'M'], label: 'Minutos', tipo: 'texto' },
      { path: ['countdown', 'labels', 'S'], label: 'Segundos', tipo: 'texto' },
    ],
  },
  'detalles.calendario': {
    id: 'detalles.calendario',
    titulo: 'Botón de calendario',
    desc: 'Texto del botón y datos que se agregan al calendario de los invitados.',
    campos: [
      { path: ['countdown', 'botonCalendario'], label: 'Texto del botón', tipo: 'texto' },
      { path: ['countdown', 'calendarioTitulo'], label: 'Título del evento', tipo: 'texto' },
      { path: ['countdown', 'calendarioLocation'], label: 'Ubicación', tipo: 'texto' },
      { path: ['countdown', 'calendarioDetalles'], label: 'Detalles', tipo: 'texto-largo', filas: 3 },
      { path: ['evento', 'duracionHoras'], label: 'Duración (horas)', tipo: 'numero' },
    ],
  },
  'ubicacion.fecha': {
    id: 'ubicacion.fecha',
    titulo: 'Fecha y hora del evento',
    desc: 'La usan la cuenta regresiva y el botón de calendario.',
    campos: [
      { path: ['evento', 'fecha'], label: 'Fecha (texto visible)', tipo: 'texto' },
      { path: ['evento', 'fechaEvento'], label: 'Fecha y hora real', tipo: 'fecha-evento', ayuda: 'Hora de Montevideo.' },
    ],
  },
  'ubicacion.lugar': {
    id: 'ubicacion.lugar',
    titulo: 'Salón y dirección',
    desc: 'Lo que muestra el bloque de ubicación.',
    campos: [
      { path: ['evento', 'lugar'], label: 'Salón / lugar', tipo: 'texto' },
      { path: ['evento', 'direccion'], label: 'Dirección', tipo: 'texto' },
    ],
  },
  'ubicacion.dresscode': {
    id: 'ubicacion.dresscode',
    titulo: 'Código de vestimenta',
    campos: [{ path: ['evento', 'dressCode'], label: 'Código de vestimenta', tipo: 'texto', placeholder: 'Gala / Elegante' }],
  },
  'ubicacion.boton': {
    id: 'ubicacion.boton',
    titulo: 'Botón «Cómo llegar»',
    desc: 'Enlace que abren los invitados en Google Maps.',
    campos: [{ path: ['evento', 'mapsUrl'], label: 'Enlace de Google Maps', tipo: 'url' }],
  },
  'ubicacion.mapa': {
    id: 'ubicacion.mapa',
    titulo: 'Mapa del evento',
    desc: 'El mapa embebido; la ciudad se usa cuando no hay enlace propio.',
    campos: [
      { path: ['evento', 'mapsEmbedUrl'], label: 'Enlace del mapa embebido (opcional)', tipo: 'url', ayuda: 'Si queda vacío se arma solo con la dirección.' },
    ],
  },
  'cronograma.titulo': {
    id: 'cronograma.titulo',
    titulo: 'Título del cronograma',
    campos: [
      { path: ['timeline', 'titulo'], label: 'Título', tipo: 'texto' },
      { path: ['timeline', 'subtitulo'], label: 'Subtítulo', tipo: 'texto' },
    ],
  },
  'cronograma.momento': {
    id: 'cronograma.momento',
    titulo: 'Momento del cronograma',
    desc: 'Una fila del cronograma de la noche.',
    campos: [
      { path: ['timeline', 'eventos', '{idx}', 'hora'], label: 'Hora', tipo: 'texto', placeholder: '21:00' },
      { path: ['timeline', 'eventos', '{idx}', 'titulo'], label: 'Título', tipo: 'texto' },
      { path: ['timeline', 'eventos', '{idx}', 'desc'], label: 'Descripción', tipo: 'texto' },
      { path: ['timeline', 'eventos', '{idx}', 'icono'], label: 'Ícono (emoji)', tipo: 'texto' },
    ],
    acciones: [{ tipo: 'quitar-momento', label: 'Quitar este momento', tono: 'peligro' }],
  },
  'galeria.titulo': {
    id: 'galeria.titulo',
    titulo: 'Título de la galería',
    campos: [
      { path: ['galeria', 'titulo'], label: 'Título', tipo: 'texto' },
      { path: ['galeria', 'subtitulo'], label: 'Subtítulo', tipo: 'texto' },
    ],
  },
  'galeria.foto': {
    id: 'galeria.foto',
    titulo: 'Foto de la galería',
    desc: 'Elegí una foto del dispositivo, previsualizala y reemplazala.',
    campos: [{ path: ['galeria', 'fotos', '{idx}', 'webp'], label: 'Foto', tipo: 'imagen' }],
    acciones: [
      { tipo: 'agregar-foto', label: 'Agregar otra foto' },
      { tipo: 'quitar-foto', label: 'Quitar esta foto', tono: 'peligro' },
    ],
  },
  'galeria.boton': {
    id: 'galeria.boton',
    titulo: 'Botón de fotos de invitados',
    desc: 'Texto del botón y el backend que recibe las fotos.',
    campos: [
      { path: ['galeria', 'botonSubir'], label: 'Texto del botón', tipo: 'texto' },
      { path: ['galeria', 'photoUploadUrl'], label: 'Backend de subida (Google Apps Script)', tipo: 'url', ayuda: 'Sin URL el botón muestra un error a los invitados.' },
    ],
  },
  'musica.titulo': {
    id: 'musica.titulo',
    titulo: 'Título de la música',
    campos: [
      { path: ['musica', 'titulo'], label: 'Título', tipo: 'texto' },
      { path: ['musica', 'subtitulo'], label: 'Subtítulo', tipo: 'texto' },
    ],
  },
  'musica.boton-agregar': {
    id: 'musica.boton-agregar',
    titulo: 'Botón de playlist',
    desc: 'El botón verde que abre la playlist.',
    campos: [
      { path: ['musica', 'botonAgregar'], label: 'Texto del botón', tipo: 'texto' },
      { path: ['musica', 'playlistUrl'], label: 'Enlace de la playlist', tipo: 'url' },
    ],
  },
  'musica.reproductor': {
    id: 'musica.reproductor',
    titulo: 'Reproductor embebido',
    desc: 'El reproductor de Spotify dentro de la invitación.',
    campos: [{ path: ['musica', 'embedUrl'], label: 'Enlace embebido de Spotify', tipo: 'url', ayuda: 'Formato: https://open.spotify.com/embed/playlist/...' }],
  },
  'musica.boton-spotify': {
    id: 'musica.boton-spotify',
    titulo: 'Botón grande de Spotify',
    campos: [
      { path: ['musica', 'botonSpotify'], label: 'Texto del botón', tipo: 'texto' },
      { path: ['musica', 'playlistUrl'], label: 'Enlace de la playlist', tipo: 'url' },
    ],
  },
  'confirmar.titulo': {
    id: 'confirmar.titulo',
    titulo: 'Título de la confirmación',
    campos: [
      { path: ['rsvp', 'titulo'], label: 'Título', tipo: 'texto' },
      { path: ['rsvp', 'subtitulo'], label: 'Subtítulo', tipo: 'texto-largo', filas: 3 },
    ],
  },
  'confirmar.fecha-limite': {
    id: 'confirmar.fecha-limite',
    titulo: 'Fecha límite para confirmar',
    campos: [
      { path: ['rsvp', 'fechaLimite'], label: 'Fecha límite (texto visible)', tipo: 'texto' },
      { path: ['rsvp', 'fechaLimiteFull'], label: 'Fecha límite extendida', tipo: 'texto' },
    ],
  },
  'regalos.titulo': {
    id: 'regalos.titulo',
    titulo: 'Título de regalos',
    campos: [
      { path: ['rsvp', 'regalos', 'titulo'], label: 'Título', tipo: 'texto' },
      { path: ['rsvp', 'regalos', 'subtitulo'], label: 'Frase', tipo: 'texto-largo', filas: 2 },
    ],
  },
  'regalos.abitab': {
    id: 'regalos.abitab',
    titulo: 'Datos de Abitab',
    campos: [
      { path: ['rsvp', 'regalos', 'abitab', 'titulo'], label: 'Título', tipo: 'texto' },
      { path: ['rsvp', 'regalos', 'abitab', 'numero'], label: 'Número', tipo: 'texto' },
    ],
  },
  'regalos.midinero': {
    id: 'regalos.midinero',
    titulo: 'Datos bancarios',
    campos: [
      { path: ['rsvp', 'regalos', 'miDinero', 'titulo'], label: 'Título', tipo: 'texto' },
      { path: ['rsvp', 'regalos', 'miDinero', 'numero'], label: 'Número de cuenta', tipo: 'texto' },
      { path: ['rsvp', 'regalos', 'miDinero', 'numeroInterbancario'], label: 'Número interbancario (opcional)', tipo: 'texto' },
      { path: ['rsvp', 'regalos', 'miDinero', 'sucursal'], label: 'Sucursal (opcional)', tipo: 'texto' },
    ],
  },
  'instagram.texto': {
    id: 'instagram.texto',
    titulo: 'Instagram',
    desc: 'Usuario que se muestra en la sección de fotos compartidas.',
    campos: [
      { path: ['instagram', 'usuario'], label: 'Usuario', tipo: 'texto', placeholder: '@usuario', ayuda: 'Vacío = la sección no se muestra.' },
      { path: ['evento', 'hashtag'], label: 'Hashtag', tipo: 'texto' },
    ],
  },
  'pie.apodo': {
    id: 'pie.apodo',
    titulo: 'Apodo del cierre',
    desc: 'El nombre grande del final de la invitación.',
    campos: [{ path: ['footer', 'apodo'], label: 'Apodo', tipo: 'texto' }],
  },
  'pie.ubicacion': {
    id: 'pie.ubicacion',
    titulo: 'Ubicación del cierre',
    campos: [{ path: ['footer', 'ubicacion'], label: 'Ubicación', tipo: 'texto' }],
  },
  'pie.frase': {
    id: 'pie.frase',
    titulo: 'Frase final',
    campos: [{ path: ['footer', 'frase'], label: 'Frase', tipo: 'texto-largo', filas: 2 }],
  },
  'pie.hashtag': {
    id: 'pie.hashtag',
    titulo: 'Hashtag del cierre',
    desc: 'El enlace a Instagram del final.',
    campos: [
      { path: ['evento', 'hashtag'], label: 'Hashtag', tipo: 'texto' },
      { path: ['evento', 'hashtagUrl'], label: 'Enlace del hashtag', tipo: 'url' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Paneles de «Ajustes» (estructurales, sin elemento visual directo)
// ---------------------------------------------------------------------------

export interface PanelAjuste {
  id: string;
  titulo: string;
  icono: string;
  desc?: string;
  campos?: CampoSpec[];
  /** Secciones con interfaz propia en el panel de ajustes */
  custom?: 'plantillas' | 'colores' | 'fondo' | 'cronograma' | 'galeria' | 'token';
}

export const PANELES_AJUSTES: PanelAjuste[] = [
  { id: 'ajustes-plantillas', titulo: 'Plantilla del diseño', icono: '🎨', custom: 'plantillas' },
  {
    id: 'ajustes-colores',
    titulo: 'Colores',
    icono: '🌈',
    custom: 'colores',
    campos: [
      { path: ['colores', 'principal'], label: 'Principal', tipo: 'color' },
      { path: ['colores', 'dorado'], label: 'Dorado', tipo: 'color' },
      { path: ['colores', 'doradoClaro'], label: 'Dorado claro', tipo: 'color' },
      { path: ['colores', 'marfil'], label: 'Marfil', tipo: 'color' },
      { path: ['colores', 'fondo'], label: 'Fondo', tipo: 'color' },
      { path: ['estilos', 'adorno'], label: 'Adorno de portada', tipo: 'opciones', opciones: ADORNOS },
      { path: ['estilos', 'modoClaro'], label: 'Tema claro', tipo: 'interruptor' },
    ],
  },
  {
    id: 'ajustes-tipografia',
    titulo: 'Tipografía y estilos',
    icono: '✍️',
    campos: [
      { path: ['estilos', 'fuenteTitulo'], label: 'Fuente de títulos', tipo: 'opciones', opciones: OPCIONES_FUENTES },
      { path: ['estilos', 'fuenteCuerpo'], label: 'Fuente de cuerpo', tipo: 'opciones', opciones: OPCIONES_FUENTES },
      { path: ['estilos', 'fuenteCursiva'], label: 'Fuente cursiva', tipo: 'opciones', opciones: OPCIONES_FUENTES },
      { path: ['estilos', 'modeloReloj'], label: 'Modelo de reloj', tipo: 'opciones', opciones: OPCIONES_RELOJ },
      { path: ['estilos', 'estiloTarjetas'], label: 'Estilo de tarjetas', tipo: 'opciones', opciones: OPCIONES_TARJETAS },
      { path: ['estilos', 'estiloBotones'], label: 'Estilo de botones', tipo: 'opciones', opciones: OPCIONES_BOTONES },
    ],
  },
  {
    id: 'ajustes-secciones',
    titulo: 'Secciones de la invitación',
    icono: '🧩',
    desc: 'Prende o apaga módulos enteros.',
    campos: [
      { path: ['secciones', 'sobre'], label: 'Sobre animado de apertura', tipo: 'interruptor' },
      { path: ['secciones', 'cuentaRegresiva'], label: 'Cuenta regresiva', tipo: 'interruptor' },
      { path: ['secciones', 'cronograma'], label: 'Cronograma de la noche', tipo: 'interruptor' },
      { path: ['secciones', 'galeria'], label: 'Galería de fotos', tipo: 'interruptor' },
      { path: ['secciones', 'musica'], label: 'Música', tipo: 'interruptor' },
      { path: ['secciones', 'confirmacion'], label: 'Confirmación (RSVP)', tipo: 'interruptor' },
      { path: ['secciones', 'regalos'], label: 'Bloque de regalos', tipo: 'interruptor' },
    ],
  },
  { id: 'ajustes-fondo', titulo: 'Fondo', icono: '🖼️', custom: 'fondo' },
  {
    id: 'ajustes-apertura',
    titulo: 'Sobre y música de fondo',
    icono: '📨',
    desc: 'Lo que ven los invitados antes de entrar al contenido.',
    campos: [
      { path: ['apertura', 'tipo'], label: 'Apertura animada', tipo: 'opciones', opciones: OPCIONES_APERTURA },
      { path: ['musicaFondo', 'tono'], label: 'Música de fondo', tipo: 'opciones', opciones: OPCIONES_TONO },
      { path: ['invitacion', 'textoAbrir'], label: 'Texto del sobre', tipo: 'texto' },
      { path: ['invitacion', 'imagen'], label: 'Imagen del sobre', tipo: 'imagen' },
      { path: ['invitacion', 'imagenFallback'], label: 'Imagen alternativa', tipo: 'imagen' },
    ],
  },
  {
    id: 'ajustes-cronograma',
    titulo: 'Cronograma',
    icono: '🕰️',
    custom: 'cronograma',
  },
  { id: 'ajustes-galeria', titulo: 'Galería', icono: '📸', custom: 'galeria' },
  {
    id: 'ajustes-datos',
    titulo: 'Datos y enlaces especiales',
    icono: '🔗',
    desc: 'Campos que no se ven directo en la invitación.',
    campos: [
      { path: ['evento', 'mapsUrl'], label: 'Google Maps (Cómo llegar)', tipo: 'url' },
      { path: ['evento', 'hashtag'], label: 'Hashtag', tipo: 'texto' },
      { path: ['evento', 'hashtagUrl'], label: 'Enlace del hashtag', tipo: 'url' },
      { path: ['instagram', 'usuario'], label: 'Usuario de Instagram', tipo: 'texto' },
      { path: ['evento', 'duracionHoras'], label: 'Duración del evento (horas)', tipo: 'numero' },
      { path: ['galeria', 'photoUploadUrl'], label: 'Backend de fotos de invitados', tipo: 'url' },
      { path: ['rsvp', 'googleSheetUrl'], label: 'Google Sheet de confirmaciones (Web App)', tipo: 'url' },
      { path: ['rsvp', 'hostPhone'], label: 'Teléfono de contacto (WhatsApp)', tipo: 'texto' },
    ],
  },
  { id: 'ajustes-token', titulo: 'Conexión con GitHub', icono: '🔑', custom: 'token' },
];

/** Ids de elementos que el editor puede abrir (para validar en runtime) */
export function specDeElemento(id: string): GrupoCampos | undefined {
  return ELEMENTOS_EDITABLES[id];
}

/** Resolver ruta con '{idx}' → ruta concreta (reexportado para UI) */
export { resolverRuta } from './editor-config';
