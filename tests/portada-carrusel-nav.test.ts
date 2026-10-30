/**
 * Iteración 025 — Portada nueva: menús «próximamente» arriba, carrusel de
 * diseños «como se ve desde un celular» y tarjetas de servicio desplegables.
 *
 *  1. ITEMS_NAV: hay un ítem de menú por CADA servicio «próximamente» y
 *     cada ancla #servicio-<id> corresponde a un servicio real; los ítems
 *     que no son de servicio apuntan a secciones que existen en la portada.
 *  2. Carrusel (src/lib/carrusel.ts): es circular —del último diseño pasa
 *     al primero y viceversa— y cada slide tiene posición bien definida
 *     (actual / izquierda / derecha / oculta).
 *  3. La colección que alimenta el carrusel tiene suficientes diseños, con
 *     ids únicos (los puntos del carrusel y las anclas dependen de eso).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS_NAV, PREFIJO_ANCLA_SERVICIO, SECCIONES_PORTADA } from '../src/data/navegacion.js';
import { SERVICIOS_EXTRA } from '../src/data/servicios.js';
import { INVITATION_DESIGNS } from '../src/data/invitation-designs.js';
import { INDICE_INICIAL, indiceVecino, posicionSlide } from '../src/lib/carrusel.js';

test('nav: cada servicio «próximamente» tiene su menú con ancla válida', () => {
  const ids = SERVICIOS_EXTRA.map((s) => s.id);
  assert.ok(ids.length >= 4, 'deben existir los 4 servicios anunciados');

  // 1) Todo ítem de servicio del menú apunta a un servicio que existe
  for (const item of ITEMS_NAV.filter((i) => i.servicio)) {
    assert.ok(item.href.startsWith(PREFIJO_ANCLA_SERVICIO), 'ancla de servicio: ' + item.href);
    const id = item.href.slice(PREFIJO_ANCLA_SERVICIO.length);
    assert.ok(ids.includes(id), 'el menú «' + item.label + '» apunta a un servicio inexistente: ' + id);
  }

  // 2) Todo servicio tiene un ítem de menú (visibles arriba como pidió el cliente)
  const hrefsServicio = ITEMS_NAV.filter((i) => i.servicio).map((i) => i.href.slice(PREFIJO_ANCLA_SERVICIO.length));
  for (const id of ids) {
    assert.ok(hrefsServicio.includes(id), 'el servicio «' + id + '» no tiene menú');
  }

  // 3) Etiquetas legibles y únicas
  const labels = ITEMS_NAV.map((i) => i.label);
  assert.equal(new Set(labels).size, labels.length, 'etiquetas de menú duplicadas');
  for (const l of labels) assert.ok(l.length >= 4 && l.length <= 22, 'etiqueta fuera de rango: ' + l);
});

test('nav: las anclas de sección existen en la portada', () => {
  for (const item of ITEMS_NAV.filter((i) => !i.servicio)) {
    const id = item.href.slice(1);
    assert.ok(
      (SECCIONES_PORTADA as readonly string[]).includes(id),
      'el menú «' + item.label + '» apunta a una sección que no existe: #' + id,
    );
  }
  // La sección de servicios contenedora también sigue existiendo (pie, FAQ)
  assert.ok((SECCIONES_PORTADA as readonly string[]).includes('servicios'));
});

test('carrusel: es circular y las posiciones de los slides son correctas', () => {
  const total = 10;

  // Avanzar desde el último vuelve al primero; retroceder desde el primero al último
  assert.equal(indiceVecino(total - 1, 1, total), 0);
  assert.equal(indiceVecino(0, -1, total), total - 1);
  // Delta grande se normaliza
  assert.equal(indiceVecino(3, 25, total), 8);
  assert.equal(indiceVecino(3, -25, total), 8);

  // Posiciones: actual centrado, vecinos a los costados, resto oculto
  assert.equal(posicionSlide(4, 4, total), 'actual');
  assert.equal(posicionSlide(3, 4, total), 'izquierda');
  assert.equal(posicionSlide(5, 4, total), 'derecha');
  assert.equal(posicionSlide(0, 4, total), 'oculta');

  // En los bordes: con actual=0, el vecino izquierdo es el último
  assert.equal(posicionSlide(total - 1, 0, total), 'izquierda');
  assert.equal(posicionSlide(1, 0, total), 'derecha');

  // Casos límite
  assert.equal(posicionSlide(0, 0, 1), 'actual');
  assert.equal(indiceVecino(0, 5, 1), 0);
  assert.equal(indiceVecino(0, 1, 0), 0); // sin diseños, no explota
  assert.equal(INDICE_INICIAL, 0);
});

test('carrusel: la colección alimenta el carrusel con diseños únicos', () => {
  assert.ok(INVITATION_DESIGNS.length >= 8, 'el carrusel necesita una colección grande, hay ' + INVITATION_DESIGNS.length);
  const ids = INVITATION_DESIGNS.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, 'ids de diseño duplicados');
  const nombres = INVITATION_DESIGNS.map((d) => d.name);
  assert.equal(new Set(nombres).size, nombres.length, 'nombres de diseño duplicados (puntos del carrusel ambiguos)');
  for (const d of INVITATION_DESIGNS) {
    assert.ok(d.name.length > 0 && d.category.length > 0, 'diseño sin nombre o categoría: ' + d.id);
    assert.ok(d.mockupName && d.mockupDate, 'maqueta incompleta: ' + d.id);
  }
});
