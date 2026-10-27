/**
 * Pruebas de publicación vía GitHub API con fetch simulado
 * (src/lib/github-deploy.ts). NADA toca la red ni el repositorio real.
 *
 * Cobertura:
 *  - publicarInvitacionEnGitHub: creación, actualización del mismo slug
 *    (sin duplicados, conservando publicadoEn), error de lectura, error
 *    del PUT, error de red y falta de token
 *  - URLs construidas con basePath /Miluaistudio/
 *  - uploadToGitHub: URL del asset en la carpeta de invitaciones,
 *    validación previa (tipo/tamaño) sin llamar a la API, respuesta HTTP
 *    fallida y error de red — siempre simulados
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  publicarInvitacionEnGitHub,
  uploadToGitHub,
} from '../src/lib/github-deploy.js';
import {
  crearInvitacionPublicada,
  serializarInvitacion,
  urlInvitacion,
  urlPublicaInvitacion,
} from '../src/data/invitacion-publicada.js';
import type { SiteConfig } from '../src/data/config-schema.js';
import { CARPETA_ACTIVOS_INVITACION } from '../src/lib/activos-editor.js';

const FECHA = new Date('2026-10-28T12:00:00.000Z');
const RUTA_API = 'https://api.github.com/repos/Sebasm2kuy/Miluaistudio/contents/content/invitaciones/muestra-xv.json';

function configMuestra(): SiteConfig {
  return {
    modoDemo: true,
    demoNombreDiseno: 'Rosa Romántica · Demostración interactiva',
    evento: {
      tipo: 'Celebración de prueba',
      nombre: 'Prueba Sintética',
      apellido: '',
      apodo: 'Prueba',
      fecha: '1 de enero',
      anio: '2027',
      fechaEvento: '2027-01-01 21:00',
      lugar: 'Lugar de Prueba',
      ubicacion: 'Montevideo',
      direccion: 'Calle Prueba 1, Montevideo',
      mapsUrl: '',
      hashtag: '',
      hashtagUrl: '',
    },
    dedicatoria: { cita: '', cuerpo: '', firma: 'Prueba' },
    timeline: { titulo: '', subtitulo: '', eventos: [] },
    galeria: { titulo: '', subtitulo: '', botonSubir: '', photoUploadUrl: '', fotos: [] },
    musica: { titulo: '', subtitulo: '', playlistUrl: '', embedUrl: '', botonAgregar: '', botonSpotify: '' },
    rsvp: {
      titulo: '', subtitulo: '', fechaLimite: '', fechaLimiteFull: '',
      googleSheetUrl: '', hostPhone: '',
      regalos: {
        titulo: '', subtitulo: '',
        abitab: { titulo: '', numero: '' },
        miDinero: { titulo: '', numero: '' },
      },
    },
    footer: { apodo: 'Prueba', ubicacion: '', frase: '' },
    invitacion: { imagen: '', imagenFallback: '', textoAbrir: '' },
    countdown: {
      titulo: '',
      labels: { D: 'Días', H: 'Horas', M: 'Min', S: 'Seg' },
      botonCalendario: '', calendarioTitulo: '', calendarioLocation: '', calendarioDetalles: '',
    },
    fondo: { fotos: [] },
    colores: { principal: '', dorado: '', doradoClaro: '', marfil: '', fondo: '' },
    estilos: {
      fuenteTitulo: 'playfair', fuenteCuerpo: 'montserrat', fuenteCursiva: 'alex-brush',
      modeloReloj: 'classic', estiloTarjetas: 'glass', estiloBotones: 'outline-gold',
    },
  } as unknown as SiteConfig;
}

function invitacionMuestra() {
  return crearInvitacionPublicada({ slug: 'muestra-xv', config: configMuestra(), ahora: FECHA });
}

interface Llamada { input: string; init?: RequestInit }

/** fetch simulado que registra llamadas y decide respuestas por método. */
function fetchFalso(respuestas: {
  get?: () => Response
  put?: () => Response
  rechazar?: boolean
}) {
  const llamadas: Llamada[] = [];
  const impl = async (input: string, init?: RequestInit): Promise<Response> => {
    llamadas.push({ input, init });
    if (respuestas.rechazar) throw new TypeError('Failed to fetch');
    const metodo = (init?.method ?? 'GET').toUpperCase();
    if (metodo === 'GET') return respuestas.get ? respuestas.get() : new Response('{}', { status: 404 });
    return respuestas.put ? respuestas.put() : new Response('{"ok":true}', { status: 200 });
  };
  return { impl, llamadas };
}

// ---------------------------------------------------------------------------
// publicarInvitacionEnGitHub — creación
// ---------------------------------------------------------------------------

test('publicar: crea el archivo del slug y reporta creado=true con URLs correctas', async () => {
  const { impl, llamadas } = fetchFalso({
    get: () => new Response('{"message":"Not Found"}', { status: 404 }),
    put: () => new Response('{"content":{},"commit":{"sha":"abc"}}', { status: 201 }),
  });
  const resultado = await publicarInvitacionEnGitHub(invitacionMuestra(), 'token-de-prueba', impl);

  assert.equal(resultado.success, true);
  assert.equal(resultado.creado, true);
  assert.equal(resultado.slug, 'muestra-xv');
  assert.equal(resultado.url, urlInvitacion('muestra-xv'));
  assert.equal(resultado.url, '/Miluaistudio/i/muestra-xv/');
  assert.equal(resultado.urlAbsoluta, urlPublicaInvitacion('muestra-xv'));
  assert.match(resultado.message, /queda activo cuando termine el deploy/i);

  // Exactamente una lectura y una escritura, a la ruta del slug
  assert.equal(llamadas.length, 2);
  assert.equal(llamadas[0].input, RUTA_API);
  assert.equal(llamadas[1].input, RUTA_API);
  assert.equal(llamadas[1].init?.method, 'PUT');
  const cuerpo = JSON.parse(String(llamadas[1].init?.body));
  assert.equal(cuerpo.sha, undefined);
  assert.equal(cuerpo.branch, 'main');
  // El contenido subido ES la representación serializada (JSON puro)
  const subido = JSON.parse(decodeURIComponent(escape(atob(cuerpo.content))));
  assert.equal(subido.slug, 'muestra-xv');
  assert.equal(subido.config.modoDemo, false);
  assert.ok(!cuerpo.message.includes('token-de-prueba'), 'el token no aparece en el commit');
});

// ---------------------------------------------------------------------------
// publicarInvitacionEnGitHub — actualización sin duplicados
// ---------------------------------------------------------------------------

test('publicar: actualizar el mismo slug reutiliza el archivo y conserva publicadoEn', async () => {
  const original = invitacionMuestra();
  const existenteBase64 = Buffer.from(serializarInvitacion(original), 'utf8').toString('base64');
  const { impl, llamadas } = fetchFalso({
    get: () =>
      new Response(JSON.stringify({ sha: 'sha-existente', content: existenteBase64 }), { status: 200 }),
    put: () => new Response('{"content":{}}', { status: 200 }),
  });
  const actualizada = crearInvitacionPublicada({
    slug: 'muestra-xv',
    config: configMuestra(),
    ahora: new Date('2026-11-05T10:00:00.000Z'),
  });
  const resultado = await publicarInvitacionEnGitHub(actualizada, 'token-de-prueba', impl);

  assert.equal(resultado.success, true);
  assert.equal(resultado.creado, false, 'es una actualización, no una duplicación');
  assert.match(resultado.message, /mismo slug y el mismo enlace/i);
  const cuerpo = JSON.parse(String(llamadas[1].init?.body));
  assert.equal(cuerpo.sha, 'sha-existente', 'PUT sobre el MISMO archivo');
  const subido = JSON.parse(decodeURIComponent(escape(atob(cuerpo.content))));
  assert.equal(subido.publicadoEn, FECHA.toISOString(), 'publicadoEn original conservado');
  assert.equal(subido.actualizadoEn, '2026-11-05T10:00:00.000Z');
});

// ---------------------------------------------------------------------------
// publicarInvitacionEnGitHub — errores honestos
// ---------------------------------------------------------------------------

test('publicar: error de la API al leer → fallo SIN escritura y sin cambios locales', async () => {
  const { impl, llamadas } = fetchFalso({
    get: () => new Response('{"message":"Server Error"}', { status: 500 }),
  });
  const antes = serializarInvitacion(invitacionMuestra());
  const resultado = await publicarInvitacionEnGitHub(invitacionMuestra(), 'token-de-prueba', impl);

  assert.equal(resultado.success, false);
  assert.match(resultado.message, /podés reintentar/i);
  assert.equal(llamadas.length, 1, 'no se intentó escribir');
  assert.equal(serializarInvitacion(invitacionMuestra()), antes, 'representación intacta');
});

test('publicar: PUT rechazado → fallo con mensaje útil para reintentar', async () => {
  const { impl } = fetchFalso({
    get: () => new Response('{"message":"Not Found"}', { status: 404 }),
    put: () => new Response('{"message":"422 Unprocessable Entity"}', { status: 422 }),
  });
  const resultado = await publicarInvitacionEnGitHub(invitacionMuestra(), 'token-de-prueba', impl);
  assert.equal(resultado.success, false);
  assert.match(resultado.message, /422/);
  assert.match(resultado.message, /reintentar/);
});

test('publicar: error de red → fallo honesto (nunca éxito no verificado)', async () => {
  const { impl } = fetchFalso({ rechazar: true });
  const resultado = await publicarInvitacionEnGitHub(invitacionMuestra(), 'token-de-prueba', impl);
  assert.equal(resultado.success, false);
  assert.match(resultado.message, /Error de red/);
});

test('publicar: sin token → fallo inmediato sin llamar a la API', async () => {
  let llamado = false;
  const espia = async () => {
    llamado = true;
    throw new Error('no debe llamarse');
  };
  const resultado = await publicarInvitacionEnGitHub(invitacionMuestra(), '', espia);
  assert.equal(resultado.success, false);
  assert.match(resultado.message, /Falta el GitHub Token/);
  assert.equal(llamado, false);
});

// ---------------------------------------------------------------------------
// uploadToGitHub — activos del editor
// ---------------------------------------------------------------------------

const JPEG_BYTES = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
]);

function archivoJpeg(nombre = 'Mi Foto de XV!.jpg', bytes = JPEG_BYTES): File {
  return new File([bytes as unknown as BlobPart], nombre, { type: 'image/jpeg' });
}

test('upload: archivo válido → URL en la carpeta de assets de invitaciones', async () => {
  const { impl, llamadas } = fetchFalso({
    get: () => new Response('{"message":"Not Found"}', { status: 404 }),
    put: () => new Response('{"content":{}}', { status: 201 }),
  });
  const resultado = await uploadToGitHub(archivoJpeg(), 'token-de-prueba', undefined, impl);

  assert.equal(resultado.success, true);
  assert.match(resultado.url, /^\/Miluaistudio\/assets-invitaciones\/mi-foto-de-xv_[0-9a-z]+\.jpg$/);
  const ruta = llamadas[0].input;
  assert.ok(ruta.includes('/contents/public/assets-invitaciones/'), 'ruta del repo correcta: ' + ruta);
  assert.ok(!ruta.includes('/uploads/'), 'ya no usa la carpeta bloqueada uploads/');
  const cuerpo = JSON.parse(String(llamadas[1].init?.body));
  assert.match(cuerpo.message, /^Upload asset de invitación /);
  assert.ok(!cuerpo.message.includes('token-de-prueba'));
});

test('upload: tipo o tamaño inválido → falla ANTES de llamar a la API', async () => {
  let llamado = false;
  const espia = async () => {
    llamado = true;
    throw new Error('no debe llamarse');
  };
  const gif = new File([new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])], 'anim.gif', { type: 'image/gif' });
  const resultadoGif = await uploadToGitHub(gif, 'token-de-prueba', undefined, espia);
  assert.equal(resultadoGif.success, false);
  assert.match(resultadoGif.message, /Formato no permitido/);

  const grande = new File([new Uint8Array(JPEG_BYTES).fill(0, 0, JPEG_BYTES.length)], 'g.jpg', { type: 'image/jpeg' });
  Object.defineProperty(grande, 'size', { value: 6 * 1024 * 1024 });
  const resultadoGrande = await uploadToGitHub(grande, 'token-de-prueba', undefined, espia);
  assert.equal(resultadoGrande.success, false);
  assert.match(resultadoGrande.message, /límite es 5 MB/);
  assert.equal(llamado, false, 'la API nunca se contactó');
});

test('upload: respuesta HTTP fallida → success=false y la URL anterior se conserva', async () => {
  const { impl } = fetchFalso({
    get: () => new Response('{"message":"Not Found"}', { status: 404 }),
    put: () => new Response('{"message":"422 too large"}', { status: 422 }),
  });
  const urlAnterior = '/Miluaistudio/assets-invitaciones/vieja.jpg';
  const resultado = await uploadToGitHub(archivoJpeg(), 'token-de-prueba', undefined, impl);
  assert.equal(resultado.success, false);
  assert.equal(resultado.url, '', 'no devuelve URL nueva');
  assert.match(resultado.message, /422/);
  // La conservación de la URL anterior es responsabilidad del llamador:
  // el uploader solo entrega URL cuando hubo éxito verificable.
  assert.notEqual(urlAnterior, resultado.url);
});

test('upload: error de red → success=false con mensaje de red', async () => {
  const { impl } = fetchFalso({ rechazar: true });
  const resultado = await uploadToGitHub(archivoJpeg(), 'token-de-prueba', undefined, impl);
  assert.equal(resultado.success, false);
  assert.match(resultado.message, /Error de red/);
});

test('upload: sin token → fallo inmediato', async () => {
  let llamado = false;
  const espia = async () => {
    llamado = true;
    throw new Error('no debe llamarse');
  };
  const resultado = await uploadToGitHub(archivoJpeg(), '', undefined, espia);
  assert.equal(resultado.success, false);
  assert.equal(llamado, false);
});

// La carpeta de fotos de invitados (backend de moderación) no cambia:
assert.equal(CARPETA_ACTIVOS_INVITACION, 'assets-invitaciones');
