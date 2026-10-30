# Iteración 025 — Portada nueva: menús «próximamente» arriba, carrusel de diseños en celular y servicios desplegables

**Fecha:** 30-10-2026 · **Rama:** `feat/home-carrusel-menus` · **Base:** origin/main tras fusionar PR #25 (iteración 024)

## Pedido

1. «las secciones proximamente tienen que estar visibles arriba como menus y al abrir despliegue el proximamente».
2. Capturas de invitio.events como referencia visual («como quiero que tambien se vea mi web»), sin copiar textos.
3. «sobre todo el carrusel de pasando los modelos de invitacion como vista desde un movil».

Contexto: la iteración 024 ya había quitado los tonos de música (Spotify directo) y creado la sección de servicios extra con badge «Próximamente» (tarjetas 2×2 fijas). Lo que faltaba era la exposición de esas secciones como menús de navegación y el carrusel central.

## Diagnóstico previo

- La nav de escritorio solo tenía 4 anclas internas (Qué incluyen / Diseños / Cómo funciona / Reseñas) y en móvil **no había navegación** (la nav estaba `hidden md:flex`, sin menú hamburguesa).
- Los servicios «próximamente» vivían solo como tarjetas completas en `#servicios`, sin ítem de menú propio.
- La franja de la colección era una tira horizontal de 10 miniaturas estáticas: no se «pasaba» nada, y ni siquiera incluía los 29 diseños del catálogo.
- `page.tsx` es server component: la interactividad nueva (menú móvil, carrusel táctil, acordeón) exigía componentes cliente aislados con datos testeables.

## Decisiones

1. **Menús arriba (escritorio + móvil):** `ITEMS_NAV` (nuevo `src/data/navegacion.ts`) como fuente única: Invitaciones, Álbum digital, Videos, Historia de vida, Tráiler, Preguntas. Los 4 servicios llevan chip «pronto» y ancla `#servicio-<id>`.
2. **Despliegue del «próximamente»:** las tarjetas de servicios pasan de grid fijo a **acordeón** (`servicios-extras.tsx`, cliente): fila con icono + nombre + tagline + badge «Próximamente»; al abrirla (toque directo o menú vía hash) despliega descripción, qué incluirá y CTA «Avisame cuando esté listo». El listener de hash (`hashchange` + carga inicial) expande, resalta con pulso dorado (`.pulso-dorado`, 2.8 s) y re-encuadra con `scrollIntoView`. Estado inicial cerrado: el menú es quien despliega.
3. **Menú móvil:** hamburger en `store-nav.tsx` (cliente) con los mismos ítems + CTAs; cierra al navegar, con Escape, y los servicios muestran su chip «pronto» también ahí.
4. **Carrusel «como se ve desde un celular»** (`carrusel-modelos.tsx` + lógica pura `src/lib/carrusel.ts`): reemplaza la tira de miniaturas por un **mazo de 29 teléfonos**: el diseño actual centrado en una maqueta de celular (notch + reflejo), vecinos izquierdo/derecho asomando rotados y atenuados, resto oculto. Interacción: swipe táctil (umbral 36 px, horizontal), toque en un vecino para traerlo al frente, flechas en tablet/escritorio, puntos por diseño solo en pantallas anchas (29 puntos saturarían el móvil → ahí hay contador «N / 29»), teclado ←/→, autoplay cada 5 s que se pausa tras interacción (6.5 s), con pestaña oculta y con `prefers-reduced-motion`. Bajo el mazo: categoría + nombre + «Ver demostración» (demo del diseño actual) + «Personalizar el mío».
5. **Héroe al estilo de la referencia, con textos propios:** badge verde «Se comparte por WhatsApp, sin instalar nada» (reemplaza el píldora genérica) + **píldoras de servicios** bajo el héroe (Álbum digital, Videos, Historia de vida, Tráiler con «pronto» + Música de Spotify) que apuntan a sus anclas.
6. **Ancla nueva en FAQ** (`#faq`) para el ítem «Preguntas» del menú.

## Opciones descartadas

- **Modal por servicio desde el menú:** aislaba el contenido del resto de la página y duplicaba estados; el acordeón con anclas es más simple, enlazable y mobile-first.
- **Un solo teléfono con transición de pantalla completa:** perdía la sensación de «mazo de diseños pasando» que pidió el cliente; el deck con vecinos asomando comunica que hay más.
- **Scroll-snap nativo con slides al 100 %:** complicaba los bordes tocables y los vecinos asomados; el control por transform/opacity da la transición exacta deseada.
- **Dots visibles en móvil:** con 29 diseños rompían la fila; contador «N / 29» + swipe + bordes tocables cubren el caso.

## Test de regresión

`tests/portada-carrusel-nav.test.ts` (4 tests nuevos, batería 160/160):

1. **Nav↔servicios:** cada ítem de servicio del menú apunta a un servicio real y **cada servicio tiene su menú** (lo que pidió el cliente queda trabado en test); etiquetas únicas y de largo razonable.
2. **Anclas de sección:** los ítems que no son servicios apuntan a secciones existentes de la portada (`SECCIONES_PORTADA` incluye #disenos, #faq, #servicios…).
3. **Carrusel circular:** `indiceVecino` envuelve en ambos bordes y normaliza deltas grandes; `posicionSlide` clasifica actual/izquierda/derecha/oculta, incluye el caso borde (actual=0 → izquierda=último) y totales 0/1 sin explotar.
4. **Colección:** ≥8 diseños con ids y nombres únicos (los puntos y anclas dependen de eso) y maquetas completas.

## Pruebas

- `npm test` 160/160 · lint 0 · typecheck 0 · build + prune + verify-export §7 + verify-privacy OK.
- Emulador 390×844: hero con badge WhatsApp; menú hamburguesa con los 4 servicios «pronto»; tap en «Álbum digital» despliega su tarjeta; hash `#servicio-trailer-evento` despliega + pulso dorado + panel con CTA; swipe simulado (TouchEvent) avanza 18→19; contador «N / 29».
- Emulador 1280×800: nav con chips «pronto»; clic en «Historia de vida» (nav) despliega con hash y pulso; carrusel con flechas y 29 puntos en una fila; flecha siguiente 9→10; sección servicios con acordeón elegante.
- Corrección durante el E2E: la maqueta del carrusel colapsaba a 0 px dentro del slide flex (aspect-ratio sin ancho) → ancho explícito `w-[236px] sm:w-[272px]`.
- **Pendiente (honestidad):** revisión del propietario en un teléfono físico; el swipe real con el dedo y el autoplay solo se confirman ahí.

## Próximos pasos

- Cuando un servicio esté listo: quitar badge, conectar su página propia y actualizar `ITEMS_NAV` + `MENSAJE_SERVICIOS_EXTRA`.
- Si la colección sigue creciendo, evaluar ventana deslizante de puntos o paginación en el carrusel.
- Medir en producción si los visitantes usan «Ver demostración» desde el carrusel (ya es un CTA medible por evento).
