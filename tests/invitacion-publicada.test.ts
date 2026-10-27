/**
 * Pruebas de la representación publicable de invitaciones
 * (src/data/invitacion-publicada.ts).
 *
 * Cobertura exigida por la iteración funcional:
 *  - creación de slug (normalización, límites, reservados)
 *  - serialización: solo datos (sin funciones ni objetos del editor),
 *    modo real (no demo) y sin etiqueta de demostración
 *  - validación de la representación leída de un JSON
 *  - construcción de URLs con basePath /Miluaistudio/
 *  - coexistencia: dos invitaciones → dos representaciones independientes;
 *    actualizar conserva el slug
 *  - la invitación publicada lleva los campos de RSVP del contrato y las
 *    demos siguen siendo demostraciones independientes (sin envíos reales)
 *
 * Datos 100% sintéticos.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  normalizarSlug,
  esSlugValido,
  motivoSlugInvalido,
  crearInvitacionPublicada,
  validarInvitacionPublicada,
  urlInvitacion,
  urlPublicaInvitacion,
  rutaArchivoInvitacion,
  serializarInvitacion,
  ESQUEMA_INVITACION,
  SLUGS_RESERVADOS,
  type InvitacionPublicada,
} from '../src/data/invitacion-publicada.js';
import type { SiteConfig } from '../src/data/config-schema.js';

const FECHA_FIJA = new Date('2026-10-28T12:00:00.000Z');

/** Config mínima sintética para las pruebas (forma completa suficiente). */
function configBase(): SiteConfig {
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

// ---------------------------------------------------------------------------
// Slug: creación y validación
// ---------------------------------------------------------------------------

test('normalizarSlug: acentos, ñ, espacios y mayúsculas → slug limpio', () => {
  assert.equal(normalizarSlug('Antonella XV'), 'antonella-xv');
  assert.equal(normalizarSlug('Mis XV Años!'), 'mis-xv-anos');
  assert.equal(normalizarSlug('Valentina & Diego'), 'valentina-diego');
  assert.equal(normalizarSlug('  Cumpleaños   de  Pepe '), 'cumpleanos-de-pepe');
  assert.equal(normalizarSlug('Ñandú Feliz'), 'nandu-feliz');
});

test('normalizarSlug: colapsa guiones, recorta bordes y respeta el máximo', () => {
  assert.equal(normalizarSlug('--Varios///Guiones---'), 'varios-guiones');
  assert.ok(normalizarSlug('a'.repeat(100)).length <= 60);
});

test('normalizarSlug: sin material utilizable devuelve cadena vacía', () => {
  assert.equal(normalizarSlug('!!!'), '');
  assert.equal(normalizarSlug('   '), '');
});

test('esSlugValido: acepta slugs razonables y rechaza inválidos y reservados', () => {
  assert.ok(esSlugValido('quince-de-muestra'));
  assert.ok(esSlugValido('boda-2027'));
  for (const malo of ['', 'a', 'Quince', 'con espacios', '-guion', 'guion-', 'dos--guiones', 'x'.repeat(61), 'punto.com']) {
    assert.equal(esSlugValido(malo), false, `debería rechazar: "${malo}"`);
  }
  for (const reservado of SLUGS_RESERVADOS) {
    assert.equal(esSlugValido(reservado), false, `debería reservar: "${reservado}"`);
  }
  // Las rutas reales del sitio nunca pueden chocar con una invitación
  assert.equal(esSlugValido('admin'), false);
  assert.equal(esSlugValido('catalogo'), false);
  assert.equal(esSlugValido('personalizar'), false);
  assert.equal(esSlugValido('i'), false);
  assert.equal(esSlugValido('uploads'), false);
  assert.equal(esSlugValido('previsualizar'), false);
});

test('motivoSlugInvalido: explica el problema de cada slug rechazado', () => {
  assert.ok(motivoSlugInvalido('admin').includes('reservado'));
  assert.ok(motivoSlugInvalido('a').includes('2 caracteres'));
  assert.ok(motivoSlugInvalido('Con Espacios').length > 0);
  assert.equal(motivoSlugInvalido('boda-2027'), '');
});

// ---------------------------------------------------------------------------
// Serialización: solo datos, modo real, fechas
// ---------------------------------------------------------------------------

test('crearInvitacionPublicada: serializa a datos puros y marca modo real', () => {
  const config = configBase() as unknown as Record<string, unknown>;
  config.demoNombreDiseno = 'Rosa Romántica · Demostración interactiva';
  // Objeto con función adentro: la representación publicada la descarta
  (config as { campoRaro?: unknown }).campoRaro = function ruido() {};

  const invitacion = crearInvitacionPublicada({
    slug: 'ejemplo-xv',
    config: config as unknown as SiteConfig,
    ahora: FECHA_FIJA,
  });

  assert.equal(invitacion.esquema, ESQUEMA_INVITACION);
  assert.equal(invitacion.slug, 'ejemplo-xv');
  assert.equal(invitacion.publicadoEn, FECHA_FIJA.toISOString());
  assert.equal(invitacion.actualizadoEn, FECHA_FIJA.toISOString());
  // Real, no demostración
  assert.equal(invitacion.config.modoDemo, false);
  assert.equal('demoNombreDiseno' in invitacion.config, false);
  // La función no sobrevive a la serialización
  assert.equal('campoRaro' in (invitacion.config as unknown as Record<string, unknown>), false);
  // El texto serializado es JSON puro (sin "function")
  assert.ok(!serializarInvitacion(invitacion).includes('function'));
});

test('crearInvitacionPublicada: rechaza slug inválido o config vacía', () => {
  assert.throws(() => crearInvitacionPublicada({ slug: 'admin', config: configBase() }));
  assert.throws(() => crearInvitacionPublicada({ slug: '', config: configBase() }));
  assert.throws(() =>
    crearInvitacionPublicada({ slug: 'boda', config: undefined as unknown as SiteConfig }),
  );
});

test('crearInvitacionPublicada: actualización conserva publicadoEn original', () => {
  const primera = crearInvitacionPublicada({
    slug: 'ejemplo-xv',
    config: configBase(),
    ahora: FECHA_FIJA,
  });
  const despues = new Date(FECHA_FIJA.getTime() + 86_400_000);
  const actualizada = crearInvitacionPublicada({
    slug: 'ejemplo-xv',
    config: configBase(),
    publicadoEn: primera.publicadoEn,
    ahora: despues,
  });
  assert.equal(actualizada.publicadoEn, primera.publicadoEn, 'publicadoEn estable');
  assert.equal(actualizada.actualizadoEn, despues.toISOString(), 'actualizadoEn avanza');
  assert.equal(actualizada.slug, primera.slug, 'mismo slug = mismo enlace');
});

// ---------------------------------------------------------------------------
// Validación de la representación leída
// ---------------------------------------------------------------------------

test('validarInvitacionPublicada: acepta un round-trip JSON completo', () => {
  const original = crearInvitacionPublicada({ slug: 'ejemplo-xv', config: configBase() });
  const leido = JSON.parse(JSON.stringify(original));
  const validada = validarInvitacionPublicada(leido);
  assert.ok(validada);
  assert.equal(validada.slug, 'ejemplo-xv');
  assert.equal(validada.config.evento.nombre, 'Prueba Sintética');
});

test('validarInvitacionPublicada: rechaza null, arrays, esquema viejo y config sin evento', () => {
  assert.equal(validarInvitacionPublicada(null), null);
  assert.equal(validarInvitacionPublicada([1, 2]), null);
  assert.equal(validarInvitacionPublicada('no-object'), null);
  assert.equal(validarInvitacionPublicada({ esquema: 99, slug: 'x' }), null);
  assert.equal(validarInvitacionPublicada({ ...configBase(), esquema: 1 }), null);
  const sinEvento = crearInvitacionPublicada({ slug: 'ejemplo-xv', config: configBase() });
  const roto = JSON.parse(JSON.stringify(sinEvento)) as Record<string, unknown>;
  (roto.config as Record<string, unknown>).evento = {};
  assert.equal(validarInvitacionPublicada(roto), null);
});

// ---------------------------------------------------------------------------
// URLs y rutas de archivo
// ---------------------------------------------------------------------------

test('urlInvitacion / urlPublicaInvitacion: incluyen /Miluaistudio/ y trailing slash', () => {
  assert.equal(urlInvitacion('ejemplo-xv'), '/Miluaistudio/i/ejemplo-xv/');
  assert.equal(
    urlPublicaInvitacion('ejemplo-xv'),
    'https://sebasm2kuy.github.io/Miluaistudio/i/ejemplo-xv/',
  );
  assert.equal(rutaArchivoInvitacion('ejemplo-xv'), 'content/invitaciones/ejemplo-xv.json');
});

// ---------------------------------------------------------------------------
// Coexistencia y actualización (nivel representación)
// ---------------------------------------------------------------------------

test('coexistencia: dos invitaciones generan representaciones y archivos distintos', () => {
  const quince = crearInvitacionPublicada({
    slug: 'ejemplo-quince',
    config: configBase(),
    disenoBase: 'rosa-romantica',
    ahora: FECHA_FIJA,
  });
  const boda = crearInvitacionPublicada({
    slug: 'ejemplo-boda',
    config: configBase(),
    disenoBase: 'geometria-moderna',
    ahora: FECHA_FIJA,
  });

  assert.notEqual(quince.slug, boda.slug);
  assert.notEqual(urlInvitacion(quince.slug), urlInvitacion(boda.slug));
  assert.notEqual(rutaArchivoInvitacion(quince.slug), rutaArchivoInvitacion(boda.slug));
  // Publicar una no toca la representación de la otra
  const quinceSerializada = serializarInvitacion(quince);
  crearInvitacionPublicada({ slug: 'otra-mas', config: configBase() });
  assert.equal(serializarInvitacion(quince), quinceSerializada);
});

// ---------------------------------------------------------------------------
// RSVP de la invitación publicada vs demos (tarea D)
// ---------------------------------------------------------------------------

test('la invitación publicada conserva los campos del contrato RSVP', () => {
  const config = configBase();
  config.rsvp.googleSheetUrl = 'https://script.google.com/macros/s/DEMO-DEPLOYMENT/exec';
  config.rsvp.hostPhone = '59800000000';
  config.modoDemo = true; // venía de una vista previa del panel
  const invitacion = crearInvitacionPublicada({ slug: 'con-rsvp', config, ahora: FECHA_FIJA });
  assert.equal(invitacion.config.rsvp.googleSheetUrl, 'https://script.google.com/macros/s/DEMO-DEPLOYMENT/exec');
  assert.equal(invitacion.config.rsvp.hostPhone, '59800000000');
  assert.equal(invitacion.config.modoDemo, false, 'al publicar, la confirmación es real (no demo)');
});

test('las demos del catálogo siguen sin enviar confirmaciones reales', () => {
  // La base de demostración real del repo (leída como texto, mismo patrón
  // que tests/privacidad-config.test.ts) mantiene endpoints vacíos y modo demo:
  // doble protección para que ninguna demo dispare envíos verdaderos.
  const demo = readFileSync(join(process.cwd(), 'src', 'data', 'demo-config.ts'), 'utf8');
  assert.match(demo, /modoDemo: true/);
  assert.match(demo, /googleSheetUrl: '',/);
  assert.match(demo, /hostPhone: '',/);
  assert.match(demo, /photoUploadUrl: '',/);
});
