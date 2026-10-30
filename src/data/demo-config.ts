import type { SiteConfig } from './config-schema';
import type { InvitationDesign } from './invitation-designs';

// ============================================================
// CONFIGURACIÓN DE DEMOSTRACIÓN — 100% SINTÉTICA Y AUTOCONTENIDA
// ------------------------------------------------------------
// Este módulo NO importa la configuración operativa
// (src/data/config.ts): define su propia base con valores
// ficticios y endpoints de escritura vacíos. Así ningún valor
// operativo puede llegar a los bundles públicos a través de las
// demos, el personalizador o las vistas previas.
// ============================================================

type DemoProfile = {
  tipo: string;
  nombre: string;
  apellido: string;
  apodo: string;
  fecha: string;
  anio: string;
  fechaEvento: string;
  lugar: string;
  hashtag: string;
};

const DEFAULT_DEMO_PROFILE: DemoProfile = {
  tipo: 'Una celebración especial',
  nombre: 'Valentina',
  apellido: '',
  apodo: 'Vale',
  fecha: '15 de noviembre',
  anio: '2027',
  fechaEvento: '2027-11-15 21:00',
  lugar: 'Jardín Magnolia',
  hashtag: '#CelebracionDeMuestra',
};

const DEMO_PROFILES: Record<string, DemoProfile> = {
  'rosa-romantica': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Valentina', apodo: 'Vale', lugar: 'Jardín Magnolia', hashtag: '#ValentinaXV2027' },
  'noche-dorada': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Camila', apodo: 'Cami', fecha: '28 de noviembre', fechaEvento: '2027-11-28 21:00', lugar: 'Salón Imperial', hashtag: '#CamilaXV2027' },
  'azul-celestial': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Lucía', apodo: 'Lu', fecha: '7 de diciembre', fechaEvento: '2027-12-07 21:00', lugar: 'Terraza Celeste', hashtag: '#LuciaXV2027' },
  'jardin-botanico': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Sofía', apodo: 'Sofi', fecha: '21 de noviembre', fechaEvento: '2027-11-21 21:00', lugar: 'Quinta del Prado', hashtag: '#SofiaXV2027' },
  lavanda: { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Martina', apodo: 'Marti', fecha: '23 de abril', fechaEvento: '2027-04-23 21:00', lugar: 'Casa Lavanda', hashtag: '#MartinaXV2027' },
  terracota: { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Renata', apodo: 'Rena', fecha: '13 de julio', fechaEvento: '2027-07-13 21:00', lugar: 'Espacio Terracota', hashtag: '#RenataXV2027' },
  'blanco-perla': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Isabella', apodo: 'Isa', fecha: '10 de octubre', fechaEvento: '2027-10-10 21:00', lugar: 'Salón Perla', hashtag: '#IsabellaXV2027' },
  'rojo-glamour': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Julieta', apodo: 'Juli', fecha: '18 de noviembre', fechaEvento: '2027-11-18 21:00', lugar: 'Palacio Rubí', hashtag: '#JulietaXV2027' },
  'geometria-moderna': { ...DEFAULT_DEMO_PROFILE, tipo: 'Nuestra boda', nombre: 'Valentina & Diego', apellido: '', apodo: 'Vale & Diego', fecha: '8 de agosto', fechaEvento: '2027-08-08 20:30', lugar: 'Casa del Lago', hashtag: '#ValentinaYDiego2027' },
  'azul-romantico': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Emilia', apodo: 'Emi', fecha: '22 de septiembre', fechaEvento: '2027-09-22 21:00', lugar: 'Jardín del Sur', hashtag: '#EmiliaXV2027' },
  // --- Colección «Fondos de autor» (020): rosas + neón ---
  'rosas-cascada': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Micaela', apodo: 'Mica', fecha: '12 de diciembre', fechaEvento: '2027-12-12 21:00', lugar: 'Salón Rosaleda', hashtag: '#MicaelaXV2027' },
  'arco-rosado': { ...DEFAULT_DEMO_PROFILE, tipo: 'Nuestra boda', nombre: 'Olivia', apellido: '', apodo: 'Oli', fecha: '9 de octubre', fechaEvento: '2027-10-09 20:30', lugar: 'Estancia El Rosal', hashtag: '#Olivia2027' },
  'jardin-durazno': { ...DEFAULT_DEMO_PROFILE, tipo: 'Nuestra boda', nombre: 'Antonella', apellido: '', apodo: 'Anto', fecha: '5 de marzo', fechaEvento: '2027-03-05 20:30', lugar: 'Huerta San José', hashtag: '#Anto2027' },
  'rosas-rubi': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Abril', apodo: 'Abi', fecha: '18 de septiembre', fechaEvento: '2027-09-18 21:00', lugar: 'Salón Rubí', hashtag: '#AbrilXV2027' },
  'blancas-eucalipto': { ...DEFAULT_DEMO_PROFILE, tipo: 'Nuestra boda', nombre: 'Isadora', apellido: '', apodo: 'Isa', fecha: '2 de octubre', fechaEvento: '2027-10-02 20:30', lugar: 'Jardín Blanco', hashtag: '#Isadora2027' },
  'neon-violeta': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Morena', apodo: 'More', fecha: '21 de agosto', fechaEvento: '2027-08-21 21:00', lugar: 'Club Neón', hashtag: '#MorenaXV2027' },
  'neon-azul': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Jazmín', apodo: 'Jaz', fecha: '14 de noviembre', fechaEvento: '2027-11-14 21:00', lugar: 'Terraza Azul', hashtag: '#JazminXV2027' },
  'neon-fucsia': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Zoe', apodo: 'Zoé', fecha: '30 de julio', fechaEvento: '2027-07-30 21:00', lugar: 'Salón Fucsia', hashtag: '#ZoeXV2027' },
  'neon-turquesa': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Celeste', apodo: 'Cele', fecha: '9 de diciembre', fechaEvento: '2027-12-09 21:00', lugar: 'Pista Turquesa', hashtag: '#CelesteXV2027' },
  'neon-dorado': { ...DEFAULT_DEMO_PROFILE, tipo: 'Gran Cumpleaños', nombre: 'Ariana', apodo: 'Ari', fecha: '25 de mayo', fechaEvento: '2027-05-25 21:00', lugar: 'Ático Dorado', hashtag: '#Ariana30' },
  // --- Colección «Fondos de autor» (022): papel + gala + disco ---
  'papel-rosado': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Florencia', apodo: 'Flor', fecha: '16 de octubre', fechaEvento: '2027-10-16 21:00', lugar: 'Salón Pétalos', hashtag: '#FlorenciaXV2027' },
  'papel-crema': { ...DEFAULT_DEMO_PROFILE, tipo: 'Nuestra boda', nombre: 'Catalina', apellido: '', apodo: 'Cata', fecha: '22 de mayo', fechaEvento: '2027-05-22 20:30', lugar: 'Hacienda Marfil', hashtag: '#Catalina2027' },
  'papel-malva': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Guadalupe', apodo: 'Lupe', fecha: '3 de julio', fechaEvento: '2027-07-03 21:00', lugar: 'Jardín Lavanda', hashtag: '#GuadalupeXV2027' },
  'gala-estrellas': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Luna', apodo: 'Lunita', fecha: '11 de septiembre', fechaEvento: '2027-09-11 21:00', lugar: 'Teatro Estelar', hashtag: '#LunaXV2027' },
  'gala-cortinas': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Delfina', apodo: 'Delfi', fecha: '20 de noviembre', fechaEvento: '2027-11-20 21:00', lugar: 'Teatro Dorado', hashtag: '#DelfinaXV2027' },
  'gala-espejos': { ...DEFAULT_DEMO_PROFILE, tipo: 'Gran Cumpleaños', nombre: 'Regina', apodo: 'Gina', fecha: '8 de mayo', fechaEvento: '2027-05-08 21:00', lugar: 'Palacio Espejos', hashtag: '#Regina50' },
  'disco-pista': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Malena', apodo: 'Male', fecha: '17 de diciembre', fechaEvento: '2027-12-17 21:00', lugar: 'Discoteca Nébula', hashtag: '#MalenaXV2027' },
  'disco-fucsia': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Alma', apodo: 'Almita', fecha: '29 de enero', fechaEvento: '2028-01-29 21:00', lugar: 'Club Magenta', hashtag: '#AlmaXV2028' },
  'disco-espejos': { ...DEFAULT_DEMO_PROFILE, tipo: 'Mis XV años', nombre: 'Violeta', apodo: 'Viole', fecha: '5 de febrero', fechaEvento: '2028-02-05 21:00', lugar: 'Sala Prisma', hashtag: '#VioletaXV2028' },
};

const DEMO_GALLERY_BASE = '/catalogo/galeria';

/** Fotos de galería de demostración por diseño (recursos temáticos generados) */
function demoGallery(designId: string) {
  return [1, 2, 3, 4].map((n, i) => ({
    webp: `${DEMO_GALLERY_BASE}/${designId}-${n}.jpg`,
    fallback: `${DEMO_GALLERY_BASE}/${designId}-${n}.jpg`,
    objectPosition: {
      desktop: ['center 30%', 'center 45%', 'center 25%', 'center 40%'][i],
      mobile: ['center 20%', 'center 35%', 'center 15%', 'center 30%'][i],
    },
  }));
}

/**
 * Base pública y autocontenida sobre la que se montan las demos.
 * - Perfiles, textos y lugares son ficticios.
 * - Endpoints de escritura (RSVP, fotos) y teléfonos van vacíos.
 * - No hay datos bancarios ni datos de contacto reales.
 */
export const CONFIG_DEMO_BASE: SiteConfig = {
  modoDemo: true,
  evento: {
    tipo: 'Una celebración especial',
    nombre: 'Valentina',
    apellido: '',
    apodo: 'Vale',
    fecha: '15 de noviembre',
    anio: '2027',
    fechaEvento: '2027-11-15 21:00',
    lugar: 'Jardín Magnolia',
    ubicacion: 'Montevideo',
    direccion: 'Montevideo, Uruguay',
    mapsUrl: 'https://maps.google.com/?q=Montevideo%2C+Uruguay',
    mapsEmbedUrl: 'https://maps.google.com/maps?q=Montevideo%2C%20Uruguay&t=&z=13&ie=UTF8&iwloc=&output=embed',
    hashtag: '#CelebracionDeMuestra',
    hashtagUrl: 'https://www.instagram.com/',
  },
  dedicatoria: {
    cita: 'Los mejores momentos se vuelven inolvidables cuando los compartimos.',
    cuerpo: 'Esta es una invitación de demostración. Los textos, colores y detalles se pueden adaptar a tu celebración.',
    firma: 'Valentina',
  },
  timeline: {
    titulo: 'La celebración',
    subtitulo: 'Un adelanto de los momentos especiales',
    eventos: [
      { hora: '20:30', titulo: 'Recepción', desc: 'Bienvenida a los invitados', icono: '✦' },
      { hora: '21:00', titulo: 'Comienza la celebración', desc: 'Un momento para compartir', icono: '♡' },
      { hora: '22:00', titulo: 'Música y baile', desc: 'Que empiece la fiesta', icono: '♫' },
      { hora: '23:30', titulo: 'Brindis', desc: 'Por los recuerdos que vendrán', icono: '🥂' },
    ],
  },
  galeria: {
    titulo: 'Galería',
    subtitulo: 'Detalles de muestra para imaginar tu propia invitación',
    botonSubir: 'Galería de demostración',
    photoUploadUrl: '',
    fotos: [],
  },
  musica: {
    titulo: 'La banda sonora',
    subtitulo: 'La música también forma parte del recuerdo',
    playlistUrl: 'https://open.spotify.com/',
    embedUrl: 'https://open.spotify.com/embed/',
    botonAgregar: 'Explorar Spotify',
    botonSpotify: 'Abrir Spotify',
  },
  rsvp: {
    titulo: 'Confirmar asistencia',
    subtitulo: 'En una invitación real, tus invitados podrían confirmar aquí.',
    fechaLimite: 'Confirmación de demostración',
    fechaLimiteFull: '',
    googleSheetUrl: '',
    hostPhone: '',
    regalos: {
      titulo: 'Información del evento',
      subtitulo: 'En una invitación real este espacio puede incluir información útil para los invitados.',
      abitab: { titulo: '', numero: '' },
      miDinero: { titulo: '', numero: '', numeroInterbancario: '', sucursal: '' },
    },
  },
  footer: {
    apodo: 'Vale',
    ubicacion: 'Montevideo · Uruguay',
    frase: 'Una invitación hecha a tu estilo',
  },
  invitacion: {
    imagen: '/catalogo/demo-cover.svg',
    imagenFallback: '/catalogo/demo-cover.svg',
    textoAbrir: 'Tocá para explorar',
  },
  countdown: {
    titulo: 'La cuenta regresiva',
    labels: { D: 'Días', H: 'Horas', M: 'Min', S: 'Seg' },
    botonCalendario: 'Agregar a tu calendario',
    calendarioTitulo: 'Una celebración especial · Valentina',
    calendarioLocation: 'Jardín Magnolia, Montevideo, Uruguay',
    calendarioDetalles: 'Invitación web de demostración. Los datos reales se configuran al personalizar tu evento.',
  },
  fondo: { fotos: ['gradient:rosa-suave'] },
  colores: {
    principal: '#9d5f6f',
    dorado: '#c4768b',
    doradoClaro: '#c4768b',
    marfil: '#4a343b',
    fondo: '#fbf1f2',
  },
  estilos: {
    fuenteTitulo: 'alex-brush',
    fuenteCuerpo: 'montserrat',
    fuenteCursiva: 'alex-brush',
    modeloReloj: 'classic',
    estiloTarjetas: 'glass',
    estiloBotones: 'outline-gold',
    modoClaro: true,
    adorno: 'rosas',
  },
};

/**
 * Builds a privacy-safe config for a public catalog sample.
 * Personal details, real endpoints, family numbers, personal photos and playlist
 * are always replaced before this config reaches the browser.
 */
export function createDemoConfig(design: InvitationDesign): SiteConfig {
  const config: SiteConfig = JSON.parse(JSON.stringify(CONFIG_DEMO_BASE)) as SiteConfig;
  const profile = DEMO_PROFILES[design.id] ?? DEFAULT_DEMO_PROFILE;

  config.modoDemo = true;
  config.demoNombreDiseno = design.name + ' · Demostración interactiva';
  config.evento = {
    ...config.evento,
    tipo: profile.tipo,
    nombre: profile.nombre,
    apellido: profile.apellido,
    apodo: profile.apodo,
    fecha: profile.fecha,
    anio: profile.anio,
    fechaEvento: profile.fechaEvento,
    lugar: profile.lugar,
    hashtag: profile.hashtag,
  };

  config.dedicatoria = {
    ...config.dedicatoria,
    firma: profile.nombre,
  };

  config.galeria = {
    ...config.galeria,
    fotos: demoGallery(design.id),
  };

  config.footer = {
    ...config.footer,
    apodo: profile.apodo,
  };

  config.countdown = {
    ...config.countdown,
    calendarioTitulo: profile.tipo + ' · ' + profile.nombre,
    calendarioLocation: profile.lugar + ', Montevideo, Uruguay',
  };

  config.fondo = { fotos: [`gradient:${design.backgroundPreset}`] };
  config.colores = {
    principal: design.id === 'blanco-perla' ? '#514338' : design.accentSoft,
    dorado: design.accent,
    doradoClaro: design.accent,
    marfil: design.text,
    fondo: design.background,
  };

  const font = design.font === 'script' ? 'alex-brush' : design.font === 'sans' ? 'montserrat' : 'playfair';
  const light = design.themeMode === 'light';
  const clock = design.clock === 'cards' ? 'classic' : design.clock === 'glass' ? 'gold-glass' : design.clock;
  const cardStyle = light ? 'glass' : 'dark';
  const buttonStyle = light ? 'outline-gold' : design.layout === 'modern' ? 'filled-dark' : 'gold-gradient';

  config.estilos = {
    ...config.estilos,
    fuenteTitulo: font,
    fuenteCuerpo: 'montserrat',
    fuenteCursiva: design.font === 'script' ? 'alex-brush' : 'playfair',
    modeloReloj: clock,
    estiloTarjetas: cardStyle,
    estiloBotones: buttonStyle,
    modeloComposicion: design.layout,
    modoClaro: light,
    adorno: design.adorno,
  };

  return config;
}
