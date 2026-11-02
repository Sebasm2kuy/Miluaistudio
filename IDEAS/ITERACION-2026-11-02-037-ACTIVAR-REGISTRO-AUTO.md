# ITERACIÓN 037 — Registro automático ACTIVADO en producción

**Fecha:** 2026-11-02 · **Estado:** activado y fusionado a main

## Qué pidió el estudio

El estudio desplegó el Web App de Apps Script (la implementación con el
`gallery-server.gs` actual, que atiende `rsvp_grupo` y `registro_cliente`)
y pidió: verificación fail-safe, conexión de la URL en `ENDPOINT_REGISTRO`
(`src/data/registro-auto.ts`), tests, y push → PR → merge a producción.

## Verificación previa (hechos comprobados)

Antes de activar se probó la URL real, tres veces y siempre con datos
ficticios:

1. **GET `/exec`** → `{"ok":true,"message":"RSVP backend activo"}` — la
   implementación está viva y el `.gs` desplegado es el actual (ese texto
   solo existe en la versión nueva).
2. **POST `registro_cliente` con credencial inválida** →
   `{"success":false,"error":"Credencial de Google inválida."}` — fail-closed:
   rechaza credenciales fabricadas y no crea nada. Es la respuesta exacta
   que espera `registrarClienteGoogle()`.
3. **GET limpio sobre el redirect de Google** (lo mismo que hace el
   `fetch` del navegador al seguir el 302 hacia `googleusercontent.com`)
   → HTTP 200 con el JSON legible. Se descartó así un falso 405 que solo
   afectaba a curl (reenvía el header `Content-Type` en el redirect; los
   navegadores no).

Las dos URLs anteriores que el estudio reportó como activas respondían 404
de Google (implementación inexistente o eliminada) — quedaron registradas en
`docs/PRUEBA-MANUAL-RSVP.md` y en el worklog (iteración 032C). No se activó
nada hasta tener una URL que respondiera el contrato.

## Decisiones

- **Activar solo `ENDPOINT_REGISTRO`.** El espejo de RSVP a la planilla
  (`rsvp.googleSheetUrl` en los JSON de `content/invitaciones/`) NO se tocó:
  es una decisión separada (qué invitaciones escriben en la hoja y desde
  cuándo). Queda listo para un commit de una línea cuando se pida.
- **La guarda del test cambia de forma coherente:** el test que exigía
  `ENDPOINT_REGISTRO === ''` (feature apagada por defecto en 036) ahora
  exige que la constante sea la URL `/exec` del Web App o cadena vacía
  (interruptor). Un valor basura sigue fallando el test.
- **Sin tokens en el bundle:** la URL del Web App es pública por diseño
  (el navegador del cliente la llama); el token de GitHub vive solo en las
  Propiedades del script de Apps Script.

## Cambios

- `src/data/registro-auto.ts`: `ENDPOINT_REGISTRO` con la URL vigente +
  comentario de estado (activo 2026-11-02, cómo desactivar).
- `tests/registro-cliente.test.ts`: la guarda pasa a validar la forma de la
  URL (o vacía = desactivado).
- `docs/REGISTRO-AUTOMATICO.md`: banner de estado DESACTIVADO → ACTIVADO
  (2026-11-02, iteración 037) con la evidencia de la verificación.
- `worklog.md` + este doc + índice `IDEAS/README.md` (se completaron los
  enlaces de 033-036 que habían quedado fuera).

## Riesgos y puntos por verificar (honestidad)

- **El flujo real con Google falta probarlo con una cuenta real**: la
  verificación cubre que el backend responde el contrato y rechaza
  credenciales inválidas, pero el alta real (id_token de Google → cuenta
  creada → commit en `content/clientes.json` → panel abierto) requiere un
  navegador con una cuenta de Google ajena a `clientes.json`. El estudio
  puede probarlo en 1 minuto entrando a `/acceso/` con Google.
- **El commit automático de cuentas exige la propiedad `GITHUB_TOKEN`** en
  el script (Contents R/W, solo este repo). Si no está configurada, el
  backend responde error y la UI cae al fallback de WhatsApp (fail-safe,
  sin romper nada).
- **Topes anti-abuso activos**: 10 altas/hora globales y 2/h por email
  (sección 3 del doc para ajustarlos; exigen nueva implementación).

## Próximos pasos

1. El estudio prueba el alta real con una cuenta de Google de prueba.
2. Si se quiere el espejo de RSVP a la planilla: activar
   `rsvp.googleSheetUrl` (+ `rsvp.slugInvitacion`) en las invitaciones
   publicadas — un commit.
3. Rotar el token de GitHub compartido por chat cuando se cierre la sesión.
