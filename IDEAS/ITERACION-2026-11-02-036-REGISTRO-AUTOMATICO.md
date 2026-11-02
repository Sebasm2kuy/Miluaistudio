# ITERACIÓN 036 — Registro automático de clientes con Google (sin aprobación manual)

**Fecha:** 2026-11-02 · **Estado:** código desplegado; **activación pendiente de un paso del estudio**

## Qué pidió el cliente

«Modificá la lógica de la página de acceso (/acceso) para que no bloquee a
ningún usuario autenticado con Google. Si el email no está en la base de
datos de clientes, debe registrarlo automáticamente en GitHub como nuevo
cliente y darle acceso al panel por primera vez, sin requerir aprobación
manual.»

## Decisión de arquitectura (la importante)

Un usuario que se registra por primera vez es un visitante ANÓNIMO sin
ningún token: su navegador necesita escribir en GitHub. **Un token de
escritura no puede vivir en el bundle público** (el JS es legible por
cualquiera; con él se podría escribir en TODO el repositorio: invitaciones,
contenido, todo). Por eso la escritura vive en el backend de Google Apps
Script que el proyecto ya usa para los RSVPs (`gallery-server.gs`), con el
token en Propiedades del script. Ese backend verifica la credencial con
Google (tokeninfo), aplica topes anti-abuso y commitea la cuenta. La
alternativa directa (token fine-grained embebido) fue evaluada y
descartada por el riesgo.

## Qué se implementó

1. **Backend** (`google-apps-script/gallery-server.gs`): nueva acción
   `registro_cliente` —
   - Verificación server-side del id_token contra
     `oauth2.googleapis.com/tokeninfo`: audiencia == `GOOGLE_CLIENT_ID`
     (propiedad del script), sin expirar, email verificado. Un POST con
     JSON inventado NO crea cuentas.
   - Topes anti-abuso con CacheService: 10 altas/hora globales
     (`REGISTRO_MAX_POR_HORA`) y 2 intentos/hora por email.
   - Idempotente: email existente → `{success:true, nuevo:false}` sin
     escribir. Colección inválida → fail-closed (no la pisa).
   - Alta con slug único (`partedelemail-` + 6 hex aleatorios, verificado
     contra los slugs existentes), nombre saneado del perfil de Google
     (máx. 60) y hash en formato válido de una contraseña descartada
     (solo-Google: el login por contraseña es imposible).
   - Commit `acceso: alta automática de cliente (Google) [skip ci]` con
     reintentos ante conflicto de SHA (relee y re-deduplica, máx. 3).
2. **Frontend**:
   - `src/data/registro-auto.ts`: `ENDPOINT_REGISTRO = ''` (desactivado por
     defecto; al pegar la URL del Web App queda activo, igual patrón que
     `GOOGLE_CLIENT_ID`).
   - `src/lib/registro-cliente.ts`: `registrarClienteGoogle()` — POST
     text/plain con la credencial solo en el cuerpo (sin preflight CORS,
     mismo contrato que RSVP), timeout con AbortController, parseo
     tolerante con `parseGasResponse`, nunca lanza.
   - `src/lib/auth-cliente.ts`: `abrirSesionCliente()` — abre la sesión 8 h
     revalidando forma de email/slug/nombre y limpiando intentos previos.
   - `src/app/acceso/page.tsx`: en `sin-cuenta` con endpoint activo →
     «Creando tu acceso…» → alta → verificación de que el email del
     registro coincide con la credencial → sesión → `/dashboard/`. Si el
     backend falla → mensaje honesto del error + fallback WhatsApp. Con
     endpoint vacío → comportamiento exacto de 034. Leyenda del formulario
     condicional.
   - Comentarios de `clientes-esquema.ts` y cabeceras actualizados (la web
     sigue sin escribir desde el navegador; escribe el backend verificado).

## Verificación

| Prueba | Resultado |
|---|---|
| Lint (`eslint .`) | sin errores |
| Tipos (`tsc --noEmit`) | sin errores |
| Tests unitarios | **229/229** (212 + 17 nuevos: contrato del registro, apertura de sesión, contrato real con el .gs vía vm — `hashSoloGoogle()` pasa `esHashValido`, `generarSlugRegistro` produce slugs válidos/únicos) |
| Build + export + privacidad | sin fugas (402 archivos escaneados) |

**E2E en navegador (export local, widget de Google sustituido por un stub y
backend/reporesitorio mockeados):**

- **Alta nueva**: credencial de `nueva@gmail.com` (no está en la colección) →
  POST al endpoint → `{success:true, nuevo:true, slug:"nueva-a1b2c3"}` →
  sesión abierta (`rol cliente`, 8 h) → `/dashboard/` → «Hola, Nueva
  Cliente», invitación visible (mock de la demo), enlace
  `lumengala.site/i/nueva-a1b2c3`.
- **Error del backend** (`success:false`, tope de registros): mensaje del
  backend mostrado, sin sesión creada, fallback de WhatsApp presente.
- **Regresión con feature desactivada** (estado final del código): cero
  peticiones al endpoint, leyenda «Acceso exclusivo…» intacta, bloque
  «todavía no tiene un panel asignado» + WhatsApp como siempre.

## Paso pendiente del estudio (activación)

El código queda desplegado pero INACTIVO (endpoint vacío). Para activarlo:
pegar el `.gs` actualizado en el proyecto de Apps Script, cargar las
propiedades `GITHUB_TOKEN` y `GOOGLE_CLIENT_ID`, crear una nueva
implementación de Aplicación web y pegar la URL en
`src/data/registro-auto.ts`. Guía completa: `docs/REGISTRO-AUTOMATICO.md`.
Si me pasás la URL del Web App en tu próximo mensaje, la integro, verifico
el flujo real contra el backend y queda activado.

## Costo asumido (documentado en docs/REGISTRO-AUTOMATICO.md §4)

Alta libre = commits libres: cada email de Google nuevo genera un commit.
Los topes por hora limitan el volumen, no la política; si algún día molesta,
se desactiva vaciando la constante (1 minuto).
