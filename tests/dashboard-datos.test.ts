/**
 * Pruebas de los esquemas de datos del panel (clientes + RSVPs) y de los
 * validadores del editor (src/data/*.ts y src/lib/dashboard-validacion.ts).
 * Todo con datos sintéticos.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validarColeccionClientes,
  buscarCuenta,
  esHashValido,
  normalizarEmail,
  serializarClientes,
} from '../src/data/clientes-esquema.js';
import {
  normalizarEntradaRsvp,
  validarColeccionRsvps,
  resumenRsvps,
  rutaArchivoRsvps,
  serializarRsvps,
  coleccionRsvpsVacia,
} from '../src/data/rsvps-esquema.js';
import {
  validarTextoRequerido,
  validarTextoOpcional,
  validarUrlOpcional,
  validarSpotify,
  validarCantidad,
  validarListaNombres,
  validarFechaEvento,
  desglosarFecha,
  valorInputDesdeFecha,
} from '../src/lib/dashboard-validacion.js';

const HASH_DEMO = 'pbkdf2-sha256$310000$7si2T5HeOPStQ6jjrtJ3Zg==$55ustdZkA6JBLY6tLSYbGEoD0RB/sBUN9raiV6mBOWg=';

test('clientes: hash PBKDF2 con formato válido detectado (y basura rechazada)', () => {
  assert.equal(esHashValido(HASH_DEMO), true);
  assert.equal(esHashValido('$2a$12$hashDeBcryptNoSirve'), false);
  assert.equal(esHashValido('texto-claro'), false);
});

test('clientes: colección válida pasa; email duplicado o hash inválido fallan cerrado', () => {
  const base = {
    esquema: 1,
    actualizadoEn: '2026-10-31T00:00:00Z',
    cuentas: [
      { email: 'Ana@Mail.com', nombre: 'Familia Ana', hash: HASH_DEMO, rol: 'cliente', slug: 'ejemplo-quince', creadoEn: '2026-10-31T00:00:00Z' },
    ],
  };
  const ok = validarColeccionClientes(base);
  assert.ok(ok);
  assert.equal(ok?.cuentas[0].email, 'ana@mail.com'); // normalizado

  const duplicada = validarColeccionClientes({
    ...base,
    cuentas: [base.cuentas[0], { ...base.cuentas[0], hash: HASH_DEMO }],
  });
  assert.equal(duplicada, null);

  const hashMalo = validarColeccionClientes({
    ...base,
    cuentas: [{ ...base.cuentas[0], hash: 'claro' }],
  });
  assert.equal(hashMalo, null);

  assert.equal(validarColeccionClientes({ esquema: 99, cuentas: [] }), null);
  assert.equal(validarColeccionClientes(null), null);
});

test('clientes: buscarCuenta normaliza el email', () => {
  const cuenta = { email: 'ana@mail.com', nombre: 'Ana', hash: HASH_DEMO, rol: 'cliente' as const, slug: 's', creadoEn: '' };
  assert.equal(buscarCuenta([cuenta], '  ANA@Mail.COM ')?.email, 'ana@mail.com');
  assert.equal(buscarCuenta([cuenta], 'otra@x.com'), null);
  assert.equal(normalizarEmail(' X@Y.ZZ '), 'x@y.zz');
});

test('clientes: serialización estable con salto final', () => {
  const texto = serializarClientes({ esquema: 1, actualizadoEn: '', cuentas: [] });
  assert.match(texto, /\n$/);
  assert.deepEqual(JSON.parse(texto), { esquema: 1, actualizadoEn: '', cuentas: [] });
});

test('rsvps: normalizarEntradaRsvp recorta, sanitiza y aplica defaults', () => {
  const r = normalizarEntradaRsvp({
    codigo: ' MIL-9 ',
    cantidad: 99,
    invitados: ['  María González ', 'A', '', 'Pedro Pérez'],
    telefono: '099111222', // se descarta: nunca al repo
    fecha: 'no-es-fecha',
    asistencia: 'lo-que-sea',
    cancion: '  La cola del ratón  ',
    origen: 'desconocido',
  });
  assert.ok(r);
  assert.equal(r?.codigo, 'MIL-9');
  assert.deepEqual(r?.invitados, ['María González', 'Pedro Pérez']); // 'A' muy corto, '' vacío
  assert.equal(r?.cantidad, 40); // tope MAX_CANTIDAD_GRUPO
  assert.equal(r?.asistencia, 'si');
  assert.equal(r?.origen, 'formulario');
  assert.equal(r?.cancion, 'La cola del ratón');
  assert.equal(JSON.stringify(r).includes('telefono'), false);
  assert.notEqual(r?.fecha, 'no-es-fecha');
});

test('rsvps: sin nombres válidos o sin código → null', () => {
  assert.equal(normalizarEntradaRsvp({ codigo: 'MIL-1', invitados: [' '] }), null);
  assert.equal(normalizarEntradaRsvp({ invitados: ['Ana'] }), null);
  assert.equal(normalizarEntradaRsvp(null), null);
  assert.equal(normalizarEntradaRsvp('texto'), null);
});

test('rsvps: colección válida con dedup de códigos; esquema viejo → null', () => {
  const coleccion = validarColeccionRsvps({
    esquema: 1,
    actualizadoEn: '',
    rsvps: [
      { codigo: 'MIL-1', invitados: ['Ana'], cantidad: 2, fecha: '2026-11-01T19:00:00Z', asistencia: 'si', origen: 'formulario' },
      { codigo: 'MIL-1', invitados: ['Ana'], cantidad: 2, fecha: '2026-11-01T19:05:00Z', asistencia: 'si', origen: 'formulario' },
      { codigo: 'MIL-2', invitados: ['Beto'], cantidad: 1, fecha: '2026-11-01T19:10:00Z', asistencia: 'no', origen: 'manual' },
    ],
  });
  assert.ok(coleccion);
  assert.equal(coleccion?.rsvps.length, 2);
  assert.equal(validarColeccionRsvps({ esquema: 2, rsvps: [] }), null);
});

test('rsvps: resumen cuenta grupos, personas y asistencia', () => {
  const r = resumenRsvps([
    { codigo: 'A', fecha: '', cantidad: 4, invitados: ['x'], asistencia: 'si', origen: 'formulario' },
    { codigo: 'B', fecha: '', cantidad: 2, invitados: ['y'], asistencia: 'si', origen: 'formulario' },
    { codigo: 'C', fecha: '', cantidad: 5, invitados: ['z'], asistencia: 'no', origen: 'manual' },
  ]);
  assert.deepEqual(r, { grupos: 3, personas: 6, asisten: 2, noAsisten: 1 });
});

test('rsvps: ruta de archivo saneada + colección vacía + serialización estable', () => {
  assert.equal(rutaArchivoRsvps('Ejemplo_Quince!'), 'content/rsvps/ejemploquince.json');
  assert.equal(rutaArchivoRsvps('../../etc/passwd'), 'content/rsvps/etcpasswd.json');
  assert.deepEqual(coleccionRsvpsVacia(new Date('2026-11-01T00:00:00Z')), {
    esquema: 1,
    actualizadoEn: '2026-11-01T00:00:00.000Z',
    rsvps: [],
  });
  assert.match(serializarRsvps(coleccionRsvpsVacia()), /\n$/);
});

test('validación: texto requerido/opcional con topes', () => {
  assert.equal(validarTextoRequerido('  Hola  ', 'el saludo').ok, true);
  assert.equal(validarTextoRequerido('   ', 'el saludo').ok, false);
  assert.equal(validarTextoOpcional('x'.repeat(500), 'X', 400).ok, false);
});

test('validación: URLs http(s) y Spotify', () => {
  assert.ok(validarUrlOpcional('', 'X').ok); // opcional
  assert.equal(validarUrlOpcional('javascript:alert(1)', 'X').ok, false);
  assert.equal(validarUrlOpcional('no-es-url', 'X').ok, false);
  assert.ok(validarUrlOpcional('https://maps.google.com/x', 'X').ok);

  const spotify = validarSpotify('https://open.spotify.com/playlist/abc?si=1');
  assert.ok(spotify.ok);
  if (spotify.ok) assert.equal(spotify.embed, 'https://open.spotify.com/embed/playlist/abc');
  assert.equal(validarSpotify('https://youtube.com/watch?v=x').ok, false);
});

test('validación: cantidad y lista de nombres', () => {
  assert.ok(validarCantidad('12').ok);
  assert.equal(validarCantidad('0').ok, false);
  assert.equal(validarCantidad('41').ok, false);
  assert.equal(validarCantidad('abc').ok, false);
  const lista = validarListaNombres('Ana\n\nB\n  Carlos Pérez ');
  assert.ok(lista.ok);
  if (lista.ok) assert.deepEqual(lista.valor, ['Ana', 'Carlos Pérez']); // 'B' < 2 caracteres se descarta
  assert.equal(validarListaNombres('a').ok, false); // único nombre de 1 carácter
});

test('validación: fecha del evento (ISO razonable) y rechazos', () => {
  const ok = validarFechaEvento('2026-11-21T21:00');
  assert.ok(ok.ok);
  assert.equal(validarFechaEvento('mañana').ok, false);
  assert.equal(validarFechaEvento('').ok, false);
  assert.equal(validarFechaEvento('1500-01-01T00:00').ok, false);
});

test('validación: desglosarFecha produce fechaEvento + fecha visual + año', () => {
  const d = desglosarFecha('2026-11-21T21:00');
  assert.deepEqual(d, { fechaEvento: '2026-11-21 21:00', fecha: '21 de noviembre', anio: '2026' });
  assert.equal(desglosarFecha('2026-13-01T10:00'), null);
  assert.equal(desglosarFecha('holamundo'), null);
});

test('validación: valorInputDesdeFecha convierte "YYYY-MM-DD HH:mm" a datetime-local', () => {
  assert.equal(valorInputDesdeFecha('2026-11-21 21:00'), '2026-11-21T21:00');
  assert.equal(valorInputDesdeFecha('2026-11-21T21:00'), '2026-11-21T21:00');
  assert.equal(valorInputDesdeFecha('basura'), '');
});
