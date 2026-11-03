/**
 * Pruebas de la agregación de métricas (src/lib/admin-metricas.ts):
 * rangos de período (incluido el personalizado con sus reglas), series
 * diarias con relleno de ceros, sesiones únicas por día, «online» por
 * ventana de minutos y tasas de conversión honestas (null sin visitas).
 * Funciones puras: cero red, cero reloj real.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  agregarFilasMetricas,
  calcularRango,
  serieRegistrosConfirmaciones,
  tasaConversion,
} from '../src/lib/admin-metricas.js';
import type { FilaMetrica } from '../src/data/metricas-esquema.js';

const AHORA = new Date('2026-11-03T15:00:00Z'); // 3/11 12:00 en Montevideo
const HOY = '2026-11-03';

function filaVisita(fechaIso: string, dia: string, sesion: string, extras: Partial<FilaMetrica> = {}): FilaMetrica {
  return {
    clase: 'visita',
    fecha: fechaIso,
    dia,
    pagina: '/',
    sesion,
    nuevaSesionDia: false,
    nuevoVisitante: false,
    ...extras,
  };
}

test('calcularRango: hoy, 7d y 30d en días de Montevideo', () => {
  assert.deepEqual(calcularRango('hoy', { referencia: AHORA }), { desde: HOY, hasta: HOY });
  assert.deepEqual(calcularRango('7d', { referencia: AHORA }), { desde: '2026-10-28', hasta: HOY });
  assert.deepEqual(calcularRango('30d', { referencia: AHORA }), { desde: '2026-10-05', hasta: HOY });
});

test('calcularRango personalizado: válido, rechaza desde>hasta y futuro', () => {
  assert.deepEqual(calcularRango('personalizado', { referencia: AHORA, desde: '2026-10-01', hasta: '2026-10-15' }), {
    desde: '2026-10-01',
    hasta: '2026-10-15',
  });
  assert.equal(calcularRango('personalizado', { referencia: AHORA, desde: '2026-10-15', hasta: '2026-10-01' }), null);
  assert.equal(calcularRango('personalizado', { referencia: AHORA, desde: '2026-10-01', hasta: '2026-11-04' }), null);
  assert.equal(calcularRango('personalizado', { referencia: AHORA, desde: 'tarde', hasta: HOY }), null);
  assert.equal(calcularRango('personalizado', { referencia: AHORA, desde: '', hasta: '' }), null);
});

test('agregarFilasMetricas cuenta visitas, sesiones únicas por día y rellena ceros', () => {
  const rango = { desde: '2026-11-01', hasta: '2026-11-03' };
  const filas: FilaMetrica[] = [
    // Día 1: 3 visitas, 2 sesiones distintas, 1 nuevo visitante.
    filaVisita('2026-11-01T12:00:00Z', '2026-11-01', 's1', { nuevaSesionDia: true, nuevoVisitante: true }),
    filaVisita('2026-11-01T13:00:00Z', '2026-11-01', 's1'),
    filaVisita('2026-11-01T14:00:00Z', '2026-11-01', 's2'),
    // Día 2: 1 visita de la sesión s1 (otra sesión no registrada ese día).
    filaVisita('2026-11-02T13:00:00Z', '2026-11-02', 's1'),
    // Fuera de rango: no cuentan.
    filaVisita('2026-10-31T13:00:00Z', '2026-10-31', 's9'),
    filaVisita('2026-11-05T13:00:00Z', '2026-11-05', 's9'),
  ];

  const r = agregarFilasMetricas(filas, rango, AHORA);
  assert.equal(r.visitas, 4);
  assert.equal(r.unicas, 3); // día 1: s1+s2 (2), día 2: s1 (1)
  assert.equal(r.nuevas, 1);
  assert.equal(r.serie.length, 3);
  assert.deepEqual(r.serie[0], { dia: '2026-11-01', visitas: 3, unicas: 2, nuevas: 1 });
  assert.deepEqual(r.serie[1], { dia: '2026-11-02', visitas: 1, unicas: 1, nuevas: 0 });
  assert.deepEqual(r.serie[2], { dia: '2026-11-03', visitas: 0, unicas: 0, nuevas: 0 }); // relleno de ceros
});

test('agregarFilasMetricas: online = sesiones con actividad en los últimos 5 min (latidos incluidos)', () => {
  const rango = { desde: HOY, hasta: HOY };
  const hace2min = new Date(AHORA.getTime() - 2 * 60000).toISOString();
  const hace10min = new Date(AHORA.getTime() - 10 * 60000).toISOString();

  const r = agregarFilasMetricas(
    [
      filaVisita(hace2min, HOY, 'activo'),
      filaVisita(hace10min, HOY, 'dormido'),
      { clase: 'latido', fecha: hace2min, dia: HOY, pagina: '', sesion: 'latido-reciente', nuevaSesionDia: false, nuevoVisitante: false },
    ],
    rango,
    AHORA,
  );
  assert.equal(r.online, 2); // 'activo' + 'latido-reciente'; 'dormido' ya no está
});

test('serieRegistrosConfirmaciones arma la serie diaria de cuentas y RSVPs del rango', () => {
  const rango = { desde: '2026-11-02', hasta: '2026-11-03' };
  const serie = serieRegistrosConfirmaciones(
    [
      { fecha: '2026-11-02T10:00:00Z' },
      { fecha: '2026-11-03T10:00:00Z' },
      { fecha: '2026-11-03T11:00:00Z' },
      { fecha: 'fecha-invalida' },
    ],
    [{ fecha: '2026-11-03T12:00:00Z' }, { fecha: '2026-10-20T12:00:00Z' }],
    rango,
  );
  assert.deepEqual(serie, [
    { dia: '2026-11-02', registros: 1, confirmaciones: 0 },
    { dia: '2026-11-03', registros: 2, confirmaciones: 1 },
  ]);
});

test('tasaConversion: porcentaje con 1 decimal y null sin visitas (nunca inventa)', () => {
  assert.equal(tasaConversion(1, 4), 25);
  assert.equal(tasaConversion(1, 3), 33.3);
  assert.equal(tasaConversion(0, 10), 0);
  assert.equal(tasaConversion(5, 0), null);
  assert.equal(tasaConversion(5, -1), null);
});
