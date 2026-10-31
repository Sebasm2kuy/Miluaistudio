/**
 * Pruebas del servicio "GitHub como base de datos" (src/lib/github-db.ts).
 *
 * Todas con fetch falso (sin red): verifica la URL llamada, los
 * encabezados (lectura anónima sin token; escritura SIEMPRE con
 * Authorization), el cuerpo del PUT (mensaje con [skip ci], sha, rama),
 * la deduplicación por código y el reintento ante conflicto de SHA.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  leerJSON,
  escribirJSON,
  agregarEntradaRsvp,
  decodificarContenido,
  codificarContenido,
  type FetchLike,
} from '../src/lib/github-db.js';

interface Llamada {
  url: string;
  init?: RequestInit;
}

interface RespuestaFalsa {
  status: number;
  cuerpo?: unknown;
}

/** fetch falso por cola: cada llamada consume la siguiente respuesta y registra la llamada. */
function fetchEnCola(respuestas: RespuestaFalsa[]): { fetch: FetchLike; llamadas: Llamada[]; cuerpos: unknown[] } {
  const llamadas: Llamada[] = [];
  const cuerpos: unknown[] = [];
  const fetch: FetchLike = async (input, init) => {
    llamadas.push({ url: String(input), init });
    if (init?.body) cuerpos.push(JSON.parse(String(init.body)));
    const r = respuestas.shift() ?? { status: 500 };
    const ok = r.status >= 200 && r.status < 300;
    return {
      ok,
      status: r.status,
      json: async () => r.cuerpo ?? {},
    } as unknown as Response;
  };
  return { fetch, llamadas, cuerpos };
}

function respuestaContenido(obj: unknown, sha = 'sha-abc'): RespuestaFalsa {
  const content = Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
  return { status: 200, cuerpo: { content, sha } };
}

test('codificar/decodificar contenido es UTF-8 ida y vuelta (acentos incluidos)', () => {
  const texto = '{"cita":"María y Facundo — 21 de noviembre"}';
  assert.equal(decodificarContenido(codificarContenido(texto)), texto);
});

test('leerJSON SIN token: no envía Authorization y parsea el contenido', async () => {
  const { fetch, llamadas } = fetchEnCola([respuestaContenido({ esquema: 1, rsvps: [] }, 'sha-1')]);
  const r = await leerJSON('content/rsvps/demo.json', { fetchImpl: fetch });
  assert.ok(r.ok);
  if (r.ok) {
    assert.deepEqual(r.data, { esquema: 1, rsvps: [] });
    assert.equal(r.sha, 'sha-1');
  }
  const headers = llamadas[0].init?.headers as Record<string, string>;
  assert.match(llamadas[0].url, /ref=main$/);
  assert.equal(headers.Authorization, undefined);
});

test('leerJSON: 404 → motivo no-existe (colección nueva, no error)', async () => {
  const { fetch } = fetchEnCola([{ status: 404 }]);
  const r = await leerJSON('content/rsvps/otro.json', { fetchImpl: fetch });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'no-existe');
});

test('leerJSON: JSON ilegible → motivo formato', async () => {
  const { fetch } = fetchEnCola([
    { status: 200, cuerpo: { content: Buffer.from('{no-json').toString('base64'), sha: 'x' } },
  ]);
  const r = await leerJSON('x.json', { fetchImpl: fetch });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'formato');
});

test('leerJSON: fallo de red → motivo red, nunca lanza', async () => {
  const fetch: FetchLike = async () => {
    throw new Error('offline');
  };
  const r = await leerJSON('x.json', { fetchImpl: fetch });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'red');
});

test('escribirJSON SIN token: rechaza antes de contactar la API', async () => {
  const { fetch, llamadas } = fetchEnCola([]);
  const r = await escribirJSON('x.json', '{}', { mensaje: 'm', token: '  ', fetchImpl: fetch });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'token');
  assert.equal(llamadas.length, 0);
});

test('escribirJSON: PUT con mensaje, rama, sha y base64 correctos', async () => {
  const { fetch, llamadas, cuerpos } = fetchEnCola([
    { status: 201, cuerpo: { content: { sha: 'sha-nuevo' } } },
  ]);
  const r = await escribirJSON('content/rsvps/demo.json', '{"a":1}', {
    mensaje: 'commit de prueba [skip ci]',
    token: 'tok',
    shaPrevio: 'sha-viejo',
    fetchImpl: fetch,
  });
  assert.ok(r.ok);
  assert.equal((r as { creado: boolean }).creado, false);
  assert.equal(llamadas[0].init?.method, 'PUT');
  const headers = llamadas[0].init?.headers as Record<string, string>;
  assert.equal(headers.Authorization, 'Bearer tok');
  const cuerpo = cuerpos[0] as { message: string; branch: string; sha: string; content: string };
  assert.equal(cuerpo.message, 'commit de prueba [skip ci]');
  assert.equal(cuerpo.branch, 'main');
  assert.equal(cuerpo.sha, 'sha-viejo');
  assert.equal(decodificarContenido(cuerpo.content), '{"a":1}');
});

test('escribirJSON: 401 → motivo token (mensaje accionable)', async () => {
  const { fetch } = fetchEnCola([{ status: 401, cuerpo: { message: 'Bad credentials' } }]);
  const r = await escribirJSON('x.json', '{}', { mensaje: 'm', token: 'tok', fetchImpl: fetch });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'token');
});

test('agregarEntradaRsvp: primera confirmación (404 + PUT) crea el archivo con commit [skip ci] SIN nombres en el mensaje', async () => {
  const { fetch, llamadas, cuerpos } = fetchEnCola([
    { status: 404 },
    { status: 201, cuerpo: { content: { sha: 'sha-2' } } },
  ]);
  const r = await agregarEntradaRsvp(
    'ejemplo-quince',
    { codigo: 'MIL-1234', cantidad: 3, invitados: ['María González'], asistencia: 'si', fecha: '2026-11-01T20:00:00Z', origen: 'formulario' },
    { token: 'tok', fetchImpl: fetch },
  );
  assert.ok(r.ok);
  assert.equal((r as { creado: boolean }).creado, true);
  assert.equal((r as { dedup: boolean }).dedup, false);
  assert.equal(llamadas.length, 2);
  const cuerpo = cuerpos[0] as { message: string; content: string };
  assert.match(cuerpo.message, /^rsvp\(ejemplo-quince\): \+1 confirmación \(3 personas\) \[skip ci\]$/);
  assert.equal(cuerpo.message.includes('María'), false, 'el commit NO lleva nombres');
  const coleccion = JSON.parse(decodificarContenido(cuerpo.content));
  assert.equal(coleccion.rsvps.length, 1);
  assert.equal(coleccion.rsvps[0].codigo, 'MIL-1234');
  assert.equal(coleccion.rsvps[0].telefono, undefined, 'sin teléfonos en el repo');
});

test('agregarEntradaRsvp: dedup por código (segundo clic) NO escribe de nuevo', async () => {
  const existente = {
    esquema: 1,
    actualizadoEn: '2026-11-01T19:00:00Z',
    rsvps: [{ codigo: 'MIL-1234', fecha: '2026-11-01T19:00:00Z', cantidad: 2, invitados: ['Ana'], asistencia: 'si', origen: 'formulario' }],
  };
  const { fetch, llamadas } = fetchEnCola([respuestaContenido(existente, 'sha-1')]);
  const r = await agregarEntradaRsvp(
    'demo',
    { codigo: 'MIL-1234', cantidad: 2, invitados: ['Ana'], asistencia: 'si', fecha: '2026-11-01T19:30:00Z', origen: 'formulario' },
    { token: 'tok', fetchImpl: fetch },
  );
  assert.ok(r.ok);
  assert.equal((r as { dedup: boolean }).dedup, true);
  assert.equal(llamadas.length, 1, 'solo lectura: nada de PUT');
});

test('agregarEntradaRsvp: conflicto 409 → re-lee y reintenta con el SHA nuevo', async () => {
  const v1 = { esquema: 1, actualizadoEn: '', rsvps: [] };
  const { fetch, llamadas, cuerpos } = fetchEnCola([
    respuestaContenido(v1, 'sha-A'), // lectura 1
    { status: 409 }, // PUT con SHA viejo
    respuestaContenido(v1, 'sha-B'), // lectura 2 (otro invitado escribió antes)
    { status: 200, cuerpo: { content: { sha: 'sha-C' } } }, // PUT ok
  ]);
  const r = await agregarEntradaRsvp(
    'demo',
    { codigo: 'MIL-77', cantidad: 1, invitados: ['Beto'], asistencia: 'si', fecha: '2026-11-01T20:00:00Z', origen: 'formulario' },
    { token: 'tok', fetchImpl: fetch },
  );
  assert.ok(r.ok);
  assert.equal(llamadas.length, 4);
  const primerPut = cuerpos[0] as { sha: string };
  const segundoPut = cuerpos[1] as { sha: string };
  assert.equal(primerPut.sha, 'sha-A');
  assert.equal(segundoPut.sha, 'sha-B');
  const coleccionFinal = JSON.parse(decodificarContenido((segundoPut as unknown as { content: string }).content));
  assert.equal(coleccionFinal.rsvps.length, 1);
  assert.equal(coleccionFinal.rsvps[0].codigo, 'MIL-77');
});

test('agregarEntradaRsvp: entrada sin nombres válidos → validacion, sin llamadas', async () => {
  const { fetch, llamadas } = fetchEnCola([]);
  const r = await agregarEntradaRsvp('demo', { codigo: 'MIL-1', invitados: ['   '], cantidad: 2 }, { token: 'tok', fetchImpl: fetch });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'validacion');
  assert.equal(llamadas.length, 0);
});
