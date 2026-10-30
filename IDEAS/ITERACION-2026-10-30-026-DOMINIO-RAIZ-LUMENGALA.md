# Iteración 026 — Migración al dominio raíz lumengala.site (fin de las rutas /Miluaistudio/)

**Fecha:** 30-10-2026 · **Rama:** `feat/dominio-raiz-lumengala`

## Pedido

«Necesito que actualices todas las rutas absolutas y referencias en mi proyecto web para que funcionen perfectamente en mi nuevo dominio raíz (lumengala.site), ya que antes estaba montado en un subdirectorio de GitHub Pages (/Miluaistudio/). Revisá y corregí: rutas de CSS, scripts, imágenes/logos/recursos, redirecciones, enlaces internos y llamadas fetch/API. Todas las rutas deben quedar relativas a la raíz para que el sitio cargue con su diseño completo en lumengala.site sin romperse.»

## Diagnóstico

- **El dominio ya estaba vivo:** lumengala.site respondía 200 servido por GitHub Pages (IPs 185.199.x.x) con el build viejo → DNS y dominio personalizado ya configurados en Settings → Pages; el contenido con prefijos `/Miluaistudio/` era lo que se veía roto.
- El prefijo no vivía solo en `next.config.ts` (`basePath: "/Miluaistudio"`): había ~90 rutas hardcodeadas en `src/` (enlaces `<a>`, `router.push`, `window.open`, escenas/fondos/galerías), URLs canónicas/OG `https://sebasm2kuy.github.io/Miluaistudio/…`, constantes `BASE_PATH` en `invitacion-publicada.ts` y `activos-editor.ts` (URLs de invitaciones publicadas y de assets subidos), `robots.txt` + `sitemap.xml`, los dos JSON de `content/invitaciones/` y los tests que exigían esas URLs exactas.
- `github-deploy.ts` tenía una `BASE_PATH` muerta (declarada y nunca usada).
- Las URLs de la API de GitHub (`api.github.com/repos/Sebasm2kuy/Miluaistudio/…`) son rutas de repositorio, NO rutas web: se conservan.

## Decisiones

1. **Quitar `basePath`** en `next.config.ts`: el sitio se sirve en la raíz del dominio propio. `trailingSlash: true` se conserva (host-agnóstico).
2. **Rutas ancladas a la raíz (`/catalogo/`, `/editar/`, `/catalogo/galeria/…`)** en lugar de relativas con `./`: en un export estático con rutas anidadas (`/catalogo/rosa-romantica/`), una ruta relativa desnuda se rompe al navegar; la raíz absoluta funciona idéntica en lumengala.site. Es la versión «relativa al dominio» que pide el pedido.
3. **Dominio canónico único:** `metadataBase`, canonicals y OpenGraph pasan de `https://sebasm2kuy.github.io/Miluaistudio/` a `https://lumengala.site/…` (también robots.txt y sitemap.xml).
4. **`public/CNAME` nuevo** con `lumengala.site`: fija el dominio propio en el artefacto publicado (buena práctica con deploys por Actions).
5. **Migración de datos ya publicados:** los JSON de `content/invitaciones/` (ejemplo-boda, ejemplo-quince) llevaban URLs embebidas con el prefijo; se reescribieron, si no sus galerías darían 404 en el dominio nuevo.
6. **Regresión blindada en verify-export §3 (nueva):** el build FALLA si `index.html`, `catalogo/`, `personalizar/` o `editar/` vuelven a contener `src|href|content="/Miluaistudio…` o una URL absoluta con `/Miluaistudio/`; además avisa si un `src/href` interno no queda anclado a la raíz. §6 ahora valida assets referenciados por invitaciones con rutas `/…` (sin prefijo) y §7 exige `href="/editar/"`.

## Cambios

- `next.config.ts`: fuera `basePath`; comentario de la decisión.
- `src/app/layout.tsx`, `catalogo/layout.tsx`, `catalogo/[designId]/page.tsx`, `personalizar/page.tsx`: metadataBase/canonical/OG/Twitter/icons → lumengala.site y raíz.
- Enlaces y constantes en: `app/page.tsx` (CATALOG_URL), `catalogo/page.tsx`, `editar/page.tsx`, `admin/page.tsx`, `store-nav.tsx`, `carrusel-modelos.tsx`, `footer.tsx` (router.push), `personalizador-app.tsx` (CATALOGO/PERSONALIZAR/EDITOR_URL), `loading-screen.tsx`.
- Datos: `config.ts` (galería + portada), `invitation-designs.ts` (30 escenas), `admin-options.ts` (19 fondos), `demo-config.ts` (DEMO_GALLERY_BASE + demo cover).
- Publicación: `invitacion-publicada.ts` (`BASE_PATH=''`, `ORIGEN_PUBLICO='https://lumengala.site'`) → `urlInvitacion()=/i/<slug>/` y `urlPublicaInvitacion()=https://lumengala.site/i/<slug>/`; `activos-editor.ts` → `/assets-invitaciones/<archivo>`; `github-deploy.ts` sin constante muerta.
- `public/robots.txt`, `public/sitemap.xml`, `public/CNAME` (nuevo).
- `content/invitaciones/ejemplo-boda.json` + `ejemplo-quince.json`: URLs internas migradas.
- Tests: `invitacion-publicada`, `activos-editor`, `publicacion-panel`, `publicacion-github`, `fondos-premium` (strips de prefijo), `rsvp-contrato` — URLs esperadas actualizadas a la raíz.
- `scripts/verify-privacy-export.mjs`: allowlist de assets por rutas raíz (`/catalogo|assets-invitaciones|invitacion|logo|sello|og-image`).
- Docs vivos: `docs/ADMINISTRACION.md` y `docs/PRUEBA-MANUAL-EDITOR-MOVIL.md` con las URLs nuevas (los registros históricos de iteraciones no se reescriben).

## Opciones descartadas

- **Rutas relativas con `./`:** frágiles con trailingSlash y rutas anidadas (un `./catalogo/` desde `/editar/` resolvería `/editar/catalogo/`).
- **basePath configurable por variable de entorno:** complica los verificadores para un escenario que no existe hoy (el dominio propio es el destino único).
- **Redirecciones 301 del subdirectorio viejo:** GitHub Pages no permite redirects por ruta en artefactos estáticos; el URL viejo queda deprecado por diseño del cambio de dominio.

## Pruebas

- 160/160 tests, lint 0, typecheck 0, build + prune + verify-export (§1-§7) + verify-privacy OK.
- Artefacto: 0 referencias `/Miluaistudio/` en HTML clave (solo la marca textual en `<title>`/keywords); `src/href` raíz correctos (`/_next/…`, `/catalogo/…`); CNAME en out/.
- Servidor local en raíz (http://localhost:4173): `/`, `/editar/`, `/catalogo/`, `/i/ejemplo-quince/`, un chunk `/_next`, una imagen de galería y `/sitemap.xml` → todos 200.
- Emulador 390×844: portada con 0 errores de consola, 0 imágenes rotas, 0 enlaces con prefijo viejo (los 6 restantes son textos de marca en enlaces wa.me, correctos); editor y catálogo cargan; invitación publicada con JSON migrado muestra sus imágenes.
- Emulador 1280×800: portada completa con menús «pronto» (Álbum digital, Videos, Historia de vida, Tráiler) y carrusel operativos.
- Pendiente: apertura del propietario en lumengala.site desde el teléfono.

## Próximos pasos

1. Si aún no se hizo, verificar en GitHub → Settings → Pages que el dominio personalizado siga siendo `lumengala.site` y «Enforce HTTPS» activo (el CNAME del repo lo fija también del lado del artefacto).
2. El URL antiguo `sebasm2kuy.github.io/Miluaistudio/` queda deprecado: actualizar bios/links/QR que apunten al subdirectorio.
3. En la próxima sesión de Search Console, dar de alta `https://lumengala.site/` como propiedad y reenviar el sitemap.
