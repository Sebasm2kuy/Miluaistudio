import type { SiteConfig, SeccionesConfig } from '@/data/config';
import type { InvitationDesign } from '@/data/invitation-designs';
import { createDemoConfig } from '@/data/demo-config';
import { APERTURA_DEFAULT, nombreApertura } from '@/lib/aperturas';
import { tonoPorId } from '@/lib/musica';

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
  /** Nombre del lugar (ej: "Salón Imperial") */
  lugar: string;
  /** Dirección para el mapa (ej: "Rambla Gandhi 1234, Montevideo") */
  direccion: string;
  /** Código de vestimenta (vacío = "Gala / Elegante") */
  dressCode: string;
  /** Usuario de Instagram (con o sin @; vacío = sin sección) */
  instagram: string;
  /** Texto de "Mi historia" (cuerpo de la dedicatoria) */
  historia: string;
  /** Frase o cita de la dedicatoria */
  frase: string;
  /** URL de Spotify (playlist, álbum o tema) */
  musica: string;
  /** Apertura animada elegida (id de APERTURAS_META) */
  apertura: string;
  /** Tono de música de fondo (id de TONOS_FONDO; vacío = sin música) */
  musicaFondo: string;
  /** URL de la foto de portada propia (opcional) */
  portada: string;
  /** Combo tipográfico elegido (id de TIPOGRAFIAS_META; vacío = el del diseño) */
  tipografia: string;
  /** Color de acento elegido (id de ACENTOS_META; vacío = el del diseño) */
  acento: string;
  /** Cronograma editable: momentos de la noche (hora + título) */
  cronograma: { hora: string; titulo: string }[];
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

/** Secciones de la invitación que el cliente prende o apaga */
export type Secciones = Required<SeccionesConfig>;

/** Combos tipográficos: título + firma. Las fuentes se cargan en layout.tsx */
export const TIPOGRAFIAS_META: {
  id: string;
  nombre: string;
  desc: string;
  fuenteTitulo: string;
  fuenteCursiva: string;
  /** Cómo se ve el nombre en la miniatura (script | serif | sans) */
  mini: 'script' | 'serif' | 'sans';
}[] = [
  { id: 'clasica', nombre: 'Clásica', desc: 'Títulos serif + firma caligráfica', fuenteTitulo: 'playfair', fuenteCursiva: 'alex-brush', mini: 'script' },
  { id: 'romantica', nombre: 'Romántica', desc: 'Cormorant elegante + firma manuscrita', fuenteTitulo: 'cormorant', fuenteCursiva: 'dancing-script', mini: 'script' },
  { id: 'moderna', nombre: 'Moderna', desc: 'Sans limpia, sin cursivas', fuenteTitulo: 'montserrat', fuenteCursiva: 'montserrat', mini: 'sans' },
  { id: 'editorial', nombre: 'Editorial', desc: 'Cormorant con cursiva serif fina', fuenteTitulo: 'cormorant', fuenteCursiva: 'playfair', mini: 'serif' },
];

/** Paleta de acentos que el cliente puede aplicar sobre cualquier diseño */
export const ACENTOS_META: { id: string; nombre: string; hex: string }[] = [
  { id: '', nombre: 'Original del diseño', hex: '' },
  { id: 'dorado', nombre: 'Dorado', hex: '#c9a227' },
  { id: 'rosa', nombre: 'Rosa antiguo', hex: '#c4768b' },
  { id: 'lavanda', nombre: 'Lavanda', hex: '#9a86c8' },
  { id: 'azul', nombre: 'Azul sereno', hex: '#6d8fb4' },
  { id: 'esmeralda', nombre: 'Esmeralda', hex: '#5f8a72' },
  { id: 'vino', nombre: 'Vino tinto', hex: '#a04f5f' },
];

/** Mezcla un hex con blanco (para el acento claro de los temas oscuros) */
function aclarar(hex: string, f: number): string {
  const m = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return hex;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * f);
  return '#' + [mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export const SECCIONES_DEFAULT: Secciones = {
  sobre: true,
  cuentaRegresiva: true,
  cronograma: true,
  galeria: true,
  musica: true,
  confirmacion: true,
  regalos: true,
};

export const SECCIONES_META: { key: keyof Secciones; label: string; desc: string }[] = [
  { key: 'sobre', label: 'Sobre animado', desc: 'Apertura con un sobre que se abre antes de la invitación' },
  { key: 'cuentaRegresiva', label: 'Cuenta regresiva', desc: 'Contador en vivo hasta el día del evento' },
  { key: 'cronograma', label: 'Cronograma', desc: 'Los momentos de la noche, hora por hora' },
  { key: 'galeria', label: 'Galería de fotos', desc: 'Fotos de la fiesta, con recuerdos de los invitados' },
  { key: 'musica', label: 'Música', desc: 'Tu playlist de Spotify dentro de la invitación' },
  { key: 'confirmacion', label: 'Confirmación', desc: 'Formulario de asistencia con códigos por WhatsApp' },
  { key: 'regalos', label: 'Regalos y datos bancarios', desc: 'Abitab / MiDinero — se muestra dentro de Confirmación' },
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
 * Si el cliente escribió todo junto en el lugar ("Salón X, calle 123"),
 * lo separamos en título + dirección (mismo patrón que las demos).
 * Con los campos separados nuevos, esto queda como red de seguridad.
 */
function partirLugar(texto: string): { lugar: string; direccion: string } {
  const i = texto.indexOf(',');
  if (i > 0) {
    const nombre = texto.slice(0, i).trim();
    const resto = texto.slice(i + 1).trim();
    if (nombre && resto && nombre.length <= 40) return { lugar: nombre, direccion: resto };
  }
  return { lugar: texto, direccion: '' };
}

/** Mapa y botón "Cómo llegar" con la dirección del cliente (sesgo Uruguay salvo que ya lo indique) */
function urlsMapa(texto: string): { mapsUrl: string; mapsEmbedUrl: string } {
  const consulta = /uruguay/i.test(texto) ? texto : `${texto}, Uruguay`;
  const q = encodeURIComponent(consulta);
  return {
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
    mapsEmbedUrl: `https://maps.google.com/maps?q=${q}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
  };
}

/** "@Vale.XV " → usuario limpio para la URL de Instagram */
function limpiarInstagram(texto: string): string {
  return texto.replace(/^@+/, '').trim().replace(/\/+$/, '').replace(/\s+/g, '');
}

/** Hashtag derivado del nombre y el año: "Antonella" + 2027 → #Antonella2027 */
function derivarHashtag(apodo: string, anio: string): string {
  const base = (apodo || '').replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]/g, '');
  return base ? '#' + base + anio : '';
}

/** Config completa de la invitación con los datos del cliente sobre la base del diseño */
export function createPersonalConfig(
  design: InvitationDesign,
  datos: DatosPersonales,
  secciones: Secciones = SECCIONES_DEFAULT,
): SiteConfig {
  const config = createDemoConfig(design);

  const p = partesFecha(datos.fecha, datos.hora);
  const nombre = datos.nombre.trim() || config.evento.nombre;
  const tipo = datos.tipo.trim() || config.evento.tipo;
  const apodo = primerNombre(nombre) || config.evento.apodo;
  const anio = p?.anio ?? String(new Date().getFullYear() + 1);

  // Lugar y dirección: campos separados; si el cliente escribió todo junto
  // en "lugar", lo partimos. La dirección alimenta el mapa y "Cómo llegar".
  const lugarCliente = datos.lugar.trim();
  const direccionCliente = datos.direccion.trim();
  const partido = lugarCliente && !direccionCliente ? partirLugar(lugarCliente) : null;
  const lugar = lugarCliente || config.evento.lugar;
  const direccion = direccionCliente || partido?.direccion || '';
  const consultaMapa = direccion || lugarCliente || '';

  config.modoDemo = true;
  config.demoNombreDiseno = design.name + ' · Vista previa';
  config.secciones = { ...secciones };
  config.evento = {
    ...config.evento,
    tipo,
    nombre,
    apellido: '',
    apodo,
    lugar,
    // Con datos propios del cliente no repetimos la ciudad al lado del lugar
    ubicacion: lugarCliente || direccionCliente ? '' : config.evento.ubicacion,
    direccion: direccion || config.evento.direccion,
    ...(datos.dressCode.trim() ? { dressCode: datos.dressCode.trim() } : {}),
    ...(consultaMapa ? urlsMapa(consultaMapa) : {}),
    ...(p ? { fecha: p.fecha, anio: p.anio, fechaEvento: p.fechaEvento } : {}),
  };

  // Hashtag propio derivado del nombre (para la sección de Instagram)
  const hashtag = derivarHashtag(apodo, anio);
  if (hashtag && hashtag.length > 3) {
    config.evento.hashtag = hashtag;
    config.evento.hashtagUrl = 'https://www.instagram.com/explore/tags/' + encodeURIComponent(hashtag.slice(1)) + '/';
  }

  // Instagram: sección nueva (solo si el cliente cargó usuario)
  const igUsuario = limpiarInstagram(datos.instagram);
  if (igUsuario) {
    config.instagram = {
      usuario: igUsuario,
      url: 'https://www.instagram.com/' + encodeURIComponent(igUsuario) + '/',
    };
  }

  config.dedicatoria = {
    cita: datos.frase.trim() || config.dedicatoria.cita,
    cuerpo: datos.historia.trim() || 'Todo lo que ves acá se ajusta a tu celebración: textos, fotos, música y detalles finales se dejan listos antes de publicar tu invitación.',
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

  // Apertura animada elegida por el cliente
  config.apertura = { tipo: datos.apertura?.trim() || APERTURA_DEFAULT };

  // Música de fondo (tono propio del catálogo; vacío = sin música de fondo)
  const tono = tonoPorId(datos.musicaFondo);
  if (tono) {
    config.musicaFondo = { tono: tono.id, url: tono.src };
  }

  // Foto de portada propia: la muestra el sobre y el fondo de la invitación
  const portada = datos.portada.trim();
  if (/^https?:\/\//i.test(portada)) {
    config.invitacion = { ...config.invitacion, imagen: portada, imagenFallback: portada };
    config.fondo = { fotos: [portada] };
    config.portadaPersonalizada = true;
  }

  // Tipografía y acento elegidos sobre el diseño base
  const tipografia = TIPOGRAFIAS_META.find((t) => t.id === datos.tipografia);
  if (tipografia) {
    config.estilos = {
      ...config.estilos,
      fuenteTitulo: tipografia.fuenteTitulo,
      fuenteCursiva: tipografia.fuenteCursiva,
    };
  }
  const acento = ACENTOS_META.find((a) => a.id === datos.acento);
  if (acento?.hex) {
    config.colores = {
      ...config.colores,
      dorado: acento.hex,
      doradoClaro: aclarar(acento.hex, 0.42),
    };
  }

  // Cronograma editable: si el cliente cargó momentos, reemplazan los de muestra
  const momentos = datos.cronograma.filter((it) => it.hora.trim() && it.titulo.trim());
  if (momentos.length) {
    const iconos = ['✦', '♡', '♫', '🥂', '📸', '🎂', '✨', '🎉', '🕰', '💃'];
    config.timeline = {
      ...config.timeline,
      eventos: momentos.slice(0, 10).map((it, i) => ({
        hora: it.hora.trim(),
        titulo: it.titulo.trim(),
        desc: '',
        icono: iconos[i % iconos.length],
      })),
    };
  }

  config.countdown = {
    ...config.countdown,
    calendarioTitulo: tipo + ' · ' + nombre,
    // En el evento de calendario va la dirección completa, no solo el nombre del salón
    calendarioLocation: [lugar, direccion].filter(Boolean).join(', ') + ', Uruguay',
  };

  config.footer = {
    apodo,
    ubicacion: lugar + ' · Uruguay',
    frase: 'Una invitación hecha a tu estilo',
  };

  return config;
}

/** Mensaje pre-cargado de WhatsApp con toda la configuración del cliente */
export function mensajeWhatsAppPersonal(
  design: InvitationDesign,
  datos: DatosPersonales,
  secciones: Secciones = SECCIONES_DEFAULT,
): string {
  const p = partesFecha(datos.fecha, datos.hora);
  const prendidas = SECCIONES_META
    .filter((m) => secciones[m.key])
    .map((m) => m.label);
  const apagadas = SECCIONES_META
    .filter((m) => !secciones[m.key])
    .map((m) => m.label);
  const historia = datos.historia.trim();
  const momentos = datos.cronograma.filter((it) => it.hora.trim() && it.titulo.trim());
  const portada = datos.portada.trim();
  const tonoElegido = tonoPorId(datos.musicaFondo);
  const tipografiaElegida = TIPOGRAFIAS_META.find((t) => t.id === datos.tipografia);
  const acentoElegido = ACENTOS_META.find((a) => a.id === datos.acento);
  const lineas = [
    'Hola! Personalicé mi invitación en la web de Miluaistudio:',
    '',
    '• Diseño: ' + design.name,
    '• Evento: ' + (datos.tipo.trim() || '—'),
    '• Nombre: ' + (datos.nombre.trim() || '—'),
    p ? '• Fecha: ' + p.fechaCorta + ' a las ' + (datos.hora || '21:00') + ' h' : null,
    '• Lugar: ' + (datos.lugar.trim() || '—'),
    datos.direccion.trim() ? '• Dirección: ' + datos.direccion.trim() : null,
    datos.dressCode.trim() ? '• Dress code: ' + datos.dressCode.trim() : null,
    limpiarInstagram(datos.instagram) ? '• Instagram: @' + limpiarInstagram(datos.instagram) : null,
    datos.frase.trim() ? '• Frase: "' + datos.frase.trim() + '"' : null,
    historia ? '• Historia: "' + (historia.length > 90 ? historia.slice(0, 90) + '…' : historia) + '"' : null,
    datos.musica.trim() ? '• Playlist de Spotify: ' + datos.musica.trim() : null,
    '• Apertura: ' + nombreApertura(datos.apertura),
    tonoElegido ? '• Música de fondo: ' + tonoElegido.nombre : '• Música de fondo: sin música',
    /^https?:\/\//i.test(portada) ? '• Foto de portada: ' + portada : null,
    momentos.length
      ? '• Cronograma:\n' + momentos.slice(0, 10).map((it) => '    ' + it.hora.trim() + ' — ' + it.titulo.trim()).join('\n')
      : '• Cronograma: lo definimos juntos después',
    tipografiaElegida ? '• Tipografía: ' + tipografiaElegida.nombre : null,
    acentoElegido?.hex ? '• Color de acento: ' + acentoElegido.nombre : null,
    '',
    '• Secciones que quiero: ' + (prendidas.join(', ') || '—'),
    apagadas.length ? '• Sin estas secciones: ' + apagadas.join(', ') : null,
    '',
    '¿Cómo seguimos para dejarla lista?',
  ].filter((linea): linea is string => linea !== null);
  return lineas.join('\n');
}
