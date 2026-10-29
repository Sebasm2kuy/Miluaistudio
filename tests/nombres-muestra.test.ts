/**
 * Iteración 023 — Nombres de muestra de mujeres en los modelos de XV.
 *
 * Pedido del propietario: «a los modelos de muestra que sean para 15 años
 * pon nombres de mujeres no de varones». Los modelos de fiesta (neón, gala,
 * disco) muestran maquetas de 15 años con nombres femeninos.
 *
 * Reglas que fija este test:
 *  1. Los diseños «Mis XV años» usan nombres de una lista femenina conocida.
 *  2. No hay nombres de muestra repetidos en todo el catálogo.
 *  3. El hashtag de los diseños XV anuncia «XV» + año (#NombreXV2027).
 *  4. El perfil demo de los diseños de fiesta coincide con la maqueta.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INVITATION_DESIGNS } from '../src/data/invitation-designs.js';
import { createDemoConfig } from '../src/data/demo-config.js';

/** Nombres femeninos aprobados para maquetas de 15 años (listado cerrado:
 *  agregar uno nuevo requiere sumarlo acá a propósito). */
const NOMBRES_FEMENINOS_XV = new Set([
  'Valentina', 'Camila', 'Renata', 'Lucía', 'Isabella', 'Martina',
  'Julieta', 'Sofía', 'Emilia', 'Micaela', 'Abril', 'Zoe',
  'Florencia', 'Guadalupe', 'Delfina', 'Alma',
  // Colección «fondos de autor» convertida a XV (023):
  'Morena', 'Jazmín', 'Celeste', 'Luna', 'Malena', 'Violeta',
]);

const XV = INVITATION_DESIGNS.filter((d) => d.mockupTipo === 'Mis XV años');

test('muestra: todo diseño de XV usa un nombre de mujer de la lista aprobada', () => {
  assert.ok(XV.length >= 20, 'el catálogo debe mantener su oferta de diseños XV');
  for (const d of XV) {
    assert.ok(
      NOMBRES_FEMENINOS_XV.has(d.mockupName),
      `${d.id}: la maqueta de XV usa «${d.mockupName}»; debe ser un nombre de mujer de la lista aprobada`,
    );
  }
});

test('muestra: no hay nombres de maqueta repetidos en el catálogo', () => {
  const nombres = INVITATION_DESIGNS.map((d) => d.mockupName);
  assert.equal(new Set(nombres).size, nombres.length, 'nombres de muestra duplicados');
});

test('muestra: el hashtag de los diseños XV anuncia XV + año', () => {
  for (const d of XV) {
    const cfg = createDemoConfig(d);
    assert.match(
      cfg.evento.hashtag,
      /^#[A-Za-zÁÉÍÓÚÑáéíóúñ]+XV\d{4}$/,
      `${d.id}: hashtag «${cfg.evento.hashtag}» no sigue el patrón #NombreXVAño`,
    );
  }
});

test('muestra: los perfiles de fiesta (neón/gala/disco) reflejan la maqueta femenina', () => {
  const fiesta = ['neon-violeta', 'neon-azul', 'neon-turquesa', 'gala-estrellas', 'disco-pista', 'disco-espejos'];
  for (const id of fiesta) {
    const d = INVITATION_DESIGNS.find((item) => item.id === id);
    assert.ok(d, `falta el diseño ${id}`);
    assert.equal(d.mockupTipo, 'Mis XV años', `${id} debe seguir mostrando XV`);
    const cfg = createDemoConfig(d);
    assert.equal(cfg.evento.nombre, d.mockupName, `${id}: perfil demo desalineado con la maqueta`);
    assert.equal(cfg.evento.tipo, 'Mis XV años', `${id}: tipo demo desalineado`);
  }
});
