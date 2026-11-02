/**
 * Pruebas del botón de sesión de la navegación pública
 * (src/lib/sesion-nav.ts), integradas con la lectura real de sesión
 * (src/lib/auth-cliente.ts) sobre un almacén en memoria: ninguna
 * prueba toca sessionStorage ni la red.
 *
 * Cobertura (iteración 040): sin sesión el botón dice «Iniciar sesión»
 * y apunta a /acceso/; con sesión muestra el nombre del cliente y va a
 * /dashboard/ sin cerrarla; nombre vacío recae en el email; sesión
 * expirada vuelve al estado «Iniciar sesión».
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLAVE_SESION,
  leerSesion,
  type AlmacenLike,
  type SesionCliente,
} from '../src/lib/auth-cliente.js';
import { estadoBotonSesion } from '../src/lib/sesion-nav.js';

/** Almacén en memoria (mismo contrato que sessionStorage). */
function almacenMemoria(): AlmacenLike {
  const mapa = new Map<string, string>();
  return {
    getItem: (k) => (mapa.has(k) ? (mapa.get(k) as string) : null),
    setItem: (k, v) => void mapa.set(k, v),
    removeItem: (k) => void mapa.delete(k),
  };
}

const SESION: SesionCliente = {
  email: 'adrian@lumengala.site',
  nombre: 'Adrian',
  slug: 'ejemplo-quince',
  rol: 'cliente',
  expiracion: Date.now() + 60 * 60 * 1000,
};

test('040 · sin sesión el botón dice «Iniciar sesión» y apunta al login', () => {
  const estado = estadoBotonSesion(null);
  assert.equal(estado.conSesion, false);
  assert.equal(estado.texto, 'Iniciar sesión');
  assert.equal(estado.destino, '/acceso/');
  assert.equal(estado.ariaLabel, 'Iniciar sesión');
});

test('040 · con sesión el botón muestra el NOMBRE y entra al panel sin cerrarla', () => {
  const estado = estadoBotonSesion(SESION);
  assert.equal(estado.conSesion, true);
  assert.equal(estado.texto, 'Adrian');
  assert.equal(estado.destino, '/dashboard/');
  assert.equal(estado.ariaLabel, 'Panel de Adrian');
});

test('040 · nombre vacío recae en el email: nunca un botón en blanco', () => {
  const estado = estadoBotonSesion({ ...SESION, nombre: '   ' });
  assert.equal(estado.conSesion, true);
  assert.equal(estado.texto, 'adrian@lumengala.site');
  assert.equal(estado.ariaLabel, 'Panel de adrian@lumengala.site');
});

test('040 · integración con la sesión real de la pestaña (leerSesion)', () => {
  const almacen = almacenMemoria();

  // Primera visita: sin sesión → «Iniciar sesión».
  assert.equal(estadoBotonSesion(leerSesion(almacen)).texto, 'Iniciar sesión');
  assert.equal(estadoBotonSesion(leerSesion(almacen)).destino, '/acceso/');

  // Tras ingresar: la sesión de la pestaña pone el nombre en el botón.
  almacen.setItem(CLAVE_SESION, JSON.stringify(SESION));
  const estado = estadoBotonSesion(leerSesion(almacen));
  assert.equal(estado.conSesion, true);
  assert.equal(estado.texto, 'Adrian');
  assert.equal(estado.destino, '/dashboard/');

  // Sesión expirada: leerSesion la descarta → de vuelta a «Iniciar sesión».
  almacen.setItem(CLAVE_SESION, JSON.stringify({ ...SESION, expiracion: Date.now() - 1000 }));
  assert.equal(estadoBotonSesion(leerSesion(almacen)).texto, 'Iniciar sesión');
  assert.equal(estadoBotonSesion(leerSesion(almacen)).destino, '/acceso/');
});
