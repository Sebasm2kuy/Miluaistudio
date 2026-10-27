/**
 * Pruebas del registro de elementos editables del editor móvil
 * (src/lib/editor-campos.ts).
 *
 * Qué garantiza:
 *  - Cada elemento tocable sobre la invitación existe en el registro y
 *    tiene al menos un campo.
 *  - Cada ruta de campo existe en una configuración base sintética
 *    (nada apunta a campos inexistentes del esquema SiteConfig).
 *  - Las rutas con '{idx}' apuntan a arrays (fotos / momentos).
 *  - Los paneles de ajustes tienen contenido y los tipos de campo son
 *    conocidos por la interfaz.
 *  - Los ids usados por los componentes de la invitación están todos
 *    registrados (un id sin registro se vería NO editable: prohibido).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ELEMENTOS_EDITABLES,
  PANELES_AJUSTES,
  specDeElemento,
  type CampoSpec,
  type TipoCampo,
} from '../src/lib/editor-campos.js';
import type { SiteConfig } from '../src/data/config-schema.js';

/** Base sintética alineada con el esquema (100% ficticia). */
const BASE: SiteConfig = {
  evento: {
    tipo: 't', nombre: 'n', apellido: '', apodo: '', fecha: 'f', anio: 'a',
    fechaEvento: '2026-11-14 21:00', lugar: 'l', ubicacion: 'u', direccion: 'd',
    dressCode: 'gala', mapsUrl: '', mapsEmbedUrl: '', hashtag: '', hashtagUrl: '', duracionHoras: 5,
  },
  dedicatoria: { cita: '', cuerpo: '', firma: '' },
  timeline: { titulo: '', subtitulo: '', eventos: [{ hora: '', titulo: '', desc: '', icono: '' }] },
  galeria: { titulo: '', subtitulo: '', botonSubir: '', photoUploadUrl: '', fotos: [{ webp: '', fallback: '' }] },
  musica: { titulo: '', subtitulo: '', playlistUrl: '', embedUrl: '', botonAgregar: '', botonSpotify: '' },
  rsvp: {
    titulo: '', subtitulo: '', fechaLimite: '', fechaLimiteFull: '', googleSheetUrl: '', hostPhone: '',
    regalos: {
      titulo: '', subtitulo: '',
      abitab: { titulo: '', numero: '' },
      miDinero: { titulo: '', numero: '', numeroInterbancario: '', sucursal: '' },
    },
  },
  footer: { apodo: '', ubicacion: '', frase: '' },
  invitacion: { imagen: '', imagenFallback: '', textoAbrir: '' },
  countdown: {
    titulo: '', labels: { D: '', H: '', M: '', S: '' },
    botonCalendario: '', calendarioTitulo: '', calendarioLocation: '', calendarioDetalles: '',
  },
  fondo: { fotos: ['gradient:bordo-solid'] },
  colores: { principal: '', dorado: '', doradoClaro: '', marfil: '', fondo: '' },
  estilos: {
    modeloComposicion: 'classic', fuenteTitulo: '', fuenteCuerpo: '', fuenteCursiva: '',
    modeloReloj: '', estiloTarjetas: '', estiloBotones: '', modoClaro: false,
    adorno: 'rosas',
  },
  secciones: { sobre: true, cuentaRegresiva: true, cronograma: true, galeria: true, musica: true, confirmacion: true, regalos: true },
  apertura: { tipo: 'sobre' },
  musicaFondo: { tono: 'vals-dorado', url: '' },
  instagram: { usuario: '', url: '' },
} as SiteConfig;

const TIPOS_VALIDOS: TipoCampo[] = [
  'texto', 'texto-largo', 'url', 'fecha-evento', 'numero', 'color', 'imagen', 'opciones', 'interruptor',
];

function verificarCampo(campo: CampoSpec, contexto: string) {
  assert.ok(campo.path.length > 0, `${contexto}: ruta vacía`);
  assert.ok(TIPOS_VALIDOS.includes(campo.tipo), `${contexto}: tipo desconocido ${campo.tipo}`);
  assert.ok(campo.label.length > 0, `${contexto}: sin etiqueta`);
  const usaIdx = campo.path.some((s) => s === '{idx}');
  const ruta = campo.path.map((s) => (s === '{idx}' ? '0' : s));
  // Caminar la base sintética: la ruta debe existir
  let actual: unknown = BASE;
  for (const segmento of ruta) {
    if (actual === null || typeof actual !== 'object') {
      assert.fail(`${contexto}: la ruta ${ruta.join('.')} sale de un escalar en "${segmento}"`);
    }
    actual = (actual as Record<string, unknown>)[segmento];
    if (actual === undefined) {
      assert.fail(`${contexto}: la ruta ${ruta.join('.')} no existe en la configuración (segmento "${segmento}")`);
    }
  }
  // '{idx}' exige que el contenedor del índice sea un array
  if (usaIdx) {
    const posicionIdx = campo.path.indexOf('{idx}');
    let contenedor: unknown = BASE;
    for (const segmento of campo.path.slice(0, posicionIdx)) {
      if (contenedor === null || typeof contenedor !== 'object') return;
      contenedor = (contenedor as Record<string, unknown>)[segmento];
    }
    assert.ok(Array.isArray(contenedor), `${contexto}: '{idx}' debe apuntar a un array (${ruta.join('.')})`);
  }
}

function leerPadre(ruta: string[]): unknown {
  let actual: unknown = BASE;
  for (const segmento of ruta.slice(0, -1)) {
    if (actual === null || typeof actual !== 'object') return undefined;
    actual = (actual as Record<string, unknown>)[segmento];
  }
  return actual;
}

test('cada elemento editable tiene id, título y campos válidos', () => {
  const ids = Object.keys(ELEMENTOS_EDITABLES);
  assert.ok(ids.length >= 30, 'debe haber un registro completo de elementos (hay ' + ids.length + ')');
  for (const [id, grupo] of Object.entries(ELEMENTOS_EDITABLES)) {
    assert.equal(grupo.id, id, `${id}: la key y el id deben coincidir`);
    assert.ok(grupo.titulo.length > 0, `${id}: sin título`);
    assert.ok(grupo.campos.length > 0, `${id}: sin campos`);
    for (const campo of grupo.campos) verificarCampo(campo, id);
    for (const accion of grupo.acciones ?? []) assert.ok(accion.label.length > 0, `${id}: acción sin etiqueta`);
  }
});

test('las acciones del registro son de tipos conocidos por el panel', () => {
  const permitidos = ['quitar-foto', 'agregar-foto', 'quitar-momento', 'agregar-momento'];
  for (const grupo of Object.values(ELEMENTOS_EDITABLES)) {
    for (const accion of grupo.acciones ?? []) {
      assert.ok(permitidos.includes(accion.tipo), `${grupo.id}: acción desconocida ${accion.tipo}`);
    }
  }
});

test('cada panel de ajustes tiene campos o una sección propia', () => {
  assert.ok(PANELES_AJUSTES.length >= 8);
  for (const panel of PANELES_AJUSTES) {
    const tieneContenido = (panel.campos?.length ?? 0) > 0 || Boolean(panel.custom);
    assert.ok(tieneContenido, `${panel.id}: panel vacío`);
    for (const campo of panel.campos ?? []) verificarCampo(campo, panel.id);
  }
});

test('los ids tocados por los componentes de la invitación están registrados', () => {
  // Mantener esta lista sincronizada con los Editable de src/components.
  // Si un componente usa un id fuera del registro, el elemento NO sería
  // editable y NO debe aparentar serlo (Editable lo ignora).
  const idsEnComponentes = [
    'portada.tipo', 'portada.nombre', 'portada.fecha', 'portada.lugar',
    'dedicatoria.cita', 'dedicatoria.cuerpo', 'dedicatoria.firma',
    'detalles.titulo', 'detalles.etiquetas', 'detalles.calendario',
    'ubicacion.fecha', 'ubicacion.lugar', 'ubicacion.dresscode', 'ubicacion.boton', 'ubicacion.mapa',
    'cronograma.titulo', 'cronograma.momento',
    'galeria.titulo', 'galeria.foto', 'galeria.boton',
    'musica.titulo', 'musica.boton-agregar', 'musica.reproductor', 'musica.boton-spotify',
    'confirmar.titulo', 'confirmar.fecha-limite',
    'regalos.titulo', 'regalos.abitab', 'regalos.midinero',
    'instagram.texto',
    'pie.apodo', 'pie.ubicacion', 'pie.frase', 'pie.hashtag',
  ];
  for (const id of idsEnComponentes) {
    assert.ok(specDeElemento(id), `falta registrar el elemento "${id}" que usan los componentes`);
  }
});

test('specDeElemento devuelve undefined para ids desconocidos (no editables silenciosos)', () => {
  assert.equal(specDeElementOInexistente(), undefined);
});

function specDeElementOInexistente() {
  return specDeElemento('elemento.que.no.existe');
}
