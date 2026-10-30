/**
 * Iteración 024 — Música directa desde Spotify + servicios extra.
 *
 *  1. spotifyEmbedUrl: cualquier enlace open.spotify.com (playlist, álbum,
 *     tema, show, episodio) se convierte al formato embed que renderiza la
 *     invitación; enlaces ajenos o acortados devuelven null (sin excepciones).
 *  2. SERVICIOS_EXTRA: integridad de los datos de la sección «próximamente»
 *     (4 servicios, ids únicos, textos completos, 3 puntos por servicio).
 *  3. Los perfiles demo y la configuración de demostración no referencian
 *     tonos de música de fondo (sistema retirado: la música es Spotify).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spotifyEmbedUrl } from '../src/lib/personalizador.js';
import { MENSAJE_SERVICIOS_EXTRA, SERVICIOS_EXTRA } from '../src/data/servicios.js';
import { CONFIG_DEMO_BASE } from '../src/data/demo-config.js';

test('spotify: playlist, álbum, tema, show y episodio se convierten a embed', () => {
  assert.equal(
    spotifyEmbedUrl('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'),
    'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
  );
  assert.equal(
    spotifyEmbedUrl('https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3'),
    'https://open.spotify.com/embed/album/1DFixLWuPkv3KT3TnV35m3',
  );
  assert.equal(
    spotifyEmbedUrl('https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6'),
    'https://open.spotify.com/embed/track/6rqhFgbbKwnb9MLmUQDhG6',
  );
  assert.equal(
    spotifyEmbedUrl('https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk'),
    'https://open.spotify.com/embed/show/4rOoJ6Egrf8K2IrywzwOMk',
  );
  assert.equal(
    spotifyEmbedUrl('https://open.spotify.com/episode/4ZAIHarJGtoZZjW7X8hPYc'),
    'https://open.spotify.com/embed/episode/4ZAIHarJGtoZZjW7X8hPYc',
  );
  // Con consulta de la app («?si=…») también funciona
  assert.equal(
    spotifyEmbedUrl('https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6?si=abc123'),
    'https://open.spotify.com/embed/track/6rqhFgbbKwnb9MLmUQDhG6',
  );
});

test('spotify: enlaces ajenos, acortados o vacíos → null (nunca lanza)', () => {
  assert.equal(spotifyEmbedUrl(''), null);
  assert.equal(spotifyEmbedUrl('https://youtube.com/watch?v=abc'), null);
  assert.equal(spotifyEmbedUrl('https://open.spotify.com/'), null);
  assert.equal(spotifyEmbedUrl('https://spotify.link/abc123'), null, 'los acortados no se pueden resolver sin red');
  // Sin protocolo también se convierte (tolerante a pegado manual)
  assert.equal(
    spotifyEmbedUrl('open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6'),
    'https://open.spotify.com/embed/track/6rqhFgbbKwnb9MLmUQDhG6',
  );
});

test('servicios: los 4 extras «próximamente» están completos y con ids únicos', () => {
  assert.equal(SERVICIOS_EXTRA.length, 4, 'álbum digital, edición de video, video de historia y tráiler');
  const ids = SERVICIOS_EXTRA.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'ids de servicio duplicados');
  assert.deepEqual(
    [...ids].sort(),
    ['album-digital', 'edicion-video', 'trailer-evento', 'video-historia'],
  );
  for (const s of SERVICIOS_EXTRA) {
    assert.ok(s.nombre.length >= 8, `${s.id}: nombre muy corto`);
    assert.ok(s.tagline.length >= 15, `${s.id}: tagline muy corto`);
    assert.ok(s.desc.length >= 80, `${s.id}: descripción demasiado corta`);
    assert.equal(s.puntos.length, 3, `${s.id}: deben ser 3 puntos`);
    assert.ok(s.puntos.every((p) => p.length >= 15), `${s.id}: puntos muy cortos`);
    // Los textos son propios: sin frases calcadas de la referencia analizada
    assert.equal(/invitio/i.test(s.nombre + s.tagline + s.desc), false, `${s.id}: menciona la referencia`);
  }
});

test('servicios: la CTA de WhatsApp lleva un mensaje concreto', () => {
  assert.ok(MENSAJE_SERVICIOS_EXTRA.startsWith('Hola!'));
  assert.match(MENSAJE_SERVICIOS_EXTRA, /álbum digital/i);
});

test('música: la demo base no contiene restos del sistema de tonos retirado', () => {
  const plano = JSON.stringify(CONFIG_DEMO_BASE);
  assert.equal(plano.includes('musicaFondo'), false, 'musicaFondo ya no existe en la config');
  assert.equal(plano.includes('/audio/fondo-'), false, 'sin MP3 de tonos en la demo');
  // La sección de música es Spotify: playlist y embed definidos
  assert.ok(CONFIG_DEMO_BASE.musica.playlistUrl.length > 0);
  assert.ok(CONFIG_DEMO_BASE.musica.embedUrl.length > 0);
});
