/**
 * Pruebas de la unidad de publicación del panel
 * (src/lib/publicacion-panel.ts) + guardas de la interfaz.
 *
 * Qué demuestra esta suite (hallazgo F-01 de la iteración 011):
 *  - La acción principal «Publicar invitación» pasa por el flujo por slug
 *    (publicarInvitacionEnGitHub → content/invitaciones/<slug>.json).
 *  - El panel ya NO depende de deployToGitHub(): el botón heredado fue
 *    retirado de la interfaz y la librería queda como LEGADO explícito.
 *  - Slug y token se validan ANTES de contactar la API de GitHub.
 *  - El resultado refleja el estado real (creada / actualizada / error).
 *
 * Todo con fetch simulado y datos 100% sintéticos: nada toca la red ni el
 * repositorio real.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  publicarInvitacionDesdePanel,
  prepararInvitacionDesdePanel,
} from '../src/lib/publicacion-panel.js';
import {
  deployToGitHub,
  uploadToGitHub,
  publicarInvitacionEnGitHub,
} from '../src/lib/github-deploy.js';
import { serializarInvitacion } from '../src/data/invitacion-publicada.js';
import type { SiteConfig } from '../src/data/config-schema.js';

const FECHA = new Date('2026-10-27T15:00:00.000Z');

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

interface Llamada { input: string; init?: RequestInit }

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
// La acción principal publica por el flujo por slug
// ---------------------------------------------------------------------------

test('panel: slug válido → publica vía publicarInvitacionEnGitHub (flujo /i/<slug>/)', async () => {
  const { impl, llamadas } = fetchFalso({
    get: () => new Response('{"message":"Not Found"}', { status: 404 }),
    put: () => new Response('{"content":{},"commit":{"sha":"abc"}}', { status: 201 }),
  });
  const resultado = await publicarInvitacionDesdePanel({
    slug: 'muestra-panel',
    config: configMuestra(),
    token: 'token-de-prueba',
    ahora: FECHA,
    fetchImpl: impl,
  });

  assert.equal(resultado.success, true);
  assert.equal(resultado.creado, true);
  assert.equal(resultado.slug, 'muestra-panel');
  assert.equal(resultado.url, '/Miluaistudio/i/muestra-panel/');
  assert.equal(resultado.urlAbsoluta, 'https://sebasm2kuy.github.io/Miluaistudio/i/muestra-panel/');

  // Exactamente una lectura y una escritura, a la ruta del slug
  assert.equal(llamadas.length, 2);
  assert.ok(
    llamadas[0].input.endsWith('/contents/content/invitaciones/muestra-panel.json'),
    'lectura de la publicación existente: ' + llamadas[0].input,
  );
  assert.equal(llamadas[1].init?.method, 'PUT');
  const cuerpo = JSON.parse(String(llamadas[1].init?.body));
  const subido = JSON.parse(decodeURIComponent(escape(atob(cuerpo.content))));
  assert.equal(subido.slug, 'muestra-panel');
  assert.equal(subido.config.modoDemo, false, 'la invitación publicada es real, no demo');
  assert.ok(!cuerpo.message.includes('token-de-prueba'));
});

test('panel: actualizar el mismo slug reutiliza el archivo y conserva publicadoEn', async () => {
  const original = prepararInvitacionDesdePanel({
    slug: 'muestra-panel',
    config: configMuestra(),
    ahora: FECHA,
  });
  const existenteBase64 = Buffer.from(serializarInvitacion(original), 'utf8').toString('base64');
  const { impl, llamadas } = fetchFalso({
    get: () => new Response(JSON.stringify({ sha: 'sha-existente', content: existenteBase64 }), { status: 200 }),
    put: () => new Response('{"content":{}}', { status: 200 }),
  });
  const resultado = await publicarInvitacionDesdePanel({
    slug: 'Muestra Panel',
    config: configMuestra(),
    token: 'token-de-prueba',
    ahora: new Date('2026-11-10T10:00:00.000Z'),
    fetchImpl: impl,
  });

  assert.equal(resultado.success, true);
  assert.equal(resultado.creado, false, 'actualización del mismo slug, sin duplicados');
  const cuerpo = JSON.parse(String(llamadas[1].init?.body));
  assert.equal(cuerpo.sha, 'sha-existente');
  const subido = JSON.parse(decodeURIComponent(escape(atob(cuerpo.content))));
  assert.equal(subido.publicadoEn, FECHA.toISOString(), 'fecha de primera publicación conservada');
});

// ---------------------------------------------------------------------------
// Validaciones ANTES de contactar GitHub
// ---------------------------------------------------------------------------

test('panel: slug inválido → fallo sin llamar a la API de GitHub', async () => {
  let llamado = false;
  const espia = async () => {
    llamado = true;
    throw new Error('no debe llamarse');
  };

  const vacio = await publicarInvitacionDesdePanel({
    slug: '', config: configMuestra(), token: 'token-de-prueba', fetchImpl: espia,
  });
  assert.equal(vacio.success, false);
  assert.match(vacio.message, /Elegí un slug/);

  const reservado = await publicarInvitacionDesdePanel({
    slug: 'admin', config: configMuestra(), token: 'token-de-prueba', fetchImpl: espia,
  });
  assert.equal(reservado.success, false);
  assert.match(reservado.message, /reservado/);

  const corto = await publicarInvitacionDesdePanel({
    slug: 'a', config: configMuestra(), token: 'token-de-prueba', fetchImpl: espia,
  });
  assert.equal(corto.success, false);
  assert.match(corto.message, /al menos 2 caracteres/);

  assert.equal(llamado, false, 'la API nunca se contactó');
});

test('panel: sin token → fallo sin llamar a la API y con la sección correcta', async () => {
  let llamado = false;
  const espia = async () => {
    llamado = true;
    throw new Error('no debe llamarse');
  };
  const resultado = await publicarInvitacionDesdePanel({
    slug: 'muestra-panel', config: configMuestra(), token: '   ', fetchImpl: espia,
  });
  assert.equal(resultado.success, false);
  assert.match(resultado.message, /Falta el GitHub Token/);
  assert.match(resultado.message, /Conexión con GitHub/);
  assert.equal(llamado, false);
});

test('panel: error de la API al leer → fallo honesto propagado, sin escritura', async () => {
  const { impl, llamadas } = fetchFalso({
    get: () => new Response('{"message":"Server Error"}', { status: 500 }),
  });
  const resultado = await publicarInvitacionDesdePanel({
    slug: 'muestra-panel', config: configMuestra(), token: 'token-de-prueba', fetchImpl: impl,
  });
  assert.equal(resultado.success, false);
  assert.match(resultado.message, /reintentar/);
  assert.equal(llamadas.length, 1, 'no se intentó escribir');
});

test('panel: error de red → fallo honesto (nunca éxito no verificado)', async () => {
  const { impl } = fetchFalso({ rechazar: true });
  const resultado = await publicarInvitacionDesdePanel({
    slug: 'muestra-panel', config: configMuestra(), token: 'token-de-prueba', fetchImpl: impl,
  });
  assert.equal(resultado.success, false);
  assert.match(resultado.message, /Error de red/);
});

// ---------------------------------------------------------------------------
// Coherencia de la representación preparada desde el panel
// ---------------------------------------------------------------------------

test('panel: en modo fotos, la representación publicada sincroniza fondo con galería', async () => {
  const cfg = configMuestra();
  cfg.galeria.fotos = [
    { webp: '/Miluaistudio/assets-invitaciones/nueva-1.jpg', fallback: '' },
    { webp: '/Miluaistudio/assets-invitaciones/nueva-2.jpg', fallback: '' },
  ];
  // Fondo desactualizado (foto vieja que ya no está en la galería)
  cfg.fondo = { fotos: ['/Miluaistudio/assets-invitaciones/vieja.jpg'] };

  const { impl, llamadas } = fetchFalso({
    get: () => new Response('{"message":"Not Found"}', { status: 404 }),
    put: () => new Response('{"content":{}}', { status: 201 }),
  });
  const resultado = await publicarInvitacionDesdePanel({
    slug: 'muestra-panel', config: cfg, token: 'token-de-prueba', fetchImpl: impl,
  });
  assert.equal(resultado.success, true);
  const cuerpo = JSON.parse(String(llamadas[1].init?.body));
  const subido = JSON.parse(decodeURIComponent(escape(atob(cuerpo.content))));
  assert.deepEqual(subido.config.fondo.fotos, [
    '/Miluaistudio/assets-invitaciones/nueva-1.jpg',
    '/Miluaistudio/assets-invitaciones/nueva-2.jpg',
  ], 'el fondo publicado usa la galería vigente, no la foto vieja');
});

test('prepararInvitacionDesdePanel: lanza con motivo entendible (lo usa «Descargar JSON»)', () => {
  assert.throws(() => prepararInvitacionDesdePanel({ slug: '', config: configMuestra() }), /Elegí un slug/);
  assert.throws(() => prepararInvitacionDesdePanel({ slug: 'i', config: configMuestra() }), /reservado/);
  const invitacion = prepararInvitacionDesdePanel({
    slug: 'Muestra Panel!', config: configMuestra(), ahora: FECHA,
  });
  assert.equal(invitacion.slug, 'muestra-panel', 'el slug se normaliza');
});

// ---------------------------------------------------------------------------
// Guardas de interfaz: el botón heredado «Deploy» no vuelve al camino normal
// ---------------------------------------------------------------------------

function fuentePanel(): string {
  const ruta = resolve(process.cwd(), 'src/app/admin/page.tsx');
  assert.ok(existsSync(ruta), 'no se encontró ' + ruta + ' (¿se corre desde la raíz del repo?)');
  return readFileSync(ruta, 'utf8');
}

test('guarda UI: el panel no ofrece ni referencia deployToGitHub (solo el flujo por slug)', () => {
  const fuente = fuentePanel();
  assert.ok(!fuente.includes('deployToGitHub'), 'el panel no debe llamar a deployToGitHub');
  assert.ok(!fuente.includes('handleDeploy'), 'no debe quedar el handler heredado');
  assert.ok(!fuente.includes('>Deploy<'), 'no debe haber un botón «Deploy» en la interfaz');
  assert.ok(!fuente.includes('Deploying'), 'no debe quedar estado de deploy heredado');
  // La acción principal usa la unidad testeable del flujo por slug
  assert.ok(fuente.includes('publicarInvitacionDesdePanel'), 'la publicación pasa por publicarInvitacionDesdePanel');
  assert.ok(fuente.includes('publicacion-panel'), 'importa la unidad publicacion-panel');
  // La sección del token no sugiere que publica
  assert.ok(fuente.includes('Conexión con GitHub'), 'sección del token renombrada a «Conexión con GitHub»');
  assert.ok(!fuente.includes('Deploy (Git Push)'), 'ya no existe la sección «Deploy (Git Push)»');
});

test('guarda lib: deployToGitHub sigue disponible como LEGADO documentado (no se quitó a ciegas)', () => {
  assert.equal(typeof deployToGitHub, 'function');
  assert.equal(typeof publicarInvitacionEnGitHub, 'function');
  assert.equal(typeof uploadToGitHub, 'function');
  const fuente = readFileSync(resolve(process.cwd(), 'src/lib/github-deploy.ts'), 'utf8');
  assert.ok(fuente.includes('LEGADO'), 'el contrato de deployToGitHub queda documentado como LEGADO');
  assert.ok(fuente.includes('NO publica invitaciones'), 'queda explícito qué NO hace deployToGitHub');
});
