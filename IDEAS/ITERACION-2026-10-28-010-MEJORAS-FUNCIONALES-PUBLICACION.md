# Iteración 010 — Mejoras funcionales: publicación de invitaciones, assets del editor y RSVP (28-10-2026)

## Contexto

El propietario priorizó una iteración **funcional** (la auditoría general de
privacidad y la limpieza de historial quedan expresamente para otra etapa).
El punto de partida tras el PR #14: el panel local ya no podía filtrar la
configuración operativa, pero quedó **roto el flujo de publicación** — el
botón Deploy escribe `src/data/config.ts` y **ningún componente consume ese
archivo** (useConfig cae a la base demo), y la subida de imágenes del editor
usaba `public/uploads/`, carpeta que `verify-export` bloquea por ser la ruta
conceptual de fotos de invitados.

## Qué se implementó (hechos verificados en esta iteración)

### 1. Invitación publicada con URL propia (P0)

- Representación publicable **tipada y serializable**
  (`src/data/invitacion-publicada.ts`): `esquema 1`, slug, fechas,
  `config` como JSON puro. Publicar fuerza `modoDemo: false` y descarta
  `demoNombreDiseno` y funciones/no-serializables.
- Colección estática **un archivo por slug**: `content/invitaciones/<slug>.json`.
  Publicar otra invitación no sobrescribe las anteriores; actualizar conserva
  slug, enlace y `publicadoEn` (el publicador lee la fecha original del
  archivo existente).
- Ruta pública **`/i/[slug]/`** (`src/app/i/[slug]/page.tsx`) con
  `generateStaticParams` + `dynamicParams = false`, `output: export`,
  `basePath` y `trailingSlash` intactos. Renderiza la experiencia existente
  (`ConfigProvider` + `InvitationExperience`), sin duplicar visual.
  Metadatos: título por evento, canonical absoluto, `noindex, follow`.
- **Publicador** (`publicarInvitacionEnGitHub` en `src/lib/github-deploy.ts`):
  API de Contents sobre `main`, resultado honesto (creada / actualizada /
  error, con slug y URL) — guardar en localStorage o iniciar la petición no
  se presenta como publicación; ante error la config del panel queda intacta.
- **Panel local**: sección "Publicar invitación" con slug validado en vivo
  (reservados: `admin`, `i`, `catalogo`, `uploads`, etc.), vista previa fiel
  (nueva ruta `/previsualizar/`, `noindex`, usa la config guardada del
  navegador o la base demo) y descarga del JSON publicable como alternativa
  sin token.
- **Fixtures sintéticos**: `ejemplo-quince` y `ejemplo-boda` (datos ficticios,
  imágenes del propio catálogo) — dos invitaciones coexistiendo en el export.
- **verify-export** extendido (sección 6): cada JSON publicado debe generar
  `out/i/<slug>/index.html`, cada asset enlazado por una invitación debe
  existir en el export y toda ruta `i/` sin JSON declarado falla el build.
  La regla `out/uploads/` sin imágenes NO se tocó.

### 2. Assets del editor compatibles con el export (P0)

- Nueva carpeta **`public/assets-invitaciones/`** para recursos que el
  propietario sube para su invitación; URL devuelta idéntica a la ruta
  publicada (`/Miluaistudio/assets-invitaciones/<archivo>`).
- Validación **no dependiente del atributo accept** (`src/lib/activos-editor.ts`):
  tamaño (≤ 5 MB), extensión (JPG/PNG/WebP), MIME normalizado y **firma real
  por magic bytes** (JPEG/PNG/WebP; un ejecutable disfrazado de .jpg se
  rechaza).
- Nombres saneados (`mi-foto-de-xv_abc123.jpg`) con sufijo único
  (tiempo + aleatorio): sin colisiones ni sobreescrituras.
- Error/retorno: el uploader solo entrega URL con éxito verificable; el
  campo conserva su URL anterior y permite reintentar.
- Sincronización galería ↔ fondo extraída a `sincronizarFondoConGaleria()`
  (mismo comportamiento que venía aplicando el panel, ahora testeada).
- Fotos de invitados: siguen por el backend de moderación
  (`photo-server.gs`) — sin cambios.

### 3. RSVP (P1)

- Estados confirmado / pendiente / error intactos; sin éxitos no verificables.
- Tests nuevos del intérprete de contrato: tabla completa de estados,
  `{ok:true}` legado → pendiente, array/vacío/no-objeto → null, wrapper HTML,
  respuesta ilegible sin lanzar.
- Verificado por prueba: la invitación publicada lleva `rsvp.googleSheetUrl` /
  `hostPhone` al componente (con `modoDemo:false`) y las demos conservan la
  doble protección (`modoDemo:true` + endpoints vacíos).
- **Prueba del Web App real: PENDIENTE MANUAL** — guion completo en
  `docs/PRUEBA-MANUAL-RSVP.md` (con datos ficticios y tabla de resultados).

## Pruebas y verificación (comandos ejecutados)

- `npm test` → **93/93** (46 previas + 47 nuevas: slug/serialización/URLs/
  rutas estáticas/coexistencia, validación de activos, publicación con fetch
  simulado, contrato de backends).
- `npm run lint` → sin errores. `npm run typecheck` → sin errores.
- `npm run build` (incluye prune + verify-export + verify-privacy) → sin
  errores; se generaron `out/i/ejemplo-quince/index.html` (78.769 B) y
  `out/i/ejemplo-boda/index.html` (70.086 B); assets enlazados presentes;
  sin secretos; `out/admin/` podado; `out/uploads/` sin imágenes.
- `node scripts/mide-export.mjs` → portada 652.391 B (sin regresión frente a
  la línea base optimizada de la iteración 007).
- Inspección del HTML exportado: título/canonical/noindex correctos en
  `/i/<slug>/`; `/previsualizar/` con `noindex, nofollow` y solo datos demo.

## Decisiones y opciones descartadas

- **Colección JSON por slug** (elegida) vs. un único `invitaciones.json`:
  por-slug hace imposible sobrescribir a otro y hace diffs de commits
  revisables; el índice no hace falta porque `generateStaticParams` lee el
  directorio.
- **Publicar desde el panel vía API** (elegida) vs. solo descarga JSON:
  la API da estado real en un clic; la descarga queda como fallback sin token.
- **`noindex` en invitaciones publicadas**: son páginas de eventos privados
  compartidas por enlace; se mantiene la política de indexación conservadora
  del sitio.
- **No se retiró el botón Deploy (legado `config.ts`)**: se documenta que
  ningún componente consume ese archivo; retirarlo sería recorte de
  funcionalidad fuera del alcance.
- **No se modificaron workflows**: ya ejecutan `npm test` antes del build.

## Riesgos / puntos por verificar

- La prueba del Web App de Apps Script desplegado sigue **pendiente de
  ejecución humana** (guion listo; no se afirmó verificación externa).
- La prueba visual del flujo completo desde el panel (Publicar real contra
  GitHub y apertura del enlace generado tras el deploy) queda como
  verificación manual del propietario: este entorno no publicó nada.
- El MVP de publicación no lista invitaciones publicadas en ninguna página
  índice (decisión: las invitaciones se comparten por su enlace directo).

## Próximos pasos

1. Propietario: ejecutar `docs/PRUEBA-MANUAL-RSVP.md` y anotar resultados.
2. Propietario: publicar una invitación real desde el panel y confirmar el
   enlace tras el deploy.
3. Etapa futura (fuera de esta iteración): auditoría general de privacidad,
   limpieza de historial Git, rotación de credenciales y almacenamiento
   privado.
