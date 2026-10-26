import defaultConfig, { type SiteConfig } from '@/data/config';
import type { InvitationDesign } from '@/data/invitation-designs';

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
};

const DEMO_GALLERY_BASE = '/Miluaistudio/catalogo/galeria';

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

function cloneConfig(): SiteConfig {
  return JSON.parse(JSON.stringify(defaultConfig)) as SiteConfig;
}

/**
 * Builds a privacy-safe config for a public catalog sample.
 * Personal details, real endpoints, family numbers, personal photos and playlist
 * are always replaced before this config reaches the browser.
 */
export function createDemoConfig(design: InvitationDesign): SiteConfig {
  const config = cloneConfig();
  const profile = DEMO_PROFILES[design.id] ?? DEFAULT_DEMO_PROFILE;

  config.modoDemo = true;
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
    ubicacion: 'Montevideo',
    direccion: 'Montevideo, Uruguay',
    mapsUrl: 'https://maps.google.com/?q=Montevideo%2C+Uruguay',
    mapsEmbedUrl: 'https://maps.google.com/maps?q=Montevideo%2C%20Uruguay&t=&z=13&ie=UTF8&iwloc=&output=embed',
    hashtag: profile.hashtag,
    hashtagUrl: 'https://www.instagram.com/',
  };

  config.dedicatoria = {
    cita: 'Los mejores momentos se vuelven inolvidables cuando los compartimos.',
    cuerpo: 'Esta es una invitación de demostración. Los textos, colores y detalles se pueden adaptar a tu celebración.',
    firma: profile.nombre,
  };

  config.timeline = {
    titulo: 'La celebración',
    subtitulo: 'Un adelanto de los momentos especiales',
    eventos: [
      { hora: '20:30', titulo: 'Recepción', desc: 'Bienvenida a los invitados', icono: '✦' },
      { hora: '21:00', titulo: 'Comienza la celebración', desc: 'Un momento para compartir', icono: '♡' },
      { hora: '22:00', titulo: 'Música y baile', desc: 'Que empiece la fiesta', icono: '♫' },
      { hora: '23:30', titulo: 'Brindis', desc: 'Por los recuerdos que vendrán', icono: '🥂' },
    ],
  };

  config.galeria = {
    titulo: 'Galería',
    subtitulo: 'Detalles de muestra para imaginar tu propia invitación',
    botonSubir: 'Galería de demostración',
    photoUploadUrl: '',
    fotos: demoGallery(design.id),
  };

  config.musica = {
    titulo: 'La banda sonora',
    subtitulo: 'La música también forma parte del recuerdo',
    playlistUrl: 'https://open.spotify.com/',
    embedUrl: 'https://open.spotify.com/embed/',
    botonAgregar: 'Explorar Spotify',
    botonSpotify: 'Abrir Spotify',
  };

  config.rsvp = {
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
  };

  config.footer = {
    apodo: profile.apodo,
    ubicacion: 'Montevideo · Uruguay',
    frase: 'Una invitación hecha a tu estilo',
  };

  config.invitacion = {
    imagen: '/Miluaistudio/catalogo/demo-cover.svg',
    imagenFallback: '/Miluaistudio/catalogo/demo-cover.svg',
    textoAbrir: 'Tocá para explorar',
  };

  config.countdown = {
    ...config.countdown,
    titulo: 'La cuenta regresiva',
    labels: { D: 'Días', H: 'Horas', M: 'Min', S: 'Seg' },
    botonCalendario: 'Agregar a tu calendario',
    calendarioTitulo: profile.tipo + ' · ' + profile.nombre,
    calendarioLocation: profile.lugar + ', Montevideo, Uruguay',
    calendarioDetalles: 'Invitación web de demostración. Los datos reales se configuran al personalizar tu evento.',
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
