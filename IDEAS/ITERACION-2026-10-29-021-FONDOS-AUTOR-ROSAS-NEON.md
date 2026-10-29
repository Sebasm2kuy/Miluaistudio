# Iteración 021 — Colección «Fondos de autor»: cascada de rosas + neón 3D

**Fecha:** 29-10-2026 · **Rama:** `feat/fondos-premium-rosas-neon` · **Base:** main (post 020)

## Contexto

El usuario observó que los fondos de las invitaciones eran «demasiado simples» (gradientes
planos) y pidió incorporar al menos 5 fondos del estilo de un pin de Pinterest de marco
floral (cascada de rosas rojas/rosadas/crema sobre papel claro) y 5 del estilo de un pin
«3d Neon» (muro de bloques 3D oscuros con luz de neón magenta/naranja entre las juntas).
Ciclo completo autorizado (push → PR → merge → deploy) con el token del propietario.

## Qué se hizo

### 1. Arte: 10 fondos fotográficos generados y 10 galerías demo derivadas
- 10 imágenes 768×1344 generadas con IA a partir de los dos pines de referencia,
  revisadas una por una contra la referencia antes de integrarlas:
  - **Florales (claros):** `rosas-cascada` (cascada roja/rosada borde derecho sobre marfil,
    la más fiel al pin), `arco-rosado` (arco superior de ranúnculos), `jardin-durazno`
    (ramilletes durazno/crema), `rosas-rubi` (columna izquierda de peonías rojas sobre
    blanco), `blancas-eucalipto` (rosas blancas + eucalipto sobre rubor).
  - **Neón (oscuros):** `neon-violeta` (el más fiel al pin 2), `neon-azul`, `neon-fucsia`,
    `neon-turquesa`, `neon-dorado`.
- Peso total: ~0,9 MB (JPG progresivos ya optimizados por el generador).
- Galería demo de los 10 diseños: en lugar de generar 40 fotos nuevas, `scripts/`
  (Pillow) recorta 4 detalles con zoom del propio fondo de cada diseño → 40 JPG de
  20-40 KB coherentes con el arte (~1,6 MB en total).

### 2. Sistema: presets de fondo con imagen (compatibles hacia atrás)
- `BackgroundPreset` (admin-options.ts) gana `image?` y `position?`; `css` se conserva
  como respaldo del mismo tono mientras carga la imagen (y fallback si fallara).
- 10 presets nuevos con prefijo `img-` en `BACKGROUND_PRESETS` → aparecen solos en el
  selector «Fondo» de Ajustes (editor móvil y panel de escritorio), que ahora muestra
  la imagen en el swatch.
- `BackgroundSlideshow`: si el preset tiene imagen la dibuja con cover + posición
  configurable sobre el gradiente de respaldo.
- Velo de legibilidad para temas claros con imagen: lavado marfil sutil
  (0,55 → 0,34 → 0,38 → 0,58) tipo papel satinado; los oscuros mantienen el overlay
  de profundidad estándar.
- `CatalogScene` y `MiniInvitation` (maqueta del catálogo) también componen la imagen
  (mini con velo 0,42/0,45 para que nombre y fecha se lean).

### 3. Corrección estructural: el contenedor de scroll tapaba el fondo
- Diagnóstico con navegador: la demo mostraba el gradiente de respaldo porque
  `.invitation-experience[data-theme-mode="light"] .scroll-container` pinta
  `var(--theme-background)` opaco encima del fondo fijo.
- Fix: la raíz de la experiencia ahora expone `data-fondo-imagen="true|false"`
  (calculado desde el preset vigente) y una regla posterior pone el scroll-container
  transparente cuando hay imagen. Los temas claros SIN imagen quedan exactamente igual.
- Titular con halo claro (`text-shadow`) solo con `[data-fondo-imagen="true"]` para que
  el nombre se lea sobre las rosas.

### 4. Catálogo: 10 diseños nuevos y contadores dinámicos
- `invitation-designs.ts`: 10 diseños completos (paleta, tipografía, layout, adornos,
  maqueta, botón AA 4.5:1+, `storeAccent` donde el accentSoft no llegaba — neon-dorado).
  Categorías: florales en XV · Bodas / Bodas · XV / Bodas · Aniversarios / XV · Cumpleaños
  / Bodas; neón en Cumpleaños · Fiestas / Cumpleaños.
- `demo-config.ts`: 10 perfiles demo sintéticos nuevos (Micaela, Olivia, Antonella,
  Abril, Isadora, Thiago, Mateo, Zoe, Santiago, Emiliano) — sin datos reales.
- Contadores hardcodeados «10» → dinámicos (`INVITATION_DESIGNS.length`) en el chip
  «NN / 10» del catálogo, el H1 «10 diseños únicos» y los enlaces «Explorar los 10
  diseños» (home y personalizador).

### 5. Tests
- Nuevo `tests/fondos-premium.test.ts` (8 tests): los 10 presets con imagen existen en
  public/ y pesan < 400 KB y conservan css de respaldo; rutas canónicas; todo diseño
  referencia un preset existente; ids únicos; 5 florales + 5 neón; perfil demo propio
  por diseño (createDemoConfig refleja mockupName y fondo `gradient:<preset>`); galería
  demo completa (4 fotos) por diseño de la colección; contraste AA de buttonBg y de la
  etiqueta de categoría (accentSoft/storeAccent) sobre blanco para TODOS los diseños.

## Pruebas

- 146/146 tests (138 previos + 8 nuevos), lint 0, typecheck 0, build + prune-export +
  verify-export §7 + verify-privacy sin errores.
- Emulador Chromium 390×844 contra `out/` servido como producción:
  catálogo muestra 20 tarjetas con los fondos fotográficos (chip «11 / 20»…), demos
  `rosas-cascada` y `neon-violeta` abren con la imagen de fondo, velo y halo del
  titular funcionando, galería demo con los recortes, tarjetas glass legibles;
  `neon-azul` con countdown y dedicatoria sobre los cubos; personalizador lista los
  nuevos diseños con su maqueta; Ajustes → Fondo muestra los 10 swatches con imagen.
- 1280×800: grilla del catálogo con 5 columnas correcta, sin regresiones.
- Pendiente (propietario): mirar las demos en un teléfono físico y elegir favoritos.

## Decisiones y opciones descartadas

- **SVG dibujado a mano vs. fotografía generada:** el estilo de referencia es
  fotográfico (flat-lay real de rosas; render 3D de bloques); SVG habría quedado lejos
  del pedido. Se generó fotografía y el gradiente queda como respaldo.
- **Reutilizar la misma imagen 4× en la galería demo:** se descartó por repetitivo;
  los recortes con zoom dan 4 fotos distintas con costo cero de generación.
- **Velo fuerte homogéneo:** apagaba la fotografía; se optó por lavado sutil + halo
  solo en el titular.
- **No se tocan los 10 diseños existentes** ni sus ids/presets: compatibilidad total
  con invitaciones ya publicadas (`gradient:<id>` sigue resolviendo igual).

## Riesgos / puntos por verificar

- En teléfonos muy angostos la cascada puede dejar poco aire limpio para el titular;
  el velo + halo lo mitigan, pero conviene mirarlo en físico (pendiente del usuario).
- Peso agregado: ~2,5 MB (fondos + galerías) en el artefacto de Pages; aceptado.
- Si el propietario quiere más variantes (p. ej. neón rosa/bebé, rosas lavanda), el
  flujo de generación ya está probado: prompt → 768×1344 → revisión → copia a
  `public/catalogo/fondos/` + preset + diseño + perfil demo.

## Próximos pasos

- Elegir favoritos y, si algún fondo no convence, regenerar esa variante puntual.
- Extender la colección con más estilos de la referencia del usuario si aparece
  otro pin modelo.
