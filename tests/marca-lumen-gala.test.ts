/**
 * Pruebas de la transición de marca a Lumen Gala (iteración 027).
 *
 * Qué garantiza:
 *  - El pedido por WhatsApp que genera el personalizador se firma
 *    «web de Lumen Gala» y no vuelve a mencionar la marca vieja.
 *  - Los mensajes de consulta (general y servicios extra) usan la
 *    marca nueva en todo el sitio.
 *  - El importador de WhatsApp sigue aceptando el formato NUEVO
 *    (Lumen Gala) y el HISTÓRICO (mensajes ya enviados por clientes
 *    con la marca anterior): la marca no es parte del formato de datos,
 *    así que los pedidos viejos se siguen importando sin avisos.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INVITATION_DESIGNS } from '../src/data/invitation-designs.js';
import {
  mensajeWhatsAppPersonal,
  type DatosPersonales,
} from '../src/lib/personalizador.js';
import { mensajeAConfigPersonal } from '../src/lib/importar-whatsapp.js';
import { WHATSAPP_MENSAJE_GENERAL } from '../src/data/contacto.js';
import { MENSAJE_SERVICIOS_EXTRA } from '../src/data/servicios.js';

const DESIGN = INVITATION_DESIGNS[0];

const DATOS: DatosPersonales = {
  tipo: 'Mis XV años',
  nombre: 'Martina',
  fecha: '2027-05-15',
  hora: '21:30',
  lugar: 'Salón Imperial',
  direccion: '',
  dressCode: '',
  instagram: '',
  historia: '',
  frase: '',
  musica: '',
  apertura: 'sobre',
  portada: '',
  tipografia: '',
  acento: '',
  cronograma: [],
};

test('el pedido por WhatsApp se firma con la marca nueva', () => {
  const mensaje = mensajeWhatsAppPersonal(DESIGN, DATOS);
  assert.match(mensaje, /web de Lumen Gala:/, 'la primera línea debe firmar Lumen Gala');
  assert.doesNotMatch(mensaje, /miluaistudio/i, 'sin rastros de la marca vieja en el pedido');
});

test('los mensajes de consulta generales y de servicios usan la marca nueva', () => {
  assert.match(WHATSAPP_MENSAJE_GENERAL, /Lumen Gala/);
  assert.doesNotMatch(WHATSAPP_MENSAJE_GENERAL, /miluaistudio/i);
  assert.match(MENSAJE_SERVICIOS_EXTRA, /Lumen Gala/);
  assert.doesNotMatch(MENSAJE_SERVICIOS_EXTRA, /miluaistudio/i);
});

test('el importador acepta el pedido nuevo y el histórico con la marca vieja', () => {
  const pedido = (marca: string) =>
    [
      'Hola! Personalicé mi invitación en la web de ' + marca + ':',
      '',
      '• Diseño: ' + DESIGN.name,
      '• Nombre: Martina',
    ].join('\n');

  const nuevo = mensajeAConfigPersonal(pedido('Lumen Gala'));
  assert.equal(nuevo.ok, true, 'formato nuevo debe importar: ' + (nuevo.error ?? ''));
  assert.equal(nuevo.designId, DESIGN.id);

  const historico = mensajeAConfigPersonal(pedido('Miluaistudio'));
  assert.equal(historico.ok, true, 'mensaje histórico debe seguir importando: ' + (historico.error ?? ''));
  assert.equal(historico.designId, DESIGN.id);
  // La marca vieja en el saludo no genera ningún aviso (los avisos que
  // puedan existir son de datos, p. ej. fecha ausente, no de la marca).
  assert.equal(
    historico.avisos.some((a) => /marca|milua|lumen/i.test(a)),
    false,
    'ningún aviso debe hablar de la marca: ' + historico.avisos.join(' | '),
  );
});
