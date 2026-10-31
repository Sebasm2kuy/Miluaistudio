# Iteración 031 — Panel de cliente (dashboard) con GitHub como base de datos + limpieza total de precios y Mercado Libre

**Fecha:** 31-10-2026
**Rama:** `feat/dashboard-clientes`
**Pedido del cliente:**

1. Eliminar por completo toda mención de precios de todas las secciones, componentes y textos del proyecto; el flujo de valor deriva consultas comerciales a WhatsApp o al registro en la plataforma.
2. Implementar un panel de cliente ultraliviano con **cero bases de datos externas** (sin Prisma, Supabase, Firebase ni ningún servicio nuevo): la información de clientes, eventos y RSVP se guarda en **JSON dentro del repositorio**, leído y actualizado mediante la **API de GitHub con commits automáticos**.
3. Login elegante (fondo charcoal, acentos dorados), `/dashboard` con estado de la invitación, editor de datos del evento (música, horarios, ubicación, frase de bienvenida) y lista de confirmaciones con filtros y exportación.

---

## Contexto y restricciones encontradas

- El repo **ya tenía** el patrón «GitHub como DB» para eventos: `content/invitaciones/<slug>.json` escrito por `publicarInvitacionEnGitHub()` (Contents API + commit, `github-deploy.ts`) y leído al build para generar `/i/<slug>/`. El dashboard REUTILIZA esa base y esas unidades testeadas en lugar de duplicar nada.
- El repo prohíbe tokens embebidos (doctrina del panel `/admin`, verify-export §4 escanea secretos): **no se usó ningún `NEXT_PUBLIC_*` con token**. Las **lecturas** de un repo público son anónimas; las **escrituras** exigen el token pegado en la «Conexión con GitHub» del propio panel (sessionStorage, muere al cerrar la pestaña, mismo patrón que /admin).
- El RSVP de invitados ya funciona vía Apps Script (hoja de cálculo). Se mantiene intacto y se le agrega un **espejo opcional** al repo (ver abajo).
- Cada commit a `main` dispara rebuild de Pages (~2-3 min). Por eso los commits de RSVP llevan **`[skip ci]`**: confirmar asistencia NO reconstruye el sitio.

## Decisiones (y descartes)

| Decisión | Alternativa descartada | Por qué |
| --- | --- | --- |
| Contraseñas con **PBKDF2-SHA256 310k** (WebCrypto, 0 dependencias), formato autodescripto `pbkdf2-sha256$iter$salt$hash` | bcryptjs (dep nueva) o NextAuth (exige servidor; el sitio es export estático) | Ultraliviano, compatible nodo↔navegador (`scripts/alta-cliente.mjs` genera el mismo formato con `node:crypto`) |
| Login **sin registro auto-servicio**: cuentas creadas por el estudio (`scripts/alta-cliente.mjs` + commit) | Registro abierto | El negocio contrata por WhatsApp primero; una cuenta suelta no tiene invitación asociada. El login ofrece WhatsApp para quien no tiene cuenta |
| Guardia de `/dashboard/*` **client-side** (layout cliente + `leerSesion()` + redirect) | `middleware.ts` | En `output: 'export'` no hay middleware de servidor. La superficie de riesgo es baja: sin sesión solo hay esqueletos; toda escritura exige además el token de la Conexión |
| RSVPs en `content/rsvps/<slug>.json` **con commits `[skip ci]`** | Rama `datos` aparte | Un solo repo/rama para el dueño (modelo mental simple) y cero rebuilds por RSVP. `deploy.yml` solo escucha push a main y GitHub respeta `[skip ci]` |
| Espejo RSVP servidor-side en `gallery-server.gs` (Script Property `GITHUB_TOKEN`, desactivado por defecto) | Token de escritura embebido en el bundle de la invitación pública | Cualquier visitante podría extraer un token del bundle; el espejo por Apps Script deja el token del lado del estudio. Fail-safe: sin token el script behave igual que siempre |
| RSVPs **sin teléfonos** en el repo (quedan solo en la hoja) y mensajes de commit sin nombres | Guardar todo | El repo es público: minimización de datos personales |
| Validadores propios (`dashboard-validacion.ts`) con contrato `{ok, valor|motivo}` | Zod (dep nueva ~14 KB) | El repo no usa Zod; misma garantía con 0 dependencias y tests propios. La conversión Spotify→embed reutiliza `spotifyEmbedUrl` del personalizador |

## Cambios

**Limpieza de precios / Mercado Libre**
- `src/data/precio.ts` **eliminado** (fuente única del precio); `contacto.ts` sin `MERCADO_LIBRE_URL`.
- `catalogo/page.tsx`: fuera el precio de las tarjetas y del quick-view (reemplazado por «Diseño personalizado / Todo incluido»), fuera los 3 botones ML (encabezado → «Acceso clientes», sección → «Conocé cómo trabajamos» → `/#proceso`, quick-view → sin ML).
- `personalizador-app.tsx`: fuera «todo va incluido en el precio» → «en tu invitación»; fuera «Comprar por Mercado Libre»; pie con «Acceso clientes».
- `testimonios.ts`: «Excelente precio.» → «Excelente atención.».
- Portada: pie con enlace «Acceso clientes».
- Grep final sobre `src/` y sobre `out/`: **cero** coincidencias de `PRECIO|MERCADO_LIBRE|1.200|UYU|Mercado`.

**Datos (GitHub como DB)**
- `content/clientes.json` (nuevo): colección de cuentas (esquema 1) con hash PBKDF2. Semilla: `demo@lumengala.site` → invitación `ejemplo-quince`.
- `content/rsvps/` (nuevo): un JSON por slug, escrito por el panel o por el espejo de Apps Script.
- `src/data/clientes-esquema.ts` y `src/data/rsvps-esquema.ts`: tipos, validación cerrada (falla ante esquemas viejos, emails duplicados, hashes inválidos), serialización estable para commits.

**Servicios**
- `src/lib/github-db.ts`: `leerJSON` (anónima, 404 = «no existe» natural), `escribirJSON` (PUT + commit, exige token), `agregarEntradaRsvp` (append con dedup por código, **reintento ante conflicto de SHA** re-leyendo, commit sin datos personales y con `[skip ci]`). Fetch inyectable (suite sin red).
- `src/lib/auth-cliente.ts`: `hashearPassword`/`verificarPassword` (WebCrypto), `iniciarSesion` (mensaje genérico que no revela si el email existe), sesión 8 h en sessionStorage (almacén inyectable), límite de intentos (5/15 min con bloqueo informado en minutos).
- `src/lib/dashboard-validacion.ts`: campos del editor y del alta manual; `desglosarFecha` produce los TRES campos del evento (`fechaEvento` "YYYY-MM-DD HH:mm" + `fecha` visual + `anio`) manteniendo el contrato de `fechaEventoEnMontevideo`.

**UI (charcoal `#131009`/`#1d1810` + dorado `#d4b465`)**
- `/acceso/`: login con isotipo LGS, errores claros (credenciales, bloqueo, sin cuentas), WhatsApp para alta.
- `/dashboard/` (resumen): estado **Publicada/Sin publicar**, enlace con copiar/abrir, fecha del evento con días restantes, resumen de confirmaciones, acciones.
- `/dashboard/editar/`: carga `content/invitaciones/<slug>.json`, edita nombre/fecha-hora/lugar/dirección/Maps, música Spotify (con embed derivado), frase de bienvenida (cita/cuerpo/firma) y cronograma (agregar/quitar momentos). Guardado honesto: **Publicar cambios** (con token: commit conservando slug y `publicadoEn`), **Guardar borrador** (localStorage), **Descargar JSON** y **Enviar por WhatsApp** (sin token). Banner de borrador local con cargar/descartar.
- `/dashboard/confirmaciones/`: lectura + **autoactualización cada 25 s** (pausada con la pestaña oculta), stats (grupos/personas/asisten/no asisten), filtros, búsqueda, **export CSV** (BOM + `;`), alta manual, alternar asistencia y eliminar (con token → commits).
- `components/dashboard/ui.tsx` (botones con spinner, avisos, esqueletos, campos con error) y `panel-conexion.tsx` (token validado contra `GET /user`, sessionStorage `lgs_token_github`).
- Headers/pies de portada, catálogo y personalizador enlazan «Acceso clientes» → `/acceso/`.

**RSVP → repo (espejo opcional)**
- `config-schema.ts`: `rsvp.slugInvitacion?: string`; `crearInvitacionPublicada` inyecta el slug al publicar (las invitaciones viejas no lo tienen → espejo desactivado para ellas hasta republicar).
- `rsvp-client.ts` + `rsvp.tsx`: payload con `slug` cuando existe.
- `gallery-server.gs`: `mirarRsvpAGitHub()` — si existe la Script Property `GITHUB_TOKEN` y el payload trae slug, hace append a `content/rsvps/<slug>.json` con commit `[skip ci]`, dedup por código, reintento ante 409/422, **sin teléfonos**, fail-safe (nunca rompe el RSVP ni la respuesta al invitado).

**Guardas y SEO**
- `verify-export.mjs`: §2 exige `/acceso/` y las 3 rutas de `/dashboard/`; nueva canario: `out/content/` no puede existir (los datos viven solo en el repo).
- `invitacion-publicada.ts`: slugs reservados += `acceso`, `dashboard`, `login`, `clientes`, `rsvps`.
- Sitemap/robots: sin cambios (las zonas privadas llevan `robots: noindex` en su metadata, política ya usada por demos e invitaciones).

**Scripts**
- `scripts/alta-cliente.mjs`: alta/actualización de cuentas con hash PBKDF2 en el mismo formato (opciones `--email --nombre --slug --password --rol --escribir --reemplazar`); genera contraseña aleatoria si no se pasa.

## Pruebas

- Suite: **202/202** (antes 163): +tests de auth (hash formato/determinismo, verificación, sesión con expiración, bloqueo por intentos, login no filtra cuentas), +github-db con fetch falso (lectura anónima sin Authorization, 404→no-existe, PUT con `[skip ci]`/sha/rama, dedup, reintento 409, sin nombres en mensajes de commit), +esquemas y validadores (sanitización, dedup, resumen, path traversal de `rutaArchivoRsvps`).
- `npm run lint` 0 · `npm run typecheck` 0 · `npm run build` + verify-export (§2 con las rutas nuevas + canario out/content/) + verify-privacy OK.
- Paridad PBKDF2 verificada: el hash de `alta-cliente.mjs` (node:crypto) verifica OK con WebCrypto (el camino del navegador).
- **E2E (agent-browser, out/ servido localmente, mocks de la Contents API con CORS)**: login demo → `/dashboard/`; resumen con Publicada/enlace/fecha/RSVP; confirmaciones con stats 3/7/2/1, filtros y cards; editor carga la config publicada, **validación** marca URL de Spotify no-playlist, happy path guarda borrador local (localStorage + banner); logout → `/dashboard/` redirige a `/acceso/`; consola y errores limpios. Portada y catálogo sin precios ni ML, con «Acceso clientes».
- **No verificable end-to-end acá** (honestidad): la publicación real con token y el espejo de Apps Script (requieren token/productivo). El flujo de publicación reutiliza `publicarInvitacionEnGitHub` (en producción desde la iteración 018) y el espejo está protegido por diseño fail-safe.

## Cómo operarlo (guía del estudio)

1. **Alta de un cliente:** `node scripts/alta-cliente.mjs --email x@y --nombre "Familia X" --slug <slug> --escribir` → commit + push. La contraseña se muestra una vez.
2. **Cliente gestiona:** entra a `/acceso/`, ve estado y confirmaciones; para publicar cambios necesita la «Conexión con GitHub»: crear un **fine-grained PAT** (Repository access: solo Miluaistudio; Permissions: Contents Read&Write) y pegarlo en el panel — vive solo en esa pestaña.
3. **RSVP automáticos al repo (opcional):** pegar el nuevo `gallery-server.gs` en el proyecto de Apps Script, crear nueva implementación y definir la Script Property `GITHUB_TOKEN` (mismo fine-grained PAT sirve). Sin eso, el RSVP sigue funcionando como siempre (hoja + WhatsApp) y el panel alimenta a mano.
4. **Rotar/revocar** el PAT cuando quiera: el panel deja de publicar (queda modo borrador/WhatsApp) y nada más se rompe.

## Riesgos / puntos por verificar

- El hash de contraseñas vive en un repo público: PBKDF2 310k + contraseñas fuertes obligatorias (mín. 8) lo hacen razonable para cuentas de bajo valor, pero si algún día hay datos sensibles en el panel, migrar a un repo de datos privado (misma API, un env) o a un backend mínimo.
- La sesión client-side protege la INTERFAZ; la integridad de los datos descansa en el token (escrituras) + historia de git (auditoría/reversión) + validaciones de esquema en lectura.
- `ejemplo-quince` tiene `playlistUrl = https://open.spotify.com/` (sin formato playlist): el editor la marca como inválida a propósito; el cliente demo puede limpiarla o poner una playlist real.

## Pendientes

- Crear el fine-grained PAT y conectarlo en el panel para habilitar «Publicar cambios» y el espejo de RSVP (lo hace el dueño; no se puede crear un PAT por API).
- Documentado en el pedido anterior: el cambio de texto «Ver diseños» (PR #31) quedó sin doc propia; se registra acá para traza.
- Evolución futura: subir fotos desde el panel (ya existe `uploadToGitHub`), notificación al estudio cuando un RSVP llega, roles `estudio` con vista multi-invitación.
