import type { SiteConfig } from '@/data/config';
import type { InvitationDesign } from '@/data/invitation-designs';
import { createDemoConfig } from '@/data/demo-config';

/**
 * Motor del personalizador auto-servicio: combina un diseño de la colección
 * con los datos que carga el cliente y produce una configuración completa
 * que la invitación real (InvitationExperience) renderiza en vivo.
 */

export interface DatosPersonales {
  tipo: string;
  nombre: string;
  /** Fecha ISO del input date: "2027-05-15" */
  fecha: string;
  /** Hora del input time: "21:00" */
  hora: string;
  lugar: string;
  frase: string;
  /** URL de Spotify (playlist, álbum o tema) */
  musica: string;
}

export const TIPOS_EVENTO = [
  'Mis XV años',
  'Nuestra boda',
  'Cumpleaños de 18',
  'Bautizo',
  'Baby shower',
  'Graduación',
  'Aniversario',
];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];

export interface PartesFecha {
  fecha: string;
  anio: string;
  dateLabel: string;
  fechaEvento: string;
  fechaCorta: string;
}

/** "2027-05-15" + "21:00" → las cuatro formas que usa la invitación */
export function partesFecha(iso: string, hora: string): PartesFecha | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return {
    fecha: `${d} de ${MESES[m - 1] ?? 'enero'}`,
    anio: String(y),
    dateLabel: `${dd} · ${mm} · ${y}`,
    fechaEvento: `${iso} ${hora || '21:00'}`,
    fechaCorta: `${dd}/${mm}/${y}`,
  };
}

/** Fecha por defecto del formulario: ~6 meses en el futuro (solo cliente) */
export function fechaSugerida(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** open.spotify.com/playlist/xyz → open.spotify.com/embed/playlist/xyz */
export function spotifyEmbedUrl(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(playlist|album|track|show|episode)\/([A-Za-z0-9]+)/);
  return m ? 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] : null;
}

function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] || '';
}

/**
 * "Salón Imperial, Rambla Gandhi 1234, Montevideo" → título corto + dirección completa
 * (mismo patrón que las demos: lugar = nombre del salón, direccion = calle y ciudad)
 */
function partirLugar(texto: string): { lugar: string; direccion: string } {
  const i = texto.indexOf(',');
  if (i > 0) {
    const nombre = texto.slice(0, i).trim();
    const resto = texto.slice(i + 1).trim();
    if (nombre && resto && nombre.length <= 40) return { lugar: nombre, direccion: resto };
  }
  return { lugar: texto, direccion: texto };
}

/** Mapa y botón "Cómo llegar" con el lugar del cliente (sesgo Uruguay salvo que ya lo indique) */
function urlsMapa(texto: string): { mapsUrl: string; mapsEmbedUrl: string } {
  const consulta = /uruguay/i.test(texto) ? texto : `${texto}, Uruguay`;
  const q = encodeURIComponent(consulta);
  return {
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
    mapsEmbedUrl: `https://maps.google.com/maps?q=${q}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
  };
}

/** Config completa de la invitación con los datos del cliente sobre la base del diseño */
export function createPersonalConfig(design: InvitationDesign, datos: DatosPersonales): SiteConfig {
  const config = createDemoConfig(design);

  const p = partesFecha(datos.fecha, datos.hora);
  const nombre = datos.nombre.trim() || config.evento.nombre;
  const tipo = datos.tipo.trim() || config.evento.tipo;
  const lugarCliente = datos.lugar.trim();
  // Con la dirección completa del cliente el mapa y "Cómo llegar" se actualizan;
  // sin ella, la invitación conserva el lugar de muestra del diseño.
  const { lugar, direccion } = lugarCliente
    ? partirLugar(lugarCliente)
    : { lugar: config.evento.lugar, direccion: config.evento.direccion };
  const apodo = primerNombre(nombre) || config.evento.apodo;

  config.modoDemo = true;
  config.evento = {
    ...config.evento,
    tipo,
    nombre,
    apellido: '',
    apodo,
    lugar,
    // Si el cliente escribió el lugar completo no repetimos la ciudad al lado;
    // la dejamos solo cuando usa el lugar de muestra.
    ubicacion: lugarCliente ? '' : config.evento.ubicacion,
    direccion,
    ...(lugarCliente ? urlsMapa(lugarCliente) : {}),
    ...(p ? { fecha: p.fecha, anio: p.anio, fechaEvento: p.fechaEvento } : {}),
  };

  config.dedicatoria = {
    cita: datos.frase.trim() || config.dedicatoria.cita,
    cuerpo: 'Todo lo que ves acá se ajusta a tu celebración: textos, fotos, música y detalles finales se dejan listos antes de publicar tu invitación.',
    firma: nombre,
  };

  const embed = spotifyEmbedUrl(datos.musica.trim());
  if (embed) {
    config.musica = {
      ...config.musica,
      playlistUrl: datos.musica.trim(),
      embedUrl: embed,
      botonAgregar: 'Escuchar la canción',
      botonSpotify: 'Abrir Spotify',
    };
  }

  config.countdown = {
    ...config.countdown,
    calendarioTitulo: tipo + ' · ' + nombre,
    // En el evento de calendario va la dirección completa, no solo el nombre del salón
    calendarioLocation: (lugarCliente || lugar) + ', Uruguay',
  };

  config.footer = {
    apodo,
    ubicacion: lugar + ' · Uruguay',
    frase: 'Una invitación hecha a tu estilo',
  };

  return config;
}

/** Mensaje pre-cargado de WhatsApp con toda la configuración del cliente */
export function mensajeWhatsAppPersonal(design: InvitationDesign, datos: DatosPersonales): string {
  const p = partesFecha(datos.fecha, datos.hora);
  const lineas = [
    'Hola! Personalicé mi invitación en la web de Miluaistudio:',
    '',
    '• Diseño: ' + design.name,
    '• Evento: ' + (datos.tipo.trim() || '—'),
    '• Nombre: ' + (datos.nombre.trim() || '—'),
    p ? '• Fecha: ' + p.fechaCorta + ' a las ' + (datos.hora || '21:00') + ' h' : null,
    '• Lugar: ' + (datos.lugar.trim() || '—'),
    datos.frase.trim() ? '• Frase: "' + datos.frase.trim() + '"' : null,
    datos.musica.trim() ? '• Música: ' + datos.musica.trim() : null,
    '',
    '¿Cómo seguimos para dejarla lista?',
  ].filter((linea): linea is string => linea !== null);
  return lineas.join('\n');
}
