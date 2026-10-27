/**
 * Pruebas de las utilidades puras del editor móvil
 * (src/lib/editor-config.ts).
 *
 * Cobertura:
 *  - actualizarEnConfig: rutas anidadas, arrays con índice numérico,
 *    inmutabilidad del objeto original y creación de contenedores.
 *  - resolverRuta / leerCampoEditado / actualizarCampoEditado con el
 *    marcador '{idx}' que usan las fotos y los momentos del cronograma.
 *  - Conversiones de fecha evento ↔ input datetime-local.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  actualizarEnConfig,
  actualizarCampoEditado,
  leerCampoEditado,
  leerEnConfig,
  resolverRuta,
  fechaEventoAInput,
  inputAFechaEvento,
} from '../src/lib/editor-config.js';
import type { SiteConfig } from '../src/data/config-schema.js';

const BASE: SiteConfig = {
  evento: {
    tipo: 'Mis XV años',
    nombre: 'Muestra',
    apellido: 'Demo',
    apodo: 'Muestra',
    fecha: 'Sábado 14 de noviembre',
    anio: '2026',
    fechaEvento: '2026-11-14 21:00',
    lugar: 'Salón Demo',
    ubicacion: 'Montevideo',
    direccion: 'Av. Ejemplo 123',
    mapsUrl: '',
    hashtag: '',
    hashtagUrl: '',
  },
  dedicatoria: { cita: 'Un sueño', cuerpo: 'Texto', firma: 'La familia' },
  timeline: {
    titulo: 'Cronograma',
    subtitulo: 'La noche',
    eventos: [
      { hora: '21:00', titulo: 'Recepción', desc: 'Llegada', icono: '🥂' },
      { hora: '22:00', titulo: 'Vals', desc: 'Baile', icono: '💃' },
    ],
  },
  galeria: {
    titulo: 'Galería',
    subtitulo: 'Momentos',
    botonSubir: 'Dejale un recuerdo',
    photoUploadUrl: '',
    fotos: [
      { webp: 'https://ejemplo.com/a.webp', fallback: 'https://ejemplo.com/a.webp' },
      { webp: 'https://ejemplo.com/b.webp', fallback: 'https://ejemplo.com/b.webp' },
    ],
  },
  musica: { titulo: 'Música', subtitulo: '', playlistUrl: '', embedUrl: '', botonAgregar: '', botonSpotify: '' },
  rsvp: {
    titulo: 'Confirmá',
    subtitulo: '',
    fechaLimite: '',
    fechaLimiteFull: '',
    googleSheetUrl: '',
    hostPhone: '',
    regalos: {
      titulo: 'Regalos',
      subtitulo: '',
      abitab: { titulo: 'Abitab', numero: '12345' },
      miDinero: { titulo: 'Banco', numero: '67890' },
    },
  },
  footer: { apodo: 'Muestra', ubicacion: '', frase: 'Nos vemos' },
  invitacion: { imagen: '', imagenFallback: '', textoAbrir: 'Abrir' },
  countdown: {
    titulo: 'Falta poco',
    labels: { D: 'Días', H: 'Horas', M: 'Min', S: 'Seg' },
    botonCalendario: 'Agregar',
    calendarioTitulo: '',
    calendarioLocation: '',
    calendarioDetalles: '',
  },
  fondo: { fotos: [] },
  colores: { principal: '#3d0202', dorado: '#b8860b', doradoClaro: '#d4af37', marfil: '#fdfcfb', fondo: '#050505' },
  estilos: {
    fuenteTitulo: 'playfair',
    fuenteCuerpo: 'montserrat',
    fuenteCursiva: 'alex-brush',
    modeloReloj: 'classic',
    estiloTarjetas: 'gold-border',
    estiloBotones: 'gold-gradient',
  },
} as SiteConfig;

test('actualizarEnConfig: cambia un campo anidado sin mutar el original', () => {
  const copiaTexto = JSON.stringify(BASE);
  const siguiente = actualizarEnConfig(BASE, ['evento', 'nombre'], 'Otro Nombre');
  assert.equal(siguiente.evento.nombre, 'Otro Nombre');
  assert.equal(BASE.evento.nombre, 'Muestra');
  // El resto del objeto se conserva intacto
  assert.equal(siguiente.evento.lugar, 'Salón Demo');
  assert.equal(siguiente.timeline.eventos.length, 2);
  assert.equal(copiaTexto, JSON.stringify(BASE));
});

test('actualizarEnConfig: actualiza un elemento de un array por índice numérico', () => {
  const siguiente = actualizarEnConfig(BASE, ['galeria', 'fotos', '1', 'webp'], 'https://nueva.com/f.webp');
  assert.equal(siguiente.galeria.fotos[1].webp, 'https://nueva.com/f.webp');
  // La otra foto no cambia
  assert.equal(siguiente.galeria.fotos[0].webp, 'https://ejemplo.com/a.webp');
  // Y el original tampoco
  assert.equal(BASE.galeria.fotos[1].webp, 'https://ejemplo.com/b.webp');
});

test('actualizarEnConfig: ignora índices fuera de rango en vez de corromper el array', () => {
  const siguiente = actualizarEnConfig(BASE, ['galeria', 'fotos', '9', 'webp'], 'x');
  assert.equal(siguiente.galeria.fotos.length, 2);
});

test('actualizarEnConfig: crea contenedores que falten (etiqueta nueva de countdown)', () => {
  const sinSecciones = JSON.parse(JSON.stringify(BASE)) as SiteConfig;
  delete (sinSecciones as unknown as Record<string, unknown>).secciones;
  const siguiente = actualizarEnConfig(sinSecciones, ['secciones', 'galeria'], false);
  const secciones = (siguiente as unknown as { secciones: Record<string, unknown> }).secciones;
  assert.equal(secciones.galeria, false);
});

test('resolverRuta y leerCampoEditado: reemplazan {idx} por el índice tocado', () => {
  assert.deepEqual(resolverRuta(['timeline', 'eventos', '{idx}', 'hora'], 1), ['timeline', 'eventos', '1', 'hora']);
  const valor = leerCampoEditado<string>(BASE, ['timeline', 'eventos', '{idx}', 'titulo'], 1);
  assert.equal(valor, 'Vals');
  // Sin idx cae al 0 (comportamiento predecible para la UI)
  assert.equal(leerCampoEditado<string>(BASE, ['galeria', 'fotos', '{idx}', 'webp']), 'https://ejemplo.com/a.webp');
});

test('actualizarCampoEditado: edita el elemento idx de un array con marcador {idx}', () => {
  const siguiente = actualizarCampoEditado(BASE, ['timeline', 'eventos', '{idx}', 'titulo'], 'Cena', 0);
  assert.equal(siguiente.timeline.eventos[0].titulo, 'Cena');
  assert.equal(siguiente.timeline.eventos[1].titulo, 'Vals');
});

test('leerEnConfig: devuelve undefined en rutas inexistentes sin lanzar', () => {
  assert.equal(leerEnConfig(BASE, ['no', 'existe']), undefined);
  assert.equal(leerEnConfig(null, ['evento']), undefined);
});

test('fechas: conversión ida y vuelta entre el esquema y datetime-local', () => {
  assert.equal(fechaEventoAInput('2026-11-14 21:00'), '2026-11-14T21:00');
  assert.equal(inputAFechaEvento('2026-11-14T21:00'), '2026-11-14 21:00');
  // Valor inválido o vacío → cadena vacía (el input muestra vacío, no basura)
  assert.equal(fechaEventoAInput(''), '');
  assert.equal(fechaEventoAInput('fecha texto'), '');
  assert.equal(inputAFechaEvento(''), '');
  // Ida y vuelta completa
  const ida = fechaEventoAInput('2026-12-01 09:30');
  assert.equal(inputAFechaEvento(ida), '2026-12-01 09:30');
});
