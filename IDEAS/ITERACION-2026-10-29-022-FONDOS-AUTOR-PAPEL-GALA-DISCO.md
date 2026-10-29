# Iteración 022 — Colección «Fondos de autor» II: flores de papel + gala dorada + disco

**Fecha:** 29-10-2026 · **Rama:** `feat/fondos-autor-coleccion` (renombrada desde `feat/fondos-premium-rosas-neon`) · **Base:** main (post 021)

## Contexto

El propietario aprobó la primera tanda de fondos de autor («exelente») y aportó **tres
pines nuevos** con la instrucción «haz 3 de cada uno»:

- Pin `808114726872238485` — «Rectangle paper craft flower frame» (rawpixel): fondo rosa
  empolvado con marco rectangular de papel de bordes rasgados y rosas de papel craft en
  las esquinas, estilo scrapbook.
- Pin `1026539308835702314` — «Prom Background Ideas»: pasarela de alfombra negra con
  estrellas doradas hasta un haz de luz cenital, entre cortinas de terciopelo y bokeh.
- Pin `1036953882972631465` — «Disco Aesthetic Background»: pista de baldosas ajedrezadas
  iluminadas violeta/azul, bolas de espejo y haces de luz, ambiente de discoteca.

A diferencia de la ronda anterior, esta vez **sí se pudieron descargar las imágenes
originales de los pines** (via `i.pinimg.com/originals/…` extraído del HTML) y se usaron
como referencia visual directa.

## Qué se hizo

### 1. Arte: 9 fondos fotográficos + 36 galerías demo
- 9 imágenes 768×1344 generadas con IA a partir de las capturas de referencia, revisadas
  una por una contra el pin antes de integrarlas. Dos se regeneraron por calidad:
  `disco-espejos` (tenía personas reconocibles en primer plano → regenerada sin gente) y
  `gala-espejos` (mesas y pared dorada brillante justo donde va el titular → regenerada
  como salón vacío con pasillo central oscuro).
  - **Papel (claros):** `papel-rosado` (la más fiel al pin), `papel-crema` (champagne y
    salvia), `papel-malva` (lavanda empolvada).
  - **Gala (oscuros):** `gala-estrellas` (la más fiel al pin), `gala-cortinas` (drapeado
    dorado + bokeh), `gala-espejos` (salón de columnas, arañas y piso ajedrezado).
  - **Disco (oscuros):** `disco-pista` (la más fiel al pin), `disco-fucsia` (pista
    magenta con humo), `disco-espejos` (bola de espejo de cerca con rayos).
- Peso: ~1,4 MB (JPG progresivos q82). Galerías demo: 36 recortes 640×640 (~2,4 MB)
  con anclas verticales ajustadas por diseño (rosas arriba/abajo, bokeh, pista…).
- Scripts persistentes: `scripts/gen-fondos-022.sh` y `scripts/postprod-022.py`.

### 2. Sistema: mismos mecanismos de 021, cero código nuevo de render
- 9 presets `img-papel-*` / `img-gala-*` / `img-disco-*` en `BACKGROUND_PRESETS` con
  `image` + `position: center` y `css` de respaldo del mismo tono.
- Velo marfil de legibilidad (temas claros) y overlay de profundidad (oscuros) ya
  existentes cubren los 9 casos sin tocar CSS: la regla `data-fondo-imagen` de 021
  resuelve el contenedor de scroll y el halo del titular.
- Los 3 presets de gala y `disco-espejos` definen `storeAccent` en su diseño porque su
  `accentSoft` dorado/celeste no llega a 4.5:1 sobre blanco.

### 3. Catálogo: 9 diseños nuevos (29 en total)
- `invitation-designs.ts`: `papel-rosado` (XV · Bodas), `papel-crema` (Bodas ·
  Aniversarios), `papel-malva` (XV · Cumpleaños), `gala-estrellas` (Cumpleaños ·
  Fiestas), `gala-cortinas` (XV · Fiestas), `gala-espejos` (Bodas · Aniversarios),
  `disco-pista` (Cumpleaños · Fiestas), `disco-fucsia` (Cumpleaños), `disco-espejos`
  (Cumpleaños · Fiestas). Layouts variados (framed para los de papel: el texto cae
  dentro del marco de papel), tipografías script/serif/sans.
- `demo-config.ts`: 9 perfiles demo sintéticos (Florencia, Catalina, Guadalupe, Benicio,
  Delfina, Lorenzo, Facundo, Alma, Ignacio) con lugares ficticios (Salón Pétalos, Teatro
  Estelar, Discoteca Nébula…).
- Contadores: ya dinámicos desde 021 (`INVITATION_DESIGNS.length`) → «29 diseños
  únicos», chips «NN / 29» y CTAs se actualizaron solos.

### 4. Tests
- `tests/fondos-premium.test.ts` extendido: 19 presets con imagen (antes 10), 19 diseños
  de la colección con verificación por familias (`FAMILIAS`: florales/neón/papel/gala/
  disco), 8 claros + 11 oscuros, contraste AA de botones y etiquetas para los 29, peso
  < 400 KB por fondo.

## Pruebas

- 146/146 tests, lint 0, typecheck 0, build + prune-export + verify-export §7 +
  verify-privacy sin errores.
- Emulador Chromium 390×844 contra `out/` servido como producción:
  - Catálogo: «29 diseños únicos», chips «21 / 29»…, tarjetas nuevas con foto propia.
  - Demos `papel-rosado` (texto dentro del marco rasgado, rosas craft en esquinas,
    velo marfil legible), `gala-estrellas` (titular dorado sobre bokeh, alfombra de
    estrellas debajo) y `disco-pista` (bola de espejo arriba, «Facundo» violeta sobre
    la pista ajedrezada): todas con `data-fondo-imagen="true"`.
  - Editor → Ajustes → Fondo: los 9 swatches nuevos con miniatura; al aplicar «Pista
    Disco» el fondo cambia en vivo y el estado pasa a «CAMBIOS SIN GUARDAR».
  - HTTP 200 verificado para las 9 páginas de demo, los 9 fondos y sus galerías.
- 1280×800: grilla del catálogo con las tarjetas 21–25 en fila, etiquetas de categoría
  con `storeAccent` legibles, sin regresiones.
- Pendiente (propietario): mirar las demos en un teléfono físico.

## Decisiones y opciones descartadas

- **Regenerar en vez de maquillar:** `disco-espejos` con personas reconocibles y
  `gala-espejos` con mesas se regeneraron con prompt más estricto («no tables, no
  chairs, no people»); el costo es de minutos y evita arte descartable.
- **Cortina dorada de fondo en `gala-cortinas`:** el drapeado es uniforme y deja el
  centro limpio para el texto; no requiere regeneración.
- **Reusar `adorno: geometrico` en gala/disco:** los adornos florales chocarían con el
  estilo; el set existente cubre sin inventar variantes nuevas.
- **No tocar los 20 diseños previos** ni sus ids/presets: compatibilidad total con
  invitaciones ya publicadas.

## Riesgos / puntos por verificar

- `gala-espejos` tiene mucho detalle arquitectónico: el overlay oscuro lo compensa, pero
  es el candidato natural a regenerarse si el propietario lo ve cargado.
- Peso agregado: ~3,9 MB (fondos + galerías) sobre el artefacto de Pages; acumulado de
  la colección ~6,4 MB. Aceptado, pero conviene no extender mucho más sin paginación.
- `disco-fucsia` usa piso con patrón chevrón (no ajedrezado) por decisión del generador;
  sigue siendo fiel al estilo disco. Si molesta, regenerar.

## Próximos pasos

- Elegir favoritos entre los 19 fondos de autor y regenerar variantes puntuales si algo
  no convence.
- Si aparecen más pines modelo, el flujo ya está aceitado: pin → `originals/` → prompt →
  768×1344 → revisión → preset + diseño + perfil demo + galería.
