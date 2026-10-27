/**
 * Pruebas del contrato frontend ↔ backend (Google Apps Script).
 *
 * Datos 100% sintéticos: ninguna entrada proviene de registros de invitados
 * reales. Corren con `npm test` (tsc + node --test), sin dependencias extra.
 *
 * Cobertura pedida por la auditoría:
 *  - éxito verificable / pendiente / error del RSVP
 *  - respuesta inválida y wrapper HTML de Apps Script
 *  - foto pendiente de moderación / publicación solo verificable
 *  - límites server-side declarados en los .gs (como contrato de código)
 *  - aislamiento de demos (endpoints de escritura vacíos)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseGasResponse,
  interpretarRespuestaRsvp,
  interpretarRespuestaFoto,
} from '../src/lib/contrato-backend.js';

// Las pruebas se ejecutan con npm desde la raíz del repo
const ROOT = process.cwd();
const GALLERY_GS = readFileSync(join(ROOT, 'google-apps-script/gallery-server.gs'), 'utf8');
const PHOTO_GS = readFileSync(join(ROOT, 'google-apps-script/photo-server.gs'), 'utf8');
const DEMO_CONFIG = readFileSync(join(ROOT, 'src/data/demo-config.ts'), 'utf8');

// ---------------------------------------------------------------------------
// parseGasResponse
// ---------------------------------------------------------------------------
test('parseGasResponse: JSON directo', () => {
  assert.deepEqual(parseGasResponse('{"success":true,"codigo":"MIL-1234"}'), {
    success: true,
    codigo: 'MIL-1234',
  });
});

test('parseGasResponse: tolera el wrapper HTML de Apps Script', () => {
  const html = '<html><body><pre>{"success":true}</pre></body></html>';
  assert.deepEqual(parseGasResponse(html), { success: true });
});

test('parseGasResponse: texto sin JSON devuelve null', () => {
  assert.equal(parseGasResponse('Internal Server Error'), null);
  assert.equal(parseGasResponse(''), null);
});

test('parseGasResponse: JSON no-objeto (array/número) se rechaza', () => {
  assert.equal(parseGasResponse('[1,2,3]'), null);
  assert.equal(parseGasResponse('42'), null);
});

// ---------------------------------------------------------------------------
// interpretarRespuestaRsvp — guardado / pendiente / error
// ---------------------------------------------------------------------------
test('RSVP: success true ⇒ guardado (solo resultado verificable)', () => {
  assert.equal(interpretarRespuestaRsvp({ success: true, codigo: 'MIL-1234' }), 'guardado');
  // duplicado también es éxito verificable
  assert.equal(interpretarRespuestaRsvp({ success: true, duplicado: true }), 'guardado');
});

test('RSVP: success false con error explícito ⇒ error', () => {
  assert.equal(
    interpretarRespuestaRsvp({ success: false, error: 'Teléfono inválido' }),
    'error',
  );
});

test('RSVP: success false sin mensaje ⇒ error (no pendiente)', () => {
  assert.equal(interpretarRespuestaRsvp({ success: false }), 'error');
});

test('RSVP: respuesta ilegible / null ⇒ pendiente (nunca guardado)', () => {
  assert.equal(interpretarRespuestaRsvp(null), 'pendiente');
  assert.equal(interpretarRespuestaRsvp({ ok: true, message: 'RSVP backend activo' }), 'pendiente');
});

test('RSVP: wrapper HTML con success true ⇒ guardado', () => {
  const data = parseGasResponse('<pre>{"success":true}</pre>');
  assert.equal(interpretarRespuestaRsvp(data), 'guardado');
});

test('RSVP: wrapper HTML ilegible ⇒ pendiente', () => {
  const data = parseGasResponse('<html>Not Found</html>');
  assert.equal(interpretarRespuestaRsvp(data), 'pendiente');
});

// ---------------------------------------------------------------------------
// interpretarRespuestaFoto — moderación
// ---------------------------------------------------------------------------
test('Foto: success + estado pendiente ⇒ pendiente (no publicada)', () => {
  assert.equal(
    interpretarRespuestaFoto({ success: true, estado: 'pendiente', fileId: 'abc' }),
    'pendiente',
  );
});

test('Foto: success + url pública ⇒ publicada (solo backend legacy)', () => {
  assert.equal(
    interpretarRespuestaFoto({ success: true, url: 'https://lh3.googleusercontent.com/d/x' }),
    'publicada',
  );
});

test('Foto: success false / error explícito ⇒ error', () => {
  assert.equal(
    interpretarRespuestaFoto({ success: false, error: 'Imagen muy grande. Maximo 500KB.' }),
    'error',
  );
});

test('Foto: respuesta ilegible ⇒ error (no se afirma recepción)', () => {
  assert.equal(interpretarRespuestaFoto(null), 'error');
  assert.equal(interpretarRespuestaFoto({ ok: true }), 'error');
  assert.equal(interpretarRespuestaFoto({ success: true }), 'error'); // sin url ni estado
});

// ---------------------------------------------------------------------------
// Contrato server-side declarado en los .gs (verificación estática)
// ---------------------------------------------------------------------------
test('gallery-server.gs: es backend SOLO de RSVP (sin endpoints de fotos)', () => {
  for (const prohibido of ['handleChunk', 'handleAssemble', 'handleGetPhotos', 'setSharing']) {
    assert.equal(
      GALLERY_GS.includes(prohibido),
      false,
      `gallery-server.gs no debe contener "${prohibido}" (las fotos van a photo-server.gs con moderación)`,
    );
  }
  assert.ok(GALLERY_GS.includes("action === 'rsvp'"), 'debe aceptar action=rsvp por GET');
  assert.ok(GALLERY_GS.includes("'rsvp_grupo'"), 'debe aceptar POST JSON tipo rsvp_grupo');
});

test('gallery-server.gs: validación server-side y anti-abuso presentes', () => {
  assert.ok(GALLERY_GS.includes('RSVP_MAX_INVITADOS'), 'límite de invitados');
  assert.ok(GALLERY_GS.includes('RSVP_MAX_NOMBRE'), 'límite de longitud de nombre');
  assert.ok(GALLERY_GS.includes('rsvp_rl_'), 'rate limit por teléfono');
  assert.ok(GALLERY_GS.includes('duplicado: true'), 'deduplicación código+teléfono');
  assert.ok(GALLERY_GS.includes('success: false'), 'errores explícitos');
});

test('photo-server.gs: recepción ≠ publicación (moderación obligatoria)', () => {
  assert.ok(PHOTO_GS.includes("estado: 'pendiente'"), 'responde estado pendiente');
  assert.ok(PHOTO_GS.includes('FOLDER_PENDIENTES'), 'guarda en carpeta pendientes');
  // El handler de recepción (handleAssemble) NO comparte el archivo: queda
  // privado hasta que los organizadores aprueban (ahi sí se comparte).
  const assembleBody = PHOTO_GS.match(/function handleAssemble\([\s\S]*?\nfunction /)?.[0] ?? '';
  assert.ok(assembleBody.length > 0, 'existe handleAssemble');
  assert.equal(
    assembleBody.includes('file.setSharing'),
    false,
    'handleAssemble no debe compartir la foto al recibirla',
  );
  assert.ok(PHOTO_GS.includes("estado === 'aprobada'"), 'getPhotos solo devuelve aprobadas');
  assert.ok(PHOTO_GS.includes('0xFF || decodedBytes[1] !== 0xD8'), 'valida firma JPEG real');
  assert.ok(PHOTO_GS.includes('MAX_FILE_SIZE_KB'), 'valida tamaño máximo');
});

// ---------------------------------------------------------------------------
// Aislamiento de demos
// ---------------------------------------------------------------------------
test('demos: endpoints de escritura vacíos y modoDemo activo', () => {
  assert.match(DEMO_CONFIG, /photoUploadUrl: ''/, 'photoUploadUrl vacío en demos');
  assert.match(DEMO_CONFIG, /googleSheetUrl: ''/, 'googleSheetUrl vacío en demos');
  assert.match(DEMO_CONFIG, /hostPhone: ''/, 'sin teléfono de anfitrión en demos');
  assert.match(DEMO_CONFIG, /modoDemo = true/, 'modoDemo activo');
});

test('demos: perfiles sintéticos sin números ni direcciones reales', () => {
  // Sin teléfonos (598… ni 09…) en los perfiles de demostración
  const perfiles = DEMO_CONFIG.slice(0, DEMO_CONFIG.indexOf('function demoGallery'));
  assert.doesNotMatch(perfiles, /598\d{6,}/, 'sin números reales de Uruguay');
  assert.doesNotMatch(perfiles, /wa\.me|api\.whatsapp/, 'sin enlaces de WhatsApp reales');
});
