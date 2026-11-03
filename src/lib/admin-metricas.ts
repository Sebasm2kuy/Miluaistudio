// ============================================================
// AGREGACIÓN DE MÉTRICAS DEL PANEL DEL ESTUDIO — funciones puras
// (iteración 042; sin red, sin DOM: 100% testeables)
// ------------------------------------------------------------
// El backend (metricas_admin) entrega filas crudas anónimas; todo el
// cálculo vive acá:
//  - Rangos de período (hoy / 7 días / 30 días / personalizado) en días
//    de Montevideo, con validez estricta (sin futuro, desde <= hasta).
//  - Agregación de tráfico: visitas del período, únicas (sesiones por
//    día), nuevos visitantes, series diarias con ceros rellenados y
//    «personas online» (sesiones con actividad en la ventana reciente).
//  - Serie de registros (clientes.json creadoEn) y confirmaciones RSVP
//    (fecha de cada entrada) para el gráfico de conversión.
//  - Tasa de conversión con denominador honesto: null si no hay visitas
//    medibles (el UI muestra «—» en lugar de inventar un porcentaje).
// ============================================================

import {
  desplazarDia,
  diaMontevideo,
  VENTANA_ONLINE_MIN,
  type FilaMetrica,
} from '../data/metricas-esquema';

export type PeriodoMetricas = 'hoy' | '7d' | '30d' | 'personalizado';

export interface RangoDias {
  /** "YYYY-MM-DD" inclusive. */
  desde: string;
  /** "YYYY-MM-DD" inclusive (<= desde + N - 1; nunca futuro). */
  hasta: string;
}

const DIA_VALIDO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * Calcula el rango del período seleccionado, en días de Montevideo.
 * Devuelve null si el período personalizado es inválido (formato,
 * desde > hasta, o fecha futura). `referencia` es «ahora» (inyectable).
 */
export function calcularRango(
  periodo: PeriodoMetricas,
  opciones: { referencia?: Date; desde?: string; hasta?: string } = {},
): RangoDias | null {
  const referencia = opciones.referencia ?? new Date();
  const hoy = diaMontevideo(referencia);

  if (periodo === 'hoy') return { desde: hoy, hasta: hoy };
  if (periodo === '7d') return { desde: desplazarDia(hoy, -6), hasta: hoy };
  if (periodo === '30d') return { desde: desplazarDia(hoy, -29), hasta: hoy };

  const desde = String(opciones.desde || '').trim();
  const hasta = String(opciones.hasta || '').trim();
  if (!DIA_VALIDO.test(desde) || !DIA_VALIDO.test(hasta)) return null;
  if (desde > hasta) return null;
  if (hasta > hoy) return null; // el futuro todavía no tiene datos: no es un rango válido
  return { desde, hasta };
}

export interface DiaSerie {
  dia: string;
  visitas: number;
  unicas: number;
  nuevas: number;
}

export interface ResumenTrafico {
  /** Cargas de página medibles del período (clase 'visita'). */
  visitas: number;
  /** Sesiones distintas del período (suma de sesiones por día). */
  unicas: number;
  /** Primeros visitantes del navegador dentro del período. */
  nuevas: number;
  /** Sesiones con actividad en los últimos VENTANA_ONLINE_MIN minutos. */
  online: number;
  /** Serie diaria completa del rango (incluye días sin datos, en cero). */
  serie: DiaSerie[];
}

/**
 * Agrega filas crudas del backend al rango pedido. Las filas fuera del
 * rango se ignoran; los «online» se calculan contra `ahora` (ventana de
 * VENTANA_ONLINE_MIN minutos) usando cualquier fila de la sesión.
 * La unicidad es por día (sesión distinta dentro del día): sumar los días
 * da las sesiones del período, la misma semántica de «sesiones» que la
 * herramienta muestra con honestidad en el rótulo del panel.
 */
export function agregarFilasMetricas(
  filas: FilaMetrica[],
  rango: RangoDias,
  ahora: Date,
): ResumenTrafico {
  const limiteOnline = ahora.getTime() - VENTANA_ONLINE_MIN * 60 * 1000;
  const sesionesOnline = new Set<string>();

  const visitasPorDia = new Map<string, number>();
  const sesionesPorDia = new Map<string, Set<string>>();
  const nuevasPorDia = new Map<string, number>();

  for (const fila of filas) {
    const enRango = fila.dia >= rango.desde && fila.dia <= rango.hasta;
    if (enRango && fila.clase === 'visita') {
      visitasPorDia.set(fila.dia, (visitasPorDia.get(fila.dia) || 0) + 1);
      if (!sesionesPorDia.has(fila.dia)) sesionesPorDia.set(fila.dia, new Set());
      sesionesPorDia.get(fila.dia)!.add(fila.sesion);
      if (fila.nuevoVisitante) {
        nuevasPorDia.set(fila.dia, (nuevasPorDia.get(fila.dia) || 0) + 1);
      }
    }
    // Online: cualquier fila (visita o latido) de la ventana reciente cuenta,
    // aunque su día ya cerró (visitante activo a la medianoche).
    if (Date.parse(fila.fecha) >= limiteOnline) {
      sesionesOnline.add(fila.sesion);
    }
  }

  const serie: DiaSerie[] = [];
  let unicas = 0;
  let nuevas = 0;
  for (let dia = rango.desde; dia <= rango.hasta; dia = desplazarDia(dia, 1)) {
    const visitas = visitasPorDia.get(dia) || 0;
    const sesiones = sesionesPorDia.get(dia);
    const unicasDia = sesiones ? sesiones.size : 0;
    const nuevasDia = nuevasPorDia.get(dia) || 0;
    serie.push({ dia, visitas, unicas: unicasDia, nuevas: nuevasDia });
    unicas += unicasDia;
    nuevas += nuevasDia;
  }

  return {
    visitas: [...visitasPorDia.values()].reduce((a, b) => a + b, 0),
    unicas,
    nuevas,
    online: sesionesOnline.size,
    serie,
  };
}

export interface EntradaRegistrable {
  /** Fecha ISO del registro (creadoEn del cliente / fecha del RSVP). */
  fecha: string;
}

export interface DiaRegistros {
  dia: string;
  registros: number;
  confirmaciones: number;
}

/**
 * Serie diaria de cuentas creadas (clientes.json) y confirmaciones RSVP
 * (content/rsvps/*.json) dentro del rango. Acepta cualquier iterable de
 * entradas con `fecha` ISO; entradas sin fecha válida se ignoran.
 */
export function serieRegistrosConfirmaciones(
  cuentas: EntradaRegistrable[],
  rsvps: EntradaRegistrable[],
  rango: RangoDias,
): DiaRegistros[] {
  const registrosPorDia = new Map<string, number>();
  for (const cuenta of cuentas) {
    const dia = diaDeIso(cuenta.fecha);
    if (!dia) continue;
    if (dia < rango.desde || dia > rango.hasta) continue;
    registrosPorDia.set(dia, (registrosPorDia.get(dia) || 0) + 1);
  }

  const confirmacionesPorDia = new Map<string, number>();
  for (const rsvp of rsvps) {
    const dia = diaDeIso(rsvp.fecha);
    if (!dia) continue;
    if (dia < rango.desde || dia > rango.hasta) continue;
    confirmacionesPorDia.set(dia, (confirmacionesPorDia.get(dia) || 0) + 1);
  }

  const serie: DiaRegistros[] = [];
  for (let dia = rango.desde; dia <= rango.hasta; dia = desplazarDia(dia, 1)) {
    serie.push({
      dia,
      registros: registrosPorDia.get(dia) || 0,
      confirmaciones: confirmacionesPorDia.get(dia) || 0,
    });
  }
  return serie;
}

/** Día "YYYY-MM-DD" de una fecha ISO (parte de calendario UTC), null si inválida. */
function diaDeIso(iso: string): string | null {
  const t = Date.parse(String(iso || ''));
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Tasa de conversión en % (1 decimal). null si el denominador es 0:
 * sin visitas medibles no se puede calcular nada honesto.
 */
export function tasaConversion(numerador: number, denominador: number): number | null {
  if (!Number.isFinite(numerador) || !Number.isFinite(denominador) || denominador <= 0) {
    return null;
  }
  return Math.round((numerador / denominador) * 1000) / 10;
}
