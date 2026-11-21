/**
 * Pruebas del esquema de métricas de tráfico (src/data/metricas-esquema.ts).
 * Validación de filas del backend, día de Montevideo y aritmética de días.
 * Cero red y cero DOM: entradas y salidas puras.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validarFilaMetrica,
  validarFilasMetricas,
  diaMontevideo,
  desplazarDia,
} from '../src/data/metricas-esquema.js';

const FILA_BASE = {
  clase: 'visita',
  fecha: '2026-11-03T15:10:00.000Z',
  dia: '2026-11-03',
  pagina: '/',
  sesion: 'a1b2c3d4e5f6a7b8',
  nuevaSesionDia: true,
  nuevoVisitante: false,
};

test('validarFilaMetrica acepta una fila de visita correcta', () => {
  const fila = validarFilaMetrica(FILA_BASE);
  assert.ok(fila);
  assert.equal(fila.clase, 'visita');
  assert.equal(fila.dia, '2026-11-03');
  assert.equal(fila.pagina, '/');
  assert.equal(fila.nuevaSesionDia, true);
  assert.equal(fila.nuevoVisitante, false);
});

test('validarFilaMetrica acepta latido sin página y acepta flags numéricos del backend', () => {
  const fila = validarFilaMetrica({
    clase: 'latido',
    fecha: '2026-11-03T15:11:00.000Z',
    dia: '2026-11-03',
    pagina: '',
    sesion: 'a1b2c3d4e5f6a7b8',
    nuevaSesionDia: 0,
    nuevoVisitante: 0,
  });
  assert.ok(fila);
  assert.equal(fila.pagina, '');
  assert.equal(fila.nuevaSesionDia, false);
});

test('validarFilaMetrica rechaza filas con clase/fecha/día/sesión inválidos', () => {
  assert.equal(validarFilaMetrica(null), null);
  assert.equal(validarFilaMetrica('x'), null);
  assert.equal(validarFilaMetrica({ ...FILA_BASE, clase: 'otra' }), null);
  assert.equal(validarFilaMetrica({ ...FILA_BASE, fecha: 'ayer' }), null);
  assert.equal(validarFilaMetrica({ ...FILA_BASE, dia: '2026-13-40' }), null);
  // Sesión irrecuperable: menos de 4 caracteres (la lectura tolera la pérdida
  // de ceros iniciales por coerción numérica de la hoja, pero no vacíos).
  assert.equal(validarFilaMetrica({ ...FILA_BASE, sesion: 'abc' }), null);
  assert.equal(validarFilaMetrica({ ...FILA_BASE, sesion: '' }), null);
  // Pathnames con query o protocolo no pasan (no viajan datos de query).
  assert.equal(validarFilaMetrica({ ...FILA_BASE, pagina: '/i/x?invitado=Juan' }), null);
  assert.equal(validarFilaMetrica({ ...FILA_BASE, pagina: 'https://maliciosa.com' }), null);
});

test('validarFilaMetrica normaliza coerciones de Google Sheets: fecha epoch y día con formato de fecha', () => {
  // La celda «fecha» puede leerse como número (epoch ms) y la celda «dia»
  // como Date cuyo String() NO es ISO. Antes ambas filas se descartaban en
  // silencio y el panel mostraba 0 visitas con la hoja llena.
  const fila = validarFilaMetrica({
    ...FILA_BASE,
    fecha: 1795271400000, // 2026-11-21T14:30:00.000Z
    dia: 'Fri Nov 21 2026 03:00:00 GMT+0000 (UTC)', // celda fecha con tz del script (UY)
    sesion: 1234567, // coerción numérica perdió ceros iniciales (7 dígitos ≥ 4)
  });
  assert.ok(fila);
  assert.equal(fila.fecha, '2026-11-21T14:30:00.000Z');
  assert.equal(fila.dia, '2026-11-21');
  assert.equal(fila.sesion, '1234567');
});

test('validarFilaMetrica normaliza epoch con separadores de miles y día ISO con hora', () => {
  const fila = validarFilaMetrica({
    ...FILA_BASE,
    fecha: '1.795.286.700.000', // 2026-11-21T18:45:00.000Z con separador de miles
    dia: '2026-11-21T00:00:00.000Z',
  });
  assert.ok(fila);
  assert.equal(fila.fecha, '2026-11-21T18:45:00.000Z');
  // Medianoche UTC de la celda bucketeada a Montevideo cae el día anterior
  // (sin zona conocida de la hoja, el instante manda): 00:00Z → 20/11 21:00.
  assert.equal(fila.dia, '2026-11-20');
});

test('validarFilaMetrica sigue rechazando instantes fuera de rango razonable', () => {
  assert.equal(validarFilaMetrica({ ...FILA_BASE, fecha: 17952714 }), null); // 8 dígitos: ni epoch ni fecha
  assert.equal(validarFilaMetrica({ ...FILA_BASE, fecha: '99999999999999' }), null); // año lejano
  assert.equal(validarFilaMetrica({ ...FILA_BASE, dia: 'texto-ni-fecha' }), null);
});

test('validarFilasMetricas filtra inválidas y ordena por fecha', () => {
  const filas = validarFilasMetricas({
    filas: [
      FILA_BASE,
      { clase: 'latido', fecha: '2026-11-03T15:09:00.000Z', dia: '2026-11-03', pagina: '', sesion: 'a1b2c3d4e5f6a7b8' },
      { clase: 'basura' },
      null,
    ],
  });
  assert.equal(filas.length, 2);
  assert.ok(Date.parse(filas[0].fecha) <= Date.parse(filas[1].fecha));
  assert.equal(validarFilasMetricas(null).length, 0);
  assert.equal(validarFilasMetricas({ filas: 'no-array' }).length, 0);
});

test('diaMontevideo devuelve el día GMT-3 aunque el UTC sea otro día', () => {
  // 2026-11-04T01:30Z == 3/11 22:30 en Montevideo.
  assert.equal(diaMontevideo(new Date('2026-11-04T01:30:00Z')), '2026-11-03');
  // 2026-11-03T02:59Z == 2/11 23:59 en Montevideo.
  assert.equal(diaMontevideo(new Date('2026-11-03T02:59:00Z')), '2026-11-02');
  assert.equal(diaMontevideo(new Date('2026-11-03T03:00:00Z')), '2026-11-03');
});

test('desplazarDia suma y resta días cruzando meses y años', () => {
  assert.equal(desplazarDia('2026-11-01', -1), '2026-10-31');
  assert.equal(desplazarDia('2026-11-03', -6), '2026-10-28');
  assert.equal(desplazarDia('2026-12-31', 1), '2027-01-01');
  assert.equal(desplazarDia('2026-02-28', 1), '2026-03-01');
  // Día inválido: devuelto tal cual (sin explotar).
  assert.equal(desplazarDia('no-es-fecha', 3), 'no-es-fecha');
});
