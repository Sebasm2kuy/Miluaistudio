/**
 * Importador del pedido por WhatsApp.
 *
 * El personalizador genera un mensaje estructurado (mensajeWhatsAppPersonal)
 * que el cliente manda por WhatsApp al estudio. Este módulo lo lee DE VUELTA:
 * convierte el texto pegado en DatosPersonales + diseño + secciones, para que
 * el propietario cargue el pedido en el editor sin re-escribir nada.
 *
 * Reglas del contrato:
 *  - El mismo mensajeWhatsAppPersonal es la fuente de verdad de las etiquetas.
 *    Si se agrega un campo al mensaje, se agrega acá (y en los tests de
 *    round-trip).
 *  - Nunca lanza: devuelve ok:false con un mensaje entendible.
 *  - Tolerante: acepta viñetas •, -, *; negritas de WhatsApp (*texto*);
 *    valores «—» (vacío); horas «21:00 h»; comillas dobles y tipográficas.
 *  - Honesto: lo que no puede recuperar lo declara en `avisos` (p. ej. la
 *    historia viene recortada a ~90 caracteres por diseño del mensaje).
 */

import type { InvitationDesign } from '../data/invitation-designs';
import { INVITATION_DESIGNS } from '../data/invitation-designs';
import {
  ACENTOS_META,
  SECCIONES_DEFAULT,
  SECCIONES_META,
  TIPOGRAFIAS_META,
  type DatosPersonales,
  type Secciones,
} from './personalizador';
import { APERTURAS_META, APERTURA_DEFAULT } from './aperturas';
import { TONOS_FONDO } from './musica';

export interface ResultadoImportacion {
  ok: boolean;
  /** Entendible para el propietario cuando ok es false. */
  error?: string;
  datos: DatosPersonales;
  /** Id del diseño reconocido (obligatorio para armar la invitación). */
  designId: string | null;
  secciones: Secciones;
  /** Campos leídos, en texto corto, para la vista previa antes de aplicar. */
  leidos: string[];
  /** Advertencias honestas sobre lo que el mensaje no trae completo. */
  avisos: string[];
}

const VACIO: DatosPersonales = {
  tipo: '',
  nombre: '',
  fecha: '',
  hora: '',
  lugar: '',
  direccion: '',
  dressCode: '',
  instagram: '',
  historia: '',
  frase: '',
  musica: '',
  apertura: '',
  musicaFondo: '',
  portada: '',
  tipografia: '',
  acento: '',
  cronograma: [],
};

/** Quita viñeta inicial, negritas de WhatsApp y espacios redundantes. */
function limpiarLinea(l: string): string {
  return l
    .replace(/^[\s•·‣*-]+/, '')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Quita comillas que envuelven el valor ("...") y espacios. */
function sinComillas(v: string): string {
  return v
    .replace(/^["“”«»'\s]+/, '')
    .replace(/["“”«»'\s]+$/, '')
    .trim();
}

/** «—» o vacío → ''. El mensaje usa — para marcar campos sin dato. */
function valorUtil(v: string): string {
  const t = sinComillas(v);
  return t === '—' ? '' : t;
}

/** dd/mm/aaaa a las hh:mm (o hh:mm) → ISO + hora. null si no calza. */
function leerFecha(texto: string): { fecha: string; hora: string } | null {
  const d = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(texto);
  if (!d) return null;
  const [_, dd, mm, yyyy] = d;
  const h = /(\d{1,2}):(\d{2})/.exec(texto);
  const pad = (n: string) => n.padStart(2, '0');
  return {
    fecha: `${yyyy}-${pad(mm)}-${pad(dd)}`,
    hora: h ? `${h[1].padStart(2, '0')}:${h[2]}` : '',
  };
}

/** «20:00 — Recepción» → { hora, titulo }. null si la línea no es un momento. */
function leerMomento(l: string): { hora: string; titulo: string } | null {
  const m = /^(\d{1,2}:\d{2})\s*[—–-]+\s*(.+)$/.exec(l);
  if (!m) return null;
  return { hora: m[1], titulo: m[2].trim() };
}

/** Nombre de sección (tolerante) → key de Secciones. null si no calza. */
function keyDeSeccion(nombre: string): keyof Secciones | null {
  const objetivo = nombre.trim().toLowerCase();
  const meta = SECCIONES_META.find((m) => m.label.toLowerCase() === objetivo);
  return meta?.key ?? null;
}

function buscarPorNombre<T extends { nombre: string }>(lista: T[], nombre: string): T | undefined {
  const objetivo = nombre.trim().toLowerCase();
  return lista.find((x) => x.nombre.toLowerCase() === objetivo);
}

/**
 * Convierte el mensaje pegado en datos listos para el editor.
 * Recibe los diseños por parámetro (misma lista que muestra la UI).
 */
export function mensajeAConfigPersonal(mensaje: string): ResultadoImportacion {
  const base: ResultadoImportacion = {
    ok: false,
    datos: { ...VACIO, cronograma: [] },
    designId: null,
    secciones: { ...SECCIONES_DEFAULT },
    leidos: [],
    avisos: [],
  };

  const texto = (mensaje || '').trim();
  if (!texto) return { ...base, error: 'Pegá primero el mensaje que te mandaron por WhatsApp.' };

  const lineas = texto.split('\n').map(limpiarLinea);
  const encabezado = texto.toLowerCase().includes('personalicé mi invitación');

  const campos = new Map<string, string>();
  const momentos: { hora: string; titulo: string }[] = [];
  let enCronograma = false;

  for (const l of lineas) {
    if (!l) continue;

    // Sub-líneas del cronograma: «20:00 — Recepción»
    const momento = leerMomento(l);
    if (enCronograma && momento) {
      if (momentos.length < 10) momentos.push(momento);
      continue;
    }
    enCronograma = false;

    const sep = l.indexOf(':');
    if (sep <= 0) continue;
    const etiqueta = l.slice(0, sep).trim().toLowerCase();
    const valor = l.slice(sep + 1).trim();
    if (!etiqueta) continue;
    campos.set(etiqueta, valor);

    if (etiqueta === 'cronograma') enCronograma = true;
  }

  const dato = (k: string): string => (campos.has(k) ? valorUtil(campos.get(k) as string) : '');
  const hayDiseño = campos.has('diseño') || campos.has('diseno');

  // Acepta el mensaje estándar O un texto que al menos traiga diseño y nombre.
  if (!encabezado && !(hayDiseño && campos.has('nombre'))) {
    return {
      ...base,
      error:
        'Este texto no parece un pedido del personalizador. Pedile al cliente que use el botón «Enviar mi configuración» de la página Personalizar y que te mande el mensaje completo.',
    };
  }

  // Diseño: obligatorio (sobre él se monta la invitación).
  const nombreDiseno = dato('diseño') || dato('diseno');
  const design: InvitationDesign | undefined = nombreDiseno
    ? INVITATION_DESIGNS.find((d) => d.name.toLowerCase() === nombreDiseno.toLowerCase())
    : undefined;
  if (!design) {
    return {
      ...base,
      error: nombreDiseno
        ? `No reconozco el diseño «${nombreDiseno}». Si el catálogo cambió, corregí el nombre o armá la invitación a mano.`
        : 'El mensaje no dice qué diseño eligió (línea «• Diseño:»).',
    };
  }

  const datos: DatosPersonales = {
    ...VACIO,
    cronograma: momentos.map((m) => ({ ...m })),
    tipo: dato('evento'),
    nombre: dato('nombre'),
    lugar: dato('lugar'),
    direccion: dato('dirección') || dato('direccion'),
    dressCode: dato('dress code'),
    instagram: dato('instagram').replace(/^@/, ''),
    frase: dato('frase'),
    historia: dato('historia'),
    musica: dato('playlist de spotify'),
    portada: /^https?:\/\//i.test(dato('foto de portada')) ? dato('foto de portada') : '',
    apertura: '',
    musicaFondo: '',
    tipografia: '',
    acento: '',
  };

  const leidos: string[] = [`Diseño: ${design.name}`];
  if (datos.tipo) leidos.push(`Evento: ${datos.tipo}`);
  if (datos.nombre) leidos.push(`Nombre: ${datos.nombre}`);

  const fechaRaw = campos.get('fecha') ?? '';
  const fecha = leerFecha(fechaRaw);
  if (fecha) {
    datos.fecha = fecha.fecha;
    datos.hora = fecha.hora || '21:00';
    leidos.push(`Fecha: ${fecha.fecha} a las ${datos.hora}`);
  } else {
    base.avisos.push('El mensaje no trae fecha legible (se espera «dd/mm/aaaa a las hh:mm»): la invitación queda con la fecha del diseño hasta que la corrijas.');
  }

  if (datos.lugar) leidos.push(`Lugar: ${datos.lugar}`);
  if (datos.direccion) leidos.push(`Dirección: ${datos.direccion}`);
  if (datos.dressCode) leidos.push(`Dress code: ${datos.dressCode}`);
  if (datos.instagram) leidos.push(`Instagram: @${datos.instagram}`);
  if (datos.frase) leidos.push(`Frase cargada (${datos.frase.length} caracteres)`);
  if (datos.musica) leidos.push(`Spotify: ${datos.musica}`);
  if (datos.portada) leidos.push('Foto de portada propia (URL)');

  // Historia: el mensaje la recorta en ~90 caracteres con «…».
  if (datos.historia) {
    leidos.push(`Historia cargada (${datos.historia.length} caracteres)`);
    if (datos.historia.endsWith('…')) {
      base.avisos.push(
        'La historia viene RECORTADA: el mensaje de WhatsApp solo incluye los primeros 90 caracteres. Tocá la dedicatoria para completarla con el texto original.',
      );
    }
  }

  // Apertura: por nombre; si no calza, la clásica + aviso.
  const aperturaTexto = dato('apertura');
  if (aperturaTexto) {
    const apertura = buscarPorNombre(APERTURAS_META, aperturaTexto);
    datos.apertura = apertura?.id ?? APERTURA_DEFAULT;
    leidos.push(`Apertura: ${apertura?.nombre ?? aperturaTexto}`);
    if (!apertura) base.avisos.push(`No reconozco la apertura «${aperturaTexto}»: quedó la clásica (sobre).`);
  }

  // Música de fondo: «sin música» → '' (valor legítimo, sin aviso); si no, por nombre.
  const musicaTexto = dato('música de fondo') || dato('musica de fondo');
  if (musicaTexto) {
    if (/sin música|sin musica/i.test(musicaTexto)) {
      datos.musicaFondo = '';
      leidos.push('Música de fondo: sin música');
    } else {
      const tono = buscarPorNombre(TONOS_FONDO, musicaTexto);
      datos.musicaFondo = tono?.id ?? '';
      leidos.push(`Música de fondo: ${tono?.nombre ?? musicaTexto}`);
      if (!tono) base.avisos.push(`No reconozco el tono «${musicaTexto}»: quedó sin música de fondo (la podés elegir en Ajustes).`);
    }
  }

  // Tipografía y acento: por nombre; vacío = los del diseño.
  const tipografiaTexto = dato('tipografía') || dato('tipografia');
  if (tipografiaTexto) {
    const tipografia = buscarPorNombre(TIPOGRAFIAS_META, tipografiaTexto);
    datos.tipografia = tipografia?.id ?? '';
    leidos.push(`Tipografía: ${tipografia?.nombre ?? tipografiaTexto}`);
    if (!tipografia) base.avisos.push(`No reconozco la tipografía «${tipografiaTexto}»: quedó la del diseño.`);
  }

  const acentoTexto = dato('color de acento');
  if (acentoTexto) {
    const acento = buscarPorNombre(ACENTOS_META, acentoTexto);
    datos.acento = acento?.id ?? '';
    leidos.push(`Color de acento: ${acento?.nombre ?? acentoTexto}`);
    if (!acento) base.avisos.push(`No reconozco el color «${acentoTexto}»: quedó el del diseño.`);
  }

  if (momentos.length) {
    leidos.push(`Cronograma: ${momentos.length} momento${momentos.length === 1 ? '' : 's'}`);
  } else if (campos.has('cronograma')) {
    base.avisos.push('El mensaje dice que el cronograma se define después: quedó el de muestra del diseño.');
  }

  // Secciones: «quiero» prende, «sin estas» apaga; lo no mencionado queda igual.
  const leerLista = (clave: string): string[] =>
    (campos.get(clave) ?? '')
      .split(',')
      .map((s) => sinComillas(s))
      .filter((s) => s && s !== '—');

  const prendidas = leerLista('secciones que quiero');
  const apagadas = leerLista('sin estas secciones');
  for (const nombre of prendidas) {
    const key = keyDeSeccion(nombre);
    if (key) base.secciones[key] = true;
  }
  for (const nombre of apagadas) {
    const key = keyDeSeccion(nombre);
    if (key) base.secciones[key] = false;
  }
  if (prendidas.length || apagadas.length) {
    leidos.push(`Secciones: ${prendidas.length} prendidas, ${apagadas.length} apagadas`);
  }

  return { ...base, ok: true, datos, designId: design.id, leidos };
}
