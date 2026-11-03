// ============================================================
// AUTENTICACIÓN DEL PANEL DEL ESTUDIO (/estudio/) — iteración 042
// ------------------------------------------------------------
// El panel de administración de métricas está reservado a UNA sola
// cuenta de Google del estudio (EMAIL_ADMIN). Validación en tres
// capas, fail-closed en todas:
//
//  1. FRONTAL (acá): el widget oficial de Google Identity Services
//     entrega un id_token; se decodifican los claims y se exige
//     audiencia == GOOGLE_CLIENT_ID, emisor de Google, vigencia,
//     email verificado y email == EMAIL_ADMIN. Sin sesión válida no
//     se renderiza NADA del panel.
//  2. BACKEND (google-apps-script/gallery-server.gs): la acción
//     metricas_admin re-verifica la firma del token contra Google
//     (tokeninfo: audiencia, vigencia, email verificado) y SOLO si el
//     email es EMAIL_ADMIN devuelve los datos de tráfico. Los datos de
//     tráfico no viven en el repo: viven en la hoja privada del
//     backend, así que sin pasar por el backend no existen vía pública.
//  3. DATOS: la lista de clientes y RSVPs ya es pública del repo
//     (mismo dato que ve el panel de cliente); el panel no añade
//     ninguna superficie de escritura ni guarda secretos.
//
// La sesión vive en sessionStorage (muere al cerrar la pestaña) y su
// expiración ES la expiración del id_token de Google (≈1 hora): nunca
// dura más que la credencial que la sostiene. Sin dependencias nuevas:
// el decodificador es el mismo enfoque de auth-cliente.ts.
// ============================================================

import type { AlmacenLike } from './auth-cliente';
import { almacenPorDefecto } from './auth-cliente';

/** Única cuenta autorizada a entrar al panel del estudio. */
export const EMAIL_ADMIN = 'sebacabrera1982@gmail.com';

/** Clave de la sesión del panel en sessionStorage. */
export const CLAVE_SESION_ADMIN = 'lgs_sesion_admin';

/** Horas máximas de sesión aunque el token viviera más (defensa extra). */
export const SESION_ADMIN_HORAS_MAX = 1;

export interface ClaimsAdmin {
  email: string;
  nombre: string;
  emailVerificado: boolean;
  /** Audiencia esperada del token (el Client ID del sitio). */
  aud: string;
  /** Emisor del token. */
  iss: string;
  /** Expiración del token en segundos epoch. */
  exp: number;
}

export interface SesionAdmin {
  email: string;
  nombre: string;
  /** id_token de Google (viaja al backend en cada consulta de métricas). */
  credencial: string;
  /** Expiración en ms epoch (la del token, acotada por SESION_ADMIN_HORAS_MAX). */
  expiracion: number;
}

/** Decodifica los claims de un id_token SIN validar la firma (nunca lanza).
 *  La firma la verifica el backend con tokeninfo; acá solo se leen claims
 *  para la decisión frontal + el reenvío al backend. */
export function decodificarClaimsAdmin(token: string): ClaimsAdmin | null {
  try {
    const partes = String(token || '').split('.');
    if (partes.length !== 3) return null;
    const base64url = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const relleno = '='.repeat((4 - (base64url.length % 4)) % 4);
    const binario = atob(base64url + relleno);
    const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    const datos = JSON.parse(json) as Record<string, unknown>;
    if (typeof datos.email !== 'string') return null;
    const exp = typeof datos.exp === 'number' ? datos.exp : parseInt(String(datos.exp), 10);
    return {
      email: datos.email,
      nombre: typeof datos.name === 'string' ? datos.name : '',
      emailVerificado: datos.email_verified === true || datos.email_verified === 'true',
      aud: typeof datos.aud === 'string' ? datos.aud : '',
      iss: typeof datos.iss === 'string' ? datos.iss : '',
      exp: Number.isFinite(exp) ? exp : 0,
    };
  } catch {
    return null;
  }
}

export type ResultadoAccesoAdmin =
  | { ok: true; sesion: SesionAdmin }
  | { ok: false; motivo: 'formato' | 'audiencia' | 'emisor' | 'expirado' | 'sin-verificar' | 'email' };

const ESMISORES_GOOGLE = ['accounts.google.com', 'https://accounts.google.com'];

/**
 * Evaluación frontal de la credencial de Google contra la lista blanca
 * del estudio. Nunca lanza y nunca revela datos del panel: ante cualquier
 * desvío devuelve un motivo tipado para mostrar el bloqueo correspondiente.
 */
export function evaluarAccesoAdmin(
  credencial: string,
  opciones: { clienteId: string; ahora?: Date },
): ResultadoAccesoAdmin {
  const ahora = opciones.ahora ?? new Date();
  const claims = decodificarClaimsAdmin(credencial);
  if (!claims || !claims.exp) return { ok: false, motivo: 'formato' };

  const audEsperado = String(opciones.clienteId || '').trim();
  if (!audEsperado || claims.aud !== audEsperado) {
    return { ok: false, motivo: 'audiencia' };
  }
  if (!ESMISORES_GOOGLE.includes(claims.iss)) {
    return { ok: false, motivo: 'emisor' };
  }
  if (claims.exp * 1000 <= ahora.getTime()) {
    return { ok: false, motivo: 'expirado' };
  }
  if (!claims.emailVerificado) {
    return { ok: false, motivo: 'sin-verificar' };
  }

  const email = claims.email.trim().toLowerCase();
  // Comparación exacta contra la ÚNICA cuenta autorizada (case-insensitive:
  // Gmail es insensible a mayúsculas y a puntos, pero el backend hace la
  // misma comparación normalizada, así que basta el minúsculas).
  if (email !== EMAIL_ADMIN) {
    return { ok: false, motivo: 'email' };
  }

  const expiracionSesion = Math.min(
    claims.exp * 1000,
    ahora.getTime() + SESION_ADMIN_HORAS_MAX * 60 * 60 * 1000,
  );
  return {
    ok: true,
    sesion: {
      email,
      nombre: String(claims.nombre || '').trim().slice(0, 60) || email,
      credencial: credencial,
      expiracion: expiracionSesion,
    },
  };
}

export function guardarSesionAdmin(sesion: SesionAdmin, almacen: AlmacenLike = almacenPorDefecto()): void {
  almacen.setItem(CLAVE_SESION_ADMIN, JSON.stringify(sesion));
}

/** Lee la sesión del panel; null si no existe, expiró o el email no es el
 *  del estudio (y en ese caso la borra: fail-closed siempre). */
export function leerSesionAdmin(
  almacen: AlmacenLike = almacenPorDefecto(),
  ahora = Date.now(),
): SesionAdmin | null {
  try {
    const crudo = almacen.getItem(CLAVE_SESION_ADMIN);
    if (!crudo) return null;
    const sesion = JSON.parse(crudo) as SesionAdmin;
    if (
      !sesion ||
      typeof sesion.email !== 'string' ||
      typeof sesion.credencial !== 'string' ||
      typeof sesion.expiracion !== 'number'
    ) {
      almacen.removeItem(CLAVE_SESION_ADMIN);
      return null;
    }
    if (sesion.email.trim().toLowerCase() !== EMAIL_ADMIN) {
      almacen.removeItem(CLAVE_SESION_ADMIN);
      return null;
    }
    if (sesion.expiracion <= ahora) {
      almacen.removeItem(CLAVE_SESION_ADMIN);
      return null;
    }
    return sesion;
  } catch {
    return null;
  }
}

export function cerrarSesionAdmin(almacen: AlmacenLike = almacenPorDefecto()): void {
  almacen.removeItem(CLAVE_SESION_ADMIN);
}
