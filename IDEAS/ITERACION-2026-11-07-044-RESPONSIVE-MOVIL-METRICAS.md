# Iteración 044 — Port del ajuste responsive móvil (044c) a producción y verificación integral de las métricas de /estudio/

**Fecha:** 2026-11-07 · **Estado:** publicado en producción y verificado en vivo.

## Pedido

Cambiar el foco al repositorio de producción (Miluaistudio / lumengala.site) y llevar ahí:
1. las correcciones móviles de la iteración 044c del repo de prueba (espaciado inferior, botón flotante con safe-area de iOS, bloqueo de scroll horizontal);
2. la verificación de que el endpoint y los scripts del panel de métricas (`/estudio/`) quedan plenamente integrados para registrar visitas reales.

## Diagnóstico previo (medido en producción en vivo, no asumido)

Se abrió lumengala.site con emulación móvil (iPhone 14, 390×844) y escritorio (1280×800) antes de tocar código:

- **Espaciado inferior:** el pie de la portada ya tenía `pb-28` (112 px) en móvil desde iteraciones anteriores y el del catálogo `pb-24` (96 px); con el botón de 56 px a 20 px del borde (franja de 76 px) no había corte ni solapamiento medible (`enlaces_tapados: []`).
- **Scroll horizontal:** ya resuelto con el patrón propio del sitio: `html:has([data-page="storefront"]) { overflow-x: hidden }` + `body { overflow-x: clip }` (portada y catálogo llevan `data-page="storefront"`); medido `scrollWidth == clientWidth` en 390 y 1280.
- **Safe-area de iOS:** el flotante usaba `bottom-5` fijo: en iPhones con barra home quedaba pegado/alras de ella. Este era el delta real de 044c.
- **Consecuencia del fix:** con safe-area la franja del botón en iPhone crece a ≈110 px (20 + inset + 56), así que los pies a 112/96 px quedaban justos o por debajo → se suben a `pb-32` (128 px) solo en la base móvil.

## Cambios

- `src/components/whatsapp-float.tsx`: `bottom-5` → `bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))]` (fallback 1.25rem donde no exista la variable). El componente sirve a portada y catálogo.
- `src/app/page.tsx`: pie de la portada `pb-28` → `pb-32` en base móvil (`sm:pb-10` intacto).
- `src/app/catalogo/page.tsx`: pie del catálogo `pb-24` → `pb-32` en base móvil (`sm:pb-6` intacto).
- Sin cambios de overflow-x: la protección existente equivale a la de 044c y está verificada.

## Verificación de las métricas de /estudio/ (integral, en vivo)

- Tracker montado en el layout raíz (`src/app/layout.tsx` línea 178) y presente en el bundle desplegado (chunk con `registrar_visita`/`lgs_sesion_visita`).
- `ENDPOINT_REGISTRO` apunta al Web App de Apps Script del estudio (el mismo del registro automático).
- Web App activo: GET → `{"ok":true,"message":"RSVP backend activo"}`.
- En navegador real sobre la portada en vivo se observaron los POST del propio tracker completando con 200 en el echo de googleusercontent (visita + latidos).
- POST de prueba controlado desde el contexto de página (clase `latido`, sin página y con sesión marcada `prueba-integracion-044`, que NO infla conteos: el panel solo agrega `clase === 'visita'`) → respuesta `{"success":true,"registrado":true}`: la acción `registrar_visita` existe y graba.
- POST de prueba de la acción de lectura del panel (`metricas_admin`, sin token, solo lectura) → `{"success":false,"error":"Falta la credencial de Google."}`: la acción existe y falla cerrada; NO responde «acción desconocida», o sea el backend desplegado es la versión con métricas completa.
- Conclusión: la cadena completa (tracker cliente → Web App → planilla → agregación del panel) está integrada y operativa; el panel mostrará visitas reales al iniciar sesión Google.

## Pruebas

263/263 tests, lint 0, typecheck 0, build + verify-export + verify-privacy OK. E2E tras el deploy: clase del safe-area y `pb-32` presentes en el HTML/CSS en vivo con cache-buster; sin overflow horizontal; tracker disparando POST en vivo.

## Nota de alcance

La nueva dirección de arte luminosa (portada y landing del repo de prueba `lumengala`, iteraciones 044/044b/044c) sigue siendo una propuesta aislada y NO se volcó a producción en esta iteración; el pedido operativo de esta tarea fueron las correcciones móviles y la verificación de métricas. Portar el rediseño completo a lumengala.site es una decisión aparte que puede tomarse cuando se apruebe la propuesta.
