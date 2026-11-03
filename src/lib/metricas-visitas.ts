// ============================================================
// REGISTRO DE VISITAS EN EL CLIENTE — iteración 042
// ------------------------------------------------------------
// Mide el tráfico real de la web pública SIN cookies, SIN IPs y SIN
// identificadores persistentes:
//  - Cada pestaña genera un id de sesión ALEATORIO en sessionStorage
//    (muere con la pestaña; sobrevive recargas de la misma pestaña).
//  - Dos banderas en localStorage (sin datos personales): «ya visitó
//    hoy» (única del día) y «ya visitó alguna vez» (nuevo visitante).
//  - Envío fire-and-forget al backend de Apps Script (mismo Web App del
//    registro automático): POST text/plain simple, sin preflight, con
//    timeout y NUNCA lanza. Un backend viejo (sin métricas) responde
//    sin `success` y se interpreta como 'sin-backend' para no reintentar.
//
// Qué se mide: portada, catálogo, personalizador e invitaciones
// (/i/<slug>/). Qué NO se mide: rutas operativas (/dashboard/, /editar/,
// /estudio/, /previsualizar/, /acceso/) para no inflar las métricas con
// tráfico del propio estudio.
// ============================================================

import { parseGasResponse } from './contrato-backend';
import { diaMontevideo } from '../data/metricas-esquema';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** Clave del id de sesión (sessionStorage). */
export const CLAVE_SESION_VISITA = 'lgs_sesion_visita';
/** Clave de la marca «ya visitó hoy» (localStorage): guarda el día. */
export const CLAVE_DIA_VISITA = 'lgs_visita_dia';
/** Clave de la marca «ya visitó alguna vez» (localStorage). */
export const CLAVE_NUEVO_VISITANTE = 'lgs_visitante_nuevo';

/** Prefijos de rutas operativas que NO se miden. */
const RUTAS_EXCLUIDAS = ['/dashboard', '/editar', '/estudio', '/previsualizar', '/acceso'];

/** true si el pathname de la página actual es medible para las métricas. */
export function esRutaMedible(pathname: string): boolean {
  const ruta = String(pathname || '/');
  return !RUTAS_EXCLUIDAS.some((prefijo) => ruta === prefijo || ruta.startsWith(`${prefijo}/`) || ruta === `${prefijo}/`);
}

/** Almacén mínimo (el mismo contrato de auth-cliente). */
interface AlmacenKv {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

/**
 * Obtiene (creando si falta) el id de sesión de esta pestaña: 32 hex
 * aleatorios. `generador` inyectable para pruebas.
 */
export function obtenerIdSesion(almacen: AlmacenKv, generador: () => string): string {
  const previo = almacen.getItem(CLAVE_SESION_VISITA);
  if (previo && /^[A-Za-z0-9_-]{8,64}$/.test(previo)) return previo;
  const nuevo = generador();
  almacen.setItem(CLAVE_SESION_VISITA, nuevo);
  return nuevo;
}

export interface MarcasVisita {
  /** Primera visita de esta pestaña en el día (única del día). */
  nuevaSesionDia: boolean;
  /** Primer visitante del navegador (sin marca previa en localStorage). */
  nuevoVisitante: boolean;
}

/**
 * Decide y registra las banderas locales para esta visita.
 * `dia` es el día de Montevideo actual (inyectable para pruebas).
 */
export function decidirMarcas(almacenLocal: AlmacenKv, dia: string): MarcasVisita {
  const diaPrevio = almacenLocal.getItem(CLAVE_DIA_VISITA);
  const yaVisitó = almacenLocal.getItem(CLAVE_NUEVO_VISITANTE) === '1';
  almacenLocal.setItem(CLAVE_DIA_VISITA, dia);
  if (!yaVisitó) almacenLocal.setItem(CLAVE_NUEVO_VISITANTE, '1');
  return { nuevaSesionDia: diaPrevio !== dia, nuevoVisitante: !yaVisitó };
}

export type TipoRegistroMetrica = 'visita' | 'latido';

/** Payload del POST al backend (text/plain, sin query string). */
export function construirPayload(
  tipo: TipoRegistroMetrica,
  datos: {
    pagina: string;
    sesion: string;
    nuevaSesionDia: boolean;
    nuevoVisitante: boolean;
    ahora?: Date;
  },
): Record<string, unknown> {
  return {
    tipo: 'registrar_visita',
    clase: tipo,
    dia: diaMontevideo(datos.ahora ?? new Date()),
    pagina: tipo === 'visita' ? String(datos.pagina || '/').slice(0, 120) : '',
    sesion: datos.sesion,
    nuevaSesionDia: tipo === 'visita' ? datos.nuevaSesionDia : false,
    nuevoVisitante: tipo === 'visita' ? datos.nuevoVisitante : false,
  };
}

export type ResultadoEnvioMetrica = 'guardado' | 'sin-backend' | 'error';

/**
 * Envía el registro al backend. Nunca lanza. Devuelve:
 *  - 'guardado': el backend confirmó { success: true }.
 *  - 'sin-backend': el endpoint respondió pero no soporta métricas aún
 *    (Web App viejo): no reintentar más en esta sesión de página.
 *  - 'error': red/CORS/timeout — el componente puede reintentar más tarde.
 */
export async function enviarRegistroMetrica(
  endpoint: string,
  payload: Record<string, unknown>,
  opciones: { fetchImpl?: FetchLike; timeoutMs?: number } = {},
): Promise<ResultadoEnvioMetrica> {
  const destino = String(endpoint || '').trim();
  if (!destino) return 'sin-backend';

  const doFetch: FetchLike = opciones.fetchImpl ?? ((input, init) => fetch(input, init));
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), opciones.timeoutMs ?? 8000);

  try {
    const res = await doFetch(destino, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controlador.signal,
    });
    const data = parseGasResponse(await res.text());
    if (!data) return 'error';
    if (data.success === true) return 'guardado';
    // Web App sin la acción metricas: responde doGet {ok:true,...} o error
    // explícito de acción desconocida: es un backend VIEJO, no un fallo de red.
    return 'sin-backend';
  } catch {
    return 'error';
  } finally {
    clearTimeout(temporizador);
  }
}
