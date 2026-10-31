// ============================================================
// ESQUEMA DE CUENTAS DE CLIENTE — content/clientes.json
// ------------------------------------------------------------
// Fuente de verdad de las cuentas que acceden al panel de cliente
// (/dashboard). El alta NO es auto-servicio: el estudio crea cada
// cuenta con scripts/alta-cliente.mjs (que genera el hash PBKDF2
// con el mismo formato) y commitea el archivo. La web NUNCA
// escribe este archivo: solo lo lee (login, /acceso).
//
// Seguridad:
//  - Las contraseñas nunca viajan ni se guardan en claro: el hash
//    es PBKDF2-SHA256 con 310.000 iteraciones (formato autodescripto
//    "pbkdf2-sha256$<iteraciones>$<saltB64>$<hashB64>").
//  - El archivo vive en el repositorio público: quien lo lea obtiene
//    hashes, no contraseñas. Ver IDEAS/ITERACION-2026-10-31-030
//    para la política completa y las mitigaciones.
// ============================================================

/** Versión del esquema de la colección de clientes. */
export const ESQUEMA_CLIENTES = 1;

/** Ruta del archivo dentro del repositorio (rama main). */
export const RUTA_CLIENTES = 'content/clientes.json';

/** Iteraciones PBKDF2 por defecto (OWASP 2023: 600k para SHA-256; 310k mantiene <0.5s en móviles de gama media). */
export const ITERACIONES_PBKDF2 = 310000;

/** Longitud mínima de contraseña al crear una cuenta (política del estudio). */
export const MIN_LARGO_PASSWORD = 8;

export type RolCliente = 'cliente' | 'estudio';

export interface ClienteCuenta {
  /** Email en minúsculas (identificador de login). */
  email: string;
  /** Nombre para mostrar en el panel ("Familia Pérez"). */
  nombre: string;
  /** Hash PBKDF2 autodescripto (ver PREFIJO_HASH en lib/auth-cliente). */
  hash: string;
  /** 'cliente' ve su invitación; 'estudio' es el rol reservado del estudio. */
  rol: RolCliente;
  /** Slug de la invitación que administra (content/invitaciones/<slug>.json). */
  slug: string;
  /** Fecha ISO de alta. */
  creadoEn: string;
}

export interface ColeccionClientes {
  esquema: number;
  actualizadoEn: string;
  cuentas: ClienteCuenta[];
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Formato "pbkdf2-sha256$310000$<saltB64>$<hashB64>" (salt 16B, hash 32B). */
const REGEX_HASH = /^pbkdf2-sha256\$\d{4,7}\$[A-Za-z0-9+/]{22}={0,2}\$[A-Za-z0-9+/]{43}={0,2}$/;

/** Normaliza el email de login: trim + minúsculas. */
export function normalizarEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

/** Email con forma válida (normalizado). */
export function esEmailValido(email: string): boolean {
  return REGEX_EMAIL.test(normalizarEmail(email));
}

/** true si el hash respeta el formato PBKDF2 autodescripto. */
export function esHashValido(hash: string): boolean {
  return typeof hash === 'string' && REGEX_HASH.test(hash);
}

/**
 * Valida la colección leída de content/clientes.json.
 * Devuelve null si el archivo no sirve (esquema viejo, cuentas
 * duplicadas, campos faltantes): el login prefieres fallar cerrado.
 */
export function validarColeccionClientes(data: unknown): ColeccionClientes | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const d = data as Record<string, unknown>;
  if (d.esquema !== ESQUEMA_CLIENTES) return null;
  if (!Array.isArray(d.cuentas)) return null;

  const vistas = new Set<string>();
  const cuentas: ClienteCuenta[] = [];
  for (const crudo of d.cuentas) {
    if (!crudo || typeof crudo !== 'object' || Array.isArray(crudo)) return null;
    const c = crudo as Record<string, unknown>;
    const email = normalizarEmail(String(c.email || ''));
    if (!esEmailValido(email) || vistas.has(email)) return null;
    if (typeof c.nombre !== 'string' || c.nombre.trim().length < 2) return null;
    if (!esHashValido(String(c.hash || ''))) return null;
    if (c.rol !== 'cliente' && c.rol !== 'estudio') return null;
    if (typeof c.slug !== 'string' || !c.slug) return null;
    if (typeof c.creadoEn !== 'string' || !c.creadoEn) return null;
    vistas.add(email);
    cuentas.push({
      email,
      nombre: c.nombre.trim(),
      hash: String(c.hash),
      rol: c.rol,
      slug: c.slug,
      creadoEn: c.creadoEn,
    });
  }
  return {
    esquema: ESQUEMA_CLIENTES,
    actualizadoEn: typeof d.actualizadoEn === 'string' ? d.actualizadoEn : '',
    cuentas,
  };
}

/** Busca una cuenta por email (normalizado). */
export function buscarCuenta(
  cuentas: ClienteCuenta[],
  email: string,
): ClienteCuenta | null {
  const buscado = normalizarEmail(email);
  return cuentas.find((c) => c.email === buscado) ?? null;
}

/** Serialización estable para commits revisables (JSON con indentación + salto final). */
export function serializarClientes(coleccion: ColeccionClientes): string {
  return JSON.stringify(coleccion, null, 2) + '\n';
}
