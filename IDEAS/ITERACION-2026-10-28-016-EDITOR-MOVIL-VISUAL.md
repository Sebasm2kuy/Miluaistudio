# Iteración 016 — Editor móvil visual: edición directa sobre la invitación

**Fecha:** 28-10-2026
**Tipo:** Implementación funcional (responde al requisito de la Iteración 015)
**Rama:** `feat/editor-movil-visual`
**Estado:** Implementado y verificado con pruebas automatizadas y navegador (360 / 375 / 430 / 1280 px). Pendiente de validación en teléfono físico.

## Contexto

La Iteración 015 registró el reporte del usuario: «En PC la edición funciona bien, pero desde el móvil es imposible; la mayoría de los usuarios usarán móviles». Esta iteración implementa la solución: un editor visual pensado para el teléfono donde la persona edita directamente sobre una representación de la invitación final, en lugar de llenar un formulario administrativo.

## Diagnóstico (confirmado por inspección de código)

| # | Causa | Evidencia |
|---|-------|-----------|
| C1 | La única superficie de edición era el formulario `/admin` (1.657 líneas, 12 secciones, sin vista previa integrada) | `src/app/admin/page.tsx` |
| C2 | Objetivos táctiles de 30–36 px en acciones del panel (`px-2 py-1.5 text-xs`, botones de foto `text-[10px]`) | encabezado e ImageCard del panel |
| C3 | La vista previa se abría en OTRA pestaña (`window.open('/Miluaistudio/previsualizar/')`): en el teléfono se pierde el contexto de edición | `handleVistaPrevia` |
| C4 | `InvitationExperience` era de solo lectura: no existía ninguna forma de tocar un elemento de la invitación para cambiarlo | componentes de secciones |
| C5 | Capas fijas que interfieren la manipulación directa: sobre de apertura, pantalla de carga, navegación inferior (z-100), música de fondo automática | `invitation-experience.tsx` |
| C6 | Los iframes de mapa (EventInfo) y Spotify se tragan los toques: ningún handler del documento los intercepta | `event-info.tsx`, `spotify-player.tsx` |
| C7 | Acciones propias de la invitación (RSVP, enlaces, lightbox, gesto secreto del footer) se dispararían al intentar editar | `rsvp.tsx`, `gallery.tsx`, `footer.tsx` |

## Solución implementada

### 1. Nueva ruta `/editar` (herramienta local, nunca publicada)

- Renderiza la invitación REAL (`InvitationExperience` + `ConfigProvider`) con la configuración vigente del navegador (misma fuente `localStorage` + versión que el panel de escritorio).
- **Modo Editar:** la invitación completa se recorre con scroll natural; cada elemento editable tiene un contorno dorado punteado discreto; al tocarlo se abre un *bottom sheet* con SOLO los campos de ese elemento. Los cambios se reflejan en vivo sin recargar y sin perder posición de scroll.
- **Modo Previa:** la experiencia completa del invitado (sobre, pantalla de carga, música, navegación, RSVP activo). Sin indicadores de edición. El cambio de modo re-monta la experiencia (botón segmentado de 44 px).
- **Guardar:** mismo flujo del panel (sincronización fondo ↔ galería + `saveConfig`). Indicador de «cambios sin guardar», aviso `beforeunload` en escritorio.
- **Ajustes:** panel con lo estructural sin representación directa: plantillas del catálogo (miniaturas reales, con confirmación), presets de color, colores individuales, adorno, tema claro, tipografías, modelo de reloj, estilos de tarjetas/botones, secciones prendibles, fondo (degradados o fotos), sobre/apertura, música de fondo, cronograma (agregar/quitar/editar momentos), galería (agregar foto), datos y enlaces especiales, y conexión con GitHub (token de sessionStorage, igual que el panel).
- **Publicar** sigue viviendo en `/admin` (PC): desde la barra superior hay botón de regreso al panel.

### 2. Capa de edición reutilizable (sin afectar la invitación publicada)

- `EditorProvider` (`src/components/editor/EditorProvider.tsx`): contexto que SOLO existe dentro de `/editar`. Fuera del editor `useEditorEdicion()` devuelve `null` y cada componente se comporta exactamente igual que hoy (invitaciones publicadas `/i/<slug>/`, demos, vista previa local, personalizador).
- `Editable` (`src/components/editor/Editable.tsx`): envoltorio transparente. Fuera del editor devuelve los children tal cual (sin envoltorio, sin estilo, sin eventos). En modo edición convierte la zona en botón real: captura el tap en fase temprana y bloquea la propagación (nadie interior recibe el evento; los hijos quedan con `pointer-events: none` vía CSS). Un id sin registro en el catálogo NO se vuelve interactivo (un elemento que no admite edición nunca aparenta admitirla).
- `InerteEnEdicion`: zona propia de la invitación que en modo edición queda totalmente inerte (`pointer-events: none` + atributo `inert`): el formulario de RSVP completo no puede enviarse ni enfocarse.
- `editor-campos.ts`: registro único elemento → campos (30+ elementos), con soporte de rutas `{idx}` para fotos y momentos del cronograma. Sin React para poder probarlo con node:test.
- `editor-config.ts`: actualización inmutable de la config por ruta (arrays incluidos), conversiones de fecha evento ↔ `datetime-local`.

### 3. Fotografías desde el teléfono

- `EditorImagen` reutiliza EXACTAMENTE la subida y validaciones del panel (`uploadToGitHub` + `validarArchivoImagen`, firma de bytes OBLIGATORIA del fix F-02): prevalidación de formato/tamaño, vista previa local mientras sube, estados de carga/ok/error con mensajes entendibles, y la URL del campo NO cambia si la subida falló (nunca se finge un guardado).
- Sin token: mensaje claro que dirige a Ajustes → Conexión con GitHub (verificación con la API, mismo criterio del panel).
- Alternativa manual por URL intacta.

### 4. Experiencia de escritorio preservada

- `/admin` conserva TODA su funcionalidad; solo se ajustaron objetivos táctiles (min 40 px) y se agregó el botón «📱 Editor móvil».
- `InvitationExperience` ganó un prop opcional `modoEdicion` (default `false`): ningún comportamiento cambia en páginas públicas.
- Nada de la lógica de guardado/validación/publicación se duplicó: el editor usa `saveConfig`, `sincronizarFondoConGaleria`, `uploadToGitHub` y el token de sessionStorage existentes.

### 5. Correcciones técnicas necesarias para la experiencia

- Contenedor de scroll de la invitación respeta las barras del editor (variables CSS medidas con `ResizeObserver`): ningún elemento editable queda tapado detrás de las barras.
- `visualViewport` ajusta la altura de los paneles para convivir con el teclado virtual; los cuerpos scrollean y los botones siempre quedan alcanzables.
- Iframes (mapa y Spotify) editables: el envoltorio captura el tap (con `pointer-events: none` en los hijos) en lugar del iframe.
- Desajuste de hidratación en `/admin` (preexistente: script bloqueante que mutaba `<html>/<body>`) eliminado moviendo los ajustes al montaje; `/editar` usa el mismo patrón seguro.
- `prune-export.mjs` + `verify-export.mjs`: `out/editar/` se elimina del artefacto y el build FALLA si reaparece (misma política que `/admin`).

## Archivos modificados

**Nuevos**
- `src/app/editar/page.tsx`, `src/app/editar/layout.tsx` — el editor móvil.
- `src/components/editor/EditorProvider.tsx`, `Editable.tsx`, `CampoControl.tsx`, `EditorImagen.tsx`, `PanelEdicion.tsx`, `PanelAjustes.tsx`.
- `src/lib/editor-campos.ts`, `src/lib/editor-config.ts` — registro y utilidades puras.
- `tests/editor-campos.test.ts`, `tests/editor-config.test.ts` — 13 pruebas nuevas.
- `docs/PRUEBA-MANUAL-EDITOR-MOVIL.md` — guion de validación en teléfono físico.

**Modificados**
- `src/components/invitation-experience.tsx` — prop `modoEdicion` (sobre/carga/música/navegación condicionales).
- Secciones instrumentadas con `Editable`/`InerteEnEdicion`: `hero.tsx`, `dedicatoria.tsx`, `countdown.tsx`, `event-info.tsx`, `timeline.tsx`, `gallery.tsx` (guard de lightbox), `spotify-player.tsx`, `rsvp.tsx`, `footer.tsx`, `instagram-section.tsx`.
- `src/hooks/useConfig.tsx` — nuevo export `leerConfigGuardada()` (sin cambios de comportamiento).
- `src/app/admin/page.tsx` + `layout.tsx` — enlace al editor, objetivos táctiles, hidratación corregida.
- `src/app/globals.css` — estilos del modo edición (contornos, badge, sheet, hero sin animaciones).
- `scripts/prune-export.mjs`, `scripts/verify-export.mjs` — poda y guarda de `out/editar/`.
- `tsconfig.tests.json` — incluye las nuevas librerías puras.
- `IDEAS/README.md`, `docs/ADMINISTRACION.md`, worklog del repo.

## Pruebas ejecutadas (reales)

- `npm run lint` — 0 errores, 0 warnings.
- `npm test` — **119/119** (106 previas + 13 nuevas: rutas de configuración, inmutabilidad, arrays fuera de rango, marcador `{idx}`, fechas, validez del registro completo de elementos).
- `npm run build` — 22 páginas estáticas; `out/admin/` y `out/editar/` podados; verify-export sin errores; verify-privacy sin fugas; rutas `/i/ejemplo-*` generadas.
- Navegador (Chromium headless, dev server):
  - 360 / 375 / 430 px: sin desbordamiento horizontal; barras y paneles usables.
  - Tocar «Nombre de la portada» abre el panel con el valor actual; escribir refleja el cambio EN VIVO detrás del panel.
  - «Cancelar» revierte solo el panel abierto; «Listo» conserva el cambio anterior.
  - Cambio de plantilla (Oro Real) aplicó el diseño conservando el nombre escrito (con confirmación).
  - Modo Previa: sin contornos, navegación visible, RSVP interactivo (formulario responde); modo Editar: formulario RSVP con `pointer-events: none` (inerte).
  - Foto de galería: panel con vista previa, reemplazar/quitar/agregar; sin token → «hace falta el token…»; con token falso → «Error al subir: Bad credentials» (error honesto, sin éxito fingido).
  - Guardar persiste en `localStorage` (`milu_config` + versión) y recargar /editar mantiene los cambios.
  - Regresiones: `/`, `/i/ejemplo-boda/` y `/admin` funcionan; 0 errores de consola en `/editar` y `/admin` (hidratación corregida en ambas).

## Pendiente de validación manual (teléfono físico)

Ver guion completo en `docs/PRUEBA-MANUAL-EDITOR-MOVIL.md`. En resumen: abrir `/editar` desde el teléfono (misma red local), editar cada tipo de elemento, seleccionar/reemplazar una foto REAL con el selector del sistema, abrir/cerrar el teclado virtual, verificar scroll y posición, alternar Editar/Previa, guardar y volver a abrir. NO se afirmará que la edición móvil quedó validada en dispositivo físico hasta ejecutar ese guion.

## Limitaciones y decisiones

- El token de GitHub sigue siendo necesario para subir fotos (mismo modelo que el panel): sin él, la edición de imágenes muestra el error honesto y el resto de la edición funciona igual.
- Publicar sigue en `/admin`: mantener UN solo flujo de publicación (por slug con estados reales) evita duplicar la lógica crítica. El botón «←» del editor lleva al panel.
- El arrastre NO se usa como única forma de editar nada: los paneles abren por toque y cierran por botones (el tirador del sheet es decorativo).
- El «modo demo» del footer y del RSVP no interfieren: en modo edición esas zonas quedan inertes y sus textos se editan por sus propios paneles.
