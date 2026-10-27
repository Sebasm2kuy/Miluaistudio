// ============================================================
// EDITOR MÓVIL — utilidades puras de configuración
// ------------------------------------------------------------
// Funciones sin React usadas por el editor visual (/editar):
// lectura y actualización inmutable de rutas anidadas dentro de
// SiteConfig (soporta arrays numéricos y el marcador '{idx}' que
// las plantillas de ruta del registro de elementos usan para
// apuntar a la foto o al momento del cronograma elegido).
// Mantener libre de React/DOM permite probarlo con node:test.
// ============================================================

/**
 * Resuelve el marcador '{idx}' de una ruta con el índice real del
 * elemento tocado. Los segmentos que no son '{idx}' pasan igual.
 */
export function resolverRuta(path: readonly string[], idx?: number): string[] {
  return path.map((segmento) => (segmento === '{idx}' ? String(idx ?? 0) : segmento));
}

/** Lee el valor en una ruta anidada; undefined si la ruta no existe. */
export function leerEnConfig<D = unknown>(config: unknown, path: readonly string[]): D | undefined {
  let actual: unknown = config;
  for (const segmento of path) {
    if (actual === null || actual === undefined) return undefined;
    if (typeof actual !== 'object') return undefined;
    actual = (actual as Record<string, unknown>)[segmento];
  }
  return actual as D | undefined;
}

/** Lee un valor aplicando '{idx}' antes de buscar. */
export function leerCampoEditado<D = unknown>(config: unknown, path: readonly string[], idx?: number): D | undefined {
  return leerEnConfig<D>(config, resolverRuta(path, idx));
}

/**
 * Devuelve una copia de la config con el valor de la ruta cambiado.
 * Inmutable: el objeto original no se modifica (React depende de
 * referencias nuevas para re-renderizar la invitación en vivo).
 * Crea los contenedores intermedios si faltan; los segmentos
 * numéricos indexan arrays (sin tocar el resto de elementos).
 */
export function actualizarEnConfig<T>(config: T, path: readonly string[], valor: unknown): T {
  if (path.length === 0) return config;
  const clon = clonProfundo(config) as Record<string, unknown>;
  let actual: Record<string, unknown> | unknown[] = clon;

  for (let i = 0; i < path.length - 1; i++) {
    const segmento = path[i];
    const siguiente = (actual as Record<string, unknown>)[segmento];
    if (Array.isArray(actual)) {
      // Sobre un array solo avanzamos por índices existentes: índices
      // fuera de rango dejan la config tal cual (sin crear huecos).
      const indice = Number(segmento);
      if (!Number.isInteger(indice) || indice < 0 || indice >= actual.length) return config;
      actual = actual[indice] as Record<string, unknown> | unknown[];
      continue;
    }
    if (siguiente === null || typeof siguiente !== 'object') {
      // Contenedor faltante: el resto de la ruta decide si es array
      const esArray = /^\d+$/.test(path[i + 1]);
      ;(actual as Record<string, unknown>)[segmento] = esArray ? [] : {};
    }
    actual = (actual as Record<string, unknown>)[segmento] as Record<string, unknown> | unknown[];
  }

  const ultimo = path[path.length - 1];
  if (Array.isArray(actual)) {
    const indice = Number(ultimo);
    if (Number.isInteger(indice) && indice >= 0 && indice < actual.length) {
      actual[indice] = valor;
    }
  } else if (actual && typeof actual === 'object') {
    (actual as Record<string, unknown>)[ultimo] = valor;
  }
  return clon as T;
}

/** Actualiza aplicando '{idx}' (atajo tipado para el editor). */
export function actualizarCampoEditado<T>(config: T, path: readonly string[], valor: unknown, idx?: number): T {
  return actualizarEnConfig(config, resolverRuta(path, idx), valor);
}

function clonProfundo<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}

// ---------------------------------------------------------------------------
// Fechas del evento: el esquema guarda 'YYYY-MM-DD HH:mm' (con espacio, así
// la lee event-info con split(' ')[1]); el input datetime-local exige
// 'YYYY-MM-DDTHH:mm'. Conversiones puras para ida y vuelta del formulario.
// ---------------------------------------------------------------------------

const RE_FECHA_EVENTO = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/;

/** 'YYYY-MM-DD HH:mm' → 'YYYY-MM-DDTHH:mm' (para datetime-local). */
export function fechaEventoAInput(valor: string): string {
  if (!RE_FECHA_EVENTO.test(valor)) return '';
  return valor.replace(' ', 'T').slice(0, 16);
}

/** 'YYYY-MM-DDTHH:mm' → 'YYYY-MM-DD HH:mm' (formato del esquema). */
export function inputAFechaEvento(valor: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(valor)) return '';
  return valor.replace('T', ' ').slice(0, 16);
}
