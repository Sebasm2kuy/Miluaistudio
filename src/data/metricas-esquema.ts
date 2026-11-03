// ============================================================
// ESQUEMA DE MÉTRICAS DE TRÁFICO — filas del backend de Apps Script
// (iteración 042 — panel del estudio /estudio/)
// ------------------------------------------------------------
// Cada visita de la web pública produce una fila anónima en la pestaña
// «Metricas» de la hoja del backend (google-apps-script/gallery-server.gs):
//
//   clase 'visita' → una carga de página medible (portada, catálogo,
//                    personalizador, invitación /i/<slug>/…).
//   clase 'latido' → señal de «pestaña abierta» cada 60 s (solo mientras
//                    la pestaña está visible) para estimar personas online.
//
// Privacidad por diseño (igual que el resto del proyecto):
//  - Sin cookies, sin direcciones IP, sin user agents, sin fingerprints.
//  - `sesion` es un identificador ALEATORIO por pestaña (sessionStorage):
//    no identifica a nadie, solo permite contar sesiones distintas.
//  - `pagina` es solo el pathname (sin query string): nunca viajan
//    parámetros que puedan contener nombres de invitados.
//  - Las banderas nuevaSesionDia / nuevoVisitante son booleanos que el
//    navegador calcula con flags locales (localStorage), sin identificador
//    persistente alguno.
// ============================================================

/** Clases de fila que acepta el esquema. */
export type ClaseMetrica = 'visita' | 'latido';

/** Una fila de métrica tal como la devuelve el backend (metricas_admin). */
export interface FilaMetrica {
  clase: ClaseMetrica;
  /** Instante ISO UTC del registro (lo pone el backend). */
  fecha: string;
  /** Día local de Montevideo "YYYY-MM-DD" (bucket del contador diario). */
  dia: string;
  /** Pathname de la página (solo clase 'visita'; '' en latidos). */
  pagina: string;
  /** Identificador aleatorio de la pestaña (8-64 caracteres hex/base). */
  sesion: string;
  /** Primera visita de esta pestaña en el día (solo clase 'visita'). */
  nuevaSesionDia: boolean;
  /** Primer visitante del navegador (localStorage sin marca previa). */
  nuevoVisitante: boolean;
}

/** Tope de filas que el panel acepta por respuesta (coincide con el backend). */
export const MAX_FILAS_METRICAS = 20000;

/** Ventana de «persona online»: actividad dentro de los últimos N minutos. */
export const VENTANA_ONLINE_MIN = 5;

const MESES_VALIDOS = /^\d{4}-(0[1-9]|1[0-2])$/;
const DIA_VALIDO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const SESION_VALIDA = /^[A-Za-z0-9_-]{8,64}$/;
const PAGINA_VALIDA = /^\/[A-Za-z0-9\-._~/]*$/;

/** Fecha ISO razonable (parseable y entre 2020 y 2100). */
function esFechaIsoRazonable(valor: string): boolean {
  const t = Date.parse(valor);
  if (!Number.isFinite(t)) return false;
  const anio = new Date(t).getUTCFullYear();
  return anio >= 2020 && anio <= 2100;
}

/**
 * Valida y normaliza una fila cruda del backend. Devuelve null si no
 * cumple el esquema (el agregador filtra filas inválidas en silencio,
 * igual que validarColeccionRsvps tolera entradas viejas).
 */
export function validarFilaMetrica(bruto: unknown): FilaMetrica | null {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return null;
  const b = bruto as Record<string, unknown>;

  const clase = b.clase === 'visita' || b.clase === 'latido' ? b.clase : null;
  if (!clase) return null;

  const fecha = String(b.fecha || '').trim();
  if (!esFechaIsoRazonable(fecha)) return null;

  const dia = String(b.dia || '').trim();
  if (!DIA_VALIDO.test(dia)) return null;

  const sesion = String(b.sesion || '').trim();
  if (!SESION_VALIDA.test(sesion)) return null;

  let pagina = '';
  if (clase === 'visita') {
    pagina = String(b.pagina || '').trim().slice(0, 120);
    // Tolerancia con páginas viejas sin pathname: cuentan como genéricas.
    if (pagina && !PAGINA_VALIDA.test(pagina)) return null;
    if (!pagina) pagina = '/';
  }

  return {
    clase,
    fecha,
    dia,
    pagina,
    sesion,
    nuevaSesionDia: b.nuevaSesionDia === true || b.nuevaSesionDia === 1 || b.nuevaSesionDia === '1',
    nuevoVisitante:
      b.nuevoVisitante === true || b.nuevoVisitante === 1 || b.nuevoVisitante === '1',
  };
}

/**
 * Valida la lista de filas que devuelve metricas_admin. Acepta tanto el
 * array directo como el envoltorio { filas: [...] }: filas válidas,
 * ordenadas por fecha, sin pasarse del tope.
 * Nunca lanza; ante cualquier formato inesperado devuelve lo aprovechable.
 */
export function validarFilasMetricas(bruto: unknown): FilaMetrica[] {
  let lista: unknown[] = [];
  if (Array.isArray(bruto)) {
    lista = bruto;
  } else if (bruto && typeof bruto === 'object' && Array.isArray((bruto as { filas?: unknown }).filas)) {
    lista = (bruto as { filas: unknown[] }).filas;
  }
  const filas: FilaMetrica[] = [];
  for (const cruda of lista) {
    const fila = validarFilaMetrica(cruda);
    if (fila) filas.push(fila);
    if (filas.length >= MAX_FILAS_METRICAS) break;
  }
  return filas.sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha));
}

/**
 * Día local de Montevideo ("YYYY-MM-DD") para un instante dado.
 * Uruguay usa GMT-3 todo el año (sin horario de verano, igual que
 * src/lib/fechas.ts), así que el offset fijo es exacto.
 */
export function diaMontevideo(ahora: Date): string {
  const msUtc = ahora.getTime();
  const local = new Date(msUtc - 3 * 3600000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
}

/**
 * Suma o resta días a un día "YYYY-MM-DD" (aritmética UTC pura:
 * los días calendario no dependen de la zona al operar sobre medianoche UTC).
 */
export function desplazarDia(dia: string, delta: number): string {
  const t = Date.parse(`${dia}T00:00:00Z`);
  if (!Number.isFinite(t)) return dia;
  const resultado = new Date(t + delta * 86400000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${resultado.getUTCFullYear()}-${pad(resultado.getUTCMonth() + 1)}-${pad(resultado.getUTCDate())}`;
}
