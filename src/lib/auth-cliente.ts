// ============================================================
// AUTENTICACIÓN LIGERA DE CLIENTES — PBKDF2 (WebCrypto) + sesión
// en sessionStorage. Sin backend y sin servicios externos.
// ------------------------------------------------------------
// El hash de la contraseña vive en content/clientes.json (repositorio)
// y la verificación ocurre en el navegador con crypto.subtle (PBKDF2-
// SHA256, 310.000 iteraciones). Es un modelo apto para un panel de
// bajo riesgo: la sesión solo habilita la INTERFAZ del panel; toda
// escritura real exige además un token de GitHub (Conexión del panel)
// y queda registrada como commit auditable.
//
// Medidas incluidas:
//  - Comparación de hash en tiempo "casi constante" (XOR acumulado).
//  - Límite de intentos por email: 5 en 15 minutos → bloqueo temporal.
//  - Sesión con expiración (8 h) y muerte al cerrar la pestaña.
//  - Almacén inyectable (sessionStorage por defecto) para pruebas.
// ============================================================

import {
  ITERACIONES_PBKDF2,
  MIN_LARGO_PASSWORD,
  buscarCuenta,
  esEmailValido,
  normalizarEmail,
  type ClienteCuenta,
} from '../data/clientes-esquema';

export const PREFIJO_HASH = 'pbkdf2-sha256';
export const SESION_HORAS = 8;
export const CLAVE_SESION = 'lgs_sesion_cliente';
export const CLAVE_INTENTOS = 'lgs_intentos_login';
export const MAX_INTENTOS = 5;
export const VENTANA_INTENTOS_MIN = 15;

/** Solo la parte de subtle que usamos (Node 20 y navegadores modernos la exponen igual). */
export interface SubtleLike {
  importKey(
    format: string,
    keyData: BufferSource,
    algorithm: { name: string },
    extractable: boolean,
    usages: KeyUsage[],
  ): Promise<CryptoKey>;
  deriveBits(
    algorithm: { name: string; salt: BufferSource; iterations: number; hash: string },
    baseKey: CryptoKey,
    length: number,
  ): Promise<ArrayBuffer>;
}

/** Almacén mínimo (sessionStorage en el navegador; mapa en memoria para pruebas/SSR). */
export interface AlmacenLike {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
}

function subtlePorDefecto(): SubtleLike {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.subtle) throw new Error('Este navegador no soporta WebCrypto (crypto.subtle).');
  return c.subtle as unknown as SubtleLike;
}

/** Almacén por defecto: sessionStorage si hay window; si no, memoria (SSR/pruebas). */
export function almacenPorDefecto(): AlmacenLike {
  if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage;
  const mapa = new Map<string, string>();
  return {
    getItem: (k) => (mapa.has(k) ? (mapa.get(k) as string) : null),
    setItem: (k, v) => void mapa.set(k, v),
    removeItem: (k) => void mapa.delete(k),
  };
}

function bytesABase64(bytes: Uint8Array): string {
  let binario = '';
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
  return btoa(binario);
}

function base64ABytes(b64: string): Uint8Array {
  const binario = atob(b64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

async function derivarBits(
  password: string,
  salt: Uint8Array,
  iteraciones: number,
  subtle: SubtleLike,
): Promise<Uint8Array> {
  // BufferSource explícito: los navegadores (y Node) rechazan strings en importKey raw.
  const bytesPassword = new TextEncoder().encode(password);
  const clave = await subtle.importKey(
    'raw',
    bytesPassword,
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: iteraciones, hash: 'SHA-256' },
    clave,
    256,
  );
  return new Uint8Array(bits);
}

export interface OpcionesHasheo {
  /** Salt base64; si falta se genera una aleatoria de 16 bytes. */
  salB64?: string;
  iteraciones?: number;
  subtle?: SubtleLike;
}

/**
 * Genera el hash autodescripto "pbkdf2-sha256$<iteraciones>$<saltB64>$<hashB64>".
 * Compatible con scripts/alta-cliente.mjs (node:crypto.pbkdf2Sync, mismo algoritmo).
 */
export async function hashearPassword(
  password: string,
  opciones: OpcionesHasheo = {},
): Promise<string> {
  const iteraciones = opciones.iteraciones ?? ITERACIONES_PBKDF2;
  const subtle = opciones.subtle ?? subtlePorDefecto();
  const salt = opciones.salB64
    ? base64ABytes(opciones.salB64)
    : crypto.getRandomValues(new Uint8Array(16));
  const bits = await derivarBits(password, salt, iteraciones, subtle);
  return `${PREFIJO_HASH}$${iteraciones}$${bytesABase64(salt)}$${bytesABase64(bits)}`;
}

/** Verifica una contraseña contra el hash almacenado (false si el formato no sirve). */
export async function verificarPassword(
  password: string,
  hashAlmacenado: string,
  opciones: { subtle?: SubtleLike } = {},
): Promise<boolean> {
  const partes = String(hashAlmacenado || '').split('$');
  if (partes.length !== 4 || partes[0] !== PREFIJO_HASH) return false;
  const iteraciones = parseInt(partes[1], 10);
  if (!Number.isFinite(iteraciones) || iteraciones < 1000 || iteraciones > 2_000_000) return false;
  let salt: Uint8Array;
  let esperado: Uint8Array;
  try {
    salt = base64ABytes(partes[2]);
    esperado = base64ABytes(partes[3]);
  } catch {
    return false;
  }
  const subtle = opciones.subtle ?? subtlePorDefecto();
  const bits = await derivarBits(password, salt, iteraciones, subtle);
  if (bits.length !== esperado.length) return false;
  // Comparación acumulada: evita cortar en el primer byte distinto.
  let diff = 0;
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ esperado[i];
  return diff === 0;
}

export type ValidezCredenciales = { ok: true; email: string } | { ok: false; motivo: string };

/** Reglas de forma del login (sin tocar la red ni los archivos). */
export function validarCredenciales(email: string, password: string): ValidezCredenciales {
  if (!esEmailValido(email)) {
    return { ok: false, motivo: 'Ingresá un email válido.' };
  }
  if (String(password).length < MIN_LARGO_PASSWORD) {
    return { ok: false, motivo: `La contraseña tiene al menos ${MIN_LARGO_PASSWORD} caracteres.` };
  }
  return { ok: true, email: normalizarEmail(email) };
}

// ---------------------------------------------------------------------------
// Límite de intentos por email (anti fuerza bruta liviana, lado cliente)
// ---------------------------------------------------------------------------

interface RegistroIntentos {
  [email: string]: number[];
}

function leerIntentos(almacen: AlmacenLike): RegistroIntentos {
  try {
    const crudo = almacen.getItem(CLAVE_INTENTOS);
    if (!crudo) return {};
    const data = JSON.parse(crudo) as RegistroIntentos;
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function guardarIntentos(registro: RegistroIntentos, almacen: AlmacenLike): void {
  almacen.setItem(CLAVE_INTENTOS, JSON.stringify(registro));
}

/** Minutos que faltan para volver a intentar (0 = sin bloqueo). */
export function minutosRestantesBloqueo(
  email: string,
  almacen: AlmacenLike = almacenPorDefecto(),
  ahora = Date.now(),
): number {
  const registro = leerIntentos(almacen);
  const marcas = registro[normalizarEmail(email)] ?? [];
  const limite = ahora - VENTANA_INTENTOS_MIN * 60 * 1000;
  const recientes = marcas.filter((m) => m > limite);
  if (recientes.length < MAX_INTENTOS) return 0;
  const masViejo = Math.min(...recientes);
  const desbloqueo = masViejo + VENTANA_INTENTOS_MIN * 60 * 1000;
  return Math.max(1, Math.ceil((desbloqueo - ahora) / 60000));
}

export function registrarIntentoFallido(
  email: string,
  almacen: AlmacenLike = almacenPorDefecto(),
  ahora = Date.now(),
): void {
  const clave = normalizarEmail(email);
  const registro = leerIntentos(almacen);
  const limite = ahora - VENTANA_INTENTOS_MIN * 60 * 1000;
  const recientes = (registro[clave] ?? []).filter((m) => m > limite);
  recientes.push(ahora);
  registro[clave] = recientes.slice(-MAX_INTENTOS);
  guardarIntentos(registro, almacen);
}

export function limpiarIntentos(
  email: string,
  almacen: AlmacenLike = almacenPorDefecto(),
): void {
  const registro = leerIntentos(almacen);
  delete registro[normalizarEmail(email)];
  guardarIntentos(registro, almacen);
}

// ---------------------------------------------------------------------------
// Sesión del cliente
// ---------------------------------------------------------------------------

export interface SesionCliente {
  email: string;
  nombre: string;
  slug: string;
  rol: ClienteCuenta['rol'];
  /** Expiración en ms epoch. */
  expiracion: number;
}

export function guardarSesion(
  sesion: SesionCliente,
  almacen: AlmacenLike = almacenPorDefecto(),
): void {
  almacen.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

/** Lee la sesión activa; null si no existe o expiró (y en ese caso la borra). */
export function leerSesion(
  almacen: AlmacenLike = almacenPorDefecto(),
  ahora = Date.now(),
): SesionCliente | null {
  try {
    const crudo = almacen.getItem(CLAVE_SESION);
    if (!crudo) return null;
    const sesion = JSON.parse(crudo) as SesionCliente;
    if (!sesion || typeof sesion.email !== 'string' || typeof sesion.slug !== 'string') return null;
    if (typeof sesion.expiracion !== 'number' || sesion.expiracion <= ahora) {
      almacen.removeItem(CLAVE_SESION);
      return null;
    }
    return sesion;
  } catch {
    return null;
  }
}

export function cerrarSesion(almacen: AlmacenLike = almacenPorDefecto()): void {
  almacen.removeItem(CLAVE_SESION);
}

// ---------------------------------------------------------------------------
// Flujo de login
// ---------------------------------------------------------------------------

export type ResultadoLogin =
  | { ok: true; sesion: SesionCliente }
  | { ok: false; motivo: string; bloqueadaMinutos?: number };

export interface OpcionesLogin {
  almacen?: AlmacenLike;
  subtle?: SubtleLike;
  ahora?: Date;
}

/**
 * Valida email+contraseña contra la colección de cuentas y abre la sesión.
 * Nunca revela si el email existe (mensaje genérico ante credenciales
 * inválidas). Respeta el bloqueo por intentos previos.
 */
export async function iniciarSesion(
  email: string,
  password: string,
  cuentas: ClienteCuenta[],
  opciones: OpcionesLogin = {},
): Promise<ResultadoLogin> {
  const almacen = opciones.almacen ?? almacenPorDefecto();
  const ahora = opciones.ahora ?? new Date();

  const forma = validarCredenciales(email, password);
  if (!forma.ok) return { ok: false, motivo: forma.motivo };

  const bloqueo = minutosRestantesBloqueo(forma.email, almacen, ahora.getTime());
  if (bloqueo > 0) {
    return {
      ok: false,
      motivo: `Demasiados intentos fallidos. Esperá ${bloqueo} minuto${bloqueo === 1 ? '' : 's'} para volver a probar.`,
      bloqueadaMinutos: bloqueo,
    };
  }

  const cuenta = buscarCuenta(cuentas, forma.email);
  const verificada = cuenta
    ? await verificarPassword(password, cuenta.hash, { subtle: opciones.subtle })
    : false;

  if (!cuenta || !verificada) {
    registrarIntentoFallido(forma.email, almacen, ahora.getTime());
    return { ok: false, motivo: 'Email o contraseña incorrectos.' };
  }

  limpiarIntentos(forma.email, almacen);
  const sesion: SesionCliente = {
    email: cuenta.email,
    nombre: cuenta.nombre,
    slug: cuenta.slug,
    rol: cuenta.rol,
    expiracion: ahora.getTime() + SESION_HORAS * 60 * 60 * 1000,
  };
  guardarSesion(sesion, almacen);
  return { ok: true, sesion };
}

// ---------------------------------------------------------------------------
// Acceso con Google (iteración 034)
// ---------------------------------------------------------------------------
// La identidad llega del widget oficial de Google Identity Services
// (id_token emitido por Google, recibido en el callback del botón).
// La AUTORIZACIÓN sigue siendo el listado del estudio: solo entra el
// email que ya existe como cuenta en content/clientes.json (política
// aprobada por el propietario: mismas cuentas, mismo email, sin
// contraseña). No hay bloqueo de intentos acá: no se verifica nada
// secreto contra el repositorio.
// ---------------------------------------------------------------------------

export type ResultadoLoginGoogle =
  | { ok: true; sesion: SesionCliente }
  | { ok: false; motivo: 'email-invalido' | 'email-sin-verificar' | 'sin-cuenta' };

export interface OpcionesLoginGoogle {
  almacen?: AlmacenLike;
  ahora?: Date;
}

/**
 * Abre sesión a partir de la identidad de Google (email verificado).
 * Requiere que el email coincida con una cuenta existente del estudio.
 * Nunca revela información del panel: ante email ajeno devuelve
 * 'sin-cuenta' y la UI ofrece el contacto por WhatsApp.
 */
export function iniciarSesionGoogle(
  email: string,
  nombreGoogle: string,
  emailVerificado: boolean,
  cuentas: ClienteCuenta[],
  opciones: OpcionesLoginGoogle = {},
): ResultadoLoginGoogle {
  const almacen = opciones.almacen ?? almacenPorDefecto();
  const ahora = opciones.ahora ?? new Date();

  if (!esEmailValido(email)) return { ok: false, motivo: 'email-invalido' };
  if (!emailVerificado) return { ok: false, motivo: 'email-sin-verificar' };

  const normalizado = normalizarEmail(email);
  const cuenta = buscarCuenta(cuentas, normalizado);
  if (!cuenta) return { ok: false, motivo: 'sin-cuenta' };

  // Si había intentos de contraseña acumulados, se limpian: ingresó.
  limpiarIntentos(normalizado, almacen);

  const sesion: SesionCliente = {
    email: cuenta.email,
    // El nombre de Google es solo cosmético: manda el del estudio.
    nombre: cuenta.nombre,
    slug: cuenta.slug,
    rol: cuenta.rol,
    expiracion: ahora.getTime() + SESION_HORAS * 60 * 60 * 1000,
  };
  guardarSesion(sesion, almacen);
  void nombreGoogle;
  return { ok: true, sesion };
}

/**
 * Decodifica el payload de un JWT (id_token de Google) sin validar la
 * firma: la firma ya fue verificada por Google en su propio widget, y
 * acá solo se leen email/nombre/email_verified. Devuelve null si el
 * token no tiene la forma esperada (nunca lanza).
 */
export function decodificarPayloadJwt(
  token: string,
): { email: string; nombre: string; emailVerificado: boolean } | null {
  try {
    const partes = String(token || '').split('.');
    if (partes.length !== 3) return null;
    const base64url = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const relleno = '='.repeat((4 - (base64url.length % 4)) % 4);
    // atob devuelve Latin-1: los bytes UTF-8 del payload (nombres con
    // acentos, ñ…) hay que decodificarlos explícitamente.
    const binario = atob(base64url + relleno);
    const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    const datos = JSON.parse(json) as {
      email?: unknown;
      name?: unknown;
      email_verified?: unknown;
    };
    if (typeof datos.email !== 'string') return null;
    return {
      email: datos.email,
      nombre: typeof datos.name === 'string' ? datos.name : '',
      emailVerificado: datos.email_verified === true || datos.email_verified === 'true',
    };
  } catch {
    return null;
  }
}
