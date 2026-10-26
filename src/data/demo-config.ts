import defaultConfig, { type SiteConfig } from '@/data/config';
import type { InvitationDesign } from '@/data/invitation-designs';

const DEMO_PHOTOS = [
  '/Miluaistudio/catalogo/demo-01.svg',
  '/Miluaistudio/catalogo/demo-02.svg',
  '/Miluaistudio/catalogo/demo-03.svg',
  '/Miluaistudio/catalogo/demo-04.svg',
];

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

  config.modoDemo = true;
  config.evento = {
    ...config.evento,
    tipo: 'Una celebración especial',
    nombre: 'Tu Nombre',
    apellido: '',
    apodo: 'Tu evento',
    fecha: '20 de noviembre',
    anio: '2027',
    fechaEvento: '2027-11-20 21:00',
    lugar: 'Tu salón',
    ubicacion: 'Montevideo',
    direccion: 'Dirección a confirmar',
    mapsUrl: 'https://maps.google.com/?q=Montevideo%2C+Uruguay',
    mapsEmbedUrl: 'https://maps.google.com/maps?q=Montevideo%2C%20Uruguay&t=&z=13&ie=UTF8&iwloc=&output=embed',
    hashtag: '#TuCelebracion',
    hashtagUrl: 'https://www.instagram.com/',
  };

  config.dedicatoria = {
    cita: 'Los mejores momentos se vuelven inolvidables cuando los compartimos.',
    cuerpo: 'Esta es una invitación de demostración. Los textos, colores y detalles se pueden adaptar a tu celebración.',
    firma: 'Con cariño',
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
    fotos: DEMO_PHOTOS.map((url) => ({ webp: url, fallback: url })),
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
    apodo: 'Tu celebración',
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
    calendarioTitulo: 'Una celebración especial',
    calendarioLocation: 'Montevideo, Uruguay',
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
  const clock = design.clock === 'cards' ? 'classic' : design.clock === 'glass' ? 'gold-glass' : design.clock;
  const cardStyle = design.layout === 'minimal' ? 'glass' : design.layout === 'cinematic' || design.layout === 'modern' ? 'dark' : 'gold-border';
  const buttonStyle = design.layout === 'minimal' || design.layout === 'editorial' ? 'outline-gold' : design.layout === 'modern' ? 'filled-dark' : 'gold-gradient';

  config.estilos = {
    ...config.estilos,
    fuenteTitulo: font,
    fuenteCuerpo: 'montserrat',
    fuenteCursiva: design.font === 'script' ? 'alex-brush' : 'playfair',
    modeloReloj: clock,
    estiloTarjetas: cardStyle,
    estiloBotones: buttonStyle,
    modeloComposicion: design.layout,
  };

  return config;
}
