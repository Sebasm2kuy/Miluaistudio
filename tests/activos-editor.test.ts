/**
 * Pruebas de los activos del editor (src/lib/activos-editor.ts).
 *
 * Cobertura exigida por la iteración funcional:
 *  - validación de tipo real (magic bytes), extensión y MIME
 *  - límite de tamaño
 *  - nombre de archivo saneado y único
 *  - URL pública exacta (anclada a la raíz del dominio propio, lumengala.site)
 *  - sincronización galería ↔ fondo como la espera el editor
 *
 * Datos y archivos 100% sintéticos (no se sube nada real en CI).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validarArchivoImagen,
  detectarTipoReal,
  sanearNombreBase,
  nombreArchivoUnico,
  sufijoUnico,
  extensionDeArchivo,
  normalizarMime,
  urlPublicaActivo,
  rutaRepoActivo,
  sincronizarFondoConGaleria,
  CARPETA_ACTIVOS_INVITACION,
  TAMANIO_MAX_ACTIVO_BYTES,
} from '../src/lib/activos-editor.js';
import type { SiteConfig } from '../src/data/config-schema.js';

const JPEG_MAGIC = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const WEBP_MAGIC = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
const EXE_MAGIC = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);

// ---------------------------------------------------------------------------
// Validación de archivos
// ---------------------------------------------------------------------------

test('validarArchivoImagen: acepta JPG/PNG/WebP coherentes (ext + mime + firma)', () => {
  assert.equal(validarArchivoImagen({ name: 'foto.jpg', type: 'image/jpeg', size: 1024 }, JPEG_MAGIC).ok, true);
  assert.equal(validarArchivoImagen({ name: 'foto.png', type: 'image/png', size: 1024 }, PNG_MAGIC).ok, true);
  assert.equal(validarArchivoImagen({ name: 'foto.webp', type: 'image/webp', size: 1024 }, WEBP_MAGIC).ok, true);
  // image/jpg (variante de navegador) se normaliza
  assert.equal(validarArchivoImagen({ name: 'foto.jpg', type: 'image/jpg', size: 1024 }, JPEG_MAGIC).ok, true);
  // Sin bytes (validación temprana de UI): extensión + MIME alcanzan
  assert.equal(validarArchivoImagen({ name: 'foto.jpg', type: 'image/jpeg', size: 1024 }).ok, true);
});

test('validarArchivoImagen: rechaza extensiones no permitidas', () => {
  const gif = validarArchivoImagen({ name: 'animacion.gif', type: 'image/gif', size: 100 });
  assert.equal(gif.ok, false);
  if (!gif.ok) assert.match(gif.motivo, /Formato no permitido/);
  const heic = validarArchivoImagen({ name: 'foto.heic', type: 'image/heic', size: 100 });
  assert.equal(heic.ok, false);
  const sinExt = validarArchivoImagen({ name: 'archivosinextension', size: 100 });
  assert.equal(sinExt.ok, false);
});

test('validarArchivoImagen: rechaza tamaño excedido y archivo vacío', () => {
  const grande = validarArchivoImagen(
    { name: 'foto.jpg', type: 'image/jpeg', size: TAMANIO_MAX_ACTIVO_BYTES + 1 },
    JPEG_MAGIC,
  );
  assert.equal(grande.ok, false);
  if (!grande.ok) assert.match(grande.motivo, /límite es 5 MB/);
  const vacio = validarArchivoImagen({ name: 'foto.jpg', type: 'image/jpeg', size: 0 });
  assert.equal(vacio.ok, false);
  if (!vacio.ok) assert.match(vacio.motivo, /vacío/);
});

test('validarArchivoImagen: no confía solo en accept — firma real obligatoria', () => {
  // Ejecutable disfrazado de .jpg: la firma no coincide
  const disfrazado = validarArchivoImagen({ name: 'malware.jpg', type: 'image/jpeg', size: 1024 }, EXE_MAGIC);
  assert.equal(disfrazado.ok, false);
  if (!disfrazado.ok) assert.match(disfrazado.motivo, /no es una imagen/);
  // Extensión y firma incoherentes (contenido PNG con nombre .jpg)
  const incoherente = validarArchivoImagen({ name: 'foto.jpg', type: 'image/jpeg', size: 1024 }, PNG_MAGIC);
  assert.equal(incoherente.ok, false);
  // MIME incoherente con la extensión
  const mimeFalso = validarArchivoImagen({ name: 'foto.jpg', type: 'image/gif', size: 1024 });
  assert.equal(mimeFalso.ok, false);
});

test('detectarTipoReal: identifica firmas y devuelve null en contenido desconocido', () => {
  assert.equal(detectarTipoReal(JPEG_MAGIC), 'jpeg');
  assert.equal(detectarTipoReal(PNG_MAGIC), 'png');
  assert.equal(detectarTipoReal(WEBP_MAGIC), 'webp');
  assert.equal(detectarTipoReal(EXE_MAGIC), null);
  assert.equal(detectarTipoReal(new Uint8Array([0xff, 0xd8])), null); // demasiado corto
});

// ---------------------------------------------------------------------------
// Nombres saneados y únicos
// ---------------------------------------------------------------------------

test('sanearNombreBase: limpia acentos, espacios y símbolos con techo de 40', () => {
  assert.equal(sanearNombreBase('Mi Foto de XV!.jpg'), 'mi-foto-de-xv');
  assert.equal(sanearNombreBase('Cumpleaños Ñandú (2027).png'), 'cumpleanos-nandu-2027');
  assert.equal(sanearNombreBase('----___----'), 'foto');
  assert.ok(sanearNombreBase('x'.repeat(80)).length <= 40);
});

test('nombreArchivoUnico: conserva extensión permitida y añade sufijo único', () => {
  const nombre = nombreArchivoUnico('Mi Foto de XV!.jpg', 'abc123');
  assert.equal(nombre, 'mi-foto-de-xv_abc123.jpg');
  const png = nombreArchivoUnico('retrato.png', 'zzz9');
  assert.equal(png, 'retrato_zzz9.png');
  const jpeg = nombreArchivoUnico('retrato.jpeg', 'zzz9');
  assert.equal(jpeg, 'retrato_zzz9.jpeg');
  // Extensión rara no pasa (la validación la rechaza antes; el helper cae a jpg)
  assert.equal(extensionDeArchivo(nombreArchivoUnico('raro.gif', 'x1')), 'jpg');
});

test('sufijoUnico: dos llamadas no colisionan (tiempo + aleatorio)', () => {
  const a = sufijoUnico(new Date(1700000000000), () => 0.1);
  const b = sufijoUnico(new Date(1700000000000), () => 0.9);
  assert.notEqual(a, b);
  assert.match(a, /^[0-9a-z]+$/);
});

// ---------------------------------------------------------------------------
// URL pública exacta (anclada a la raíz del dominio propio)
// ---------------------------------------------------------------------------

test('urlPublicaActivo: coincide exactamente con la ruta publicada', () => {
  assert.equal(
    urlPublicaActivo('mi-foto_abc123.jpg'),
    '/assets-invitaciones/mi-foto_abc123.jpg',
  );
  assert.equal(rutaRepoActivo('mi-foto_abc123.jpg'), 'public/assets-invitaciones/mi-foto_abc123.jpg');
  assert.equal(CARPETA_ACTIVOS_INVITACION, 'assets-invitaciones');
  // La carpeta de fotos de invitados sigue siendo otra, con su regla propia
  assert.notEqual(CARPETA_ACTIVOS_INVITACION, 'uploads');
});

// ---------------------------------------------------------------------------
// Sincronización galería ↔ fondo
// ---------------------------------------------------------------------------

function cfgDePrueba(fondo: string[], galeria: { webp: string; fallback: string }[]): SiteConfig {
  return {
    fondo: { fotos: fondo },
    galeria: { fotos: galeria },
  } as unknown as SiteConfig;
}

test('sincronizarFondoConGaleria: en modo fotos, el fondo copia la galería vigente', () => {
  const cfg = cfgDePrueba(
    ['/assets-invitaciones/vieja.jpg'],
    [
      { webp: '/assets-invitaciones/nueva-1.jpg', fallback: '' },
      { webp: '', fallback: '' }, // entrada sin URL: se filtra
      { webp: '/assets-invitaciones/nueva-2.jpg', fallback: '' },
    ],
  );
  const sincronizada = sincronizarFondoConGaleria(cfg);
  assert.deepEqual(sincronizada.fondo.fotos, [
    '/assets-invitaciones/nueva-1.jpg',
    '/assets-invitaciones/nueva-2.jpg',
  ]);
  // La galería queda intacta
  assert.equal(sincronizada.galeria.fotos.length, 3);
});

test('sincronizarFondoConGaleria: en modo gradiente el fondo no se toca', () => {
  const cfg = cfgDePrueba(['gradient:rosa-suave'], [
    { webp: '/a.jpg', fallback: '' },
  ]);
  const resultado = sincronizarFondoConGaleria(cfg);
  assert.equal(resultado, cfg, 'devuelve la misma configuración sin alteraciones');
});
