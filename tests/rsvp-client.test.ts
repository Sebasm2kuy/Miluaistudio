/**
 * Pruebas del cliente RSVP (src/lib/rsvp-client.ts) con fetch simulado.
 *
 * Datos 100% sintéticos. Cobertura exigida por la auditoría:
 *  - éxito verificable → 'guardado'
 *  - error explícito del backend → 'error'
 *  - respuesta inválida / ilegible → 'pendiente' (nunca 'guardado')
 *  - timeout y error de red → 'pendiente'
 *  - los datos personales viajan SOLO en el cuerpo del POST, nunca en la URL
 *  - Content-Type text/plain (solicitud simple, sin preflight CORS)
 *  - sin mode: 'no-cors' ni respuestas opacas
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enviarRsvpPost, type RsvpPayload } from '../src/lib/rsvp-client.js';

const URL_BACKEND = 'https://script.google.com/macros/s/DEMO-DEPLOYMENT-ID/exec';

const PAYLOAD: RsvpPayload = {
  codigo: 'MIL-0000',
  cantidad: 2,
  invitados: ['Invitado Uno', 'Invitado Dos'],
  telefono: '099000000',
  fecha: '2026-01-01T00:00:00.000Z',
};

function fetchQueResponde(body: string, ok = true, status = 200) {
  return async (_input: string, _init?: RequestInit) =>
    new Response(body, { status: ok ? status : 500 });
}

test('RSVP POST: success true ⇒ guardado (único resultado verificable)', async () => {
  const resultado = await enviarRsvpPost({
    url: URL_BACKEND,
    payload: PAYLOAD,
    fetchImpl: fetchQueResponde('{"success":true,"codigo":"MIL-0000"}'),
  });
  assert.equal(resultado, 'guardado');
});

test('RSVP POST: tolera el wrapper HTML de Apps Script', async () => {
  const resultado = await enviarRsvpPost({
    url: URL_BACKEND,
    payload: PAYLOAD,
    fetchImpl: fetchQueResponde('<html><pre>{"success":true}</pre></html>'),
  });
  assert.equal(resultado, 'guardado');
});

test('RSVP POST: success false con error ⇒ error', async () => {
  const resultado = await enviarRsvpPost({
    url: URL_BACKEND,
    payload: PAYLOAD,
    fetchImpl: fetchQueResponde('{"success":false,"error":"Teléfono inválido"}'),
  });
  assert.equal(resultado, 'error');
});

test('RSVP POST: respuesta inválida (sin JSON) ⇒ pendiente, nunca guardado', async () => {
  const resultado = await enviarRsvpPost({
    url: URL_BACKEND,
    payload: PAYLOAD,
    fetchImpl: fetchQueResponde('<html>Not Found</html>'),
  });
  assert.equal(resultado, 'pendiente');
});

test('RSVP POST: respuesta HTTP de error ⇒ pendiente (no se puede verificar)', async () => {
  const resultado = await enviarRsvpPost({
    url: URL_BACKEND,
    payload: PAYLOAD,
    fetchImpl: fetchQueResponde('Internal Server Error', false, 500),
  });
  assert.equal(resultado, 'pendiente');
});

test('RSVP POST: timeout (abort) ⇒ pendiente y sin excepción hacia la UI', async () => {
  const lento = async (_input: string, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        const e = new Error('The operation was aborted');
        e.name = 'AbortError';
        reject(e);
      });
    });
  const resultado = await enviarRsvpPost({
    url: URL_BACKEND,
    payload: PAYLOAD,
    fetchImpl: lento,
    timeoutMs: 30,
  });
  assert.equal(resultado, 'pendiente');
});

test('RSVP POST: error de red ⇒ pendiente', async () => {
  const rechazo = async () => {
    throw new TypeError('Failed to fetch');
  };
  const resultado = await enviarRsvpPost({
    url: URL_BACKEND,
    payload: PAYLOAD,
    fetchImpl: rechazo,
  });
  assert.equal(resultado, 'pendiente');
});

test('RSVP POST: sin URL configurada ⇒ pendiente (no envía nada)', async () => {
  let llamado = false;
  const espia = async () => {
    llamado = true;
    throw new Error('no debe llamarse');
  };
  const resultado = await enviarRsvpPost({ url: '', payload: PAYLOAD, fetchImpl: espia });
  assert.equal(resultado, 'pendiente');
  assert.equal(llamado, false);
});

test('RSVP POST: los datos personales van en el CUERPO y la URL queda limpia', async () => {
  let urlRecibida = '';
  let initRecibido: RequestInit | undefined;
  const espia = async (input: string, init?: RequestInit) => {
    urlRecibida = input;
    initRecibido = init;
    return new Response('{"success":true}', { status: 200 });
  };
  const resultado = await enviarRsvpPost({ url: URL_BACKEND, payload: PAYLOAD, fetchImpl: espia });
  assert.equal(resultado, 'guardado');

  // 1. Método POST
  assert.equal(initRecibido?.method, 'POST');
  // 2. La URL no contiene NINGÚN dato personal ni parámetro de consulta
  assert.equal(urlRecibida, URL_BACKEND);
  assert.ok(!urlRecibida.includes('?'), 'la URL no debe llevar query string');
  assert.ok(!urlRecibida.includes('invitados'), 'los nombres no deben viajar en la URL');
  assert.ok(!urlRecibida.includes('telefono'), 'el teléfono no debe viajar en la URL');
  // 3. El cuerpo transporta el contrato completo
  const cuerpo = JSON.parse(String(initRecibido?.body) || '{}');
  assert.equal(cuerpo.tipo, 'rsvp_grupo');
  assert.equal(cuerpo.codigo, PAYLOAD.codigo);
  assert.deepEqual(cuerpo.invitados, PAYLOAD.invitados);
  assert.equal(cuerpo.telefono, PAYLOAD.telefono);
  // 4. Solicitud "simple": text/plain (sin preflight CORS) y sin mode opaco
  const headers = new Headers(initRecibido?.headers);
  assert.match(headers.get('content-type') ?? '', /text\/plain/i);
  assert.notEqual(initRecibido?.mode, 'no-cors');
});

test('RSVP POST: respuesta con ok:true sin success ⇒ pendiente (contrato desactualizado)', async () => {
  // Simula un backend productivo viejo que responde { ok: true } al POST
  const resultado = await enviarRsvpPost({
    url: URL_BACKEND,
    payload: PAYLOAD,
    fetchImpl: fetchQueResponde('{"ok":true,"message":"RSVP backend activo"}'),
  });
  assert.equal(resultado, 'pendiente');
});
