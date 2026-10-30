# Iteración 028 — Isotipo oficial LGS en el encabezado (fuera el corazón)

**Fecha:** 30-10-2026 · **Rama:** `feat/isotipo-lgs-header`

## Pedido

«Corrige el encabezado: (1) eliminar por completo el icono del corazón que está al lado del nombre; (2) reemplazarlo por la imagen del nuevo isotipo oficial (rombo dorado con las letras entrelazadas LGS) justo antes del texto "LUMEN GALA", limpio, alineado verticalmente y con tamaño elegante de miniatura (32-40 px de alto).»

## Decisiones

1. **`public/logo-lgs.png` (nuevo):** recorte cuadrado centrado del `Logo.jpg` oficial a 240×240 PNG — nítido en pantallas retina al mostrarse a 36-40 px. Comparte el diseño del favicon (rombo dorado sobre fondo oscuro).
2. **Los 3 encabezados de la tienda** (portada `store-nav.tsx`, catálogo `catalogo/page.tsx`, personalizador `personalizador-app.tsx`): fuera el `<span>` con el corazón de lucide y su círculo dorado; en su lugar la imagen del isotipo con `rounded-lg`, anillo fino dorado (`ring-[#dfc9a4]`) y sombra suave — mantiene el acento dorado del sitio. Alt vacío (decorativo): el enlace ya lleva el aria-label de la marca.
3. **Tamaños:** portada `h-9 → sm:h-10` (36→40 px), catálogo 40 px, personalizador 36 px — igual que el círculo anterior, sin cambios de layout. `shrink-0` + `object-cover` para alineación vertical estable.
4. **Alcance:** el corazón del label «Mi historia» del personalizador (línea aparte, no es marca) se conserva. El favicon y el ticket de aperturas no cambian.

## Pruebas

- 163/163 tests, lint 0, typecheck 0, build + verify-export OK.
- E2E raíz 390×844 y 1280×800: `/logo-lgs.png` 200 (image/png), logo renderiza 36-40 px, alineado con el texto, sin corazón en ningún header; capturas verificadas visualmente.
