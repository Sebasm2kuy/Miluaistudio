# Iteración 027 — Transición definitiva de marca: Lumen Gala (LGS)

**Fecha:** 30-10-2026 · **Rama:** `feat/lumen-gala-marca`

## Pedido

«Actualiza la identidad de la marca en el código fuente de la web para hacer la transición definitiva a Lumen Gala Studio (LGS): (1) texto del logotipo del header — donde dice "MILUAISTUDIO" y el subtítulo — por el nuevo nombre comercial LUMEN GALA manteniendo la tipografía elegante y minimalista; (2) favicon apuntando correctamente al archivo del icono en la raíz (favicon.ico); (3) títulos y meta tags reflejando Lumen Gala; (4) verificar que los enlaces del menú superior y los botones principales funcionen sin errores de ruta en el dominio raíz lumengala.site.»

Se adjuntaron `favicon.ico` (monograma dorado LGS en rombo, 16/32/48 px) y `Logo.jpg` (logo LGS dorado sobre fondo oscuro, referencia de identidad).

## Diagnóstico

Auditoría con `rg "(?i)milua"` sobre `src/`, `public/`, `content/`, `tests/` y docs:

- **Marca visible (12 ubicaciones):** header de la portada (`store-nav.tsx`), headers y pies de catálogo y personalizador (`catalogo/page.tsx`, `personalizador-app.tsx`), pie de portada (`page.tsx`) y el texto vertical del ticket «ADMITE UNO» de las aperturas de demostración (`aperturas.tsx`).
- **Metadatos (5 archivos):** `layout.tsx` (title default/template, keywords, OG, Twitter), `personalizar/page.tsx`, `catalogo/layout.tsx`, `catalogo/[designId]/page.tsx`, `i/[slug]/page.tsx` (siteName, títulos, alts).
- **Textos de WhatsApp (5):** mensaje general (`contacto.ts`), mensaje del pedido personalizado (`personalizador.ts`), placeholder del importador (`PanelImportarWhatsApp.tsx`), CTA de servicios (`servicios.ts`, `servicios-extras.tsx`).
- **Favicon anterior:** `icons` en `layout.tsx` apuntaba a `/logo.svg` — un logo genérico «Z» de plantilla, ajeno a la marca — y a `/sello-sm.png` (sello de lacre «Millagros», arte de demo). **No existía favicon.ico** en `public/`; los navegadores pedían `/favicon.ico` y recibían 404.
- **og-image.jpg:** muestra la demo «Milagros XV» (nombre de perfil de muestra, no de marca) → se conserva.
- **Referencias legítimas que se CONSERVAN con el nombre del repo:** `GITHUB_REPO` (`github-deploy.ts`), las URLs de la API (`api.github.com/repos/Sebasm2kuy/Miluaistudio/…` en `PanelAjustes.tsx` y `admin/page.tsx`) y la ayuda de tokens del panel — el repositorio sigue llamándose `Miluaistudio`; son rutas de API, no de web. Identificadores internos de código (`milua:abrir`, `.milua-neo` en comentario) quedan: no son visibles y cambiarlos solo agrega riesgo.
- El dominio raíz ya operaba desde la iteración 026 (sin `basePath`, canonicals a lumengala.site), así que el punto 4 del pedido era verificación, no cambios.

## Decisiones

1. **Marca de texto, no de imagen, en headers:** «LUMEN GALA» con la misma tipografía serif (`font-serif` / Playfair Display) y `tracking` que tenía «MILUAISTUDIO» — 10 caracteres en lugar de 12, sin ajustes de layout. El subtítulo «Invitaciones digitales» se conserva como descriptor.
2. **Favicon LGS oficial:** `favicon.ico` (16/32/48) a `public/favicon.ico` como icono primario y `shortcut`; `apple-touch-icon.png` (180×180) generado por recorte cuadrado centrado del `Logo.jpg` oficial para iOS. Fuera del `icons` el `logo.svg` de plantilla (archivo eliminado de `public/`) y el sello de lacre.
3. **Guarda de marca en el build (verify-export §8, nueva):** el build FALLA si el `<title>` de la portada vuelve a decir «Miluaistudio», si no menciona «Lumen Gala», o si la portada deja de declarar `<link rel="icon" href="/favicon.ico">`. §2 ahora exige `favicon.ico` y `apple-touch-icon.png` en el artefacto (ya no `logo.svg`).
4. **Compatibilidad hacia atrás del importador:** la marca NO es parte del formato de datos del pedido por WhatsApp — el importador sigue leyendo mensajes históricos firmados «web de Miluaistudio» (los fixtures de `importar-whatsapp.test.ts` se conservan a propósito) y acepta los nuevos «web de Lumen Gala».
5. **Documentación histórica intacta:** los docs de iteraciones anteriores y guías internas mencionan la marca vieja como registro histórico; no se reescriben.

## Cambios

- `public/favicon.ico` (nuevo, subido por el propietario) y `public/apple-touch-icon.png` (nuevo, generado del Logo.jpg). `public/logo.svg` eliminado (logo «Z» de plantilla).
- `src/app/layout.tsx`: title default/template → «Lumen Gala | …» / «%s | Lumen Gala»; keywords + «Lumen Gala», «Lumen Gala Studio», «LGS»; `icons` → favicon.ico + apple-touch-icon.png; OG/Twitter title, siteName y alt con la marca nueva.
- Headers/pies con «LUMEN GALA» y «© Lumen Gala»: `store-nav.tsx`, `page.tsx`, `catalogo/page.tsx`, `personalizador-app.tsx` (+ `aria-label` de los logos de inicio) y `aperturas.tsx` (ticket vertical).
- Metadatos de páginas: `personalizar/page.tsx` (OG title, keywords, siteName), `catalogo/layout.tsx` (OG/Twitter title, siteName, alt), `catalogo/[designId]/page.tsx` (títulos, keywords, siteName, alt), `i/[slug]/page.tsx` (siteName).
- Textos de WhatsApp: `contacto.ts`, `servicios.ts` (mensaje + comentario), `servicios-extras.tsx`, `personalizador.ts` (firma del pedido), `PanelImportarWhatsApp.tsx` (placeholder).
- `scripts/verify-export.mjs`: §2 exige favicon.ico + apple-touch-icon.png; §8 nueva guarda de marca (título + favicon en la portada).
- `tests/marca-lumen-gala.test.ts` (nuevo, 3 tests): el pedido se firma «web de Lumen Gala» sin rastros de la marca vieja; mensajes de consulta con la marca nueva; el importador acepta formato nuevo E histórico.

## Pruebas

- **163/163 tests** (160 + 3 nuevos), lint 0, typecheck 0, `build` + prune + verify-export (§2 con favicon, §8 marca nueva) + verify-privacy OK.
- **Head de la portada servida en raíz:** `<title>Lumen Gala | Invitaciones digitales personalizadas</title>`, tres `<link rel="icon">` a `/favicon.ico` (200, `image/vnd.microsoft.icon`), `apple-touch-icon.png` 200, `og:site_name = Lumen Gala · Invitaciones digitales`.
- **E2E móvil 390×844:** header «LUMEN GALA» + pie «© 2026 Lumen Gala»; menú con los 6 ítems y chips «pronto»; tap «Álbum digital» despliega la tarjeta (`aria-expanded=true`, panel 263 px); `/catalogo/` y `/personalizar/` cargan con títulos «| Lumen Gala» y marca en header.
- **E2E escritorio 1280×800:** nav con los 6 ítems; tipografía del logo Playfair Display con tracking 1.2 px (identidad elegante conservada); demo «Rosa Romántica» con título «· Lumen Gala»; el chunk del ticket «ADMITE UNO» contiene «LUMEN GALA» (texto vertical de la apertura).
- **Rutas íntegras en raíz:** `/editar/` carga («Editor móvil | Lumen Gala»), sin errores de consola ni de página; menú superior y botones principales (Personalizar, Ver el catálogo, WhatsApp) funcionan.
- Capturas: portada móvil y catálogo PC con la marca nueva aplicada.

## Pendiente para el propietario

- Verificar en un teléfono físico: favicon LGS en la pestaña del navegador y al «Agregar a inicio» (iOS usa `apple-touch-icon.png`), y que WhatsApp muestre el preview con «Lumen Gala» al compartir el enlace (la caché de WhatsApp puede tardar; forzar con el depurador de sharing si hace falta).
- Google puede tardar días en refrescar el título de resultados; el favicon nuevo puede tardar en aparecer en la pestaña por caché del navegador (probar en incógnito).
