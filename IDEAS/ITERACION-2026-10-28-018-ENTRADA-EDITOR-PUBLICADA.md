# Iteración 018 — El editor móvil pasa a ser alcanzable desde el sitio publicado (28-10-2026)

## Contexto

Las iteraciones 016 y 017 implementaron y publicaron el editor móvil visual
(`/editar/`): recorrer la invitación como un invitado, tocar un elemento y
editarlo en un panel contextual, con carga y publicación reales por slug y
token. Los PR #17 y #18 se fusionaron y el deploy a Pages terminó sin errores.

Aun así, la prueba del propietario mostró que **en el teléfono todo seguía
igual que antes**. La verificación del sitio publicado confirmó la causa raíz:

- `/editar/` existe y responde 200 en el sitio publicado.
- Pero **ninguna página publicada enlaza al editor**. El único enlace del
  código vive en `/admin` (botón «📱 Editor móvil»), y `/admin` no se publica
  (se poda del export por privacidad, decisión P0).
- Resultado: el editor quedó como una **isla** — solo accesible tipeando la
  URL a mano. El propietario navega el sitio como siempre (inicio → catálogo →
  personalizar) y no ve ningún cambio: exactamente lo que reportó.

Además, aun llegando a `/editar/` sin borrador previo, la pantalla muestra la
invitación de ejemplo (Valentina) y no hay nada que explique cómo conectar la
invitación real (Ajustes → «Invitación publicada» → slug + token).

## Decisión tomada

**Hacer el editor alcanzable desde el sitio publicado y guiar el primer uso.**
No se toca el flujo de publicación, la validación ni el modelo de datos: el
acceso público al editor ya fue decidido en la 017 (la protección real es el
token del propietario en `sessionStorage`, no la URL oculta).

## Cambios

1. **`src/components/personalizador-app.tsx`** — botón «✏️ Editar tocando la
   invitación» en la tarjeta de vista previa (paso 2, visible al elegir un
   diseño). Es un `<a href="/Miluaistudio/editar/">` con `onClick` que guarda
   la configuración vigente del personalizador como borrador del editor con la
   MISMA unidad `saveConfig()` que usa el propio editor: al abrir `/editar/`,
   `leerConfigGuardada()` levanta los datos de la persona, no la demo. Es una
   acción explícita del usuario, por lo que reemplaza el borrador previo del
   editor en ese navegador (documentado en el código). El enlace navega aun
   sin JS. El texto bajo los botones de la tarjeta explica qué hace.
2. **`src/components/personalizador-app.tsx` (pie)** — enlace «Editor de
   invitaciones» en el pie del personalizador.
3. **`src/app/page.tsx`** — enlace «Editor de invitaciones» en el pie del
   sitio (mismo criterio de superficie pública que la 017).
4. **`src/app/editar/page.tsx`** — franja de onboarding en la barra inferior:
   cuando la pantalla arrancó con el ejemplo base (no había borrador guardado,
   `demoPura`) y todavía no se cargó ninguna publicada en la sesión
   (`invitacionCargada`), se muestra «Esta es una invitación de ejemplo. Para
   editar la tuya: Ajustes → Invitación publicada → …». Tocarla abre Ajustes
   directamente. Desaparece al cargar la publicada o cuando hay borrador
   propio (p. ej. al venir del personalizador), que es exactamente cuando la
   guía deja de aplicar.
5. **`scripts/verify-export.mjs`** — nueva sección 7: el build FALLA si
   `index.html` o `personalizar/index.html` dejan de contener
   `href="/Miluaistudio/editar/"`. Protege contra la repetición exacta de esta
   causa raíz (editor publicado pero inalcanzable).

## Opciones descartadas

- **Enlace desde las invitaciones publicadas (`/i/<slug>/`)**: descartado.
  Los invitados no deben ver herramientas de edición; el propietario llega por
  el pie del sitio o al marcador `/editar/?slug=…`.
- **Redirigir `/personalizar` a `/editar` en móvil**: descartado. Son
  herramientas distintas (armado por formulario vs. edición directa sobre la
  invitación) y el personalizador es también la vidriera comercial.
- **Pasar los datos por URL en vez de localStorage**: descartado. La URL
  queda compartible/pegable con una configuración completa embebida; el
  borrador local con versión ya es el mecanismo del editor.

## Pruebas

- Suite completa: **127/127** (Node --test). Typecheck y lint sin errores.
- `npm run build` (incluye prune-export + verify-export + verify-privacy):
  sin errores; la nueva sección 7 reporta «enlace al editor móvil presente»
  en `index.html` y `personalizar/index.html`.
- Navegador automatizado (Chromium, viewport 390×844, `npm run dev`) —
  **emulador, no teléfono físico**:
  - Personalizar → elegir diseño → aparece el botón; escribir un nombre
    («Sebastián Test») → tocar el botón → `/editar/` abre con ese nombre en
    pantalla y en el borrador (`milu_config.evento.nombre`). Sin banner demo
    (correcto: ya hay borrador propio).
  - `/editar/` con storage limpio → franja de onboarding visible → tocarla
    abre Ajustes con la sección «Invitación publicada» (slug + Cargar
    publicada + Publicar cambios).
  - Capturas en 390 px: barra inferior sin solapamientos, sin scroll lateral.

## Pendiente de verificar en un teléfono físico

- El tap (no clic) sobre el botón del personalizador y sobre la franja.
- Que el teclado virtual no tape el campo de slug al expandir «Invitación
  publicada» en Ajustes.
- Flujo completo con token real: cargar publicada → editar → publicar →
  verificar `/i/<slug>/`.

## Riesgos

- El botón del personalizador reemplaza el borrador local del editor (acción
  explícita y con etiqueta clara); si el propietario tenía una publicada
  cargada en el editor y juega con el personalizador, debe volver a «Cargar
  publicada» para recuperar los datos reales.
- La franja de onboarding se basa en el estado de la sesión (no persiste):
  recargar la página con un borrador demo guardado ya no la muestra. Aceptado:
  en ese caso el usuario ya interactuó con el editor.
