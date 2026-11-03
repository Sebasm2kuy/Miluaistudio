/**
 * Pruebas del acceso directo «Panel del estudio» en el panel de cliente
 * (iteración 043): la visibilidad del enlace en la barra del /dashboard/
 * la decide esEmailDelEstudio() sobre el email de la SESIÓN autenticada.
 *
 * Cobertura: exactitud del email reservado (constante, no un literal
 * disperso), comparación normalizada (mayúsculas/espacios), email ajeno
 * y parecidos que NO deben pasar, y la decisión completa del render con
 * la lectura real de sesión (leerSesion) sobre un almacén en memoria:
 * sesión del estudio → visible; sesión demo → oculto; sesión expirada →
 * oculto. Ninguna prueba toca sessionStorage ni la red.
 *
 * Nota de diseño: la visibilidad del enlace es UX, no seguridad —
 * /estudio/ sigue protegida por su propia puerta fail-closed (042).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLAVE_SESION,
  leerSesion,
  type AlmacenLike,
  type SesionCliente,
} from '../src/lib/auth-cliente.js';
import { EMAIL_ADMIN, esEmailDelEstudio } from '../src/lib/admin-auth.js';

/** Almacén en memoria (mismo contrato que sessionStorage). */
function almacenMemoria(): AlmacenLike {
  const mapa = new Map<string, string>();
  return {
    getItem: (k) => (mapa.has(k) ? (mapa.get(k) as string) : null),
    setItem: (k, v) => void mapa.set(k, v),
    removeItem: (k) => void mapa.delete(k),
  };
}

function sesionDe(email: string): SesionCliente {
  return {
    email,
    nombre: 'Titular',
    slug: 'ejemplo-quince',
    rol: 'cliente',
    expiracion: Date.now() + 60 * 60 * 1000,
  };
}

/** La misma expresión que evalúa guardia.tsx para renderizar (o no) el enlace. */
function enlaceVisible(sesion: SesionCliente | null): boolean {
  return Boolean(sesion && esEmailDelEstudio(sesion.email));
}

test('043 · el email reservado es exactamente el de la cuenta del estudio', () => {
  assert.equal(EMAIL_ADMIN, 'sebacabrera1982@gmail.com');
});

test('043 · esEmailDelEstudio: exacto, mayúsculas y espacios sí entran', () => {
  assert.equal(esEmailDelEstudio('sebacabrera1982@gmail.com'), true);
  assert.equal(esEmailDelEstudio('SebaCabrera1982@Gmail.com'), true);
  assert.equal(esEmailDelEstudio('  sebacabrera1982@gmail.com  '), true);
});

test('043 · esEmailDelEstudio: cualquier otro email queda fuera', () => {
  assert.equal(esEmailDelEstudio('demo@lumengala.site'), false);
  assert.equal(esEmailDelEstudio('sebacabrera1982@gmail.com.ar'), false);
  assert.equal(esEmailDelEstudio('xsebacabrera1982@gmail.com'), false);
  assert.equal(esEmailDelEstudio('sebacabrera1982+xv@gmail.com'), false);
  assert.equal(esEmailDelEstudio('sebacabrera1982@gmail.com.evil.io'), false);
});

test('043 · esEmailDelEstudio: vacío y nulos nunca pasan', () => {
  assert.equal(esEmailDelEstudio(''), false);
  assert.equal(esEmailDelEstudio('   '), false);
  assert.equal(esEmailDelEstudio(null), false);
  assert.equal(esEmailDelEstudio(undefined), false);
});

test('043 · con la sesión del estudio el enlace es visible', () => {
  const almacen = almacenMemoria();
  almacen.setItem(CLAVE_SESION, JSON.stringify(sesionDe(EMAIL_ADMIN)));
  assert.equal(enlaceVisible(leerSesion(almacen)), true);
});

test('043 · con la sesión demo el enlace permanece oculto', () => {
  const almacen = almacenMemoria();
  almacen.setItem(CLAVE_SESION, JSON.stringify(sesionDe('demo@lumengala.site')));
  assert.equal(enlaceVisible(leerSesion(almacen)), false);
});

test('043 · sin sesión (o expirada) el enlace nunca se renderiza', () => {
  assert.equal(enlaceVisible(null), false);
  const almacen = almacenMemoria();
  const expirada = { ...sesionDe(EMAIL_ADMIN), expiracion: Date.now() - 1000 };
  almacen.setItem(CLAVE_SESION, JSON.stringify(expirada));
  assert.equal(leerSesion(almacen), null); // leerSesion la borra
  assert.equal(enlaceVisible(leerSesion(almacen)), false);
});
