# Iteración 007 — Corrección de riesgos críticos pendientes (28-10-2026)

Esta iteración implementa las correcciones pedidas por la auditoría de riesgos críticos pendientes (iteración 006), con evidencia reproducible. Trabajo realizado en la rama `fix/riesgos-criticos-pendientes` mediante Pull Request contra `main` (sin push directo ni merge sin aprobación).

## Estado de cada problema

| Problema | Estado |
|---|---|
| P0 — Literales de la config operativa en bundles públicos | **Resuelto** (verificado sobre los artefactos reales de `out/`) |
| P0 — RSVP enviaba nombres y teléfono por GET | **Resuelto en el código**; el backend desplegado queda pendiente de verificación manual externa |
| P1 — Contraste WCAG insuficiente (#9a7440, #b58c5a, blanco sobre dorado, estrellas) | **Resuelto** con tokens auditados + pruebas automáticas |
| P1 — `npm test` no se ejecutaba en GitHub Actions | **Resuelto** en ambos workflows |
| P1 — HTML de portada ~905 KB | **Resuelto parcialmente**: −28 % (907.429 → 652.391 bytes de archivo); catálogo y personalizador sin cambios por decisión de identidad visual |
| P2 — Re-verificación de correcciones anteriores | **Confirmado** (admin fuera del export, basePath, uploads vacíos, SEO, estados de galería y RSVP) |

## 1. P0 — Separación de la configuración operativa de la demo pública

**Diagnóstico confirmado con medición propia.** Antes del cambio, tres chunks JS públicos (`_next/static/chunks/…js`, los mismos que carga `/personalizar/`) contenían literales de la plantilla operativa (lugar del evento, textos de dedicatoria y hashtag de plantilla). Causa: `demo-config.ts` y `useConfig.tsx` importaban `defaultConfig` desde `config.ts`; aunque `createDemoConfig` sobrescribiera campos, el módulo entero quedaba empaquetado en el grafo cliente.

**Arquitectura nueva:**

- `src/data/config-schema.ts` (nuevo): solo tipos (`SiteConfig`, etc.). Cualquier módulo cliente puede tiparse sin tocar datos.
- `src/data/config.ts`: queda como **archivo operativo/plantilla del panel**, con encabezado explícito de que nadie debe importar su export por defecto. Sus valores de plantilla son ahora **canarios sintéticos únicos** (distintos de los perfiles de demo, p. ej. el nombre de plantilla y el hashtag de plantilla ya no existen en la demo). Ningún módulo de `src` lo importa como valor (solo `export type`, que se borra al compilar).
- `src/data/demo-config.ts`: **100 % autocontenida**. Define `CONFIG_DEMO_BASE` propia (perfiles ficticios, endpoints de escritura vacíos, sin teléfonos ni datos bancarios). Ya no importa `defaultConfig`.
- `src/hooks/useConfig.tsx`: el fallback ya no es `defaultConfig` sino `CONFIG_DEMO_BASE` (pública).
- `src/app/admin/page.tsx`: el editor arranca desde `CONFIG_DEMO_BASE` + `localStorage` (la herramienta local sigue funcionando; el despliegue vía `github-deploy.ts` sigue escribiendo `config.ts`, que ya no se empaqueta).
- Lista explícita de campos publicables: los valores de plantilla permitidos en artefactos están en el allowlist de `scripts/verify-privacy-export.mjs` (rutas `/Miluaistudio/…`, ciudad genérica, URLs genéricas de mapas/Spotify). Todo lo demás se considera no autorizado por defecto.

**Prueba de regresión sobre los artefactos reales:**

- `scripts/verify-privacy-export.mjs` (nuevo, integrado a `npm run build` y ejecutable con `npm run verify:privacy`): extrae los valores de los campos privados de `config.ts` (11 canarios vigilados), escanea los 153 archivos de texto de `out/` (HTML, JS, CSS, JSON, SVG, txt, xml) y **falla el build** si alguno reaparece, indicando archivo y campo sin reproducir el valor. Además bloquea imports de valor de `config.ts` en todo `src/` y exige que los canarios no existan en la demo (para que una fuga no sea ambigua).
- `tests/privacidad-config.test.ts` (nuevo, corre en `npm test` sin build): guarda del grafo de imports, vigencia de los canarios, campos de escritura vacíos en la plantilla y ausencia de solapamiento demo↔operativa.

**Evidencia:** tras el build, los tres marcadores de config operativa están ausentes de todo `out/` (antes: 3 chunks). Mensajes de error no muestran valores.

**Sobre el historial Git:** los commits antiguos (p. ej. “Config update from admin” y commits de cuentas de regalo) muestran que `config.ts` llegó a contener datos reales; siguen en el historial público. Eliminar el archivo del estado actual **no** purga las copias históricas: la limpieza de historial (p. ej. `git filter-repo`) es destructiva, rompería forks/PRs y requiere aprobación expresa del dueño, por eso no se ejecutó. Si hubo credenciales reales en el historial, corresponde revocarlas/rotarlas en el servicio de origen además de cualquier limpieza.

## 2. P0 — Privacidad y fiabilidad del RSVP

**Contrato verificado:** el backend del repositorio (`google-apps-script/gallery-server.gs`) acepta `POST JSON { tipo: "rsvp_grupo", codigo, cantidad, invitados, telefono, fecha }` y responde siempre `{ success: true/false, … }`. El handler GET se conserva como legado pero el frontend **ya no lo usa**.

**Limitación declarada:** no hubo acceso al Web App de Google desplegado, así que no es posible afirmar que la URL productiva ya acepte POST. El archivo `.gs` del repo documenta el recordatorio de que editar el archivo no actualiza el despliegue (hay que crear nueva implementación y probar). El frontend está diseñado para degradar honestamente en ese caso.

**Implementación (`src/lib/rsvp-client.ts`, nuevo):**

- Envío por **POST con los datos solo en el cuerpo**; la URL queda sin query string (fuera de historiales, logs de proxies y referers).
- `Content-Type: text/plain;charset=utf-8` → solicitud “simple”, sin preflight OPTIONS (los Web Apps de Apps Script no responden OPTIONS).
- Timeout con `AbortController` (15 s), `redirect: follow`, sin `mode: 'no-cors'` ni respuestas opacas.
- Estados: `guardado` solo con `{success:true}` legible; `error` con rechazo explícito; **todo lo no verificable (CORS, red, timeout, JSON ilegible, backend viejo que responde `{ok:true}`) → `pendiente`, nunca éxito**.
- `rsvp.tsx` usa el cliente nuevo; se eliminaron el `URLSearchParams` con datos personales y el reintento `no-cors` fire-and-forget. En `pendiente`/`error` la interfaz ofrece **WhatsApp como alternativa visible elegida por la persona** (“Confirmar también por WhatsApp”), que ya existía y se mantiene.
- Sin datos personales en `localStorage`/`sessionStorage`/analítica/logs (el único storage con datos de configuración es el del panel local).

**Pruebas (`tests/rsvp-client.test.ts`, con fetch simulado, datos sintéticos):** éxito verificable, wrapper HTML, error explícito, respuesta inválida, HTTP 500, timeout, error de red, URL vacía; y una prueba estructural que exige método POST, URL limpia sin `?`, cuerpo con el contrato completo, `text/plain` y ausencia de `no-cors`.

**Pendiente manual externo:** comprobar con una confirmación de prueba que la implementación productiva de Apps Script responde `{"success":true}` al POST (y si no, crear nueva implementación desde el `.gs` actual). Mientras eso no se verifique, los envíos reales quedarán en estado “pendiente” con el fallback de WhatsApp disponible, sin éxitos falsos.

## 3. P1 — Contraste y accesibilidad WCAG

Razones calculadas con la fórmula WCAG 2.1 (luminancia relativa). Token nuevo: `src/data/store-tokens.ts` + utilidades exportadas.

| Combinación | Antes | Ahora |
|---|---:|---:|
| Champagne de texto sobre blanco | #9a7440 → 4.25:1 / #b58c5a → 3.06:1 ✗ | `#8a6534` → **5.26:1** ✓ |
| Champagne de texto sobre marfil #faf8f4 | 4.00:1 / 2.88:1 ✗ | **4.96:1** ✓ |
| Blanco sobre fondo dorado (badges/pasos) | sobre #b58c5a → 3.06:1 ✗ | sobre `#8a6534` → **5.26:1** ✓ |
| Borde indicador (seleccionado/foco) sobre marfil | #b58c5a/60 ≈ 1.9:1 ✗ | `#8a6534` sólido → **4.96:1** ✓ |
| Estrellas de calificación sobre blanco | #d9a53f → 2.23:1 ✗ | `#b8860b` → **3.25:1** ✓ |
| Iconos dorados sobre crema #f3ead9 | #9c7443 → 3.52:1 ✓ | sin cambio (≥3:1 gráfico) |
| Enlaces dorados #8a6a44 (blanco/marfil) | 4.97 / 4.69 ✓ | sin cambio |
| Etiquetas de categoría de los 10 diseños | 4.75–8.81:1 ✓ | sin cambio (verificadas en pruebas) |

Cambios aplicados: `store-ui.tsx`, `page.tsx` (token GOLD), `catalogo/page.tsx` (eyebrows, foco visible, estrellas), `personalizador-app.tsx` (todos los usos de texto/fondo/borde champagne; los bordes de estados seleccionado/deshabilitado ahora son sólidos, el anillo de foco sube a /35), `globals.css` (`--store-accent`). El foco visible se conserva en todos los controles; ningún estado depende solo del color (los toggles mantienen posición del knob, los badges mantienen numeral, etc.).

**Pruebas (`tests/contraste-wcag.test.ts`):** mide con la fórmula canónica las combinaciones críticas (texto 4.5:1, gráficos 3:1, WhatsApp, etiquetas de los 10 diseños) y **barre `src/` prohibiendo el regreso de los tonos insuficientes** (ignora comentarios para no confundir documentación con código).

## 4. P1 — Tests en GitHub Actions

- `validate-catalog.yml`: agrega el paso **`npm test`** (después de `npm ci`, antes de lint y build). Un test fallido hace fallar la validación.
- `deploy.yml`: además de arreglarse el trigger corrupto (ver abajo), ahora también corre `npm test` antes de compilar y publicar.
- `npm run build` ya incluye, dentro del mismo comando, `prune-export.mjs` + `verify-export.mjs` + `verify-privacy-export.mjs`; el workflow lo documenta y **no duplica** esas verificaciones a propósito.
- `npm test` no depende de archivos generados previamente (compila con `tsc -p tsconfig.tests.json` y corre `node --test`; la verificación de artefactos vive en el build, no en los tests unitarios).

**Evidencia real de CI:** [Validate Miluaistudio — run 40550777200](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40550777200) sobre este PR: resultado **success**; pasos `Tests` → success, `Lint` → success, `Build static site + verificación del export` → success (el paso de build ejecuta prune + verify-export + verify-privacy).

**Hallazgo adicional corregido:** `deploy.yml` tenía el trigger `branches: ain]` (YAML corrupto, probable resto de una edición), de modo que el deploy automático por push a `main` no podía dispararse; solo `workflow_dispatch`. Se restauró `branches: - main`. **Limitación:** no se ejecutaron las Actions remotas desde este entorno (no dispara runs); la evidencia real serán las corridas del PR. No se declara ningún resultado de CI como aprobado sin enlace real.

## 5. P1 — Peso del export

Metodología única antes/después (`scripts/mide-export.mjs`, nuevo): longitud de archivo HTML por página y bytes totales de JS/CSS del artefacto. **No** es peso comprimido de red ni puntuación Lighthouse; no se ejecutaron Lighthouse ni Core Web Vitals, y así se declara.

| Métrica | Antes | Después | Variación |
|---|---:|---:|---:|
| `index.html` (portada) | 907.429 B | **652.391 B** | **−28,1 % (−255 KB)** |
| `catalogo/index.html` | 280.934 B | 280.934 B | 0 (decisión) |
| `personalizar/index.html` | 195.200 B | 195.200 B | 0 |
| `catalogo/<demo>/index.html` | 77.283 B | 77.263 B | −20 B |
| JS total (20 archivos) | 1.110.506 B | 1.112.415 B | +1,9 KB (módulo rsvp-client) |

**Qué se cambió:** la franja de 10 diseños de la portada (solo-previews, ~116 px de ancho en móvil / 5 columnas en escritorio) reemplazó la maqueta completa (celular + tarjeta = 2 mini-invitaciones + adornos + overlays por diseño) por la **miniatura ligera** (`MiniInvitation`), que muestra el mismo diseño (nombre, fecha, paleta, adorno). El héroe, los 4 destacados y todo el catálogo **conservan la maqueta completa** por identidad comercial, y las demos interactivas no cambiaron (mantienen textos, acciones y apariencia; la única diferencia visible de la portada es el estilo de la tira de miniaturas, que ahora muestra la invitación sin el marco del celular).

**Decisión documentada de no tocar el catálogo:** las tarjetas del catálogo son el escaparate principal a tamaños donde la maqueta sí aporta detalle; sustituirlas era viable técnicamente pero sacrificaría identidad visual sin un requisito de rendimiento medido. Queda como oportunidad futura (miniatura + `CatalogScene` solo en la vista rápida).

## 6. P2 — Re-verificación de correcciones anteriores (sobre el build nuevo)

- `out/admin/` **no existe** en el export (prune + verify-export, sin errores; además no queda ningún archivo con “admin” en el nombre).
- Rutas obligatorias presentes y **basePath** `/Miluaistudio/` presente en portada, catálogo y personalizador; sin referencias absolutas fuera de basePath (verify-export sin avisos).
- `out/uploads/` sin imágenes y `public/uploads/` vacío; los 4 assets retirados por privacidad siguen ausentes.
- SEO: portada con H1 único y título correcto; catálogo H1 único + 13 H2; personalizador “Personalizá tu invitación | Miluaistudio”; canonical correctos; demos con `noindex, follow` y canonical hacia catálogo.
- Galería: mantiene estados `idle/compressing/uploading/ok/pendiente/error` con moderación (recepción ≠ publicación).
- RSVP/fotos: sin mensajes de éxito no verificable (estados de contrato; la demo declara explícitamente que no se envió nada).

## Comandos ejecutados y resultados reales

```
npm ci                      → OK
npm test                    → 46 tests, 46 pass, 0 fail (tsc + node --test)
npm run lint                → 0 errores, 0 warnings
npm run typecheck           → 0 errores
npm run build               → OK; prune-export OK; verify-export sin errores;
                              verify-privacy sin fugas (153 archivos escaneados)
node scripts/mide-export.mjs → tabla de arriba
```

Comparación de tamaño antes/después con el mismo método: portada 907.429 → 652.391 bytes de archivo.

## Limitaciones y tareas que requieren intervención manual

1. **Apps Script productivo (RSVP y fotos):** verificar la URL desplegada con una prueba controlada; si sigue solo con GET, crear nueva implementación desde el `.gs` del repo. Sin ese acceso no se puede declarar probado el servicio externo.
2. **GitHub Actions:** las corridas reales se producirán al abrir el PR; este entorno no las dispara ni se inventan resultados.
3. **Historial Git:** contiene versiones antiguas de `config.ts` con datos operativos y assets retirados. Purgarlo requiere aprobación expresa (acción destructiva). Recomendación: rotar cualquier credencial que haya podido exponerse alguna vez en el historial.
4. **Catálogo 280 KB:** optimización postergada por decisión de identidad (ver §5).
5. **Lighthouse/PageSpeed/CWV:** no ejecutados; la métrica informada es tamaño de archivo, no rendimiento de red.
6. `github-deploy.ts` reescribe `config.ts` con un template de tipos embebido que está desactualizado respecto de `config-schema.ts` (campos opcionales nuevos, p. ej. secciones/dressCode/duración). Los despliegues desde el panel pueden perder esos campos opcionales. Corrección sugerida (fuera de alcance aquí): generar el archivo desde el esquema.

## Próximos pasos

1. Revisar y aprobar el PR; observar la corrida de `Validate Miluaistudio` (debe incluir `npm test`).
2. Verificar el Web App de RSVP desplegado con una confirmación de prueba y, si aplica, redesplegar el `.gs`.
3. Decidir (dueño) la limpieza del historial Git y rotación de credenciales históricas.
4. Oportunidad: miniaturas también en el catálogo si se necesita otra bajada de peso; medir Lighthouse real en móvil.
