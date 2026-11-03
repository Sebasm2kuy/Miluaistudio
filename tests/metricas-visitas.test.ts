/**
 * Pruebas del registro de visitas en el cliente (src/lib/metricas-visitas.ts)
 * y del cliente del backend de métricas (src/lib/admin-backend.ts):
 * rutas medibles, id de sesión, marcas locales, payload, envío con fetch
 * falso (guardado / backend viejo / red caída) y consulta metricas_admin
 * con sus motivos tipados. Nada toca la red ni el sessionStorage real.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLAVE_DIA_VISITA,
  CLAVE_NUEVO_VISITANTE,
  CLAVE_SESION_VISITA,
  construirPayload,
  decidirMarcas,
  enviarRegistroMetrica,
  esRutaMedible,
  obtenerIdSesion,
} from '../src/lib/metricas-visitas.js';
import { consultarMetricasAdmin, MENSAJES_METRICAS } from '../src/lib/admin-backend.js';
import { diaMontevideo } from '../src/data/metricas-esquema.js';

interface MapaKv {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

function kvMemoria(): MapaKv {
  const mapa = new Map<string, string>();
  return {
    getItem: (k) => (mapa.has(k) ? (mapa.get(k) as string) : null),
    setItem: (k, v) => void mapa.set(k, v),
  };
}

/** Response falsa con cuerpo JSON (o HTML envolvente como Apps Script). */
function respuesta(cuerpo: unknown): Response {
  return new Response(typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo), { status: 200 });
}

test('esRutaMedible: públicas sí, rutas operativas no', () => {
  assert.equal(esRutaMedible('/'), true);
  assert.equal(esRutaMedible('/catalogo/'), true);
  assert.equal(esRutaMedible('/catalogo/rosa-romantica/'), true);
  assert.equal(esRutaMedible('/personalizar/'), true);
  assert.equal(esRutaMedible('/i/ejemplo-quince/'), true);
  assert.equal(esRutaMedible('/dashboard/'), false);
  assert.equal(esRutaMedible('/dashboard/confirmaciones/'), false);
  assert.equal(esRutaMedible('/editar/'), false);
  assert.equal(esRutaMedible('/estudio/'), false);
  assert.equal(esRutaMedible('/previsualizar/'), false);
  assert.equal(esRutaMedible('/acceso/'), false);
});

test('obtenerIdSesion: crea uno nuevo con la forma esperada y reutiliza el existente', () => {
  const kv = kvMemoria();
  let llamadas = 0;
  const generador = () => {
    llamadas++;
    return 'idgenerado0000000000000000000a';
  };
  const primero = obtenerIdSesion(kv, generador);
  assert.equal(primero, 'idgenerado0000000000000000000a');
  assert.equal(llamadas, 1);
  assert.equal(obtenerIdSesion(kv, generador), primero); // reutilizado
  assert.equal(llamadas, 1);

  // Un id inválido almacenado se reemplaza.
  kv.setItem(CLAVE_SESION_VISITA, 'corto');
  const regenerado = obtenerIdSesion(kv, generador);
  assert.notEqual(regenerado, 'corto');
});

test('decidirMarcas: primera vez → nueva y nuevo; mismo día → nada; otro día → única del día', () => {
  const kv = kvMemoria();
  const primera = decidirMarcas(kv, '2026-11-03');
  assert.deepEqual(primera, { nuevaSesionDia: true, nuevoVisitante: true });
  const segunda = decidirMarcas(kv, '2026-11-03');
  assert.deepEqual(segunda, { nuevaSesionDia: false, nuevoVisitante: false });
  const otroDia = decidirMarcas(kv, '2026-11-04');
  assert.deepEqual(otroDia, { nuevaSesionDia: true, nuevoVisitante: false });
  assert.equal(kv.getItem(CLAVE_DIA_VISITA), '2026-11-04');
  assert.equal(kv.getItem(CLAVE_NUEVO_VISITANTE), '1');
});

test('construirPayload: visita completa y latido sin página ni marcas', () => {
  const ahora = new Date('2026-11-03T15:00:00Z');
  const visita = construirPayload('visita', {
    pagina: '/i/ejemplo-quince/',
    sesion: 'a1b2c3d4e5f6a7b8',
    nuevaSesionDia: true,
    nuevoVisitante: false,
    ahora,
  });
  assert.equal(visita.tipo, 'registrar_visita');
  assert.equal(visita.clase, 'visita');
  assert.equal(visita.dia, diaMontevideo(ahora));
  assert.equal(visita.pagina, '/i/ejemplo-quince/');
  assert.equal(visita.nuevaSesionDia, true);

  const latido = construirPayload('latido', {
    pagina: '/i/ejemplo-quince/',
    sesion: 'a1b2c3d4e5f6a7b8',
    nuevaSesionDia: true,
    nuevoVisitante: true,
    ahora,
  });
  assert.equal(latido.clase, 'latido');
  assert.equal(latido.pagina, '');
  assert.equal(latido.nuevaSesionDia, false);
  assert.equal(latido.nuevoVisitante, false);
});

test('enviarRegistroMetrica: guardado, backend viejo (sin success) y error de red', async () => {
  const cuerpo = { pagina: '/', sesion: 'a1b2c3d4e5f6a7b8', nuevaSesionDia: true, nuevoVisitante: false };

  const guardado = await enviarRegistroMetrica('https://gas.example/exec', cuerpo, {
    fetchImpl: async () => respuesta({ success: true, registrado: true }),
  });
  assert.equal(guardado, 'guardado');

  // Web App viejo: responde doGet {ok:true,message:...} sin `success`.
  const viejo = await enviarRegistroMetrica('https://gas.example/exec', cuerpo, {
    fetchImpl: async () => respuesta({ ok: true, message: 'RSVP backend activo' }),
  });
  assert.equal(viejo, 'sin-backend');

  const red = await enviarRegistroMetrica('https://gas.example/exec', cuerpo, {
    fetchImpl: async () => {
      throw new Error('offline');
    },
  });
  assert.equal(red, 'error');

  // Sin endpoint configurado: 'sin-backend' sin llamar a la red.
  const sinEndpoint = await enviarRegistroMetrica('', cuerpo, {
    fetchImpl: async () => {
      throw new Error('no debería llamarse');
    },
  });
  assert.equal(sinEndpoint, 'sin-backend');
});

test('consultarMetricasAdmin: ok valida filas; sin-actualizar, credencial, no-autorizado y red, tipados', async () => {
  const filas = [
    {
      clase: 'visita',
      fecha: '2026-11-03T14:00:00.000Z',
      dia: '2026-11-03',
      pagina: '/',
      sesion: 'a1b2c3d4e5f6a7b8',
      nuevaSesionDia: true,
      nuevoVisitante: true,
    },
  ];

  const ok = await consultarMetricasAdmin('credencial', {
    endpoint: 'https://gas.example/exec',
    fetchImpl: async () => respuesta({ success: true, filas }),
  });
  assert.ok(ok.ok);
  assert.equal(ok.filas.length, 1);
  assert.equal(ok.filas[0].sesion, 'a1b2c3d4e5f6a7b8');

  const viejo = await consultarMetricasAdmin('credencial', {
    endpoint: 'https://gas.example/exec',
    fetchImpl: async () => respuesta({ ok: true, message: 'RSVP backend activo' }),
  });
  assert.ok(!viejo.ok);
  assert.equal(viejo.motivo, 'sin-actualizar');

  const credencial = await consultarMetricasAdmin('credencial', {
    endpoint: 'https://gas.example/exec',
    fetchImpl: async () => respuesta({ success: false, error: 'Credencial de Google inválida o vencida.' }),
  });
  assert.ok(!credencial.ok);
  assert.equal(credencial.motivo, 'credencial');

  const ajeno = await consultarMetricasAdmin('credencial', {
    endpoint: 'https://gas.example/exec',
    fetchImpl: async () => respuesta({ success: false, error: 'Esta cuenta no está autorizada para las métricas del estudio.' }),
  });
  assert.ok(!ajeno.ok);
  assert.equal(ajeno.motivo, 'no-autorizado');

  const red = await consultarMetricasAdmin('credencial', {
    endpoint: 'https://gas.example/exec',
    fetchImpl: async () => {
      throw new Error('offline');
    },
  });
  assert.ok(!red.ok);
  assert.equal(red.motivo, 'red');

  // Sin endpoint → sin-endpoint, sin llamar a la red.
  const sinEndpoint = await consultarMetricasAdmin('credencial', {
    endpoint: '',
    fetchImpl: async () => {
      throw new Error('no debería llamarse');
    },
  });
  assert.ok(!sinEndpoint.ok);
  assert.equal(sinEndpoint.motivo, 'sin-endpoint');
  assert.equal(sinEndpoint.mensaje, MENSAJES_METRICAS['sin-endpoint']);

  // Filas inválidas se filtran silenciosamente.
  const conBasura = await consultarMetricasAdmin('credencial', {
    endpoint: 'https://gas.example/exec',
    fetchImpl: async () =>
      respuesta({ success: true, filas: [...filas, { clase: 'no-valida' }, null, filas[0]] }),
  });
  assert.ok(conBasura.ok);
  assert.equal(conBasura.filas.length, 2);
});
