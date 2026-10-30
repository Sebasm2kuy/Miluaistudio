# Iteración 030 — Héroe de portada: modelos de impacto, sin precios ni Mercado Libre

**Fecha:** 30-10-2026 · **Rama:** `feat/heroe-impacto-sin-ml`

## Pedido

«En esta parte donde se ve una imagen estática usa un modelo más llamativo de más impacto; también quita los precios y la opción de comprar por Mercado Libre.» (captura de la portada, sección héroe).

## Decisiones

1. **Modelos del héroe:** el collage mostraba `INVITATION_DESIGNS[0]` (Rosa Romántica, rosa pastel) y `[1]` (Noche Dorada). Ahora muestra los dos de mayor impacto de la colección, elegidos por id con fallback: **Gala Estrellada** (`gala-estrellas` — terciopelo negro, haz de luz dorado y alfombra de estrellas: negro + oro puro Lumen Gala) como principal y **Pista Disco** (`disco-pista` — bola de espejo, violeta/azul eléctrico) como contraste vibrante en el collage de escritorio. El mockup móvil pasa a Gala Estrellada.
2. **Sin precios en la portada:** fuera la línea «$1.200 UYU · Pago único · Personalización a medida» del héroe.
3. **Sin Mercado Libre en la portada (4 puntos):** botón «Comprar por Mercado Libre» del héroe (desktop), enlace «Compralo en Mercado Libre» (móvil), botón «Ver publicación» de la sección CTA y enlace «Comprar» del pie. La FAQ «¿Cuánto cuesta?» pasa a responder sin cifras y deriva a WhatsApp: «Depende del diseño y de las funciones… te pasamos el presupuesto en el día, sin compromiso».
4. **Limpieza:** imports sin uso eliminados (`ExternalLink`, `MERCADO_LIBRE_URL`, `PRECIO` en `page.tsx`). El catálogo (`/catalogo/`) sigue mostrando precio/ML: no se pidió tocarlo — decidir en próxima iteración si se alinea.

## Pruebas

- 163/163 tests, lint 0, typecheck 0, build + verify-export + verify-privacy OK.
- E2E local 1280×800 y 390×844: héroe con Gala Estrellada + Pista Disco, sin botón de Mercado Libre ni línea de precio, sin errores de consola.
- `out/index.html` sin «Mercado Libre», sin «$1.200», con el fondo `gala-estrellas` en el héroe.
