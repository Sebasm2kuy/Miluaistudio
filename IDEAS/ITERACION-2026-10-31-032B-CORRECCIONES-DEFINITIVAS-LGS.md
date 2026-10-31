# Iteración 032 — Correcciones definitivas de Lumen Gala Studio

**Fecha:** 31-10-2026
**Rama:** `feat/correcciones-032`
**Pedido del cliente:** informe de auditoría + prompt de correcciones definitivas (iteraciones 031-A/B en `IDEAS/`): favicon, primer pantallazo móvil, carrusel de 29 diseños, editor fuera de la navegación pública, testimonios de muestra, servicios «próximamente», canonical/noindex/robots/sitemap, revisión general de consistencia y accesibilidad.

---

## 1. Favicon: fuera el sello rojo antiguo (definitivo)

**Causa raíz:** los convencionales especiales de Next.js `src/app/favicon.ico` (189 KB) y `src/app/icon.png` (131 KB) eran los DOS el sello rojo «Milagros XV Años» (marca vieja, fechados 28-10) y **prevalecían sobre `public/favicon.ico`** (monograma LGS, 15 KB): el archivo especial se sirve en `/favicon.ico` por encima de `public/`. Producción estaba sirviendo el sello viejo (verificado por md5 contra `https://lumengala.site/favicon.ico`).

- Eliminados `src/app/favicon.ico` e `src/app/icon.png`; queda un único icono: `public/favicon.ico` (LGS) + `public/apple-touch-icon.png` (180×180) + la metadata `icons` explícita del layout raíz (sin cambios, era correcta).
- **Canarios en verify-export:** §8b compara el md5 de `out/favicon.ico` contra el md5 del sello viejo (`946df6b3…`), limita el peso (100 KB) y exige que `out/icon.png` no exista; el `<head>` no puede declarar `/icon.png`.
- Verificado en el artefacto: `out/favicon.ico` = 15 KB, md5 `8c83d462…` (el monograma LGS).

## 2. Primer pantallazo móvil

Antes: la maqueta (aspecto 4/5, hasta 400 px) iba primera en móvil y empujaba el H1 y el CTA bajo el pliegue. Ahora:

- **Texto primero en móvil**: badge WhatsApp + H1 + subtítulo + CTA principal («Personalizar mi invitación») + catálogo + WhatsApp, y la maqueta después, compactada a `max-w-[360px]` (escritorio idéntico: texto a la izquierda, collage a la derecha — mismas columnas del grid, solo se cambiaron los `order` y el orden del DOM).
- Medido en emulación (sin scroll inicial): **360×800** H1 a 147 px y CTA a 561 px (primer pantallazo), imagen a 843 px; **390×844** H1 a 163 px y CTA a 621 px; **320×800** sin overflow (scrollWidth 320) y CTA bottom a 669 px; **1280×800** texto izquierda / collage derecha (capturas verificadas).

## 3. Carrusel de los 29 diseños: render liviano + autoplay centralizado

- `src/lib/carrusel.ts`: nueva función pura `renderCompleto(pos)` — solo el diseño activo y sus dos vecinos montan `MiniInvitation`; los slides `oculta` usan una representación liviana (marco del teléfono) y montan la invitación al asomar. Los 29 diseños y sus enlaces siguen en el DOM (`data-slide` + marcadores `data-render="completo|liviano"`).
- **Medición (mismo método, HTML SSR de la portada):** producción anterior 57 mini-invitaciones → 31 (−26, exactamente los slides ocultos); documento 704 KB → 495 KB (−30 %). En vivo: 3 completos + 26 livianos.
- **Interacción centralizada:** `registrarInteraccion()` — flechas, teclado (ArrowLeft/Right), indicadores, botones de borde y gestos táctiles pasan todos por acá; el autoplay espera `PAUSA_TRAS_INTERACCION_MS` (6,5 s). Antes las flechas y el teclado NO pausaban el autoplay.
- Autoplay: intervalo único con limpieza al desmontar; no avanza con la pestaña oculta ni con `prefers-reduced-motion` (ahora escucha cambios en vivo del media query). `requestSubmit`-free, sin temporizadores duplicados.
- Accesibilidad conservada: `aria-roledescription`, `aria-label` con posición, `aria-live` en el nombre, `aria-current` en puntos, foco visible, `tabIndex` gestionado.
- **Verificado en vivo:** flecha avanza; tras click el contador queda 6 s sin moverse y reanuda después (pausa real); teclado avanza; punto 6 salta; click en el borde izquierdo trae ese diseño; consola y errores limpios.
- **Imágenes:** `public/invitacion-vertical.png` (1,8 MB, fallback del sobre de demo, referenciado por `config.ts` → `envelope.tsx`) convertida a JPEG q82 (187 KB, −90 %, alpha innecesaria — extrema 255/255) y renombrada a `.jpg`; `config.ts` actualizado. Comparación visual lado a lado equivalente. `sello.png`/`gallery1.jpg` no referenciados: se dejan (no pesan en la página).

## 4. Editor fuera de la navegación pública

- Quitados los enlaces «Editor de invitaciones» del pie de la **portada** y del pie del **personalizador**. El botón del flujo «Editar tocando la invitación» (personalizador → editor con datos) **se conserva** — es el camino de trabajo, no navegación comercial.
- `/editar/` sigue publicado (ruta directa del propietario, exigida por §2 de verify-export) y noindex/nofollow.
- **verify-export §7 reescrita coherente con la decisión:** falla si `index.html` o `catalogo/index.html` vuelven a contener `href="/editar/"`; exige que la URL `/editar/` siga empaquetada en el JS cliente (camino del personalizador; el flujo completo se verifica en E2E). Invierte la garantía de la 018 a pedido explícito del propietario.
- Sin tokens en el artefacto (verify-privacy + grep manual: `tokensEnHtml: false` en `/editar/` en vivo).

## 5. Testimonios de muestra sin apariencia de puntuación

- Portada y catálogo: estrellas (y el `aria-label` «Calificación: 5 de 5») **solo** cuando `estado === 'verificado'`; los ejemplos muestran una etiqueta discreta «Ejemplo de referencia» en su lugar.
- Eliminada la etiqueta duplicada del `figcaption` (quedaba doble con la nueva).
- La aclaración «Comentarios de muestra… se publicarán una vez autorizadas» se conserva (portada). Nada se inventa: `testimonios.ts` sigue 100 % `muestra`.

## 6. Servicios «próximamente» sin protagonismo

- **Píldoras del primer pantallazo:** antes 4/5 eran «pronto». Ahora: «Los 29 diseños» + «Música de Spotify» (producto real) y una píldora agregada «Extras: álbum, video y más» hacia `#servicios`. Las tarjetas individuales con su etiqueta «Próximamente» y su WhatsApp siguen intactas en la sección.
- **Navegación:** secciones disponibles primero («Invitaciones», «Preguntas»), los 4 servicios «pronto» al final — mismo contrato testado (cada servicio con su ítem y su ancla).
- **Menú móvil (verificado en vivo, 360×800):** abre (aria-expanded true, 8 enlaces), Escape cierra, elegir un enlace cierra, panel cerrado fuera del DOM (no intercepta toques), captura visual verificada.

## 7. Canonical, noindex, robots y sitemap

- Causa: el `alternates.canonical` del layout raíz se **heredaba**: `/editar/`, `/previsualizar/`, `/acceso/`, `/dashboard/*` y `404` apuntaban a `/` y las **29 demos** a `/catalogo/` — ninguna es equivalente a su canonical.
- Política aplicada: `alternates: { canonical: null }` en editar, previsualizar, acceso, dashboard (layout de las 3 rutas) y en `catalogo/[designId]`. `/i/<slug>/` ya era coherente (noindex + autocanonical propio) y no se tocó. La portada, catálogo y personalizador conservan sus canonical.
- 404: sigue heredando el canonical de la portada — `not-found.tsx` no soporta export de metadata en App Router; queda documentado como límite conocido (sin efecto práctico: un 404 no se indexa).
- **verify-export §11 nueva:** falla si una ruta interna noindex declara canonical, si alguna demo declara canonical, si robots.txt no apunta a `https://lumengala.site/sitemap.xml`, o si el sitemap no es exactamente las 3 páginas comerciales.
- Sitemap/robots: sin cambios de contenido — ya correctos (3 comerciales; demos, invitaciones y operativas fuera).

## 8. Revisión general

- Enlaces internos verificados en vivo (portada, catálogo, demo, personalizar, editar, acceso, dashboard). Sin overflow horizontal en 320/360/390. Consola y errores de página limpios en todas las visitas.
- Portada, catálogo y personalizador: cero «precio|Mercado» en producción (grep + texto vivo).
- Marca visible en todas las páginas principales; sin referencias activas a Miluaistudio (§3 de verify-export vigente). El arte de demo del sobre (`invitacion-vertical.*`) muestra «Milagros» como nombre de demostración del producto — es contenido de demo, no identidad del sitio; se conserva por ser parte del arte de la invitación demo.

## Pruebas

- `npm test`: **203/203** (antes 202; +1 test del render liviano del carrusel con 3 activos/26 livianos y contrato por posición).
- `npm run lint`: 0 errores · `npm run typecheck`: 0 errores.
- `npm run build`: OK + verify-export sin errores (§2 rutas, §7 editor, §8 marca + favicon binario, §11 SEO) + verify-privacy sin fugas (401 archivos).
- E2E (agent-browser, `out/` servido local): portada escritorio (texto izq/collage der), móvil 360/390/320 (orden, CTA en pliegue, sin overflow), carrusel (flechas/teclado/puntos/borde/pausa), catálogo (6 testimonios, 0 estrellas, 6 etiquetas), demo (noindex + sin canonical), personalizador (flujo → botón `/editar/` presente), editor directo (noindex, sin canonical, sin tokens), login demo → dashboard (con la Contents API mockeada por rate limit anónimo del sandbox: sesión, resumen, confirmaciones con filtros/stats/CSV, editor del evento con 23 campos, consola limpia).
- **No verificable acá (honestidad):** teléfono físico real; `prefers-reduced-motion` en navegador real (la lógica está testeada y escucha cambios en vivo); la lectura anónima de `content/clientes.json` en producción quedó fuera porque la IP del sandbox agotó el rate limit anónimo de la API de GitHub (60/h por IP) — en producción cada visitante usa su propia cuota.

## Riesgos / pendientes

- El arte de demo del sobre mantiene «Milagros» (contenido de demo, decisión de marca pendiente si quiere cambiarse).
- 404 hereda el canonical de la portada (limitación de App Router con not-found; sin efecto práctico).
- La navegación client-side del panel no se pudo probar contra la API real (rate limit del sandbox); la paridad PBKDF2 navegador↔nodo sigue cubierta por tests.
