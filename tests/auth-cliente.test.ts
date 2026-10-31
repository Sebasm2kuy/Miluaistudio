/**
 * Pruebas de la autenticación ligera de clientes (src/lib/auth-cliente.ts).
 *
 * Corren con el WebCrypto REAL de Node (globalThis.crypto.subtle) y un
 * almacén en memoria: ninguna prueba toca sessionStorage ni la red.
 * Cobertura: formato del hash PBKDF2, verificación (éxito/fallo/formato
 * roto), normalización de email, sesión con expiración, límite de
 * intentos (bloqueo y liberación) y flujo completo de login.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashearPassword,
  verificarPassword,
  iniciarSesion,
  guardarSesion,
  leerSesion,
  cerrarSesion,
  registrarIntentoFallido,
  minutosRestantesBloqueo,
  limpiarIntentos,
  validarCredenciales,
  MAX_INTENTOS,
  type AlmacenLike,
} from '../src/lib/auth-cliente.js';
import type { ClienteCuenta } from '../src/data/clientes-esquema.js';

/** Almacén en memoria (mismo contrato que sessionStorage). */
function almacenMemoria(): AlmacenLike {
  const mapa = new Map<string, string>();
  return {
    getItem: (k) => (mapa.has(k) ? (mapa.get(k) as string) : null),
    setItem: (k, v) => void mapa.set(k, v),
    removeItem: (k) => void mapa.delete(k),
  };
}

function cuentaDemo(hash: string): ClienteCuenta {
  return {
    email: 'demo@lumengala.site',
    nombre: 'Cliente Demostración',
    hash,
    rol: 'cliente',
    slug: 'ejemplo-quince',
    creadoEn: '2026-10-31T00:00:00.000Z',
  };
}

test('hashearPassword: formato autodescripto pbkdf2-sha256 con 4 partes', async () => {
  const hash = await hashearPassword('ClaveSegura1', { salB64: 'AAAAAAAAAAAAAAAAAAAAAA==' });
  const partes = hash.split('$');
  assert.equal(partes.length, 4);
  assert.equal(partes[0], 'pbkdf2-sha256');
  assert.equal(partes[1], '310000');
  // Mismo salt → mismo hash (determinista)
  const hash2 = await hashearPassword('ClaveSegura1', { salB64: 'AAAAAAAAAAAAAAAAAAAAAA==' });
  assert.equal(hash, hash2);
});

test('hashearPassword: sal distinta produce hash distinto', async () => {
  const a = await hashearPassword('ClaveSegura1', { salB64: 'AAAAAAAAAAAAAAAAAAAAAA==' });
  const b = await hashearPassword('ClaveSegura1', { salB64: 'BBBBBBBBBBBBBBBBBBBBBB==' });
  assert.notEqual(a, b);
});

test('verificarPassword: correcta → true; incorrecta → false', async () => {
  const hash = await hashearPassword('ClaveSegura1');
  assert.equal(await verificarPassword('ClaveSegura1', hash), true);
  assert.equal(await verificarPassword('otra-clave-99', hash), false);
});

test('verificarPassword: hash malformado → false sin lanzar', async () => {
  assert.equal(await verificarPassword('x', ''), false);
  assert.equal(await verificarPassword('x', 'bcrypt$12$abc$def'), false);
  assert.equal(await verificarPassword('x', 'pbkdf2-sha256$no-num$aa$bb'), false);
});

test('validarCredenciales: email normalizado y contraseña con mínimo', () => {
  const ok = validarCredenciales('  Cliente@Sitio.COM ', 'ClaveSegura1');
  assert.ok(ok.ok);
  if (ok.ok) assert.equal(ok.email, 'cliente@sitio.com');
  assert.equal(validarCredenciales('no-es-email', 'ClaveSegura1').ok, false);
  assert.equal(validarCredenciales('cliente@sitio.com', 'corta').ok, false);
});

test('iniciarSesion: credenciales correctas abren sesión con slug y expiración', async () => {
  const almacen = almacenMemoria();
  const hash = await hashearPassword('ClaveSegura1');
  const ahora = new Date('2026-10-31T12:00:00Z');
  const r = await iniciarSesion('DEMO@lumengala.site', 'ClaveSegura1', [cuentaDemo(hash)], { almacen, ahora });
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.sesion.email, 'demo@lumengala.site');
    assert.equal(r.sesion.slug, 'ejemplo-quince');
    assert.equal(r.sesion.expiracion, ahora.getTime() + 8 * 3600 * 1000);
  }
  const sesion = leerSesion(almacen, ahora.getTime());
  assert.ok(sesion);
  assert.equal(sesion?.slug, 'ejemplo-quince');
});

test('iniciarSesion: contraseña incorrecta NO revela si el email existe', async () => {
  const almacen = almacenMemoria();
  const hash = await hashearPassword('ClaveSegura1');
  const r = await iniciarSesion('demo@lumengala.site', 'OtraClave99', [cuentaDemo(hash)], { almacen });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.match(r.motivo, /Email o contraseña incorrectos/);
    assert.equal(r.motivo.includes('demo@'), false);
  }
  // Y sin cuenta, el mensaje es el mismo (no filtra cuentas existentes)
  const r2 = await iniciarSesion('nadie@x.com', 'OtraClave99', [cuentaDemo(hash)], { almacen });
  assert.equal(r2.ok, false);
  if (!r2.ok) assert.equal(r2.motivo, r.motivo || '');
});

test('iniciarSesion: 5 fallos disparan bloqueo temporal con minutos', async () => {
  const almacen = almacenMemoria();
  const hash = await hashearPassword('ClaveSegura1');
  for (let i = 0; i < MAX_INTENTOS; i++) {
    await iniciarSesion('demo@lumengala.site', 'MalaClave99', [cuentaDemo(hash)], { almacen });
  }
  const bloqueo = minutosRestantesBloqueo('demo@lumengala.site', almacen);
  assert.ok(bloqueo >= 1 && bloqueo <= 15);
  const r = await iniciarSesion('demo@lumengala.site', 'ClaveSegura1', [cuentaDemo(hash)], { almacen });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.match(r.motivo, /Esperá \d+ minuto/);
    assert.ok((r.bloqueadaMinutos ?? 0) >= 1);
  }
});

test('limpiarIntentos libera el bloqueo', () => {
  const almacen = almacenMemoria();
  for (let i = 0; i < MAX_INTENTOS; i++) registrarIntentoFallido('demo@lumengala.site', almacen);
  assert.ok(minutosRestantesBloqueo('demo@lumengala.site', almacen) > 0);
  limpiarIntentos('demo@lumengala.site', almacen);
  assert.equal(minutosRestantesBloqueo('demo@lumengala.site', almacen), 0);
});

test('leerSesion: expiración pasa la sesión a null y la borra', () => {
  const almacen = almacenMemoria();
  const ahora = Date.now();
  guardarSesion(
    { email: 'demo@lumengala.site', nombre: 'X', slug: 's', rol: 'cliente', expiracion: ahora + 1000 },
    almacen,
  );
  assert.ok(leerSesion(almacen, ahora));
  assert.equal(leerSesion(almacen, ahora + 2000), null);
  assert.equal(almacen.getItem('lgs_sesion_cliente'), null);
});

test('cerrarSesion borra la sesión', () => {
  const almacen = almacenMemoria();
  guardarSesion(
    { email: 'a@b.com', nombre: 'X', slug: 's', rol: 'cliente', expiracion: Date.now() + 1000 },
    almacen,
  );
  cerrarSesion(almacen);
  assert.equal(leerSesion(almacen), null);
});

test('leerSesion tolera basura en el almacén', () => {
  const almacen = almacenMemoria();
  almacen.setItem('lgs_sesion_cliente', '{no-json');
  assert.equal(leerSesion(almacen), null);
});
