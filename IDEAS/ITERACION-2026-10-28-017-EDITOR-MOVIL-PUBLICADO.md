# Iteración 017 — El editor móvil pasa a estar publicado: editar la invitación real desde el teléfono (28-10-2026)

## Contexto

La iteración 016 implementó el editor móvil visual (`/editar`): recorrer la invitación
como un invitado, tocar un elemento y editar en un panel contextual, con modo Previa
fiel y sin degradar la experiencia de escritorio. El PR #17 se fusionó y el deploy a
GitHub Pages terminó sin errores.

Sin embargo, la prueba del propietario mostró que **en el teléfono todo seguía igual
que antes**. La causa no era de implementación del editor sino de alcance de publicación:

- `scripts/prune-export.mjs` (herencia del P0 de privacidad de `/admin`) **eliminaba
  `out/editar/` del artefacto** y `verify-export.mjs` fallaba si reaparecía. Es decir:
  el editor existía solo corriendo `npm run dev` en la compu y nunca en el sitio
  publicado, que es donde se lo necesita.
- Además, aunque se lo hubiera publicado, el flujo quedaba cortado:
  - la carga inicial venía de `localStorage` (borrador local del navegador) y no de la
    invitación real publicada (`content/invitaciones/<slug>.json`);
  - «Guardar» persistía solo el borrador local y publicar seguía en `/admin`, que
    tampoco está publicado.
- El botón «volver» del editor apuntaba a `/admin/`, que en producción devuelve 404.

## Decisión tomada

**El editor móvil se publica.** La protección real del sitio nunca fue la URL oculta:
es el token de GitHub del propietario (fine-grained PAT con `Contents: read/write`),
que se pega por sesión en el navegador y vive en `sessionStorage`. Publicar la
interfaz no expone datos ni poder de escritura:

- La ruta lleva `noindex` (ya lo traía desde la 016).
- Cargar por slug y publicar **exigen token**: sin él, la UI lo dice de forma honesta
  y no se contacta a la API.
- Un visitante sin token puede abrir el editor y jugar con un borrador en SU propio
  navegador (parte de la demo sintética); no puede leer ni escribir datos reales.
- `/admin` sigue siendo herramienta local (sigue podado del export): concentra acciones
  más amplias y es la herramienta principal de escritorio.

## Cambios

1. **`scripts/prune-export.mjs`** — ya no poda `out/editar/`; sigue podando `out/admin/`.
2. **`scripts/verify-export.mjs`** — ya no prohíbe `out/editar/`; ahora lo **exige**
   (`editar/index.html` en rutas obligatorias), para que un cambio futuro no borre el
   editor del artefacto sin que el build falle.
3. **`src/lib/carga-invitacion.ts` (nuevo)** — unidad testeable que lee
   `content/invitaciones/<slug>.json` por la API de GitHub con el token, valida la
   representación con `validarInvitacionPublicada()` y devuelve `ResultadoCarga`
   honesto (nunca lanza): slug inválido, falta token, no existe, JSON ilegible,
   formato inesperado, error de red. Reutiliza `rutaArchivoInvitacion()` y
   `validarInvitacionPublicada()`; no duplica nada del flujo de publicación.
4. **`src/lib/github-deploy.ts`** — `GITHUB_REPO` pasa a ser exportado (única fuente
   de la constante para la lectura; sin cambios de comportamiento).
5. **`src/lib/editor-campos.ts`** — nuevo panel de ajustes `custom: 'github'`
   («Invitación publicada», 🕊️).
6. **`src/components/editor/PanelAjustes.tsx`** — sección «Invitación publicada»:
   campo de slug, «Cargar publicada», «Publicar cambios» (deshabilitado sin token),
   mensajes con el estado real y enlace «Ver la invitación publicada ↗».
7. **`src/app/editar/page.tsx`**:
   - «Cargar publicada» trae la invitación real al editor (con confirmación si hay
     cambios sin guardar), la guarda como borrador y recuerda el slug
     (`localStorage`, clave `milu_editor_slug`).
   - «Publicar cambios» usa **la misma unidad validada del panel de escritorio**
     (`publicarInvitacionDesdePanel`): valida slug y token, sincroniza fondo ↔
     galería, conserva `publicadoEn` original y muestra el resultado real
     (creada / actualizada / error).
   - El slug se preselecciona desde `?slug=` en la URL (ideal para un marcador
     `/editar/?slug=mi-invitacion` en el teléfono).
   - «Guardar» queda como guardado de **borrador** (aria-label aclarado); publicar es
     una acción distinta y explícita.
   - El botón «volver al panel» ahora solo existe en desarrollo
     (`process.env.NODE_ENV === 'development'`): en producción `/admin` no existe.
8. **`src/app/editar/layout.tsx`** — comentarios actualizados (la ruta sí se publica).
9. **Tests** — `tests/carga-invitacion.test.ts` (8 pruebas, fetch simulado): validación
   previa de slug/token, URL exacta del slug normalizado, 404, error de API, JSON
   ilegible, formato inesperado, fallo de red y carga exitosa. Suite completa: 127/127.
10. **Docs** — `docs/ADMINISTRACION.md` (nuevo flujo publicado) y
    `docs/PRUEBA-MANUAL-EDITOR-MOVIL.md` (acceso desde el sitio publicado + pasos de
    carga/publicación reales).

## Opciones descartadas

- **Seguir local-only** (pedirle al propietario que corra `npm run dev` y entre por la
  IP de su compu): descartada porque no es su flujo real — la prueba del teléfono
  mostró que edita contra el sitio publicado.
- **Publicar también `/admin`**: descartado. El panel concentra acciones más amplias
  y su flujo de escritorio ya funciona de forma local; el editor móvil cubre la
  necesidad del teléfono sin ampliar la superficie administrativa.
- **Pedir el slug por prompt del navegador o guardar el slug en la URL siempre**:
  descartado por fricción; el campo vive en Ajustes y `?slug=` es opcional para
  marcadores.

## Riesgos y puntos por verificar

- La interfaz del editor es alcanzable públicamente (por diseño). Verificar en un
  teléfono real que sin token nada se puede cargar ni publicar (paso 3-5 del guion).
- El deploy de Pages corre tests + build + verificaciones: si `out/editar/` desaparece
  del artefacto, el deploy falla a propósito.
- El borrador local sigue siendo por navegador/dispositivo: editar en la compu y en el
  teléfono con el mismo slug puede pisar el borrador del otro dispositivo; la carga
  desde GitHub con confirmación es el camino de sincronización.

## Próximos pasos

- Ejecutar `docs/PRUEBA-MANUAL-EDITOR-MOVIL.md` completo en un teléfono físico.
- Considerar un aviso dentro del editor cuando el slug activo tenga cambios sin
  publicar hace mucho (higiene del borrador).
- Evaluar listar las invitaciones publicadas dentro del editor (hoy se escribe el slug
  a mano; la lista requeriría exponer el listado de slugs, decisión de producto).
