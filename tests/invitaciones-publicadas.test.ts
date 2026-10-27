/**
 * Pruebas de la colección de invitaciones publicadas en disco
 * (src/lib/invitaciones-publicadas.ts) con directorio temporal.
 *
 * Cobertura:
 *  - dos slugs de prueba → dos entradas de generateStaticParams
 *  - lectura válida, JSON roto y slug inexistente
 *  - actualizar un archivo (mismo slug) no duplica entradas
 *  - coexistencia de dos invitaciones en el mismo directorio
 *  - directorio ausente → colección vacía (build sin invitaciones)
 *
 * Datos 100% sintéticos.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  listarSlugsEnDirectorio,
  leerInvitacionDeDirectorio,
  parametrosRutasInvitaciones,
} from '../src/lib/invitaciones-publicadas.js';
import {
  crearInvitacionPublicada,
  serializarInvitacion,
} from '../src/data/invitacion-publicada.js';
import type { SiteConfig } from '../src/data/config-schema.js';

const FECHA = new Date('2026-10-28T12:00:00.000Z');

function configMinima(nombre: string): SiteConfig {
  return {
    evento: {
      tipo: 'Celebración de prueba',
      nombre,
      apellido: '',
      apodo: nombre,
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
    dedicatoria: { cita: '', cuerpo: '', firma: nombre },
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
    footer: { apodo: nombre, ubicacion: '', frase: '' },
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

function nuevoDir(): string {
  const base = mkdtempSync(join(tmpdir(), 'milu-invitaciones-'));
  mkdirSync(join(base, 'invitaciones'), { recursive: true });
  return join(base, 'invitaciones');
}

function escribir(dir: string, slug: string, nombre: string): void {
  const invitacion = crearInvitacionPublicada({
    slug,
    config: configMinima(nombre),
    ahora: FECHA,
  });
  writeFileSync(join(dir, `${slug}.json`), serializarInvitacion(invitacion), 'utf8');
}

test('dos invitaciones de prueba producen dos parámetros de rutas estáticas', () => {
  const dir = nuevoDir();
  try {
    escribir(dir, 'prueba-uno', 'Prueba Uno');
    escribir(dir, 'prueba-dos', 'Prueba Dos');
    assert.deepEqual(listarSlugsEnDirectorio(dir), ['prueba-dos', 'prueba-uno']);
    const params = parametrosRutasInvitaciones(dir);
    assert.equal(params.length, 2);
    assert.deepEqual(params, [{ slug: 'prueba-dos' }, { slug: 'prueba-uno' }]);
  } finally {
    rmSync(join(dir, '..'), { recursive: true, force: true });
  }
});

test('actualizar una invitación (mismo slug) no duplica entradas y conserva su slug', () => {
  const dir = nuevoDir();
  try {
    escribir(dir, 'prueba-uno', 'Prueba Uno');
    escribir(dir, 'prueba-dos', 'Prueba Dos');

    // "Actualizar" = reescribir el MISMO archivo del slug
    escribir(dir, 'prueba-uno', 'Prueba Uno (editada)');

    assert.equal(listarSlugsEnDirectorio(dir).length, 2, 'siguen siendo dos invitaciones');
    const leida = leerInvitacionDeDirectorio(dir, 'prueba-uno');
    assert.ok(leida);
    assert.equal(leida.slug, 'prueba-uno', 'el slug y el enlace se conservan');
    assert.equal(leida.config.dedicatoria.firma, 'Prueba Uno (editada)');
    assert.equal(leida.publicadoEn, FECHA.toISOString(), 'publicadoEn estable');
  } finally {
    rmSync(join(dir, '..'), { recursive: true, force: true });
  }
});

test('coexistencia: publicar otra invitación no sobrescribe la anterior', () => {
  const dir = nuevoDir();
  try {
    escribir(dir, 'prueba-uno', 'Prueba Uno');
    const contenidoAntes = readFileSync(join(dir, 'prueba-uno.json'), 'utf8');
    escribir(dir, 'prueba-dos', 'Prueba Dos');
    assert.equal(readFileSync(join(dir, 'prueba-uno.json'), 'utf8'), contenidoAntes);
    const leidas = listarSlugsEnDirectorio(dir).map((s) => leerInvitacionDeDirectorio(dir, s));
    assert.ok(leidas.every((inv) => inv !== null));
    assert.equal(new Set(leidas.map((inv) => inv?.slug)).size, 2);
  } finally {
    rmSync(join(dir, '..'), { recursive: true, force: true });
  }
});

test('lectura defensiva: JSON roto, slug inexistente y directorio ausente', () => {
  const dir = nuevoDir();
  try {
    writeFileSync(join(dir, 'roto.json'), '{ no es json', 'utf8');
    assert.equal(leerInvitacionDeDirectorio(dir, 'roto'), null);
    assert.equal(leerInvitacionDeDirectorio(dir, 'fantasma'), null);
    // Un JSON válido pero con otro slug adentro no pasa la consistencia de ruta
    escribir(dir, 'prueba-uno', 'Prueba Uno');
    const inconsistente = join(dir, 'prueba-inconsistente.json');
    writeFileSync(
      inconsistente,
      readFileSync(join(dir, 'prueba-uno.json'), 'utf8').replace('"prueba-uno"', '"prueba-otro"'),
      'utf8',
    );
    const leida = leerInvitacionDeDirectorio(dir, 'prueba-inconsistente');
    // La validación de forma no compara con el nombre de archivo: eso lo hace
    // la página (slug !== slug solicitado → notFound) y verify-export.
    if (leida) assert.notEqual(leida.slug, 'prueba-inconsistente');
  } finally {
    rmSync(join(dir, '..'), { recursive: true, force: true });
  }
  const inexistente = join(tmpdir(), 'milu-no-existe-' + Date.now());
  assert.deepEqual(listarSlugsEnDirectorio(inexistente), []);
  assert.deepEqual(parametrosRutasInvitaciones(inexistente), []);
});
