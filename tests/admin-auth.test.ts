/**
 * Pruebas del acceso al panel del estudio (src/lib/admin-auth.ts).
 * Decodificación de claims, evaluación de la lista blanca
 * (sebacabrera1982@gmail.com) y ciclo de sesión en sessionStorage
 * (almacén en memoria; ninguna prueba toca la red ni laStorage real).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLAVE_SESION_ADMIN,
  EMAIL_ADMIN,
  cerrarSesionAdmin,
  decodificarClaimsAdmin,
  evaluarAccesoAdmin,
  guardarSesionAdmin,
  leerSesionAdmin,
  type SesionAdmin,
} from '../src/lib/admin-auth.js';
import type { AlmacenLike } from '../src/lib/auth-cliente.js';

const CLIENTE_ID = '118004981247-ah0r221q93h627lrocr6utiiocphhh2j.apps.googleusercontent.com';

/** Almacén en memoria (mismo contrato que sessionStorage). */
function almacenMemoria(): AlmacenLike {
  const mapa = new Map<string, string>();
  return {
    getItem: (k) => (mapa.has(k) ? (mapa.get(k) as string) : null),
    setItem: (k, v) => void mapa.set(k, v),
    removeItem: (k) => void mapa.delete(k),
  };
}

/** JWT de prueba (payload base64url UTF-8, firma falsa: acá no se verifica firma).
 *  El payload se codifica UTF-8 igual que hace Google con los nombres reales:
 *  btoa solo acepta Latin-1, así que los bytes UTF-8 viajan como "latin-1". */
function jwtDe(claims: Record<string, unknown>): string {
  const b64url = (obj: unknown) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${b64url({ alg: 'ES256', kid: 'test' })}.${b64url(claims)}.firma`;
}

const AHORA = new Date('2026-11-03T15:00:00Z');
const EXP_VALIDO = Math.floor(AHORA.getTime() / 1000) + 3600;

const CLAIMS_OK = {
  email: EMAIL_ADMIN,
  name: 'Sebastián Cabrera',
  email_verified: true,
  aud: CLIENTE_ID,
  iss: 'accounts.google.com',
  exp: EXP_VALIDO,
};

test('decodificarClaimsAdmin lee email, nombre, aud, iss y exp; null ante basura', () => {
  const claims = decodificarClaimsAdmin(jwtDe(CLAIMS_OK));
  assert.ok(claims);
  assert.equal(claims.email, EMAIL_ADMIN);
  assert.equal(claims.nombre, 'Sebastián Cabrera');
  assert.equal(claims.aud, CLIENTE_ID);
  assert.equal(claims.iss, 'accounts.google.com');
  assert.equal(claims.exp, EXP_VALIDO);
  assert.equal(decodificarClaimsAdmin('no-es-jwt'), null);
  assert.equal(decodificarClaimsAdmin('a.b.c'), null);
});

test('evaluarAccesoAdmin: credencial del estudio → sesión con expiración = token', () => {
  const r = evaluarAccesoAdmin(jwtDe(CLAIMS_OK), { clienteId: CLIENTE_ID, ahora: AHORA });
  assert.ok(r.ok);
  assert.equal(r.sesion.email, EMAIL_ADMIN);
  assert.equal(r.sesion.nombre, 'Sebastián Cabrera');
  assert.equal(r.sesion.expiracion, EXP_VALIDO * 1000);
});

test('evaluarAccesoAdmin rechaza con motivo tipado todos los desvíos (fail-closed)', () => {
  const casos: Array<[Record<string, unknown>, string]> = [
    [{ ...CLAIMS_OK, email: 'otro@correo.com' }, 'email'],
    [{ ...CLAIMS_OK, email_verified: false }, 'sin-verificar'],
    [{ ...CLAIMS_OK, aud: 'otro-cliente-id' }, 'audiencia'],
    [{ ...CLAIMS_OK, iss: 'https://emisor-maligno.example' }, 'emisor'],
    [{ ...CLAIMS_OK, exp: Math.floor(AHORA.getTime() / 1000) - 10 }, 'expirado'],
    [{ email: EMAIL_ADMIN }, 'formato'], // sin exp
  ];
  for (const [claims, motivo] of casos) {
    const r = evaluarAccesoAdmin(jwtDe(claims), { clienteId: CLIENTE_ID, ahora: AHORA });
    assert.ok(!r.ok, `esperaba rechazo por ${motivo}`);
    assert.equal(r.motivo, motivo);
  }
  // Credencial ilegible y clienteId vacío también bloquean.
  assert.ok(!evaluarAccesoAdmin('basura', { clienteId: CLIENTE_ID, ahora: AHORA }).ok);
  assert.ok(!evaluarAccesoAdmin(jwtDe(CLAIMS_OK), { clienteId: '', ahora: AHORA }).ok);
});

test('evaluarAccesoAdmin compara el email sin mayúsculas (Gmail es insensible)', () => {
  const r = evaluarAccesoAdmin(
    jwtDe({ ...CLAIMS_OK, email: 'SebaCabrera1982@Gmail.com' }),
    { clienteId: CLIENTE_ID, ahora: AHORA },
  );
  assert.ok(r.ok);
  assert.equal(r.sesion.email, EMAIL_ADMIN);
});

test('sesión admin: guardar/leer/cerrar y borrado por expiración o email ajeno', () => {
  const almacen = almacenMemoria();
  const sesion: SesionAdmin = {
    email: EMAIL_ADMIN,
    nombre: 'Sebastián',
    credencial: 'credencial-de-prueba',
    expiracion: AHORA.getTime() + 1800000,
  };
  guardarSesionAdmin(sesion, almacen);
  const leida = leerSesionAdmin(almacen, AHORA.getTime());
  assert.ok(leida);
  assert.equal(leida.credencial, 'credencial-de-prueba');

  // Expirada → null y borrada.
  assert.equal(leerSesionAdmin(almacen, sesion.expiracion + 1), null);
  assert.equal(almacen.getItem(CLAVE_SESION_ADMIN), null);

  // Email ajeno manipulado → null y borrada (fail-closed).
  guardarSesionAdmin({ ...sesion, email: 'intruso@correo.com' }, almacen);
  assert.equal(leerSesionAdmin(almacen, AHORA.getTime()), null);
  assert.equal(almacen.getItem(CLAVE_SESION_ADMIN), null);

  // Cerrar sesión limpia.
  guardarSesionAdmin(sesion, almacen);
  cerrarSesionAdmin(almacen);
  assert.equal(leerSesionAdmin(almacen, AHORA.getTime()), null);
});
