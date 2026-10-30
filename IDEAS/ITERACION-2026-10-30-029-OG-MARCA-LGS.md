# Iteración 029 — Tarjeta de WhatsApp con la marca LGS: og:title, og:description y og:image nuevos

**Fecha:** 30-10-2026 · **Rama:** `feat/og-marca-lgs`

## Pedido

«Actualiza las etiquetas meta Open Graph del archivo HTML principal: (1) og:title → "Lumen Gala Studio | Invitaciones web de alta gama"; (2) og:description → "Experiencias digitales personalizadas para 15s, bodas y eventos únicos. Música, RSVP y cuenta regresiva en un solo enlace."; (3) og:image → que apunte a la nueva imagen oficial de marca (isotipo LGS dorado sobre fondo oscuro); (4) <title> del navegador → "Lumen Gala | Invitaciones digitales". A renglón siguiente reforzó: la URL de og:image debe ser un archivo completamente NUEVO (parámetro único o renombrado, p. ej. lgs-preview.jpg) para forzar a WhatsApp a refrescar su caché, y la imagen enlazada debe ser el rombo dorado LGS, no una tarjeta vieja.»

## Diagnóstico

- La portada tenía `og:title` "Lumen Gala | Invitaciones digitales personalizadas" y una `og-image.jpg` del 28-10 que mostraba la tarjeta vieja de demo «Milagros XV Años» — nada que ver con la identidad LGS.
- WhatsApp cachea la vista previa por URL: aunque el contenido de `og-image.jpg` cambiara, el nombre igual haría que WhatsApp siguiese mostrando la tarjeta vieja. Hacía falta una URL distinta.

## Decisiones

1. **`public/lgs-preview.jpg` (nuevo, 1200×630, ~58 KB):** composición de marca generada con PIL desde el `Logo.jpg` oficial: el rombo dorado LGS extraído con transparencia (alfa = diferencia R−B con umbral, el fondo pizarra desaparece) flotando sobre el fondo oscuro con textura y viñeta del propio logo, más «LUMEN GALA» en serif (Noto Serif SC Black, dorado muestreado del logo) y el filete con la línea «INVITACIONES WEB DE ALTA GAMA», coherente con el nuevo og:title. La vieja `og-image.jpg` se elimina del repo.
2. **og:title / twitter:title:** «Lumen Gala Studio | Invitaciones web de alta gama» (texto exacto del pedido). **og:description / twitter:description:** el texto exacto del pedido. **`<title>` por defecto:** «Lumen Gala | Invitaciones digitales» (el template `%s | Lumen Gala` de las páginas internas no cambia).
3. **og:image en URL completamente nueva:** `https://lumengala.site/lgs-preview.jpg` en portada (`layout.tsx`), catálogo (`catalogo/layout.tsx`, `catalogo/[designId]/page.tsx`) y twitter equivalents — al cambiar el nombre del archivo, WhatsApp la trata como recurso nuevo y refresca la vista previa. `og:image:alt` describe el isotipo.
4. **Guardas coherentes (sin burlarlas):** `verify-export` §2 exige ahora `lgs-preview.jpg` (antes og-image.jpg) y §8 valida que el og:title de la portada diga «Lumen Gala Studio…/alta gama» y que og:image sea exactamente la URL nueva; `verify-privacy-export` actualiza la allowlist de assets (`lgs-preview`).

## Cambios

- `public/lgs-preview.jpg` (renombrada + regenerada desde `scripts/gen_og_lgs.py`, fuera del repo), `public/og-image.jpg` eliminada.
- `src/app/layout.tsx`: title.default, openGraph (title/description/images/alt), twitter (title/description/images).
- `src/app/catalogo/layout.tsx` y `src/app/catalogo/[designId]/page.tsx`: og:image y twitter:image → lgs-preview.jpg.
- `scripts/verify-export.mjs` (§2 + §8), `scripts/verify-privacy-export.mjs` (allowlist).

## Pruebas

- 163/163 tests, lint 0, typecheck 0, build + verify-export + verify-privacy OK (§8 nuevo: og:title y og:image validados sobre out/index.html).
- Local sobre out/: `<title>` exacto, og:title/og:description exactos, og:image = https://lumengala.site/lgs-preview.jpg, `/lgs-preview.jpg` → 200 image/jpeg 58 686 bytes, `/og-image.jpg` → 404.
- Composición visual de la tarjeta revisada: rombo dorado nítido, sin cuadrado del tile visible, textos centrados.

## Pendiente

- WhatsApp refresca su caché al re-compartir el enlace (URL nueva obliga re-rastreo); si un chat viejo mostró la tarjeta vieja, basta reenviar el enlace.
- `/personalizar/` define su openGraph sin og:image propia desde antes de esta iteración (Next no hereda imágenes si el segmento redefine openGraph): candidato para una próxima iteración si se quiere tarjeta con imagen ahí también.
