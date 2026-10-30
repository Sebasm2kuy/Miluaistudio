/**
 * Pruebas del importador del pedido por WhatsApp
 * (src/lib/importar-whatsapp.ts).
 *
 * Qué garantiza:
 *  - Round-trip completo: mensajeWhatsAppPersonal → mensajeAConfigPersonal
 *    devuelve los mismos datos (diseño, campos, cronograma, secciones,
 *    tipografía, acento, apertura).
 *  - Errores honestos: texto vacío, texto ajeno, diseño desconocido,
 *    mensaje sin diseño.
 *  - Avisos honestos: historia recortada por el mensaje (~90 caracteres),
 *    sin fecha legible, cronograma pendiente.
 *  - Tolerancia de formato: viñetas •, negritas de WhatsApp (*texto*),
 *    guiones - como viñeta, valores «—», @ de Instagram, comillas.
 *  - Mensajes antiguos: las líneas «Música de fondo» (sistema de tonos
 *    retirado) se ignoran sin avisos.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INVITATION_DESIGNS } from '../src/data/invitation-designs.js';
import {
  mensajeWhatsAppPersonal,
  type DatosPersonales,
  type Secciones,
} from '../src/lib/personalizador.js';
import { mensajeAConfigPersonal } from '../src/lib/importar-whatsapp.js';

const DESIGN = INVITATION_DESIGNS[0];
const OTRO_DESIGN = INVITATION_DESIGNS[1] ?? INVITATION_DESIGNS[0];

/** Datos completos: todos los campos con valor, cronograma de 3 momentos. */
const DATOS_COMPLETOS: DatosPersonales = {
  tipo: 'Mis XV años',
  nombre: 'Martina',
  fecha: '2027-05-15',
  hora: '21:30',
  lugar: 'Salón Imperial',
  direccion: 'Rambla Gandhi 1234, Montevideo',
  dressCode: 'Gala',
  instagram: 'martina.xv',
  historia: 'Una noche soñada con la gente que más quiero.',
  frase: 'Que empiece la celebración',
  musica: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
  apertura: 'corazon',
  portada: 'https://example.com/foto.jpg',
  tipografia: 'romantica',
  acento: 'rosa',
  cronograma: [
    { hora: '20:00', titulo: 'Recepción' },
    { hora: '21:00', titulo: 'Ingreso y vals' },
    { hora: '23:30', titulo: 'Brindis' },
  ],
};

const SECCIONES_MIXTAS: Secciones = {
  sobre: true,
  cuentaRegresiva: true,
  cronograma: false,
  galeria: true,
  musica: true,
  confirmacion: true,
  regalos: false,
};

test('round-trip completo: mensaje generado → importador → mismos datos', () => {
  const mensaje = mensajeWhatsAppPersonal(DESIGN, DATOS_COMPLETOS, SECCIONES_MIXTAS);
  const r = mensajeAConfigPersonal(mensaje);

  assert.equal(r.ok, true, 'debe leer el mensaje estándar sin errores: ' + (r.error ?? ''));
  assert.equal(r.error, undefined);
  assert.deepEqual(r.avisos, [], 'sin avisos con datos completos: ' + r.avisos.join(' | '));
  assert.equal(r.designId, DESIGN.id);

  const d = r.datos;
  assert.equal(d.tipo, DATOS_COMPLETOS.tipo);
  assert.equal(d.nombre, DATOS_COMPLETOS.nombre);
  assert.equal(d.fecha, '2027-05-15');
  assert.equal(d.hora, '21:30');
  assert.equal(d.lugar, DATOS_COMPLETOS.lugar);
  assert.equal(d.direccion, DATOS_COMPLETOS.direccion);
  assert.equal(d.dressCode, DATOS_COMPLETOS.dressCode);
  assert.equal(d.instagram, 'martina.xv', 'sin @ inicial');
  assert.equal(d.frase, DATOS_COMPLETOS.frase);
  assert.equal(d.historia, DATOS_COMPLETOS.historia);
  assert.equal(d.musica, DATOS_COMPLETOS.musica);
  assert.equal(d.apertura, 'corazon');
  assert.equal(d.portada, DATOS_COMPLETOS.portada);
  assert.equal(d.tipografia, 'romantica');
  assert.equal(d.acento, 'rosa');
  assert.deepEqual(d.cronograma, DATOS_COMPLETOS.cronograma);
  assert.deepEqual(r.secciones, SECCIONES_MIXTAS);

  // La vista previa menciona lo esencial
  const texto = r.leidos.join('\n');
  assert.match(texto, /Diseño: /);
  assert.match(texto, /Nombre: Martina/);
  assert.match(texto, /3 momentos/);
  assert.match(texto, /prendidas/);
});

test('round-trip con mínimos: campos opcionales vacíos → vacíos (sinBasura)', () => {
  const minimos: DatosPersonales = {
    tipo: '',
    nombre: 'Lucía',
    fecha: '2027-05-15',
    hora: '',
    lugar: 'Salón',
    direccion: '',
    dressCode: '',
    instagram: '',
    historia: '',
    frase: '',
    musica: '',
    apertura: 'sobre',
    portada: '',
    tipografia: '',
    acento: '',
    cronograma: [],
  };
  const mensaje = mensajeWhatsAppPersonal(OTRO_DESIGN, minimos);
  const r = mensajeAConfigPersonal(mensaje);

  assert.equal(r.ok, true);
  assert.equal(r.designId, OTRO_DESIGN.id);
  assert.equal(r.datos.nombre, 'Lucía');
  assert.equal(r.datos.tipo, '');
  assert.equal(r.datos.direccion, '');
  assert.equal(r.datos.instagram, '');
  assert.equal(r.datos.historia, '');
  assert.equal(r.datos.musica, '');
  assert.equal(r.datos.portada, '');
  assert.equal(r.datos.tipografia, '');
  assert.equal(r.datos.acento, '');
  assert.equal(r.datos.hora, '21:00', 'el mensaje pone «a las 21:00 h» por defecto');
  assert.deepEqual(r.datos.cronograma, [], 'sin momentos → cronograma vacío');
  assert.equal(r.avisos.some((a) => /cronograma/i.test(a)), true, 'aviso: cronograma a definir');
  assert.deepEqual(r.avisos.filter((a) => /tono|música de fondo|musica de fondo/i.test(a)), [], 'el sistema de tonos ya no genera avisos');
  assert.deepEqual(r.secciones, { sobre: true, cuentaRegresiva: true, cronograma: true, galeria: true, musica: true, confirmacion: true, regalos: true });
});

test('historia larga: el mensaje la recorta a ~90 caracteres y el importador lo advierte', () => {
  const larga = { ...DATOS_COMPLETOS, historia: 'x'.repeat(140) };
  const mensaje = mensajeWhatsAppPersonal(DESIGN, larga, SECCIONES_MIXTAS);
  const r = mensajeAConfigPersonal(mensaje);

  assert.equal(r.ok, true);
  assert.equal(r.datos.historia.length, 91, '90 + «…»');
  assert.equal(r.datos.historia.endsWith('…'), true);
  assert.equal(r.avisos.some((a) => /recortada/i.test(a)), true, 'debe advertir que viene recortada');
});

test('sin fecha legible: aviso y no error', () => {
  const mensaje = mensajeWhatsAppPersonal(DESIGN, { ...DATOS_COMPLETOS, fecha: '', hora: '21:00' });
  const r = mensajeAConfigPersonal(mensaje);
  assert.equal(r.ok, true);
  assert.equal(r.datos.fecha, '');
  assert.equal(r.avisos.some((a) => /fecha/i.test(a)), true);
});

test('texto vacío → error entendible', () => {
  const r = mensajeAConfigPersonal('   ');
  assert.equal(r.ok, false);
  assert.match(r.error ?? '', /pegá/i);
});

test('texto ajeno al pedido → error entendible', () => {
  const r = mensajeAConfigPersonal('Hola, ¿cómo está el precio de la web?');
  assert.equal(r.ok, false);
  assert.match(r.error ?? '', /no parece un pedido/i);
});

test('diseño desconocido → error con el nombre', () => {
  const mensaje = [
    'Hola! Personalicé mi invitación en la web de Miluaistudio:',
    '',
    '• Diseño: Estilo Que No Existe',
    '• Nombre: Martina',
  ].join('\n');
  const r = mensajeAConfigPersonal(mensaje);
  assert.equal(r.ok, false);
  assert.match(r.error ?? '', /No reconozco el diseño «Estilo Que No Existe»/);
});

test('mensaje sin línea de diseño → error', () => {
  const mensaje = [
    'Hola! Personalicé mi invitación en la web de Miluaistudio:',
    '',
    '• Nombre: Martina',
  ].join('\n');
  const r = mensajeAConfigPersonal(mensaje);
  assert.equal(r.ok, false);
  assert.match(r.error ?? '', /no dice qué diseño/i);
});

test('tolerante a negritas de WhatsApp, viñetas con guión y valores «—»', () => {
  const mensaje = [
    '*Hola! Personalicé mi invitación en la web de Miluaistudio:*',
    '',
    '- *Diseño:* Rosa Romántica',
    '- *Evento:* —',
    '- *Nombre:* *Lucía*',
    '- *Fecha:* 15/5/2027 a las 20:30 h',
    '- *Lugar:* —',
    '- *Dirección:* —',
    '- *Dress code:* —',
    '- *Instagram:* —',
    '- *Frase:* —',
    '- *Apertura:* Sobre clásico',
    '- *Música de fondo:* sin música',
    '',
    '- *Secciones que quiero:* —',
    '',
    '¿Cómo seguimos para dejarla lista?',
  ].join('\n');
  const r = mensajeAConfigPersonal(mensaje);

  assert.equal(r.ok, true, r.error ?? '');
  assert.equal(r.designId, 'rosa-romantica');
  assert.equal(r.datos.nombre, 'Lucía');
  assert.equal(r.datos.tipo, '', '«—» → vacío');
  assert.equal(r.datos.lugar, '');
  assert.equal(r.datos.fecha, '2027-05-15', 'fecha sin ceros a la izquierda');
  assert.equal(r.datos.hora, '20:30');
  assert.equal(r.datos.apertura, 'sobre');
  assert.equal(r.datos.musica, '', 'el mensaje antiguo no trae Spotify → vacío');
  assert.deepEqual(r.secciones, { sobre: true, cuentaRegresiva: true, cronograma: true, galeria: true, musica: true, confirmacion: true, regalos: true }, 'lista «—» no rompe las secciones');
});

test('mensaje antiguo con «Música de fondo» (tonos retirados) importa sin avisos', () => {
  const mensaje = [
    'Hola! Personalicé mi invitación en la web de Miluaistudio:',
    '',
    `• Diseño: ${DESIGN.name}`,
    '• Nombre: Martina',
    '• Música de fondo: Vals Dorado',
    '',
  ].join('\n');
  const r = mensajeAConfigPersonal(mensaje);
  assert.equal(r.ok, true, r.error ?? '');
  assert.equal(r.avisos.some((a) => /música de fondo|tono/i.test(a)), false, 'la línea retirada se ignora en silencio');
  assert.equal(r.datos.nombre, 'Martina');
});

test('cronograma de una sola línea con guión simple también se lee', () => {
  const mensaje = [
    'Hola! Personalicé mi invitación en la web de Miluaistudio:',
    '',
    `• Diseño: ${DESIGN.name}`,
    '• Nombre: Test',
    '• Cronograma:',
    '    20:00 - Recepción',
    '    21:00 - Vals',
  ].join('\n');
  const r = mensajeAConfigPersonal(mensaje);
  assert.equal(r.ok, true);
  assert.deepEqual(r.datos.cronograma, [
    { hora: '20:00', titulo: 'Recepción' },
    { hora: '21:00', titulo: 'Vals' },
  ]);
});

test('limita el cronograma importado a 10 momentos (contrato del editor)', () => {
  const muchas = Array.from({ length: 14 }, (_, i) => ({
    hora: `${String(8 + i).padStart(2, '0')}:00`,
    titulo: `Momento ${i + 1}`,
  }));
  const mensaje = mensajeWhatsAppPersonal(DESIGN, { ...DATOS_COMPLETOS, cronograma: muchas }, SECCIONES_MIXTAS);
  const r = mensajeAConfigPersonal(mensaje);
  assert.equal(r.ok, true);
  assert.equal(r.datos.cronograma.length, 10);
});
