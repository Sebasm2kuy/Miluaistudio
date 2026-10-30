# Worklog - Milagros XV Invitation Website

---
Task ID: 1
Agent: Main
Task: Planificación general del proyecto

Work Log:
- Analicé el repositorio original Miluaistudio (Vite + React CDN)
- Identifiqué todas las funciones y áreas de mejora
- Definí la arquitectura del proyecto Next.js 16
- Generé 6 imágenes placeholder con AI (2 fondo + 4 galería)

Stage Summary:
- Proyecto planificado con todas las mejoras
- Imágenes generadas en `/public/fotos/` y `/public/gallery/`

---
Task ID: 2
Agent: Main
Task: Prisma schema + API route RSVP

Work Log:
- Verificado schema Prisma ya tenía modelo Rsvp
- Ejecuté `bun run db:push` para sincronizar base de datos
- Creé `/src/app/api/rsvp/route.ts` con endpoints POST y GET

Stage Summary:
- Base de datos SQLite configurada con tabla RSVP
- API funcional en `/api/rsvp`

---
Task ID: 3
Agent: Main
Task: Crear todos los componentes del sitio

Work Log:
- Creado `envelope.tsx` - Pantalla de apertura con animación framer-motion
- Creado `navigation.tsx` - Barra flotante inferior con glass morphism
- Creado `background-slideshow.tsx` - Slideshow Ken Burns con fotos
- Creado `particles.tsx` - 50 partículas doradas flotantes
- Creado `hero.tsx` - Sección hero con animación reveal
- Creado `countdown.tsx` - Cuenta regresiva interactiva
- Creado `event-info.tsx` - Detalles del evento con mapa
- Creado `gallery.tsx` - Galería con lightbox y navegación
- Creado `rsvp.tsx` - Formulario RSVP + sección colaboración
- Creado `footer.tsx` - Footer elegante

Stage Summary:
- 10 componentes creados con animaciones Framer Motion
- Diseño mobile-first con glass morphism

---
Task ID: 4-5
Agent: Main
Task: Actualizar layout, globals.css y page.tsx

Work Log:
- Layout actualizado con Google Fonts (Alex Brush, Playfair Display, Montserrat)
- Metadata SEO en español para la invitación
- globals.css con animaciones custom (kenBurns, float, shimmer, reveal)
- Colores custom: bordeaux, gold, goldLight, ivory
- page.tsx integra todos los componentes con lógica de envelope

Stage Summary:
- Página completa funcional con todas las secciones

---
Task ID: 9
Agent: Main
Task: Verificación y corrección de errores

Work Log:
- Corregido error `border-border` en globals.css
- ESLint pasó sin errores
- Dev server compilando correctamente (GET / 200)

Stage Summary:
- Sin errores de compilación ni lint

---
Task ID: 8
Agent: Main
Task: Push y deploy en GitHub

Work Log:
- Configuré git user y remote URL
- Actualicé .gitignore para proyecto Next.js
- Commit con mensaje descriptivo detallado
- Force push exitoso a GitHub

Stage Summary:
- Código subido a https://github.com/Sebasm2kuy/Miluaistudio
- Todas las imágenes incluidas en el repo

---
Task ID: 10
Agent: Main
Task: Fixes y mejoras variadas - Divider, tipeo, imports, flip countdown, calendario, shimmer hashtag, fotos regalo

Work Log:
- Agregado Divider entre Galería y Spotify en page.tsx
- Corregido "dia" → "día" en footer.tsx (tildes)
- Eliminados iconos importados sin usar en RSVP (Heart, Bell)
- Verificado "Cada" ya está en mayúscula en Timeline
- Countdown reescrito con animación flip (AnimatePresence + rotateX) y línea divisoria central
- Agregado botón "Agregar al calendario" en Countdown (Google Calendar link)
- Hashtag #MilagrosXV2026 ahora tiene shimmer dorado infinito en Footer
- Sección "Tu foto como regalo" añadida en Galería con botón para Google Form
- Build exitoso sin errores

Stage Summary:
- Countdown con flip animation premium
- Calendario Google integrado
- Hashtag con efecto shimmer dorado
- Sección de fotos regalo con esquinas decorativas doradas
- Código limpio (imports optimizados)

---
Task ID: F2-fix-preview
Agent: Main (sesión actual)
Task: La vista previa de la derecha debe acompañar el scroll en /personalizar

Work Log:
- Diagnóstico: body con overflow-x: hidden (inline en layout.tsx + regla storefront) era
  contenedor de scroll que nunca se desplaza; position:sticky quedaba anclado a él y la
  columna de vista previa se perdía al bajar.
- Fix raíz: scroll real en html (overflow-y auto) y body con overflow-x: clip + overflow-y: visible.
  Removido overflowX inline del body en layout.tsx.
- Aside del personalizador: wrapper interno con lg:max-h-[calc(100vh-7rem)] + overflow-y auto
  y scrollbar fina (.sidebar-scroll) para monitores bajos.
- PhonePreview sensible a la altura: w-[min(218px,26vh)] / sm:w-[min(248px,30vh)].
- Verificado con agent-browser: 1366x768 (sticky a 96px con scroll de 900 y 2200px, preview
  100% visible), 1920x1080, móvil 390px sin overflow-x, vista completa con sobre clásico OK,
  catálogo ahora con header sticky funcionando.
- Build de export estático OK (18 páginas). Lint falla por incompatibilidad preexistente
  de ESLint 10 con el lockfile (no afecta el deploy, que solo corre npm run build).

Stage Summary:
- Commit 3be4e35 listo en local; pendiente push (sin credenciales en este entorno).

---
Task ID: AUDITORIA-2026-10-27
Agent: Main (Z.ai)
Task: Auditoría e mejora integral (10 fases del prompt maestro)

Work Log:
- SEGURIDAD: .env y db/custom.db desrastreados (git rm --cached); eliminados
  prisma/, db/, src/lib/db.ts, examples/, mini-services/ (legado sin uso;
  @prisma/client ni siquiera estaba en package.json). .gitignore reforzado.
- ADMIN: el token de GitHub ya no se persiste en localStorage; vive en
  sessionStorage (migración automática + botón "Borrar token").
- RSVP: el frontend ya no usa no-cors ciego. GET legible con verificación
  {success:true} → ok; si el navegador bloquea la lectura → estado "pendiente"
  con confirmación por WhatsApp (nunca finge guardado); error explícito →
  reintento. Backend gallery-server.gs: GET action=rsvp validado + dedupe por
  código+teléfono + rate-limit 5/h + límites de tamaño (repo alineado al
  despliegue real, que ya aceptaba GET rsvp).
- FOTOS: photo-server.gs pasa de publicación automática a MODERACIÓN
  (carpeta Pendientes, estado pendiente, sin sharing público); MIME JPEG
  verificado server-side; galería honesta con estado "pendiente" + texto de
  consentimiento/eliminación.
- BUILD: tsc limpio (7 errores corregidos), ignoreBuildErrors eliminado,
  ESLint 10→9 (compat con eslint-config-next), lint 0 errores/0 warnings,
  validate-catalog.yml con lint bloqueante y trigger en main.
- FECHAS: src/lib/fechas.ts con offset -03:00 explícito; countdown con estados
  previo/hoy/pasado (sin ceros eternos); calendario con duración configurable
  (evento.duracionHoras, default 5) y fechas absolutas UTC.
- VISUAL: bloque oscuro .milua-neo (-8KB CSS) eliminado; paleta boutique
  marfil #FAF8F4 / carbón #292522 / champagne #B58C5A aplicada a portada,
  catálogo, personalizador y admin; fondo del body controlado por CSS (sin
  inline styles en layout.tsx); demos e invitaciones conservan su identidad.
- CONVERSIÓN: precio centralizado en src/data/precio.ts (0 hardcodes);
  testimonios marcados como "Ejemplo de referencia" hasta validación real.
- PERSONALIZADOR: validación de fecha pasada junto al campo; tarjetas e
  inputs claros; advertencia visible.
- SEO: lang es-UY, canónicos por página, OG/Twitter con og-image.jpg 1200x630
  (antes SVG que las redes no renderizan), sitemap.xml + Sitemap en robots.txt.
- PRUEBAS: build estático OK (18 rutas); verificación en navegador local de
  portada/catálogo/personalizar/demo/admin a 1366px y 320px sin overflow-x;
  flujo RSVP demo honesto; 0 errores de consola.

Stage Summary:
- 10 fases implementadas; pendiente de acción manual del dueño: (1) repegar
  gallery-server.gs y photo-server.gs actualizados en Apps Script y crear
  nueva implementación; (2) revocar/rotar tokens GitHub expuestos en chats;
  (3) datos del evento real de Milu siguen en el historial git público
  (limpieza requiere reescritura de historial → requiere autorización).

---
Task ID: CORRECCION-FINAL-2026-10-27
Agent: Main (Z.AI)
Task: Corrección final de errores de la auditoría de la web publicada (rama fix/auditoria-final-web)

Work Log:
- P0 ADMIN: /admin/ ya no se publica. `npm run build` = next build +
  scripts/prune-export.mjs (elimina out/admin/) + scripts/verify-export.mjs
  (falla el build si out/admin/ reaparece, si falta alguna ruta comercial de
  las 13, si el basePath se pierde, si hay secretos en 153+ assets o si
  vuelven imágenes personales). docs/ADMINISTRACION.md: flujo local del
  panel (PAT fine-grained en sessionStorage + cierre de sesión) o PR Git.
- P0 PRIVACIDAD: retirados de public/ el screenshot de celular (1.24 MB,
  invitación de evento real) y 3 fotos reales de uploads/ (retratos de la
  cumpleañera adolescente). .gitignore bloquea public/uploads/* salvo
  .gitkeep. Los archivos siguen en el historial de git → limpieza requiere
  reescritura de historial (pendiente de autorización del dueño).
- P1 CONTRASTE (medido WCAG): #8f867c/#a39a8e/#82786e → #787168 (4.5:1+);
  links #96714a → #8a6a44 (4.69:1); champagne de texto #b58c5a/#a8814f →
  #9a7440 (4.0:1) e iconos → #9c7443 (3.5:1); botones WhatsApp con texto
  oscuro #0b3d1e (6.23:1, antes blanco 1.98:1) conservando verde de marca;
  link verde → #0f6a2d (5.5:1); buttonBg de 7 diseños oscurecidos 4.5:1+
  (misma familia cromática); storeAccent nuevo para etiquetas de categoría
  (terracota 4.40 → #61735a 5.11:1). accentSoft intacto (temas de demos).
- P1 MINIATURAS/SEMÁNTICA: contador falso 120/14/32/05 de las maquetas →
  guiones ilustrativos aria-hidden; h3 decorativo de miniaturas → div.
  Título del personalizador sin marca duplicada (template del layout).
- P1 RSVP/FOTOS: gallery-server.gs queda SOLO RSVP (se retiraron endpoints
  de fotos sin moderación que competían con photo-server.gs). Lógica de
  contrato extraída a src/lib/contrato-backend.ts y refactor en rsvp.tsx y
  gallery.tsx: guardado/publicada solo con respuesta verificable,
  pendiente ante CORS/ilegible, error explícito. photo-server.gs ya
  moderaba (pendiente/aprobada, firma JPEG, sin setSharing al recibir).
- PRUEBAS: npm test = tsc + node --test, 19 pruebas (contrato con datos
  sintéticos, validación server-side declarada en .gs, aislamiento de
  demos). typecheck y lint 0 errores. Build + verify-export OK.
- VERIFICACIÓN NAVEGADOR (build local servido con basePath): portada y
  catálogo OK a 1366/768/320 sin overflow-x; minis con "––"; botones con
  texto oscuro; foco visible; /admin/ da 404; demos noindex; título del
  personalizador sin duplicar.

Stage Summary:
- 6 commits en rama fix/auditoria-final-web (sin push a main, sin merge).
- Pendiente humano: revisar PR; re-deploy de los 2 Apps Scripts; decidir
  limpieza de historial (imágenes + datos del evento real); verificar
  publicación de Mercado Libre externamente.

---
Task ID: audit-fix-2026-10-28
Agent: Z.AI (ingeniería frontend/seguridad/privacidad/a11y/rendimiento)
Task: Corregir los riesgos críticos pendientes (P0 config en bundles, P0 RSVP GET, P1 contraste, P1 tests en CI, P1 peso, P2 re-verificación)

Work Log:
- P0 CONFIG: medí la fuga (3 chunks públicos con literales de la plantilla
  operativa) y separé la arquitectura: config-schema.ts (solo tipos),
  config.ts como archivo operativo que NADIE importa como valor (canarios
  sintéticos únicos), demo-config.ts 100% autocontenida (CONFIG_DEMO_BASE),
  useConfig y /admin arrancan de la base de demo. verify-privacy-export.mjs
  en el build extrae los campos privados de config.ts, escanea out/ y falla
  sin revelar valores; tests/privacidad-config.test.ts custodia el grafo de
  imports y los canarios.
- P0 RSVP: nuevo src/lib/rsvp-client.ts (POST JSON en el cuerpo, text/plain
  sin preflight, timeout AbortController, redirect follow, sin no-cors) y
  rsvp.tsx sin URLSearchParams ni reintento opaco. Estados guardado/error/
  pendiente intactos; WhatsApp queda como alternativa visible en
  pendiente/error. El GET queda como legado documentado en el .gs.
- P1 CONTRASTE: token #8a6534 (5.26:1 sobre blanco, 4.96:1 marfil) reemplaza
  #9a7440 y #b58c5a en texto/bordes/badges; blanco sobre dorado 5.26:1;
  estrellas #b8860b (3.25:1); bordes de estado sólidos; foco visible.
  store-tokens.ts + tests/contraste-wcag.test.ts miden y prohíben el regreso
  de los tonos insuficientes.
- P1 CI: validate-catalog.yml y deploy.yml corren npm test; deploy.yml
  tenía el trigger corrupto "branches: ain]" (el deploy por push no podía
  dispararse) → restaurado "- main". Build documenta que incluye
  prune + verify-export + verify-privacy.
- P1 PESO: tira de 10 previews de la portada pasa de maqueta completa a
  miniatura ligera; portada 907.429 → 652.391 bytes de archivo (−28,1 %,
  método consistente en scripts/mide-export.mjs). Héroe/destacados/catálogo
  conservan la maqueta completa (decisión de identidad documentada).
- P2 REVERIFICACIÓN: out/ sin admin ni uploads con imágenes; basePath OK;
  SEO/H1/canonical/demos noindex OK; galería y RSVP sin éxitos no
  verificables; historial Git con datos operativos antiguos documentado
  (purga requiere aprobación, no se tocó).

Stage Summary:
- 46 pruebas (19 previas + 27 nuevas: RSVP simulado, privacidad, contraste)
  pass 46/46; lint y typecheck 0/0; build + verify-export + verify-privacy
  sin errores; literales de config operativa ausentes de todo out/.
- Rama fix/riesgos-criticos-pendientes → PR #14 contra main (sin merge).
- CI real del PR: run 40550777200 success (Tests/Lint/Build+verificación).
- Pendiente humano: verificar el Web App de RSVP desplegado (POST),
  revisar corridas reales de Actions, decidir purga de historial y rotación
  de credenciales históricas.

---
Task ID: 2 (iteración funcional 010)
Agent: Z.AI principal
Task: Mejoras funcionales — invitación publicada con URL propia (/i/<slug>/), carga de assets compatible con el export, integración RSVP y verificación funcional

Work Log:
- Base: main actualizada (PR #14 fusionado). Rama feat/publicacion-invitaciones-assets.
- P0 publicación: src/data/invitacion-publicada.ts (esquema 1, slug normalizado/validado con reservados, serialización pura, URLs con basePath), src/lib/invitaciones-publicadas.ts (colección content/invitaciones/*.json leída en build), ruta src/app/i/[slug]/page.tsx (generateStaticParams + dynamicParams false, metadatos noindex + canonical), /previsualizar/ (vista previa fiel del panel, noindex), publicarInvitacionEnGitHub() en github-deploy.ts (crea/actualiza el JSON del slug vía Contents API, conserva publicadoEn, estado real creado/actualizada/error).
- Panel admin: sección "Publicar invitación" (slug en vivo, Publicar, Ver vista previa, Descargar JSON publicable); sincronización galería↔fondo extraída a sincronizarFondoConGaleria().
- P0 assets: src/lib/activos-editor.ts — validación no-dependiente de accept (tamaño ≤5 MB, extensión JPG/PNG/WebP, MIME normalizado, firma real por magic bytes), nombres saneados + sufijo único, urlPublicaActivo() exacta con basePath; uploadToGitHub() sube por defecto a public/assets-invitaciones/ (la carpeta uploads/ sigue bloqueada para fotos de invitados y verify-export mantiene la regla).
- P1 RSVP: tests nuevos del intérprete de contrato (estados completos, {ok:true} legado → pendiente, wrapper HTML, arrays/vacíos); invitación publicada pasa rsvp.* con modoDemo:false; demos conservan modoDemo:true + endpoints vacíos; docs/PRUEBA-MANUAL-RSVP.md con el guion de prueba manual del Web App desplegado (pendiente de ejecución humana).
- Fixtures: content/invitaciones/ejemplo-quince.json + ejemplo-boda.json (100% ficticios, imágenes del propio catálogo).
- verify-export.mjs sección 6: out/i/<slug>/index.html por cada JSON, assets enlazados presentes, rutas i/ sin JSON declarado = fallo.
- Validación: npm test 93/93 (46+47), lint 0, typecheck 0, build con prune+verify-export+verify-privacy sin errores; out/i/ejemplo-quince (78.769 B) y out/i/ejemplo-boda (70.086 B) generadas; mide-export: portada 652.391 B sin regresión; HTML exportado con título/canonical/noindex correctos.
- Docs: ADMINISTRACION.md (flujo de publicación), IDEAS iteración 010 + índice, worklog.

Stage Summary:
- Flujo completo: panel → vista previa fiel → Publicar (estado real) → JSON por slug → página estática /i/<slug>/ verificada en el build; coexistencia y actualización sin duplicados garantizadas por diseño y por tests.
- Assets del editor en /Miluaistudio/assets-invitaciones/ con validación real; fotos de invitados siguen por moderación; out/uploads sin imágenes.
- RSVP con estados honestos; prueba del servicio externo pendiente manual (documentada, sin afirmar verificación).
- PR contra main sin fusionar; publicación real desde el panel y deploy quedan como verificación del propietario.
- CI del PR #15: run 40568830138 "Validate Miluaistudio" → success (npm ci, npm test 93/93, lint, build con verificaciones). Enlace: https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40568830138

---
Task ID: 3 (iteración 012/013)
Agent: Z.AI principal
Task: Correcciones funcionales posteriores a la auditoría — eliminar confusión del botón heredado «Deploy» (F-01) y fallo seguro si no se leen los bytes de una imagen (F-02); aceptación manual preparada

Work Log:
- Base: main actualizada (PR #15 fusionado + iteración 011). Rama fix/iteracion-012-correcciones-funcionales.
- F-01: retirado el botón «Deploy» del encabezado del panel (llamaba a deployToGitHub(), que escribe src/data/config.ts sin consumidor); sección del token renombrada a «Conexión con GitHub (token)» con texto explícito de que pegar el token no publica; handlePublicar delega en la unidad testeable publicarInvitacionDesdePanel() (src/lib/publicacion-panel.ts) que valida slug/token antes de contactar la API y devuelve el estado real vía publicarInvitacionEnGitHub(); deployToGitHub() conservada como LEGADO documentado (no se eliminó a ciegas); sincronización fondo↔galería preservada en Guardar / Ver vista previa / representación publicada; mensajes de token faltante apuntan a la sección correcta.
- F-02: uploadToGitHub() exige firma real: si file.slice(0,16).arrayBuffer() falla (rechazo o error síncrono) la subida se rechaza con mensaje entendible SIN llamar a la API de GitHub; validarArchivoImagen() mantiene bytes opcional solo para prevalidación de UI; mensajes sin detalles internos.
- Tests: +13 (tests/publicacion-panel.test.ts con guardas de UI/lib; upload con lectura rota, error síncrono de slice y MIME perfecto con bytes ilegibles — siempre cero llamadas HTTP) → 106/106.
- Docs: ADMINISTRACION.md con lista de aceptación manual de 7 pasos (todos PENDIENTES, datos 100% ficticios); PRUEBA-MANUAL-RSVP.md con verificación anti-falso-éxito en la UI; IDEAS iteración 013 + índice.
- Validación: npm test 106/106; lint 0; typecheck 0; build + prune + verify-export + verify-privacy sin errores (21 páginas, /i/ejemplo-boda y /i/ejemplo-quince generadas, out/admin podado, out/uploads sin imágenes); mide-export sin regresión (portada 652.391 B).

Stage Summary:
- El panel tiene una única acción principal de publicación (flujo por slug) con estados reales; la acción heredada ya no aparece en la interfaz y una guarda de tests impide su regreso.
- La subida real nunca valida solo por extensión/MIME: sin bytes legibles no hay subida ni llamada a GitHub.
- Sin merge, sin deploy; aceptación manual del propietario documentada y pendiente (publicación real + Web App RSVP).

---
Task ID: 5 (iteración 015/016 — editor móvil visual)
Agent: Z.AI principal
Task: Editor móvil visual e interactivo — editar la invitación tocando directamente sus elementos desde el teléfono, sin degradar la experiencia de escritorio

Work Log:
- Base: main actualizada (PR #16 fusionado + iteraciones 014/015 en IDEAS). Diagnóstico confirmado en código: única superficie de edición = formulario /admin (1.657 líneas, sin vista previa integrada), vista previa en OTRA pestaña, objetivos táctiles de 30–36 px, invitación de solo lectura, iframes de mapa/Spotify que se tragan los toques, capas fijas (sobre, carga, música, navegación) y acciones propias (RSVP, lightbox, gesto secreto) que se dispararían al editar.
- Nuevo editor visual /editar (herramienta local, podada del export igual que /admin): renderiza la invitación REAL con ConfigProvider en vivo; modo Editar (tocar elemento → bottom sheet con SOLO sus campos, cambios en vivo, posición de scroll intacta) y modo Previa (experiencia completa del invitado, sin indicadores).
- Capa reutilizable: EditorProvider (contexto que solo existe en /editar; fuera devuelve null y todo se comporta igual que hoy), Editable (envoltorio transparente que en modo edición captura el tap y bloquea interiores), InerteEnEdicion (RSVP y zonas propias quedan inertes con pointer-events none + inert), registro editor-campos.ts (30+ elementos → rutas de config con marcador {idx}) y editor-config.ts (actualización inmutable con arrays, fechas evento ↔ datetime-local).
- Secciones instrumentadas: hero, dedicatoria, countdown, event-info (mapa), timeline (por momento), gallery (por foto + guard de lightbox), spotify (reproductor/botones), rsvp (formulario inerte), footer (gesto secreto tapado), instagram.
- Fotos desde el teléfono: EditorImagen reutiliza uploadToGitHub + validarArchivoImagen (firma de bytes obligatoria del fix F-02); sin token → mensaje honesto; fallo de API → «Error al subir: Bad credentials» y la URL anterior queda intacta (nunca éxito fingido); token verificado contra la API y guardado en sessionStorage igual que el panel.
- Ajustes estructurales: plantillas del catálogo (miniaturas + confirmación, conserva el nombre escrito), presets e individuales de color, adorno, tema claro, tipografías/reloj/tarjetas/botones, secciones prendibles, fondo, sobre/música de fondo, cronograma (agregar/quitar), galería (agregar foto), datos especiales, conexión GitHub.
- Guardar = mismo flujo del panel (sincronizarFondoConGaleria + saveConfig) con indicador de cambios sin guardar y beforeunload en escritorio. Publicar sigue en /admin (botón ← regresa).
- Escritorio preservado: InvitationExperience ganó prop opcional modoEdicion (default false, cero cambios en páginas públicas); /admin solo suma el botón «📱 Editor móvil» y objetivos táctiles ≥40 px; desajuste de hidratación preexistente de /admin corregido (script bloqueante → montaje), mismo patrón seguro en /editar.
- Contenedor de scroll respeta las barras del editor (ResizeObserver → variables CSS); paneles usan visualViewport para convivir con el teclado virtual; safe-areas respetadas; sin arrastre como única vía (cierre siempre por botones).
- Poda y guarda: prune-export.mjs elimina out/editar/ y verify-export.mjs falla si reaparece.
- Tests: +13 (tests/editor-campos.test.ts: registro completo, rutas existentes en el esquema, {idx} apunta a arrays, ids usados por componentes registrados; tests/editor-config.test.ts: inmutabilidad, arrays fuera de rango sin corromper, fechas) → 119/119; lint 0; typecheck 0; build + prune + verify-export + verify-privacy sin errores (22 páginas).
- Verificación en navegador (dev server + Chromium): 360/375/430/1280 px sin desbordamiento horizontal; edición en vivo reflejada detrás del panel; Cancelar revierte solo el panel; plantilla Oro Real aplicada conservando nombre; Previa sin contornos con RSVP activo y Editar con RSVP inerte; foto sin token → «hace falta el token…», con token falso → «Error al subir: Bad credentials»; Guardar persiste y recarga conserva cambios; regresiones /, /i/ejemplo-boda/ y /admin OK; 0 errores de consola en /editar y /admin.
- CI del PR #17: run 40585640122 "Validate Miluaistudio" → success (https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40585640122).
- Docs: IDEAS/ITERACION-2026-10-28-016-EDITOR-MOVIL-VISUAL.md + índice; docs/PRUEBA-MANUAL-EDITOR-MOVIL.md (guion de 27 pasos para teléfono físico, todos pendientes del propietario); ADMINISTRACION.md referencia el editor móvil; worklog del repo.

Stage Summary:
- La edición desde el teléfono ahora es directa y visual: recorrer la invitación, tocar un elemento, cambiarlo y seguir sin perder el lugar; la vista previa es la experiencia real del invitado; ninguna acción propia de la invitación se dispara mientras se edita.
- La experiencia de PC no perdió capacidades: /admin sigue intacto (objetivos táctiles más grandes y enlace al editor) y toda la lógica de guardado/validación/publicación es la MISMA, sin duplicación.
- Pendientes del propietario: ejecutar docs/PRUEBA-MANUAL-EDITOR-MOVIL.md en un teléfono físico (con y sin token) y aceptar el PR; sin merge ni deploy hasta autorización explícita.

---
## Iteración 017 — El editor móvil pasa a estar publicado (fix/editor-movil-publicado)

**Problema reportado:** «No cambió nada: la edición por móvil se sigue viendo exactamente igual a antes» tras fusionar el PR #17. Causa real verificada: el PR sí se fusionó y el deploy terminó, pero `prune-export.mjs` (herencia del P0 de privacidad de /admin) eliminaba out/editar/ del artefacto estático → la ruta /editar/ daba 404 en producción y el editor solo existía en `npm run dev`. Además el flujo quedaba corto incluso publicado: la carga venía de localStorage y publicar vivía en /admin (que tampoco está publicado).

**Cambios:**
- prune-export.mjs ya no poda out/editar/ (sigue podando out/admin/); verify-export.mjs ahora EXIGE editar/index.html en el artefacto.
- src/lib/carga-invitacion.ts (nuevo): leer la invitación real content/invitaciones/<slug>.json por la API de GitHub con token; validación con validarInvitacionPublicada(); ResultadoCarga honesto, nunca lanza; fetch inyectable.
- src/lib/github-deploy.ts: GITHUB_REPO exportado (sin cambios de comportamiento).
- PanelAjustes: nueva sección «Invitación publicada» (slug + «Cargar publicada» + «Publicar cambios», deshabilitado sin token, mensajes reales, enlace «Ver la invitación publicada ↗»).
- /editar/page.tsx: carga real por slug (con confirmación si hay cambios sin guardar), publicación por publicarInvitacionDesdePanel() — la MISMA unidad validada del panel de escritorio (conserva publicadoEn, sincroniza fondo↔galería, estados reales); slug persistente (localStorage) y ?slug= para marcadores; «Guardar» aclarado como borrador; botón «volver al panel» solo en dev (en producción /admin no existe).
- Tests: +8 (tests/carga-invitacion.test.ts, fetch simulado) → 127/127; lint 0; typecheck 0; build + prune + verify-export + verify-privacy sin errores.
- Verificación del artefacto con navegador (Chromium, 390 px, sobre out/ servido como producción): /editar/ carga sin errores de página, todos los elementos editables registrados, sección «Invitación publicada» operativa, «Publicar cambios» deshabilitado sin token, «Cargar publicada» sin token → «Falta el GitHub Token…» (honesto), Previa/Editar alternan bien, sin desbordamiento horizontal (390=390).
- Docs: ADMINISTRACION.md (Opción A = editor publicado con marcador ?slug=), PRUEBA-MANUAL-EDITOR-MOVIL.md (acceso publicado + pasos 28-33 de carga/publicación real), IDEAS/ITERACION-2026-10-28-017-EDITOR-MOVIL-PUBLICADO.md + índice.

**Decisión de privacidad (documentada):** el editor se publica como interfaz; la protección real sigue siendo el token del propietario (no la URL oculta). Sin token, un visitante solo puede jugar con el borrador demo de su propio navegador; no puede leer ni escribir datos reales. /admin sigue podado del export.

---
## Iteración 018 — El editor móvil pasa a ser alcanzable desde el sitio publicado (fix/editor-movil-entrada-publicada)

**Problema reportado:** «la versión de editar la invitación por móvil sigue igual, no cambió nada» tras fusionar los PR #17 y #18. Verificación del sitio publicado: /editar/ existe (HTTP 200) y el deploy de Pages se ejecutó con el último commit de main, pero NINGUNA página publicada enlaza al editor — el único enlace del código vive en /admin (podado del export). El editor quedó como una isla: solo accesible tipeando la URL a mano. Además, al llegar sin borrador la pantalla muestra la demo de ejemplo sin explicar cómo conectar la invitación real.

**Cambios:**
- src/components/personalizador-app.tsx: botón «✏️ Editar tocando la invitación» en la tarjeta de vista previa — guarda la configuración vigente con la MISMA saveConfig() del editor y navega (enlace real <a>, funciona sin JS); el editor levanta los datos con leerConfigGuardada() → se edita LO CARGADO, no la demo. Enlace «Editor de invitaciones» en el pie del personalizador.
- src/app/page.tsx: enlace «Editor de invitaciones» en el pie del sitio (superficie pública ya decidida en la 017).
- src/app/editar/page.tsx: franja de onboarding en la barra inferior cuando la pantalla arrancó con el ejemplo base (demoPura) y no se cargó ninguna publicada en la sesión; tocarla abre Ajustes (donde vive «Invitación publicada» → slug + token + Cargar publicada/Publicar cambios). Desaparece al cargar la publicada o con borrador propio (p. ej. viniendo del personalizador).
- scripts/verify-export.mjs: nueva sección 7 — el build FALLA si index.html o personalizar/index.html dejan de contener href="/Miluaistudio/editar/" (protege contra repetir esta causa raíz exacta).
- Docs: IDEAS/ITERACION-2026-10-28-018-ENTRADA-EDITOR-PUBLICADA.md + índice; PRUEBA-MANUAL-EDITOR-MOVIL.md con pasos 0a-0c (llegar al editor desde el sitio publicado).

**Pendientes del propietario:** ejecutar los pasos 0a-0c + 28-33 de docs/PRUEBA-MANUAL-EDITOR-MOVIL.md en un teléfono físico.

---
## Iteración 019 — El botón «Editar tocando la invitación» pasa a ser visible en el móvil (fix/boton-editor-movil-paso-1)

**Problema reportado:** en PC se ve el botón «Editar tocando la invitación» en la tarjeta de vista previa que se desplaza a la derecha; en el móvil «no se llega a ver». Causa: el botón vive en el `aside` del paso 2 con `lg:sticky`; en pantallas < lg la grilla colapsa y ese aside cae al FINAL de todo el formulario (datos, frase, música, cronograma, secciones, estilo + paso 3), varias pantallas hacia abajo. El botón existía y funcionaba (PR #19 publicado y verificado en el HTML de Pages), pero quedaba inalcanzable en la práctica.

**Cambios:**
- src/components/personalizador-app.tsx: nueva tarjeta en el paso 1, debajo de «Elegiste {diseño}…» y encima del paso 2, con `lg:hidden` — solo pantallas chicas. Reutiliza el mismo mecanismo: `<a href={EDITOR_URL} onClick={editarSobreInvitacion}>` (saveConfig antes de navegar, funciona sin JS). Texto de apoyo de una línea. En PC no se duplica (allí está el de la columna pegajosa).
- Docs: IDEAS/ITERACION-2026-10-28-019-BOTON-EDITOR-VISIBLE-MOVIL.md + índice; paso 0b del guion manual actualizado con la nueva ubicación.

**Pruebas:** 127/127 tests, lint OK, typecheck OK, build OK (verify-export §7 intacto). Emulador 390×844: la tarjeta aparece al elegir diseño sin scroll previo y abre /editar/ con los datos cargados; 1280×800 sin regresión. Pendiente: teléfono físico (paso 0b).

---
## Iteración 020 — Importar el pedido por WhatsApp (feat/importar-pedido-whatsapp)

**Necesidad:** el mensaje que el cliente manda con «Enviar mi configuración» llegaba como texto y había que re-copiar los datos a mano. Ahora se importa: Ajustes → «Importar pedido por WhatsApp» → pegar el mensaje → «Leer el mensaje» (vista previa con ✓ por campo y ⚠ por avisos honestos: historia recortada a ~90 caracteres, sin fecha, tonos no reconocidos) → «Cargar en la invitación» reemplaza el borrador por la misma vía del puente personalizador→editor (createPersonalConfig + saveConfig). Publicar sigue exigiendo el token del propietario.

**Cambios:** src/lib/importar-whatsapp.ts (parser tolerante a negritas/viñetas/«—»/comillas, nunca lanza) + PanelImportarWhatsApp.tsx + panel primero en PANELES_AJUSTES + props onImportarLeer/onImportarAplicar en PanelAjustes + callbacks en editar/page.tsx. Imports relativos en el cierre incluido en la suite de Node (convención editor-campos) y guardia de privacidad de la demo ampliado a alias o relativo (misma intención).

**Pruebas:** 138/138 tests (11 nuevos, incluido round-trip mensajeWhatsAppPersonal → importador), lint/typecheck/build OK, verify-export §7 y verify-privacy intactos. Emulador 390×844: mensaje real pegado → 15 campos leídos, 0 avisos → cargar → editor muestra la invitación con todos los datos y borrador persistido. Pendiente: mensaje real recibido por WhatsApp (paso 0d del guion).

---
## Iteración 021 — Colección «Fondos de autor»: cascada de rosas + neón 3D (feat/fondos-premium-rosas-neon)

**Pedido:** los fondos eran «demasiado simples» (gradientes planos). Incorporar al menos 5 fondos del estilo del pin de Pinterest de marco floral (cascada de rosas sobre papel claro) y 5 del pin «3d Neon» (bloques 3D oscuros con neón entre las juntas).

**Cambios:**
- Arte: 10 fondos fotográficos 768×1344 generados con IA y revisados uno por uno contra los pines (5 florales claros: rosas-cascada, arco-rosado, jardin-durazno, rosas-rubi, blancas-eucalipto; 5 neón oscuros: violeta, azul, fucsia, turquesa, dorado) en public/catalogo/fondos/ (~0,9 MB). Galerías demo de los 10 diseños generadas recortando 4 detalles del propio fondo (40 JPG, ~1,6 MB).
- Sistema: BackgroundPreset gana image?/position? (css queda de respaldo); 10 presets img-* nuevos; BackgroundSlideshow, CatalogScene y MiniInvitation componen la imagen; velo marfil de legibilidad en claros con imagen + halo en el titular; swatches del selector «Fondo» (editor móvil y admin) muestran la imagen.
- Fix estructural: el scroll-container de temas claros pintaba var(--theme-background) opaco y tapaba el fondo fijo; ahora la experiencia expone data-fondo-imagen y el contenedor pasa a transparente solo cuando el preset tiene imagen (temas claros sin imagen: idénticos a antes).
- Catálogo: 10 diseños nuevos completos con perfiles demo sintéticos y categorías nuevas «Cumpleaños · Fiestas»/«Bodas»; contadores «10» → INVITATION_DESIGNS.length (chip NN/20, H1 y enlaces «Explorar los N diseños»).
- Tests: tests/fondos-premium.test.ts (8): archivos y peso de fondos, rutas canónicas, presets existentes, ids únicos, 5+5, perfil demo por diseño, galería demo completa, contraste AA de botones y etiquetas de categoría.

**Pruebas:** 146/146 tests, lint 0, typecheck 0, build + prune + verify-export §7 + verify-privacy OK. Emulador 390×844: catálogo con 20 tarjetas fotográficas, demos rosas-cascada/neon-violeta/neon-azul con imagen de fondo, velo, halo, galería y tarjetas glass legibles; personalizador y Ajustes → Fondo con los nuevos swatches. 1280×800 sin regresiones. Pendiente: revisión del propietario en teléfono físico y elección de favoritos.

---
## Iteración 022 — Colección «Fondos de autor» II: flores de papel + gala dorada + disco (feat/fondos-autor-coleccion)

**Pedido:** el propietario aprobó la primera tanda («exelente») y aportó 3 pines nuevos con «haz 3 de cada uno»: marco de flores de papel craft (rosa empolvado, scrapbook), «Prom Background» (alfombra negra con estrellas doradas, cortinas, focos) y «Disco Aesthetic» (pista ajedrezada violeta/azul con bolas de espejo). Esta vez se descargaron las imágenes originales de los pines (i.pinimg.com/originals) y se usaron como referencia directa.

**Cambios:**
- Arte: 9 fondos 768×1344 generados con IA y revisados contra cada pin; 2 regenerados por calidad (disco-espejos tenía personas reconocibles; gala-espejos tenía mesas y pared brillante al centro). ~1,4 MB en public/catalogo/fondos/. 36 galerías demo (recortes con anclas por diseño, ~2,4 MB).
- Sistema: 9 presets img-papel-*/img-gala-*/img-disco-* con image + css de respaldo; cero código de render nuevo (velo marfil, overlay, data-fondo-imagen y halo de 021 cubren los 9). storeAccent en gala-estrellas/gala-cortinas/gala-espejos/disco-espejos (accentSoft no llega a 4.5:1 sobre blanco).
- Catálogo: 9 diseños nuevos (29 en total) con layouts variados — framed en los de papel para que el texto caiga dentro del marco — y 9 perfiles demo sintéticos (Florencia, Catalina, Guadalupe, Benicio, Delfina, Lorenzo, Facundo, Alma, Ignacio). Contadores dinámicos de 021 se actualizaron solos.
- Tests: fondos-premium.test.ts extendido a 19 presets con imagen, verificación por familias (florales/neón/papel/gala/disco), 8 claros + 11 oscuros.

**Pruebas:** 146/146 tests, lint 0, typecheck 0, build + prune + verify-export §7 + verify-privacy OK. Emulador 390×844: catálogo «29 diseños únicos», demos papel-rosado/gala-estrellas/disco-pista con fondo fotográfico y texto legible, editor Ajustes → Fondo con los 9 swatches nuevos y aplicación en vivo («Pista Disco» → CAMBIOS SIN GUARDAR + data-fondo-imagen=true). HTTP 200 en las 9 demos, fondos y galerías. 1280×800: tarjetas 21–29 correctas. Pendiente: revisión del propietario en teléfono físico.
---
## Iteración 023 — Nombres de mujeres en los modelos de muestra de 15 años (fix/nombres-muestra-mujeres)

**Pedido:** «a los modelos de muestra que sean para 15 años pon nombres de mujeres no de varones». Los 19 diseños de la colección «fondos de autor» (021/022) incluían 8 maquetas masculinas (Thiago, Mateo, Santiago, Emiliano, Benicio, Lorenzo, Facundo, Ignacio).

**Cambios:**
- invitation-designs.ts: 8 mockupName femeninos (Morena, Jazmín, Celeste, Ariana, Luna, Regina, Malena, Violeta); los 6 de fiesta «Mis 18» pasan a «Mis XV años» (producto real = quinceañeras); los 2 «Gran Cumpleaños» (30/50) conservan tipo con nombre de mujer. Categorías y fechas sin tocar; nombres ≤7 caracteres no activan la escala de nombres largos de la maqueta.
- demo-config.ts: 8 DEMO_PROFILES alineados (nombre, apodo, tipo, hashtag #NombreXV2027, horario 21:00); lugar «Club Neon» corregido a «Club Neón».
- tests/nombres-muestra.test.ts (nuevo, 4 tests): lista cerrada de 22 nombres femeninos aprobados para XV, unicidad de mockupName en el catálogo, hashtag XV con patrón #NombreXVAño, perfiles demo de fiesta alineados con la maqueta.
- Docs: IDEAS/ITERACION-2026-10-29-023-NOMBRES-MUESTRA-MUJERES.md + índice.

**Pruebas:** 150/150 tests (4 nuevos), lint 0, typecheck 0, build + prune + verify-export §7 + verify-privacy OK. Emulador 390×844: personalizador con los 8 nombres nuevos y cero «Mis 18»; demos neon-violeta (Morena · Mis XV años · #MorenaXV2027) y disco-pista (Malena, sin rastro de Facundo). 1280×800: grilla del paso 1 sin los 8 nombres viejos (búsqueda insensible a mayúsculas). Pendiente: revisión del propietario en teléfono físico.
---
## Iteración 024 — Música directa desde Spotify + servicios extra «próximamente» (feat/spotify-directo-servicios)

**Pedido:** (1) «la musica quita los tonos que creaste para que sea una eleccion directa desde spotify»; (2) analizar invitio.events#planning y «sin copiar todo textual» hacer que el sitio se vea más funcional presentando álbum digital, edición de video, video de recopilación para historia de vida y tráilers — sección a desarrollar en un futuro próximo.

**Cambios música:**
- Fuera el sistema de tonos completo: src/lib/musica.ts, musica-fondo.tsx (botón flotante), config.musicaFondo (schema + editor-campos + importador WhatsApp), 10 MP3 de public/audio (−5,4 MB), línea «Música de fondo» del mensaje de WhatsApp. Ajustes del editor: «Sobre y música de fondo» → «Sobre y apertura».
- Personalizador: nuevo panel «Tu música, directo desde Spotify» con feedback en vivo (✓ Reconocido / aviso rojo con instrucción) y reproductor embebido de previsualización idéntico al del invitado; nota honesta: Spotify reproduce con toque (sin autoplay).
- invitacion: la sección de música (SpotifyPlayer) queda como única música; `spotifyEmbedUrl` con tests propios.

**Cambios servicios:**
- src/data/servicios.ts (nuevo): álbum digital, edición de video, video de tu historia, tráiler del evento — textos 100% propios, 3 puntos por servicio.
- page.tsx: sección #servicios (2×2, badge «Próximamente», CTA WhatsApp con MENSAJE_SERVICIOS_EXTRA, nota «nada de esto se cobra todavía»), FAQ nueva («¿También hacen álbum de fotos o videos…?») y enlace «Próximamente» en el pie.

**Tests:** tests/servicios-spotify.test.ts (5 nuevos: embed de playlist/álbum/tema/show/episodio ± ?si/protocolo, ajenos→null, integridad de servicios, CTA, demo sin restos de tonos); importar-whatsapp.test.ts sin musicaFondo + mensaje antiguo con «Música de fondo» importa en silencio; editor-campos.test.ts fixture limpio.

**Pruebas:** 156/156 tests, lint 0, typecheck 0, build + prune + verify-export §7 + verify-privacy OK. Emulador 390×844: personalizador sin tonos, enlace Spotify válido → preview montada, YouTube → aviso honesto; demo rosa-romantica sin botón flotante y #musica con iframe Spotify. 1280×800: #servicios con 4 tarjetas + badge + CTA. Pendiente: revisión del propietario en teléfono físico.

---
## Iteración 025 — Portada nueva: menús «próximamente», carrusel en celular y servicios desplegables (feat/home-carrusel-menus)

**Pedido:** «las secciones proximamente tienen que estar visibles arriba como menus y al abrir despliegue el proximamente»; capturas de invitio.events como guía visual (sin copiar textos); «sobre todo el carrusel de pasando los modelos de invitacion como vista desde un movil».

**Cambios:**
- src/data/navegacion.ts (nuevo): ITEMS_NAV fuente única (Invitaciones, Álbum digital, Videos, Historia de vida, Tráiler, Preguntas) + SECCIONES_PORTADA; los 4 servicios con ancla #servicio-<id>.
- src/components/store-nav.tsx (nuevo, cliente): encabezado con nav completa en escritorio (chip «pronto» en servicios) y menú hamburguesa móvil con los mismos ítems + CTAs; cierra al navegar y con Escape.
- src/components/carrusel-modelos.tsx + src/lib/carrusel.ts (nuevos): reemplaza la tira de 10 miniaturas por un mazo de 29 diseños dentro de maqueta de celular (notch + reflejo), swipe táctil, vecinos tocables, flechas, puntos solo en pantallas anchas + contador N/29 en móvil, teclado ←/→, autoplay 5 s pausable (interacción/pestaña oculta/reduced-motion), CTAs «Ver demostración» y «Personalizar el mío» del diseño actual.
- src/components/servicios-extras.tsx (nuevo, cliente): tarjetas «próximamente» en acordeón; hash #servicio-<id> (menú/enlaces/recarga) expande + pulso dorado 2,8 s + re-encuadre; CTA por servicio «Avisame cuando esté listo».
- page.tsx: header → StoreNav; badge del héroe ahora verde «Se comparte por WhatsApp, sin instalar nada»; píldoras de servicios bajo el héroe; sección #coleccion con el carrusel; #servicios usa el acordeón; FAQ con id #faq.
- globals.css: servicioAbre (despliegue), pulsoDorado (destacado), guardas prefers-reduced-motion.
- tests/portada-carrusel-nav.test.ts (nuevo, 4 tests): menú↔servicios 1:1, anclas existentes, carrusel circular y posiciones, colección con ids/nombres únicos.

**Pruebas:** 160/160 tests (4 nuevos), lint 0, typecheck 0, build + prune + verify-export §7 + verify-privacy OK. Emulador 390×844: menú móvil con servicios «pronto», tap «Álbum digital» despliega, hash #servicio-trailer-evento expande con pulso, swipe 18→19. 1280×800: nav con chips, «Historia de vida» despliega con pulso, carrusel con flechas + 29 puntos en una fila, flecha 9→10. Fix del E2E: maqueta del carrusel colapsaba a 0 px (ancho explícito). Pendiente: revisión del propietario en teléfono físico.

---
## Iteración 026 — Migración al dominio raíz lumengala.site (feat/dominio-raiz-lumengala)

**Pedido:** «actualices todas las rutas absolutas y referencias para que funcionen en mi nuevo dominio raíz (lumengala.site), antes montado en el subdirectorio /Miluaistudio/ de GitHub Pages» — CSS, scripts, imágenes/logos, enlaces internos, fetch/API.

**Hallazgo clave:** lumengala.site ya respondía 200 vía GitHub Pages (DNS y dominio personalizado ya configurados); el sitio se veía roto porque el build servido todavía tenía el prefijo /Miluaistudio/.

**Cambios:**
- next.config.ts: fuera basePath (sitio en la raíz del dominio propio); trailingSlash se conserva.
- ~90 rutas re-ancladas a la raíz en src/ (enlaces, router.push, window.open, escenas/fondos/galerías, loading-screen, store-nav, carrusel, personalizador, footer, admin/editar/catalogo).
- Metadatos SEO: metadataBase, canonicals, OG y Twitter → https://lumengala.site/…; icons en raíz; robots.txt y sitemap.xml migrados.
- Publicación: BASE_PATH='' en invitacion-publicada.ts y activos-editor.ts → /i/<slug>/ y /assets-invitaciones/<archivo>; ORIGEN_PUBLICO=lumengala.site; BASE_PATH muerta eliminada de github-deploy.ts. Las URLs de la API de GitHub (rutas de repo) no se tocan.
- content/invitaciones/ejemplo-boda.json y ejemplo-quince.json: URLs embebidas migradas (si no, galerías 404 en el dominio nuevo).
- public/CNAME (nuevo) con lumengala.site; scripts/verify-privacy-export.mjs con allowlist de rutas raíz.
- verify-export §3 reescrito como prueba de regresión: el build FALLA si reaparece src|href|content="/Miluaistudio… o una URL absoluta con /Miluaistudio/ en index/catalogo/personalizar/editar; §6 valida assets con rutas raíz; §7 exige href="/editar/".
- Tests actualizados (invitacion-publicada, activos-editor, publicacion-panel, publicacion-github, fondos-premium, rsvp-contrato) a las URLs raíz; docs vivos (ADMINISTRACION, PRUEBA-MANUAL-EDITOR-MOVIL) con las URLs nuevas.

**Pruebas:** 160/160 tests, lint 0, typecheck 0, build + prune + verify-export + verify-privacy OK. Artefacto sin ninguna referencia /Miluaistudio/ en HTML clave (solo marca textual). Servidor local en raíz: /, /editar/, /catalogo/, /i/ejemplo-quince/, chunk _next, imagen y sitemap → 200. Emulador 390×844 y 1280×800: 0 errores de consola, 0 imágenes rotas, menús «pronto» y carrusel operativos; los 6 enlaces restantes con «Miluaistudio» son textos de marca en wa.me (correctos). Pendiente: revisión del propietario en lumengala.site desde el teléfono físico.

---
## Iteración 027 — Transición definitiva de marca: Lumen Gala (feat/lumen-gala-marca)

**Pedido:** identidad de marca nueva en el código fuente: (1) texto del logotipo del header «MILUAISTUDIO» → «LUMEN GALA» con tipografía elegante; (2) favicon del <head> apuntando al icono en la raíz (favicon.ico); (3) títulos y meta tags con Lumen Gala; (4) menú superior y botones principales sin errores de ruta en lumengala.site. Se adjuntaron favicon.ico (monograma LGS dorado) y Logo.jpg de referencia.

**Cambios:**
- public/favicon.ico (nuevo, monograma LGS 16/32/48) + public/apple-touch-icon.png (180×180, generado del Logo.jpg); public/logo.svg eliminado (era un logo «Z» de plantilla, ajeno a la marca). El sello de lacre deja de usarse como icono.
- layout.tsx: title «Lumen Gala | Invitaciones digitales personalizadas», template «%s | Lumen Gala», keywords +Lumen Gala/LGS, icons → favicon.ico + apple-touch-icon.png, OG/Twitter/siteName/alt con la marca nueva.
- «LUMEN GALA» y «© Lumen Gala» en headers/pies: store-nav, page.tsx, catalogo/page.tsx, personalizador-app.tsx (+aria-labels) y el texto vertical del ticket «ADMITE UNO» de aperturas.tsx.
- Metadatos por página: personalizar, catalogo/layout, catalogo/[designId], i/[slug] (títulos, keywords, siteName, alts).
- Textos de WhatsApp con «Lumen Gala»: contacto.ts, servicios.ts, servicios-extras.tsx, firma del pedido (personalizador.ts) y placeholder del importador.
- verify-export: §2 exige favicon.ico + apple-touch-icon.png; §8 NUEVA guarda de marca — el build falla si el <title> de la portada dice «Miluaistudio», no menciona «Lumen Gala» o falta el <link rel="icon" href="/favicon.ico">.
- Compatibilidad: el importador sigue aceptando pedidos históricos firmados «web de Miluaistudio» (fixtures conservados a propósito); la marca no es parte del formato de datos.
- Se conservan las referencias al nombre del REPO (GITHUB_REPO, api.github.com, ayuda de tokens): son rutas de API reales, no de web.

**Pruebas:** 163/163 tests (3 nuevos en tests/marca-lumen-gala.test.ts), lint 0, typecheck 0, build + prune + verify-export (§2+§8) + verify-privacy OK. E2E móvil 390×844: header «LUMEN GALA», pie «© 2026 Lumen Gala», menú con chips «pronto», tap «Álbum digital» despliega, /catalogo/ y /personalizar/ con títulos «| Lumen Gala». E2E 1280×800: nav completa, logo en Playfair Display tracking 1.2 px, demo «Rosa Romántica · Lumen Gala», chunk del ticket con «LUMEN GALA», /editar/ carga sin errores de consola. favicon.ico servido 200 con type image/vnd.microsoft.icon. Pendiente: revisión del propietario en teléfono físico (favicon en pestaña + preview de WhatsApp puede demorar por caché).

---
## Iteración 028 — Isotipo oficial LGS en el encabezado (feat/isotipo-lgs-header)

**Pedido:** quitar por completo el corazón del header y poner en su lugar el isotipo oficial (rombo dorado LGS) antes del texto «LUMEN GALA», limpio, alineado y a 32-40 px.

**Cambios:** public/logo-lgs.png (nuevo, recorte centrado 240×240 del Logo.jpg para nitidez retina); los 3 headers de la tienda (store-nav, catalogo/page, personalizador-app) cambian el círculo con corazón de lucide por la imagen del isotipo con rounded-lg + anillo dorado fino + sombra suave, mismos tamaños (36→40 px, sin cambios de layout); alt vacío decorativo (el aria-label vive en el enlace); imports de Heart limpiados donde ya no se usa (se conserva en el label «Mi historia»). Favicon y ticket de aperturas sin cambios.

**Pruebas:** 163/163 tests, lint 0, typecheck 0, build + verify-export OK. E2E raíz: /logo-lgs.png 200 image/png; logo render 36-40 px alineado con el texto; capturas móvil (390×844) y PC catálogo (1280×800) verificadas visualmente — rombo dorado nítido y legible en miniatura, sin corazón.

---
## Iteración 029 — Tarjeta de WhatsApp con la marca LGS (feat/og-marca-lgs)

**Pedido:** og:title «Lumen Gala Studio | Invitaciones web de alta gama»; og:description «Experiencias digitales personalizadas para 15s, bodas y eventos únicos. Música, RSVP y cuenta regresiva en un solo enlace.»; og:image con la imagen oficial LGS (rombo dorado sobre fondo oscuro) en una URL completamente NUEVA para forzar a WhatsApp a refrescar su caché; <title> «Lumen Gala | Invitaciones digitales».

**Cambios:** public/lgs-preview.jpg (nueva, 1200×630: rombo LGS extraído con alfa R−B flotando sobre el fondo oscuro del logo + LUMEN GALA en serif dorada + «INVITACIONES WEB DE ALTA GAMA»; la vieja og-image.jpg con la tarjeta «Milagros XV» se elimina); layout.tsx (title.default, openGraph y twitter completos); catalogo/layout.tsx y catalogo/[designId]/page.tsx → lgs-preview.jpg; verify-export §2 exige lgs-preview.jpg y §8 valida og:title LGS + og:image exacta nueva; verify-privacy allowlist actualizada.

**Pruebas:** 163/163 tests, lint 0, typecheck 0, build + verify-export (§2+§8) + verify-privacy OK. Local sobre out/: título/og:title/og:description exactos, og:image = https://lumengala.site/lgs-preview.jpg, asset 200 image/jpeg 58 686 bytes, og-image.jpg 404. Tarjeta visual verificada (sin tile cuadrado, textos centrados). Pendiente: reenviar el enlace por WhatsApp para ver la tarjeta nueva (URL nueva obliga re-rastreo).

---
## Iteración 030 — Héroe de portada con modelos de impacto, sin precios ni ML (feat/heroe-impacto-sin-ml)

**Pedido:** en la imagen estática del héroe usar un modelo más llamativo y de más impacto; quitar los precios y la opción de comprar por Mercado Libre.

**Cambios:** page.tsx — héroe ahora con Gala Estrellada (principal, móvil y PC) y Pista Disco (secundaria del collage desktop); fuera la línea de precio del héroe, el botón «Comprar por Mercado Libre» (desktop), «Compralo en Mercado Libre» (móvil), «Ver publicación» (CTA) y «Comprar» (pie); FAQ «¿Cuánto cuesta?» ahora deriva a WhatsApp sin cifras; imports sin uso limpiados. El catálogo conserva precio/ML (no se pidió).

**Pruebas:** 163/163 tests, lint 0, typecheck 0, build + verify-export + verify-privacy OK. E2E PC 1280×800 y móvil 390×844: collage con Gala Estrellada + Pista Disco, sin rastros de ML/precio, consola limpia. out/index.html sin «Mercado Libre» ni «1.200».
