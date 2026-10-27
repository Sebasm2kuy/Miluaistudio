/**
 * Pruebas del contrato de backends (src/lib/contrato-backend.ts) —
 * completan la batería del cliente RSVP con los casos borde del
 * intérprete y de parsing, y bloquean que un fallo de CORS/timeout/
 * respuesta ilegible pueda interpretarse como éxito.
 *
 * Cobertura adicional (tarea D):
 *  - JSON válido parcial ({}) → pendiente (contrato desactualizado)
 *  - array JSON y cuerpo vacío → no son respuestas de backend
 *  - JSON embebido en el wrapper HTML de Apps Script
 *  - interpretarRespuestaRsvp: todos los estados posibleles
 *  - interpretarRespuestaFoto: moderación pendiente nunca es 'publicada'
 *
 * Datos 100% sintéticos.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGasResponse,
  parseGasResponseBody,
  interpretarRespuestaRsvp,
  interpretarRespuestaFoto,
} from '../src/lib/contrato-backend.js';

test('parseGasResponse: JSON directo de objeto plano', () => {
  assert.deepEqual(parseGasResponse('{"success":true}'), { success: true });
});

test('parseGasResponse: extrae JSON del wrapper HTML de Apps Script', () => {
  const data = parseGasResponse('<html><head></head><body>{"success":false,"error":"X"}</body></html>');
  assert.deepEqual(data, { success: false, error: 'X' });
});

test('parseGasResponse: cuerpo vacío, texto sin JSON y arrays → null', () => {
  assert.equal(parseGasResponse(''), null);
  assert.equal(parseGasResponse('   '), null);
  assert.equal(parseGasResponse('<html>Not Found</html>'), null);
  assert.equal(parseGasResponse('{"roto": '), null);
  assert.equal(parseGasResponse('[{"success":true}]'), null, 'un array no es una respuesta de backend');
});

test('parseGasResponse: JSON de tipo no objeto (número/string) → null', () => {
  assert.equal(parseGasResponse('42'), null);
  assert.equal(parseGasResponse('"ok"'), null);
  assert.equal(parseGasResponse('null'), null);
});

test('parseGasResponseBody: response ilegible → null sin lanzar', async () => {
  const res = new Response('<html>oops</html>', { status: 502 });
  assert.equal(await parseGasResponseBody(res), null);
});

test('interpretarRespuestaRsvp: tabla completa de estados', () => {
  assert.equal(interpretarRespuestaRsvp({ success: true }), 'guardado');
  assert.equal(interpretarRespuestaRsvp({ success: false, error: 'Teléfono inválido' }), 'error');
  assert.equal(interpretarRespuestaRsvp({ error: 'Falta el código' }), 'error');
  assert.equal(interpretarRespuestaRsvp(null), 'pendiente');
  assert.equal(interpretarRespuestaRsvp({}), 'pendiente', 'contrato desactualizado no es éxito');
  assert.equal(interpretarRespuestaRsvp({ ok: true }), 'pendiente', '{ok:true} legado NO es guardado');
  assert.equal(interpretarRespuestaRsvp({ success: 'true' }), 'pendiente', 'tipos incorrectos no son éxito');
});

test('interpretarRespuestaFoto: la moderación pendiente nunca cuenta como publicada', () => {
  assert.equal(interpretarRespuestaFoto(null), 'error');
  assert.equal(interpretarRespuestaFoto({ success: false, error: 'x' }), 'error');
  assert.equal(interpretarRespuestaFoto({ success: true, estado: 'pendiente' }), 'pendiente');
  assert.equal(interpretarRespuestaFoto({ success: true, estado: 'aprobada' }), 'publicada');
  assert.equal(interpretarRespuestaFoto({ success: true, url: '/Miluaistudio/a.jpg' }), 'publicada');
  assert.equal(interpretarRespuestaFoto({ success: true }), 'error', 'éxito sin estado ni url → error');
});
