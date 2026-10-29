# Iteración 023 — Nombres de mujeres en los modelos de muestra de 15 años

**Fecha:** 29-10-2026
**Rama:** `fix/nombres-muestra-mujeres`
**Estado:** completada (pendiente de revisión del propietario en teléfono físico)

## Pedido del propietario

> «a los modelos de muestra que sean para 15 años pon nombres de mujeres no de varones»

Contexto: tras publicar la colección «fondos de autor» (iteraciones 021/022, 19 diseños
nuevos), varios modelos de fiesta (neón, gala, disco) quedaron con maquetas de muestra
masculinas: Thiago, Mateo, Santiago, Emiliano, Benicio, Lorenzo, Facundo e Ignacio.
Como el negocio principal del estudio son las invitaciones de 15 años (quinceañeras),
las muestras deben lucir nombres de mujeres.

## Diagnóstico (hechos comprobados)

- Los únicos nombres de varón de todo el sitio vivían en 8 diseños de
  `src/data/invitation-designs.ts` (`mockupName`) y sus 8 perfiles demo en
  `src/data/demo-config.ts` (`DEMO_PROFILES`).
- Seis de ellos mostraban el tipo «Mis 18» y dos «Gran Cumpleaños» (30/50 con el
  age en el hashtag: #Emiliano30, #Lorenzo50).
- Los 16 modelos «Mis XV años» previos ya usaban nombres femeninos; el problema era
  solo de la colección nueva de fiesta.
- La maqueta (`MiniInvitation`) muestra `tipo` + nombre + fecha en la tarjeta del
  catálogo, la grilla del personalizador (paso 1), la portada de la home y la demo;
  el nombre también aparece en «Ejemplo: {mockupName}» de la página de catálogo.

## Decisiones tomadas

1. **Los 6 modelos de fiesta pasan a ser de 15 años con nombre de mujer** — son el
   producto que se vende a quinceañeras; una maqueta «Mis 18 · Thiago» no mostraba
   el uso real del diseño. Cambios de tipo: «Mis 18» → «Mis XV años».
2. **Los 2 «Gran Cumpleaños» (30/50) conservan su tipo pero pasan a nombre de mujer** —
   siguen mostrando la versatilidad para cumpleaños adultos, pero sin varones en las
   muestras (evita una nueva ronda del mismo reclamo).
3. **Horarios de demo unificados a 21:00** para los de fiesta (los «Mis 18» usaban
   22:00; los XV del catálogo, 21:00).
4. **Categorías sin tocar** — ya existía precedentes de diseños XV con categoría
   «Cumpleaños · Fiestas» (neon-fucsia/Zoe, disco-fucsia/Alma), así que no hace
   falta mover filtros ni etiquetas.
5. **Test de regresión nuevo** que fija la regla como política del catálogo:
   `tests/nombres-muestra.test.ts`.

## Nombres elegidos (todos sin repetir en el catálogo)

| Diseño | Antes | Ahora | Tipo | Hashtag |
|---|---|---|---|---|
| Neón Violeta | Thiago · Mis 18 | **Morena** («More») | Mis XV años | #MorenaXV2027 |
| Neón Azul | Mateo · Mis 18 | **Jazmín** («Jaz») | Mis XV años | #JazminXV2027 |
| Neón Turquesa | Santiago · Mis 18 | **Celeste** («Cele») | Mis XV años | #CelesteXV2027 |
| Neón Dorado | Emiliano · Gran Cumpleaños 30 | **Ariana** («Ari») | Gran Cumpleaños | #Ariana30 |
| Gala Estrellada | Benicio · Mis 18 | **Luna** («Lunita») | Mis XV años | #LunaXV2027 |
| Salón de Gala | Lorenzo · Gran Cumpleaños 50 | **Regina** («Gina») | Gran Cumpleaños | #Regina50 |
| Pista Disco | Facundo · Mis 18 | **Malena** («Male») | Mis XV años | #MalenaXV2027 |
| Bola de Espejos | Ignacio · Mis 18 | **Violeta** («Viole») | Mis XV años | #VioletaXV2028 |

Nombres cortos (≤7 caracteres): la maqueta no activa la escala reducida de nombres
largos, así que las tarjetas no cambian de tipografía.

## Opciones descartadas

- **Solo cambiar el nombre y dejar «Mis 18»**: habría dejado modelos de fiesta que el
  propietario percibe como «de 15» mostrando otro tipo; el pedido apunta a que las
  muestras de fiesta vendan 15 años.
- **Cambiar también las categorías** («Cumpleaños · Fiestas» → «XV · Fiestas»):
  innecesario, hay precedentes de XV con esas categorías y obligaba a revisar filtros.
- **Regla genérica por heurística de género**: un detector automático de género de
  nombres es frágil; se prefirió una lista cerrada de nombres aprobados en el test.

## Test de regresión (tests/nombres-muestra.test.ts)

1. Todo diseño «Mis XV años» usa un nombre de la lista femenina aprobada (22 nombres).
2. No hay `mockupName` repetidos en todo el catálogo.
3. El hashtag de los XV sigue el patrón `#NombreXVAño`.
4. Los perfiles demo de los 6 diseños de fiesta coinciden con la maqueta
   (nombre + tipo).

## Pruebas realizadas

- **Automáticas:** 150/150 tests (4 nuevos), lint 0, typecheck 0, build + prune +
  verify-export §7 (enlaces del editor móvil) + verify-privacy OK.
- **Emulador 390×844:** personalizador con los 8 nombres nuevos visibles y cero
  «Mis 18»; demo `neon-violeta` muestra «Morena · Mis XV años · #MorenaXV2027» y
  apodo «More»; demo `disco-pista` muestra «Malena» y ya no contiene «Facundo».
- **Emulador 1280×800:** grilla del paso 1 sin nombres de varones (búsqueda
  insensible a mayúsculas de los 8 nombres viejos) y secciones neón/gala/papel
  renderizando bien.
- **Pendiente (honestidad):** revisión del propietario en teléfono físico; el
  emulador no reemplaza el gesto real en un celu.

## Próximos pasos

- Revisión visual del propietario (catálogo + 2 o 3 demos).
- Si algún nombre no gusta, es un cambio de una línea por diseño (maqueta + perfil).
- Iteración 020 ya fusionada; seguir con la cola de ideas del README.
