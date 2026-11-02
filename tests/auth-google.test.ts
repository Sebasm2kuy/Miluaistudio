/**
 * Pruebas del acceso con Google (iteración 034, src/lib/auth-cliente.ts).
 *
 * Cobertura: iniciarSesionGoogle (coincidencia de email con la cuenta del
 * estudio, email sin verificar, email ajeno → 'sin-cuenta', normalización,
 * sesión con expiración y limpieza de intentos previos) y
 * decodificarPayloadJwt (payload base64url real, email_verified como bool
 * o string, tokens rotos → null sin lanzar).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  iniciarSesionGoogle,
  decodificarPayloadJwt,
  registrarIntentoFallido,
  minutosRestantesBloqueo,
  hashearPassword,
  CLAVE_SESION,
  type AlmacenLike,
} from '../src/lib/auth-cliente.js';
import type { ClienteCuenta } from '../src/data/clientes-esquema.js';

function almacenMemoria(): AlmacenLike {
  const mapa = new Map<string, string>();
  return {
    getItem: (k) => (mapa.has(k) ? (mapa.get(k) as string) : null),
    setItem: (k, v) => void mapa.set(k, v),
    removeItem: (k) => void mapa.delete(k),
  };
}

async function cuentaDemo(email = 'demo@lumengala.site'): Promise<ClienteCuenta> {
  return {
    email,
    nombre: 'Cliente Demostración',
    hash: await hashearPassword('lo-que-sea-1A', { iteraciones: 1000 }),
    rol: 'cliente',
    slug: 'ejemplo-quince',
    creadoEn: '2026-10-31T00:00:00.000Z',
  };
}

/** JWT de prueba con el mismo shape que emite el widget de Google. */
function jwtDePrueba(payload: Record<string, unknown>): string {
  const b64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url(payload)}.firma-falsa`;
}

test('iniciarSesionGoogle: email de cuenta existente abre sesión con slug y expiración', async () => {
  const almacen = almacenMemoria();
  const cuenta = await cuentaDemo();
  const ahora = new Date('2026-10-31T12:00:00Z');

  const resultado = iniciarSesionGoogle(
    'Demo@Lumengala.site', // mayúsculas a propósito: se normaliza
    'Familia Demo',
    true,
    [cuenta],
    { almacen, ahora },
  );

  assert.ok(resultado.ok);
  if (!resultado.ok) return;
  assert.equal(resultado.sesion.email, 'demo@lumengala.site');
  assert.equal(resultado.sesion.nombre, 'Cliente Demostración'); // manda el nombre del estudio
  assert.equal(resultado.sesion.slug, 'ejemplo-quince');
  assert.equal(resultado.sesion.rol, 'cliente');
  const esperado = new Date('2026-10-31T12:00:00Z').getTime() + 8 * 60 * 60 * 1000;
  assert.equal(resultado.sesion.expiracion, esperado);
  // La sesión quedó guardada en el almacén
  assert.ok(almacen.getItem(CLAVE_SESION));
});

test('iniciarSesionGoogle: email ajeno → sin-cuenta (nunca revela nada)', async () => {
  const cuenta = await cuentaDemo();
  const resultado = iniciarSesionGoogle('intruso@gmail.com', 'Intruso', true, [cuenta], {
    almacen: almacenMemoria(),
  });
  assert.deepEqual(resultado, { ok: false, motivo: 'sin-cuenta' });
});

test('iniciarSesionGoogle: email sin verificar de Google → rechaza', async () => {
  const cuenta = await cuentaDemo();
  const resultado = iniciarSesionGoogle(cuenta.email, 'Alguien', false, [cuenta], {
    almacen: almacenMemoria(),
  });
  assert.deepEqual(resultado, { ok: false, motivo: 'email-sin-verificar' });
});

test('iniciarSesionGoogle: email inválido → rechaza antes de mirar cuentas', async () => {
  const resultado = iniciarSesionGoogle('no-es-un-email', 'X', true, [], {
    almacen: almacenMemoria(),
  });
  assert.deepEqual(resultado, { ok: false, motivo: 'email-invalido' });
});

test('iniciarSesionGoogle: limpia el bloqueo de intentos de contraseña al ingresar', async () => {
  const almacen = almacenMemoria();
  const cuenta = await cuentaDemo();
  // Simula 5 fallos previos de contraseña con el mismo email
  for (let i = 0; i < 5; i++) {
    registrarIntentoFallido(cuenta.email, almacen, new Date('2026-10-31T12:00:00Z').getTime());
  }
  assert.ok(minutosRestantesBloqueo(cuenta.email, almacen, new Date('2026-10-31T12:01:00Z').getTime()) > 0);

  const resultado = iniciarSesionGoogle(cuenta.email, 'Nombre Google', true, [cuenta], {
    almacen,
    ahora: new Date('2026-10-31T12:02:00Z'),
  });
  assert.ok(resultado.ok);
  assert.equal(minutosRestantesBloqueo(cuenta.email, almacen, new Date('2026-10-31T12:02:00Z').getTime()), 0);
});

test('decodificarPayloadJwt: payload válido con email_verified booleano', () => {
  const token = jwtDePrueba({
    email: 'Cliente@Lumengala.site',
    name: 'Familia Pérez',
    email_verified: true,
  });
  const datos = decodificarPayloadJwt(token);
  assert.ok(datos);
  assert.equal(datos.email, 'Cliente@Lumengala.site');
  assert.equal(datos.nombre, 'Familia Pérez');
  assert.equal(datos.emailVerificado, true);
});

test('decodificarPayloadJwt: email_verified como string "true" también cuenta', () => {
  const token = jwtDePrueba({ email: 'a@b.com', email_verified: 'true' });
  const datos = decodificarPayloadJwt(token);
  assert.ok(datos);
  assert.equal(datos.emailVerificado, true);
});

test('decodificarPayloadJwt: sin name → nombre vacío sin lanzar', () => {
  const token = jwtDePrueba({ email: 'a@b.com', email_verified: true });
  const datos = decodificarPayloadJwt(token);
  assert.ok(datos);
  assert.equal(datos.nombre, '');
});

test('decodificarPayloadJwt: tokens rotos → null sin lanzar', () => {
  assert.equal(decodificarPayloadJwt(''), null);
  assert.equal(decodificarPayloadJwt('no-es-un-jwt'), null);
  assert.equal(decodificarPayloadJwt('a.b'), null);
  assert.equal(decodificarPayloadJwt('h.c&.i'), null);
  assert.equal(
    decodificarPayloadJwt(`${Buffer.from('x').toString('base64url')}.${Buffer.from('no-json!').toString('base64url')}.f`),
    null,
  );
});
