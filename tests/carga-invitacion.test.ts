/**
 * Pruebas de la unidad de carga de invitaciones publicadas
 * (src/lib/carga-invitacion.ts) — editor móvil, iteración 017.
 *
 * Qué demuestra esta suite:
 *  - La carga pasa por la API de GitHub al archivo EXACTO del slug
 *    (content/invitaciones/<slug>.json) con el slug normalizado.
 *  - Slug y token se validan ANTES de contactar la API.
 *  - Cada fallo (no existe, JSON ilegible, formato inesperado, error de
 *    red o de API) devuelve un ResultadoCarga honesto y accionable:
 *    nunca lanza y nunca carga nada al editor a medias.
 *  - El éxito devuelve la SiteConfig publicada lista para editar.
 *
 * Todo con fetch simulado y datos 100% sintéticos: nada toca la red ni
 * el repositorio real.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  leerInvitacionPublicadaDeGitHub,
} from '../src/lib/carga-invitacion.js';

const SLUG = 'quince-de-prueba';
const URL_ESPERADA =
  `https://api.github.com/repos/Sebasm2kuy/Miluaistudio/contents/content/invitaciones/${SLUG}.json`;

/** Representación publicada sintética válida (esquema 1). */
function cuerpoPublicada(): string {
  return JSON.stringify({
    esquema: 1,
    slug: SLUG,
    publicadoEn: '2026-10-01T12:00:00.000Z',
    actualizadoEn: '2026-10-27T12:00:00.000Z',
    config: {
      evento: { nombre: 'Prueba Sintética' },
    },
  });
}

function respuestaGithub(estado: number, cuerpo: unknown) {
  return {
    ok: estado >= 200 && estado < 300,
    status: estado,
    json: async () => cuerpo,
  } as unknown as Response;
}

function respuestaContenido(json: string) {
  return respuestaGithub(200, {
    content: Buffer.from(json, 'utf8').toString('base64'),
  });
}

test('slug y token se validan ANTES de contactar la API de GitHub', async () => {
  let llamadas = 0;
  const fetchImpl = async () => {
    llamadas += 1;
    throw new Error('la API no debió contactarse');
  };

  const sinSlug = await leerInvitacionPublicadaDeGitHub({ slug: '', token: 'tok', fetchImpl });
  assert.equal(sinSlug.success, false);
  assert.ok(sinSlug.message.length > 10);

  const slugReservado = await leerInvitacionPublicadaDeGitHub({ slug: 'admin', token: 'tok', fetchImpl });
  assert.equal(slugReservado.success, false);
  assert.match(slugReservado.message, /reservado/);

  const sinToken = await leerInvitacionPublicadaDeGitHub({ slug: SLUG, token: '   ', fetchImpl });
  assert.equal(sinToken.success, false);
  assert.match(sinToken.message, /token/i);

  assert.equal(llamadas, 0, 'ningún fetch debió ocurrir');
});

test('carga exitosa: URL exacta del slug, config lista y mensaje honesto', async () => {
  const urls: string[] = [];
  const fetchImpl = async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : String(input);
    urls.push(url);
    return respuestaContenido(cuerpoPublicada());
  };

  const resultado = await leerInvitacionPublicadaDeGitHub({
    slug: `  ${SLUG} `,
    token: 'tok',
    fetchImpl,
  });

  assert.equal(resultado.success, true);
  assert.equal(resultado.slug, SLUG);
  assert.equal(urls.length, 1);
  assert.equal(urls[0], URL_ESPERADA);
  assert.equal(resultado.config?.evento.nombre, 'Prueba Sintética');
  assert.equal(resultado.publicadoEn, '2026-10-01T12:00:00.000Z');
  assert.match(resultado.message, /Publicar cambios/);
});

test('slug se normaliza para construir la URL (mayúsculas y espacios)', async () => {
  const urls: string[] = [];
  const fetchImpl = async (input: string | URL | Request) => {
    urls.push(typeof input === 'string' ? input : String(input));
    return respuestaContenido(cuerpoPublicada());
  };

  await leerInvitacionPublicadaDeGitHub({ slug: 'Quince de Prueba', token: 'tok', fetchImpl });

  assert.equal(urls.length, 1);
  assert.ok(urls[0].endsWith('/contents/content/invitaciones/quince-de-prueba.json'), urls[0]);
});

test('404: mensaje claro de que no existe, sin cargar nada', async () => {
  const fetchImpl = async () => respuestaGithub(404, { message: 'Not Found' });

  const resultado = await leerInvitacionPublicadaDeGitHub({ slug: SLUG, token: 'tok', fetchImpl });

  assert.equal(resultado.success, false);
  assert.equal(resultado.config, undefined);
  assert.match(resultado.message, /No existe una invitación publicada/);
  assert.match(resultado.message, new RegExp(SLUG));
});

test('error de la API (500): estado honesto y sin éxito fingido', async () => {
  const fetchImpl = async () => respuestaGithub(500, { message: 'Server Error' });

  const resultado = await leerInvitacionPublicadaDeGitHub({ slug: SLUG, token: 'tok', fetchImpl });

  assert.equal(resultado.success, false);
  assert.match(resultado.message, /500/);
  assert.match(resultado.message, /reintentar/i);
});

test('JSON ilegible: no se carga nada al editor', async () => {
  const fetchImpl = async () => respuestaContenido('esto no es json {');

  const resultado = await leerInvitacionPublicadaDeGitHub({ slug: SLUG, token: 'tok', fetchImpl });

  assert.equal(resultado.success, false);
  assert.match(resultado.message, /JSON legible/);
});

test('formato inesperado (esquema equivocado): rechazado por la validación', async () => {
  const malo = JSON.stringify({
    esquema: 99,
    slug: SLUG,
    publicadoEn: '2026-10-01T12:00:00.000Z',
    actualizadoEn: '2026-10-27T12:00:00.000Z',
    config: { evento: { nombre: 'X' } },
  });
  const fetchImpl = async () => respuestaContenido(malo);

  const resultado = await leerInvitacionPublicadaDeGitHub({ slug: SLUG, token: 'tok', fetchImpl });

  assert.equal(resultado.success, false);
  assert.match(resultado.message, /formato esperado/);
});

test('fallo de red: mensaje de conexión sin promesa rota', async () => {
  const fetchImpl = async () => {
    throw new TypeError('fetch failed');
  };

  const resultado = await leerInvitacionPublicadaDeGitHub({ slug: SLUG, token: 'tok', fetchImpl });

  assert.equal(resultado.success, false);
  assert.match(resultado.message, /No se pudo conectar/);
});
