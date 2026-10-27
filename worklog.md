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
- Docs: IDEAS/ITERACION-2026-10-28-016-EDITOR-MOVIL-VISUAL.md + índice; docs/PRUEBA-MANUAL-EDITOR-MOVIL.md (guion de 27 pasos para teléfono físico, todos pendientes del propietario); ADMINISTRACION.md referencia el editor móvil; worklog del repo.

Stage Summary:
- La edición desde el teléfono ahora es directa y visual: recorrer la invitación, tocar un elemento, cambiarlo y seguir sin perder el lugar; la vista previa es la experiencia real del invitado; ninguna acción propia de la invitación se dispara mientras se edita.
- La experiencia de PC no perdió capacidades: /admin sigue intacto (objetivos táctiles más grandes y enlace al editor) y toda la lógica de guardado/validación/publicación es la MISMA, sin duplicación.
- Pendientes del propietario: ejecutar docs/PRUEBA-MANUAL-EDITOR-MOVIL.md en un teléfono físico (con y sin token) y aceptar el PR; sin merge ni deploy hasta autorización explícita.
