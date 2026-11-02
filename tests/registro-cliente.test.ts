/**
 * Pruebas del registro automático de clientes (iteración 036).
 *
 * Cobertura:
 *  - registrarClienteGoogle (src/lib/registro-cliente.ts): contrato con el
 *    backend de Apps Script — alta creada, email ya existente (idempotente),
 *    error explícito del backend, respuesta ilegible, red caída / timeout,
 *    endpoint o credencial ausente, respuesta incompleta.
 *  - abrirSesionCliente (src/lib/auth-cliente.ts): sesión 8 h con datos
 *    revalidados, normalización, fallback de nombre, rechazo de datos
 *    inválidos y limpieza de intentos de contraseña previos.
 *  - Contrato real con el backend de Google Apps Script
 *    (google-apps-script/gallery-server.gs): el archivo del repo declara la
 *    acción registro_cliente y sus defensas, y sus helpers
 *    (hashSoloGoogle, generarSlugRegistro) producen valores que pasan las
 *    validaciones del esquema TS (esHashValido y forma de slug).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { registrarClienteGoogle } from '../src/lib/registro-cliente.js';
import {
  abrirSesionCliente,
  registrarIntentoFallido,
  minutosRestantesBloqueo,
  leerSesion,
  CLAVE_SESION,
  type AlmacenLike,
} from '../src/lib/auth-cliente.js';
import { esHashValido } from '../src/data/clientes-esquema.js';
import { ENDPOINT_REGISTRO } from '../src/data/registro-auto.js';

const ENDPOINT_FALSO = 'https://script.google.com/macros/s/falso/exec';

function almacenMemoria(): AlmacenLike {
  const mapa = new Map<string, string>();
  return {
    getItem: (k) => (mapa.has(k) ? (mapa.get(k) as string) : null),
    setItem: (k, v) => void mapa.set(k, v),
    removeItem: (k) => void mapa.delete(k),
  };
}

/** fetch inyectable con una cola de respuestas (texto y estado). */
function fetchDeCola(respuestas: Array<{ estado?: number; texto: string }>) {
  const llamadas: Array<{ url: string; init?: RequestInit }> = [];
  const impl = async (input: string, init?: RequestInit) => {
    llamadas.push({ url: input, init });
    const r = respuestas.shift() ?? { estado: 500, texto: '{"success":false,"error":"sin respuesta"}' };
    return {
      ok: (r.estado ?? 200) >= 200 && (r.estado ?? 200) < 300,
      status: r.estado ?? 200,
      text: async () => r.texto,
    } as unknown as Response;
  };
  return { impl, llamadas };
}

function jwtCon(email: string): string {
  const b64url = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url({ email, email_verified: true })}.firma`;
}

// ---------------------------------------------------------------------------
// registrarClienteGoogle
// ---------------------------------------------------------------------------

test('registro: alta creada devuelve email, nombre, slug y nuevo true', async () => {
  const { impl, llamadas } = fetchDeCola([
    { texto: JSON.stringify({ success: true, nuevo: true, email: 'Nueva@Gmail.com', nombre: 'Nueva Cliente', slug: 'nueva-a1b2c3' }) },
  ]);

  const r = await registrarClienteGoogle(jwtCon('nueva@gmail.com'), { endpoint: ENDPOINT_FALSO, fetchImpl: impl });

  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.nuevo, true);
    assert.equal(r.email, 'Nueva@Gmail.com');
    assert.equal(r.nombre, 'Nueva Cliente');
    assert.equal(r.slug, 'nueva-a1b2c3'); // slug ya se devuelve en minúsculas
  }
  // Contrato con el backend: POST simple (text/plain), credencial solo en el cuerpo.
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].init?.method, 'POST');
  const cuerpo = JSON.parse(String(llamadas[0].init?.body));
  assert.equal(cuerpo.tipo, 'registro_cliente');
  assert.match(cuerpo.credential, /^eyJ/);
  assert.ok(String(llamadas[0].init?.headers && (llamadas[0].init?.headers as Record<string, string>)['Content-Type']).includes('text/plain'));
});

test('registro: email ya existente responde success con nuevo false (idempotente)', async () => {
  const { impl } = fetchDeCola([
    { texto: JSON.stringify({ success: true, nuevo: false, email: 'vieja@gmail.com', nombre: 'Cliente Vieja', slug: 'vieja-112233' }) },
  ]);
  const r = await registrarClienteGoogle(jwtCon('vieja@gmail.com'), { endpoint: ENDPOINT_FALSO, fetchImpl: impl });
  assert.deepEqual(r, { ok: true, nuevo: false, email: 'vieja@gmail.com', nombre: 'Cliente Vieja', slug: 'vieja-112233' });
});

test('registro: error explícito del backend se muestra tal cual (motivo backend)', async () => {
  const { impl } = fetchDeCola([
    { texto: JSON.stringify({ success: false, error: 'Ahora mismo hay demasiados registros en curso. Probá de nuevo en un rato.' }) },
  ]);
  const r = await registrarClienteGoogle(jwtCon('x@gmail.com'), { endpoint: ENDPOINT_FALSO, fetchImpl: impl });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.equal(r.motivo, 'backend');
    assert.match(r.mensaje, /demasiados registros/i);
  }
});

test('registro: respuesta ilegible (HTML sin JSON) → backend con mensaje genérico', async () => {
  const { impl } = fetchDeCola([{ texto: '<html>Google necesita que te identifiques</html>' }]);
  const r = await registrarClienteGoogle(jwtCon('x@gmail.com'), { endpoint: ENDPOINT_FALSO, fetchImpl: impl });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'backend');
});

test('registro: red caída → motivo red sin lanzar', async () => {
  const impl = async () => {
    throw new Error('ECONNRESET');
  };
  const r = await registrarClienteGoogle(jwtCon('x@gmail.com'), { endpoint: ENDPOINT_FALSO, fetchImpl: impl });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.equal(r.motivo, 'red');
    assert.match(r.mensaje, /no se pudo confirmar/i);
  }
});

test('registro: timeout por abort → motivo red', async () => {
  const impl = (_input: string, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('abort')));
    });
  const r = await registrarClienteGoogle(jwtCon('x@gmail.com'), { endpoint: ENDPOINT_FALSO, fetchImpl: impl, timeoutMs: 20 });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'red');
});

test('registro: sin endpoint configurado → sin-endpoint y cero llamadas de red', async () => {
  const { impl, llamadas } = fetchDeCola([]);
  const r = await registrarClienteGoogle(jwtCon('x@gmail.com'), { endpoint: '', fetchImpl: impl });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'sin-endpoint');
  assert.equal(llamadas.length, 0);
});

test('registro: credencial vacía → rechazo local sin red', async () => {
  const { impl, llamadas } = fetchDeCola([]);
  const r = await registrarClienteGoogle('', { endpoint: ENDPOINT_FALSO, fetchImpl: impl });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'credencial');
  assert.equal(llamadas.length, 0);
});

test('registro: respuesta sin slug ni email → no se abre nada (backend)', async () => {
  const { impl } = fetchDeCola([{ texto: JSON.stringify({ success: true }) }]);
  const r = await registrarClienteGoogle(jwtCon('x@gmail.com'), { endpoint: ENDPOINT_FALSO, fetchImpl: impl });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.motivo, 'backend');
});

test('registro: la constante del sitio es la URL del Web App del estudio o está vacía (interruptor)', () => {
  // Activada en la iteración 037 (Web App verificado en vivo, fail-closed).
  // Desactivar = volver a ''. Cualquier otro valor es un error de edición:
  // solo se acepta la forma https://script.google.com/macros/s/<id>/exec.
  // El tipo se ensancha a string para que la comparación con '' compile
  // esté la constante activa o desactivada (el guardia no depende del valor).
  const endpoint: string = ENDPOINT_REGISTRO;
  assert.ok(
    endpoint === '' ||
      /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint),
    'ENDPOINT_REGISTRO debe ser la URL /exec del Web App del estudio o cadena vacía',
  );
});

// ---------------------------------------------------------------------------
// abrirSesionCliente
// ---------------------------------------------------------------------------

test('abrirSesionCliente: crea sesión 8 h con email normalizado y rol cliente', () => {
  const almacen = almacenMemoria();
  const ahora = new Date('2026-11-02T12:00:00Z');
  const r = abrirSesionCliente('Nueva@GMAIL.com', 'Nueva Cliente', 'Nueva-A1B2C3', { almacen, ahora });
  assert.equal(r.ok, true);
  const sesion = leerSesion(almacen, ahora.getTime());
  assert.ok(sesion);
  assert.equal(sesion?.email, 'nueva@gmail.com');
  assert.equal(sesion?.slug, 'nueva-a1b2c3'); // minúsculas forzadas
  assert.equal(sesion?.rol, 'cliente');
  assert.equal(sesion?.nombre, 'Nueva Cliente');
  assert.equal(sesion?.expiracion, ahora.getTime() + 8 * 60 * 60 * 1000);
});

test('abrirSesionCliente: nombre demasiado corto cae a la parte local del email', () => {
  const almacen = almacenMemoria();
  const r = abrirSesionCliente('lucia@gmail.com', '  ', 'lucia-a1b2c3', { almacen });
  assert.equal(r.ok, true);
  const sesion = leerSesion(almacen);
  assert.equal(sesion?.nombre, 'lucia');
});

test('abrirSesionCliente: rechaza email inválido y slug con forma inválida', () => {
  const almacen = almacenMemoria();
  assert.deepEqual(abrirSesionCliente('no-es-email', 'Nombre', 'slug-ok', { almacen }), { ok: false, motivo: 'datos-invalidos' });
  assert.deepEqual(abrirSesionCliente('ok@gmail.com', 'Nombre', 'slug con espacios', { almacen }), { ok: false, motivo: 'datos-invalidos' });
  assert.deepEqual(abrirSesionCliente('ok@gmail.com', 'Nombre', 'SLASH/respuesta', { almacen }), { ok: false, motivo: 'datos-invalidos' });
  assert.equal(leerSesion(almacen), null);
});

test('abrirSesionCliente: limpia intentos de contraseña acumulados', () => {
  const almacen = almacenMemoria();
  const email = 'bloqueada@gmail.com';
  for (let i = 0; i < 5; i++) registrarIntentoFallido(email, almacen);
  assert.ok(minutosRestantesBloqueo(email, almacen) > 0);
  const r = abrirSesionCliente(email, 'Nombre', 'slug-ok', { almacen });
  assert.equal(r.ok, true);
  assert.equal(minutosRestantesBloqueo(email, almacen), 0);
});

// ---------------------------------------------------------------------------
// Contrato con el backend real (google-apps-script/gallery-server.gs)
// ---------------------------------------------------------------------------

const CODIGO_GS = readFileSync(join(process.cwd(), 'google-apps-script', 'gallery-server.gs'), 'utf8');

test('backend GAS: expone registro_cliente con sus defensas obligatorias', () => {
  assert.match(CODIGO_GS, /body\.tipo === 'registro_cliente'/);
  assert.match(CODIGO_GS, /function handleRegistroCliente\(/);
  // Verificación de la credencial con Google (no se confía en el JSON del cliente)
  assert.match(CODIGO_GS, /oauth2\.googleapis\.com\/tokeninfo/);
  assert.match(CODIGO_GS, /GOOGLE_CLIENT_ID/);
  assert.match(CODIGO_GS, /GITHUB_TOKEN/);
  // Anti-abuso + idempotencia + hash solo-Google + commit sin rebuild
  assert.match(CODIGO_GS, /REGISTRO_MAX_POR_HORA/);
  assert.match(CODIGO_GS, /REGISTRO_MAX_POR_EMAIL_HORA/);
  assert.match(CODIGO_GS, /nuevo: false/);
  assert.match(CODIGO_GS, /function hashSoloGoogle\(/);
  assert.match(CODIGO_GS, /\[skip ci\]/);
});

test('backend GAS: hashSoloGoogle() pasa la validación del esquema TS (cuenta solo-Google)', () => {
  const contexto: Record<string, unknown> = { CacheService: {}, PropertiesService: {}, Utilities: {} };
  vm.createContext(contexto);
  vm.runInContext(CODIGO_GS, contexto);
  const hash = vm.runInContext('hashSoloGoogle()', contexto);
  assert.equal(typeof hash, 'string');
  assert.ok(esHashValido(hash as string), 'el hash generado por el backend debe respetar REGEX_HASH: ' + String(hash));
  // La salt/hash son aleatorios: dos llamadas no repiten valores.
  const hash2 = vm.runInContext('hashSoloGoogle()', contexto);
  assert.notEqual(hash, hash2);
});

test('backend GAS: generarSlugRegistro produce slug válido, único y evita colisiones', () => {
  const contexto: Record<string, unknown> = { CacheService: {}, PropertiesService: {}, Utilities: {} };
  vm.createContext(contexto);
  vm.runInContext(CODIGO_GS, contexto);
  const cuentas = [{ slug: 'ejemplo-quince' }, { slug: 'familiaperez-9f8e7d' }];
  const generar = (email: string) => vm.runInContext(`generarSlugRegistro(${JSON.stringify(email)}, ${JSON.stringify(cuentas)})`, contexto) as string;

  for (let i = 0; i < 50; i++) {
    const slug = generar('familia.perez@gmail.com');
    assert.match(slug as string, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.match(slug as string, /^familia-perez-[0-9a-f]{6}$/);
    assert.ok(slug !== 'familiaperez-9f8e7d');
  }
  // Email ilegible → base "cliente" + sufijo.
  const minimo = generar('..@@..') as string;
  assert.match(minimo, /^cliente-[0-9a-f]{6}$/);
});
